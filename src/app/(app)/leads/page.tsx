import { getLeadsPeriodo, leadsRecentes, periodoLabel, type Periodo } from "@/lib/data";
import { Card, PageHeader } from "@/components/ui";
import { PeriodFilter } from "@/components/PeriodFilter";
import { LeadsTable } from "@/components/LeadsTable";

export const dynamic = "force-dynamic";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const sp = await searchParams;
  const p = (["7", "30", "90", "mes", "tudo"].includes(sp.p || "") ? sp.p : "30") as Periodo;
  const leads = leadsRecentes(await getLeadsPeriodo(p), 300);
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <PageHeader title="Leads" subtitle={`${leads.length} leads · ${periodoLabel(p)}`} />
        <PeriodFilter atual={p} />
      </div>
      <Card>
        <LeadsTable leads={leads} />
      </Card>
    </div>
  );
}
