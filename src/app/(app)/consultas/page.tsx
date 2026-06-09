import { getLeadsPeriodo, consultasRealizadas, resumo, periodoLabel, type Periodo } from "@/lib/data";
import { Card, PageHeader, Kpi, brl } from "@/components/ui";
import { PeriodFilter } from "@/components/PeriodFilter";
import { LeadsTable } from "@/components/LeadsTable";

export const dynamic = "force-dynamic";

export default async function ConsultasPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const sp = await searchParams;
  const p = (["7", "30", "90", "mes", "tudo"].includes(sp.p || "") ? sp.p : "tudo") as Periodo;
  const leads = await getLeadsPeriodo(p);
  const r = resumo(leads);
  const consultas = consultasRealizadas(leads, 300);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <PageHeader title="Consultas Realizadas" subtitle={`CONSULTA REALIZADA (pipeline Agendamento) · ${periodoLabel(p)}`} />
        <PeriodFilter atual={p} />
      </div>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Kpi label="Total realizadas" value={r.consultas.toLocaleString("pt-BR")} accent="green" />
        <Kpi label="Valor total" value={brl(r.valorRealizado)} accent="navy" />
        <Kpi label="Ticket médio" value={brl(r.ticket)} accent="teal" />
      </div>
      <Card>
        <LeadsTable leads={consultas} />
      </Card>
    </div>
  );
}
