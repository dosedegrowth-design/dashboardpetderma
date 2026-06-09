import {
  getLeadsPeriodo,
  resumo,
  porCanal,
  porUnidade,
  serieTemporal,
  getFunil,
  consultasRealizadas,
  velocidade,
  periodoLabel,
  PIPE_ATENDIMENTO,
  type Periodo,
} from "@/lib/data";
import { Card, Kpi, PageHeader, brl, Badge } from "@/components/ui";
import { PeriodFilter } from "@/components/PeriodFilter";
import { LeadsChart } from "@/components/LeadsChart";
import { CanalChart } from "@/components/CanalChart";
import { MetricTable } from "@/components/MetricTable";
import { Funil } from "@/components/Funil";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const sp = await searchParams;
  const p = (["7", "30", "90", "mes", "tudo"].includes(sp.p || "") ? sp.p : "tudo") as Periodo;

  const [leads, funil] = await Promise.all([getLeadsPeriodo(p), getFunil(PIPE_ATENDIMENTO)]);
  const r = resumo(leads);
  const v = velocidade(leads);
  const canais = porCanal(leads);
  const unidades = porUnidade(leads).filter((u) => u.nome !== "(não informado)");
  const serie = serieTemporal(leads, p);
  const consultas = consultasRealizadas(leads, 8);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <PageHeader title="Visão Geral" subtitle={`Panorama comercial · ${periodoLabel(p)}`} />
        <PeriodFilter atual={p} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Leads no período" value={r.totalLeads.toLocaleString("pt-BR")} accent="navy" />
        <Kpi label="Consultas realizadas" value={r.consultas.toLocaleString("pt-BR")} sub={brl(r.valorRealizado)} accent="green" />
        <Kpi label="Ticket médio" value={brl(r.ticket)} accent="teal" />
        <Kpi label="Taxa de conversão" value={`${r.conversao.toFixed(1)}%`} sub={`${r.emAberto} em aberto`} accent="green" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Leads perdidos" value={r.perdidos.toLocaleString("pt-BR")} accent="navy" />
        <Kpi label="Taxa de perda" value={`${r.taxaPerda.toFixed(1)}%`} accent="navy" />
        <Card className="lg:col-span-2 bg-gradient-to-br from-ptd-navy to-ptd-teal text-white">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/70">Oportunidade perdida (estimada)</div>
          <div className="mt-2 text-3xl font-extrabold">{brl(r.oportunidadePerdida)}</div>
          <div className="mt-1 text-xs text-white/70">
            {r.perdidos} leads perdidos × ticket médio {brl(r.ticket)}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Dias até a consulta" value={`${v.diasAteConsulta.toFixed(1)}d`} accent="green" />
        <Kpi label="Dias até perder" value={`${v.diasAtePerda.toFixed(1)}d`} accent="navy" />
        <Kpi label="Tempo parado médio" value={`${v.diasParadoMedio.toFixed(1)}d`} accent="teal" />
        <Kpi label="Parados +14 dias" value={v.paradosMais14.toLocaleString("pt-BR")} sub="risco de esfriar" accent="navy" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="mb-3 text-sm font-semibold text-ptd-ink">Leads e consultas ao longo do tempo</div>
          <LeadsChart data={serie} />
        </Card>
        <Card className="lg:col-span-2">
          <div className="mb-2 text-sm font-semibold text-ptd-ink">Origem dos leads</div>
          <CanalChart grupos={canais} />
        </Card>
      </div>

      <Card className="mt-6">
        <div className="mb-1 text-sm font-semibold text-ptd-ink">Desempenho por canal</div>
        <p className="mb-4 text-xs text-ptd-muted">
          De onde vêm os leads, quanto convertem e quanto perdem. Canal sem preenchimento aparece como “não informado”.
        </p>
        <MetricTable grupos={canais} titleCol="Canal / Origem" />
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 text-sm font-semibold text-ptd-ink">Por unidade</div>
          {unidades.length ? (
            <MetricTable grupos={unidades} titleCol="Unidade" />
          ) : (
            <p className="text-sm text-ptd-muted">Unidade ainda pouco preenchida no CRM.</p>
          )}
        </Card>
        <Card>
          <div className="mb-4 text-sm font-semibold text-ptd-ink">Funil de atendimento (atual)</div>
          <Funil etapas={funil} />
        </Card>
      </div>

      <Card className="mt-6">
        <div className="mb-4 text-sm font-semibold text-ptd-ink">Consultas realizadas recentes</div>
        {consultas.length === 0 ? (
          <p className="text-sm text-ptd-muted">Nenhuma consulta realizada no período.</p>
        ) : (
          <div className="divide-y divide-black/5">
            {consultas.map((c) => (
              <div key={c.lead_id} className="flex items-center justify-between py-2.5">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-ptd-ink">{c.nome || "—"}</div>
                  <div className="text-xs text-ptd-muted">
                    {[c.unidade, c.origem].filter(Boolean).join(" · ") || c.telefone || ""}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {(c.valor_consulta || c.valor) > 0 && <Badge tone="green">{brl(c.valor_consulta || c.valor)}</Badge>}
                  <span className="text-xs text-ptd-muted">
                    {c.criado_em ? new Date(c.criado_em).toLocaleDateString("pt-BR") : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
