import { getLeadsPeriodo, porCanal, resumo, periodoLabel, type Periodo, type LeadRaw } from "@/lib/data";
import { Card, Kpi, PageHeader, brl } from "@/components/ui";
import { PeriodFilter } from "@/components/PeriodFilter";
import { CanalChart } from "@/components/CanalChart";
import { MetricTable } from "@/components/MetricTable";

export const dynamic = "force-dynamic";

function porCampanha(leads: LeadRaw[]) {
  const m = new Map<string, number>();
  for (const l of leads) {
    if (l.utm_campaign) m.set(l.utm_campaign, (m.get(l.utm_campaign) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
}

export default async function CanaisPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const sp = await searchParams;
  const p = (["7", "30", "90", "mes", "tudo"].includes(sp.p || "") ? sp.p : "tudo") as Periodo;
  const leads = await getLeadsPeriodo(p);
  const canais = porCanal(leads);
  const r = resumo(leads);

  const comOrigem = leads.filter((l) => l.origem).length;
  const cobertura = leads.length ? (comOrigem / leads.length) * 100 : 0;
  const melhor = [...canais].filter((c) => c.nome !== "(não informado)" && c.leads >= 5).sort((a, b) => b.conversao - a.conversao)[0];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <PageHeader title="Canais & Atribuição" subtitle={`De onde vêm os leads · ${periodoLabel(p)}`} />
        <PeriodFilter atual={p} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Total de leads" value={r.totalLeads.toLocaleString("pt-BR")} accent="navy" />
        <Kpi label="Cobertura de origem" value={`${cobertura.toFixed(0)}%`} sub={`${comOrigem} com canal identificado`} accent="teal" />
        <Kpi label="Canal com + volume" value={canais.find((c) => c.nome !== "(não informado)")?.nome ?? "—"} accent="green" />
        <Kpi label="Melhor conversão" value={melhor ? `${melhor.conversao.toFixed(1)}%` : "—"} sub={melhor?.nome} accent="green" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <div className="mb-2 text-sm font-semibold text-ptd-ink">Distribuição por canal</div>
          <CanalChart grupos={canais} />
        </Card>
        <Card className="lg:col-span-3">
          <div className="mb-4 text-sm font-semibold text-ptd-ink">Desempenho por canal</div>
          <MetricTable grupos={canais} titleCol="Canal / Origem" />
        </Card>
      </div>

      <Card className="mt-6 border-amber-200 bg-amber-50/60">
        <div className="text-sm font-semibold text-ptd-ink">⚠️ Qualidade da atribuição</div>
        <p className="mt-1 text-sm text-ptd-muted">
          Apenas <strong>{cobertura.toFixed(0)}%</strong> dos leads têm o campo “Origem do Lead” preenchido no CRM. Para medir com
          precisão qual canal traz mais retorno, o ideal é que a origem seja registrada em 100% dos leads (e mantida quando o lead
          avança para o pipeline de agendamento). Hoje boa parte das consultas realizadas perde o rótulo de canal nesse caminho.
        </p>
      </Card>

      <Card className="mt-6">
        <div className="mb-4 text-sm font-semibold text-ptd-ink">Campanhas (UTM)</div>
        {porCampanha(leads).length ? (
          <div className="flex flex-col gap-2">
            {porCampanha(leads).map(([c, n]) => (
              <div key={c} className="flex items-center justify-between text-sm">
                <span className="truncate text-ptd-ink">{c}</span>
                <span className="font-semibold text-ptd-ink">{n}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ptd-muted">Nenhuma campanha com UTM registrada no período.</p>
        )}
      </Card>
    </div>
  );
}
