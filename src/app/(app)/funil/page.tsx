import { getFunil, PIPE_ATENDIMENTO, PIPE_AGENDAMENTO } from "@/lib/data";
import { Card, PageHeader } from "@/components/ui";
import { Funil } from "@/components/Funil";

export const dynamic = "force-dynamic";

export default async function FunilPage() {
  const [atendimento, agendamento] = await Promise.all([
    getFunil(PIPE_ATENDIMENTO),
    getFunil(PIPE_AGENDAMENTO),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Funil" subtitle="Distribuição de leads por etapa, por pipeline" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 text-sm font-semibold text-ptd-ink">Atendimento</div>
          <Funil etapas={atendimento} />
        </Card>
        <Card>
          <div className="mb-4 text-sm font-semibold text-ptd-ink">Agendamento</div>
          <Funil etapas={agendamento} />
        </Card>
      </div>
    </div>
  );
}
