import { db } from "./supabase";

export const PIPE_ATENDIMENTO = 13483411;
export const PIPE_AGENDAMENTO = 13533947;
export const GANHO_STATUS = 142;

export type Periodo = "7" | "30" | "90" | "mes" | "tudo";

export function periodoLabel(p: Periodo) {
  return { "7": "Últimos 7 dias", "30": "Últimos 30 dias", "90": "Últimos 90 dias", mes: "Mês atual", tudo: "Todo o período" }[p];
}

export function sinceDate(p: Periodo): Date | null {
  const d = new Date();
  if (p === "tudo") return null;
  if (p === "mes") {
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  d.setDate(d.getDate() - Number(p));
  return d;
}

export type LeadRaw = {
  lead_id: number;
  nome: string | null;
  telefone: string | null;
  origem: string | null;
  unidade: string | null;
  profissional: string | null;
  pipeline_id: number | null;
  status_id: number | null;
  status_nome: string | null;
  pipeline_nome: string | null;
  valor: number;
  valor_consulta: number | null;
  ganho: boolean;
  perdido: boolean;
  tags: string[] | null;
  criado_em: string | null;
  atualizado_em: string | null;
  ganho_em: string | null;
  perdido_em: string | null;
  utm_campaign: string | null;
  primeira_msg: string | null;
  animal: string | null;
  raca: string | null;
  tipo_consulta: string | null;
  data_consulta: string | null;
  consulta_paga: string | null;
  nome_pet: string | null;
};

const COLS =
  "lead_id,nome,telefone,origem,unidade,profissional,pipeline_id,status_id,status_nome,pipeline_nome,valor,valor_consulta,ganho,perdido,tags,criado_em,atualizado_em,ganho_em,perdido_em,utm_campaign,primeira_msg,animal,raca,tipo_consulta,data_consulta,consulta_paga,nome_pet";

// Busca todos os leads do período (paginado para passar do limite de 1000 do PostgREST)
export async function getLeadsPeriodo(p: Periodo): Promise<LeadRaw[]> {
  const s = db();
  const since = sinceDate(p);
  const all: LeadRaw[] = [];
  const step = 1000;
  for (let from = 0; from < 20000; from += step) {
    let q = s.from("leads").select(COLS).order("criado_em", { ascending: false, nullsFirst: false }).range(from, from + step - 1);
    if (since) q = q.gte("criado_em", since.toISOString());
    const { data, error } = await q;
    if (error || !data || data.length === 0) break;
    all.push(...(data as LeadRaw[]));
    if (data.length < step) break;
  }
  return all;
}

const canalDe = (l: LeadRaw) => l.origem?.trim() || "(não informado)";
const valorGanho = (l: LeadRaw) => Number(l.valor_consulta ?? 0) || Number(l.valor ?? 0);

export type Resumo = {
  totalLeads: number;
  consultas: number;
  valorRealizado: number;
  ticket: number;
  conversao: number;
  perdidos: number;
  taxaPerda: number;
  oportunidadePerdida: number;
  emAberto: number;
};

export function resumo(leads: LeadRaw[]): Resumo {
  const total = leads.length;
  const ganhos = leads.filter((l) => l.ganho);
  const perdidos = leads.filter((l) => l.perdido).length;
  const consultas = ganhos.length;
  const valorRealizado = ganhos.reduce((a, l) => a + valorGanho(l), 0);
  const ticket = consultas ? valorRealizado / consultas : 0;
  const conversao = total ? (consultas / total) * 100 : 0;
  const taxaPerda = total ? (perdidos / total) * 100 : 0;
  const oportunidadePerdida = perdidos * ticket;
  const emAberto = total - consultas - perdidos;
  return { totalLeads: total, consultas, valorRealizado, ticket, conversao, perdidos, taxaPerda, oportunidadePerdida, emAberto };
}

export type GrupoMetrica = {
  nome: string;
  leads: number;
  consultas: number;
  perdidos: number;
  valor: number;
  conversao: number;
};

function agrupar(leads: LeadRaw[], keyFn: (l: LeadRaw) => string): GrupoMetrica[] {
  const m = new Map<string, GrupoMetrica>();
  for (const l of leads) {
    const k = keyFn(l);
    const g = m.get(k) || { nome: k, leads: 0, consultas: 0, perdidos: 0, valor: 0, conversao: 0 };
    g.leads++;
    if (l.ganho) {
      g.consultas++;
      g.valor += valorGanho(l);
    }
    if (l.perdido) g.perdidos++;
    m.set(k, g);
  }
  const arr = [...m.values()];
  arr.forEach((g) => (g.conversao = g.leads ? (g.consultas / g.leads) * 100 : 0));
  return arr.sort((a, b) => b.leads - a.leads);
}

export const porCanal = (leads: LeadRaw[]) => agrupar(leads, canalDe);
export const porUnidade = (leads: LeadRaw[]) => agrupar(leads, (l) => l.unidade?.trim() || "(não informado)");
export const porProfissional = (leads: LeadRaw[]) =>
  agrupar(leads.filter((l) => l.profissional), (l) => l.profissional!.trim());

export type SerieDia = { dia: string; leads: number; consultas: number };

export function serieTemporal(leads: LeadRaw[], p: Periodo): SerieDia[] {
  const porMes = p === "tudo" || p === "90";
  const m = new Map<string, SerieDia>();
  for (const l of leads) {
    if (!l.criado_em) continue;
    const d = new Date(l.criado_em);
    const k = porMes
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      : d.toISOString().slice(0, 10);
    const g = m.get(k) || { dia: k, leads: 0, consultas: 0 };
    g.leads++;
    if (l.ganho) g.consultas++;
    m.set(k, g);
  }
  return [...m.values()].sort((a, b) => a.dia.localeCompare(b.dia));
}

// Funil snapshot (estado atual, não filtrado por período)
export type FunilEtapa = { nome: string; ordem: number; n: number; tipo: string };
export async function getFunil(pipelineId: number): Promise<FunilEtapa[]> {
  const s = db();
  const [stagesRes, leadsRes] = await Promise.all([
    s.from("stages").select("status_id,nome,ordem,tipo").eq("pipeline_id", pipelineId).order("ordem"),
    s.from("leads").select("status_id").eq("pipeline_id", pipelineId),
  ]);
  const counts = new Map<number, number>();
  for (const l of leadsRes.data ?? []) counts.set(l.status_id as number, (counts.get(l.status_id as number) || 0) + 1);
  return (stagesRes.data ?? []).map((st) => ({
    nome: st.nome as string,
    ordem: st.ordem as number,
    tipo: st.tipo as string,
    n: counts.get(st.status_id as number) || 0,
  }));
}

// ---- velocidade / tempo ----
const dias = (a: string | null, b: string | null) =>
  a && b ? (new Date(a).getTime() - new Date(b).getTime()) / 86400000 : null;

export type Velocidade = {
  diasAteConsulta: number;
  diasAtePerda: number;
  diasParadoMedio: number;
  paradosMais14: number;
};
export function velocidade(leads: LeadRaw[]): Velocidade {
  const ate = (f: (l: LeadRaw) => number | null) => {
    const v = leads.map(f).filter((x): x is number => x !== null && isFinite(x));
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
  };
  const abertos = leads.filter((l) => !l.ganho && !l.perdido);
  const agora = Date.now();
  const paradosMais14 = abertos.filter(
    (l) => l.atualizado_em && (agora - new Date(l.atualizado_em).getTime()) / 86400000 > 14,
  ).length;
  return {
    diasAteConsulta: ate((l) => (l.ganho ? dias(l.ganho_em, l.criado_em) : null)),
    diasAtePerda: ate((l) => (l.perdido ? dias(l.perdido_em, l.criado_em) : null)),
    diasParadoMedio: ate((l) => (!l.ganho && !l.perdido && l.atualizado_em ? (agora - new Date(l.atualizado_em).getTime()) / 86400000 : null)),
    paradosMais14,
  };
}

// ---- todos os funis (snapshot atual) ----
export type FunilPipeline = { pipeline_id: number; nome: string; etapas: FunilEtapa[]; total: number };
export async function getFunisTodos(): Promise<FunilPipeline[]> {
  const s = db();
  const [stagesRes, leadsRes] = await Promise.all([
    s.from("stages").select("status_id,pipeline_id,nome,ordem,tipo").order("ordem"),
    s.from("leads").select("pipeline_id,status_id"),
  ]);
  const counts = new Map<string, number>();
  for (const l of leadsRes.data ?? []) {
    const k = `${l.pipeline_id}:${l.status_id}`;
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  const byPipe = new Map<number, FunilPipeline>();
  const nomePipe: Record<number, string> = {
    13483411: "Atendimento", 13533947: "Agendamento", 13487535: "Pós-Venda", 13542887: "Relatório",
  };
  for (const st of stagesRes.data ?? []) {
    const pid = st.pipeline_id as number;
    if (!byPipe.has(pid)) byPipe.set(pid, { pipeline_id: pid, nome: nomePipe[pid] || `Funil ${pid}`, etapas: [], total: 0 });
    const n = counts.get(`${pid}:${st.status_id}`) || 0;
    byPipe.get(pid)!.etapas.push({ nome: st.nome as string, ordem: st.ordem as number, tipo: st.tipo as string, n });
    byPipe.get(pid)!.total += n;
  }
  const ordem = [13483411, 13533947, 13487535, 13542887];
  return [...byPipe.values()].sort((a, b) => ordem.indexOf(a.pipeline_id) - ordem.indexOf(b.pipeline_id));
}

// ---- 1a mensagem: clusters de assunto ----
const ASSUNTOS: { nome: string; kw: RegExp }[] = [
  { nome: "Preço / valor", kw: /\b(valor|pre[çc]o|quanto|custa|custo|or[çc]amento)\b/i },
  { nome: "Agendamento / horário", kw: /\b(agend|hor[áa]rio|marcar|dispon|vaga|consulta|data)\b/i },
  { nome: "Localização / unidade", kw: /\b(unidade|endere[çc]o|onde|local|fica|campo belo|tatuap|s[ãa]o jos[ée]|zona)\b/i },
  { nome: "Problema de pele", kw: /\b(coceira|al[ée]rgia|pele|co[çc]a|queda de pelo|caspa|otite|ouvido|micose|dermat)\b/i },
  { nome: "Online / telemedicina", kw: /\b(online|on-line|tele|v[íi]deo|dist[âa]ncia)\b/i },
];
export type AssuntoCount = { nome: string; n: number };
export function primeiraMsgClusters(leads: LeadRaw[]): { clusters: AssuntoCount[]; comMsg: number; total: number } {
  const com = leads.filter((l) => l.primeira_msg && l.primeira_msg.trim());
  const cl = ASSUNTOS.map((a) => ({ nome: a.nome, n: com.filter((l) => a.kw.test(l.primeira_msg!)).length }));
  cl.push({ nome: "Outros", n: com.filter((l) => !ASSUNTOS.some((a) => a.kw.test(l.primeira_msg!))).length });
  return { clusters: cl.sort((a, b) => b.n - a.n), comMsg: com.length, total: leads.length };
}

export function perfilPet(leads: LeadRaw[]) {
  const animal = agrupar(leads.filter((l) => l.animal), (l) => l.animal!);
  const raca = agrupar(leads.filter((l) => l.raca), (l) => l.raca!).slice(0, 10);
  return { animal, raca };
}

export function proximasConsultas(leads: LeadRaw[]) {
  const agora = Date.now();
  return leads
    .filter((l) => l.data_consulta)
    .sort((a, b) => new Date(b.data_consulta!).getTime() - new Date(a.data_consulta!).getTime())
    .slice(0, 30)
    .map((l) => ({ ...l, futura: new Date(l.data_consulta!).getTime() >= agora }));
}

export function leadsRecentes(leads: LeadRaw[], n = 100) {
  return leads.slice(0, n);
}
export function consultasRealizadas(leads: LeadRaw[], n = 200) {
  return leads.filter((l) => l.ganho).slice(0, n);
}
