import { getLeadsPeriodo, leadsRecentes, consultasRealizadas, resumo, periodoLabel, type Periodo } from "@/lib/data";
import { Card, PageHeader, Kpi, brl } from "@/components/ui";
import { PeriodFilter } from "@/components/PeriodFilter";
import { ViewToggle } from "@/components/ViewToggle";
import { LeadsTable } from "@/components/LeadsTable";
import { Stagger, FadeIn } from "@/components/Motion";

export const dynamic = "force-dynamic";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ p?: string; view?: string }> }) {
  const sp = await searchParams;
  const p = (["7", "30", "90", "mes", "tudo"].includes(sp.p || "") ? sp.p : "tudo") as Periodo;
  const view = sp.view === "consultas" ? "consultas" : "todos";
  const all = await getLeadsPeriodo(p);
  const r = resumo(all);
  const lista = view === "consultas" ? consultasRealizadas(all, 300) : leadsRecentes(all, 300);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <PageHeader title="Leads" subtitle={`${lista.length} registros · ${periodoLabel(p)}`} />
        <div className="flex items-center gap-2">
          <ViewToggle atual={view} opcoes={[{ v: "todos", label: "Todos" }, { v: "consultas", label: "Consultas" }]} />
          <PeriodFilter atual={p} />
        </div>
      </div>

      {view === "consultas" && (
        <Stagger className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
          <FadeIn><Kpi label="Consultas realizadas" value={r.consultas.toLocaleString("pt-BR")} accent="green" /></FadeIn>
          <FadeIn><Kpi label="Valor total" value={brl(r.valorRealizado)} accent="navy" /></FadeIn>
          <FadeIn><Kpi label="Ticket médio" value={brl(r.ticket)} accent="teal" /></FadeIn>
        </Stagger>
      )}

      <FadeIn>
        <Card>
          <LeadsTable leads={lista} />
        </Card>
      </FadeIn>
    </div>
  );
}
