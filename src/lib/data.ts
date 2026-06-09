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
  utm_campaign: string | null;
};

const COLS =
  "lead_id,nome,telefone,origem,unidade,profissional,pipeline_id,status_id,status_nome,pipeline_nome,valor,valor_consulta,ganho,perdido,tags,criado_em,utm_campaign";

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

export function leadsRecentes(leads: LeadRaw[], n = 100) {
  return leads.slice(0, n);
}
export function consultasRealizadas(leads: LeadRaw[], n = 200) {
  return leads.filter((l) => l.ganho).slice(0, n);
}
