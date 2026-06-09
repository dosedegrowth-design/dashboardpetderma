import { getFunisTodos, getLeadsPeriodo, velocidade } from "@/lib/data";
import { Card, PageHeader, Kpi } from "@/components/ui";
import { Funil } from "@/components/Funil";

export const dynamic = "force-dynamic";

export default async function FunilPage() {
  const [funis, leads] = await Promise.all([getFunisTodos(), getLeadsPeriodo("tudo")]);
  const v = velocidade(leads);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Funis & Velocidade" subtitle="Os 4 funis do CRM, gargalos e tempo de avanço" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Dias até a consulta" value={`${v.diasAteConsulta.toFixed(1)}d`} sub="média lead → realizada" accent="green" />
        <Kpi label="Dias até perder" value={`${v.diasAtePerda.toFixed(1)}d`} sub="média lead → perdido" accent="navy" />
        <Kpi label="Tempo parado médio" value={`${v.diasParadoMedio.toFixed(1)}d`} sub="leads em aberto" accent="teal" />
        <Kpi label="Parados +14 dias" value={v.paradosMais14.toLocaleString("pt-BR")} sub="risco de esfriar" accent="navy" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {funis.map((f) => {
          const gargalo = [...f.etapas].filter((e) => e.tipo === "aberto").sort((a, b) => b.n - a.n)[0];
          const perdido = f.etapas.find((e) => e.tipo === "perdido");
          return (
            <Card key={f.pipeline_id}>
              <div className="mb-1 flex items-baseline justify-between">
                <div className="text-sm font-semibold text-ptd-ink">{f.nome}</div>
                <div className="text-xs text-ptd-muted">{f.total} leads</div>
              </div>
              {gargalo && gargalo.n > 0 && (
                <p className="mb-3 text-xs text-ptd-muted">
                  Maior concentração em <strong className="text-ptd-ink">{gargalo.nome}</strong> ({gargalo.n})
                  {perdido && perdido.n > 0 ? ` · ${perdido.n} perdidos` : ""}
                </p>
              )}
              <Funil etapas={f.etapas} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
