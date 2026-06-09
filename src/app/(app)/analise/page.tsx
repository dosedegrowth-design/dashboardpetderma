import {
  getFunisTodos,
  getLeadsPeriodo,
  velocidade,
  primeiraMsgClusters,
  porProfissional,
  perfilPet,
  proximasConsultas,
  periodoLabel,
  type Periodo,
} from "@/lib/data";
import { Card, PageHeader, Kpi, brl, Badge } from "@/components/ui";
import { PeriodFilter } from "@/components/PeriodFilter";
import { Funil } from "@/components/Funil";
import { MetricTable } from "@/components/MetricTable";
import { Stagger, FadeIn } from "@/components/Motion";

export const dynamic = "force-dynamic";

function Barra({ nome, n, max, cor = "bg-ptd-teal/70" }: { nome: string; n: number; max: number; cor?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-40 shrink-0 truncate text-sm text-ptd-ink" title={nome}>{nome}</div>
      <div className="h-6 flex-1 overflow-hidden rounded-lg bg-black/[0.04]">
        <div className={`h-full rounded-lg ${cor} transition-all`} style={{ width: `${max ? (n / max) * 100 : 0}%`, minWidth: n ? 24 : 0 }} />
      </div>
      <div className="w-10 text-right text-sm font-bold text-ptd-ink tabular-nums">{n}</div>
    </div>
  );
}

export default async function AnalisePage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const sp = await searchParams;
  const p = (["7", "30", "90", "mes", "tudo"].includes(sp.p || "") ? sp.p : "tudo") as Periodo;
  const [funis, leads] = await Promise.all([getFunisTodos(), getLeadsPeriodo(p)]);
  const v = velocidade(leads);
  const { clusters, comMsg, total } = primeiraMsgClusters(leads);
  const prof = porProfissional(leads);
  const { animal, raca } = perfilPet(leads);
  const agenda = proximasConsultas(leads);
  const maxAssunto = Math.max(1, ...clusters.map((c) => c.n));
  const maxAnimal = Math.max(1, ...animal.map((a) => a.leads));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <PageHeader title="Análise" subtitle={`Funis, velocidade e demanda · ${periodoLabel(p)}`} />
        <PeriodFilter atual={p} />
      </div>

      {/* Velocidade */}
      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <FadeIn><Kpi label="Dias até a consulta" value={`${v.diasAteConsulta.toFixed(1)}d`} accent="green" /></FadeIn>
        <FadeIn><Kpi label="Dias até perder" value={`${v.diasAtePerda.toFixed(1)}d`} accent="navy" /></FadeIn>
        <FadeIn><Kpi label="Tempo parado médio" value={`${v.diasParadoMedio.toFixed(1)}d`} accent="teal" /></FadeIn>
        <FadeIn><Kpi label="Parados +14 dias" value={v.paradosMais14.toLocaleString("pt-BR")} sub="risco de esfriar" accent="navy" /></FadeIn>
      </Stagger>

      {/* 4 Funis */}
      <Stagger className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {funis.map((f) => {
          const gargalo = [...f.etapas].filter((e) => e.tipo === "aberto").sort((a, b) => b.n - a.n)[0];
          const perdido = f.etapas.find((e) => e.tipo === "perdido");
          return (
            <FadeIn key={f.pipeline_id}>
              <Card>
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
            </FadeIn>
          );
        })}
      </Stagger>

      {/* Demanda */}
      <FadeIn className="mt-6">
        <Card>
          <div className="mb-1 text-sm font-semibold text-ptd-ink">O que os leads pedem (1ª mensagem)</div>
          <p className="mb-4 text-xs text-ptd-muted">Classificação automática — {comMsg} de {total} leads têm mensagem registrada.</p>
          <div className="flex flex-col gap-2.5">
            {clusters.map((c) => <Barra key={c.nome} nome={c.nome} n={c.n} max={maxAssunto} cor="bg-ptd-green/70" />)}
          </div>
        </Card>
      </FadeIn>

      {/* Profissional + Pet */}
      <Stagger className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FadeIn>
          <Card>
            <div className="mb-4 text-sm font-semibold text-ptd-ink">Por profissional</div>
            {prof.length ? <MetricTable grupos={prof} titleCol="Profissional" /> : <p className="text-sm text-ptd-muted">Ainda pouco preenchido no CRM.</p>}
          </Card>
        </FadeIn>
        <FadeIn>
          <Card>
            <div className="mb-4 text-sm font-semibold text-ptd-ink">Perfil dos pacientes</div>
            {animal.length ? (
              <>
                <div className="mb-4 flex flex-col gap-2">
                  {animal.map((a) => <Barra key={a.nome} nome={a.nome} n={a.leads} max={maxAnimal} />)}
                </div>
                {raca.length > 0 && (
                  <>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ptd-muted">Top raças</div>
                    <div className="flex flex-wrap gap-1.5">{raca.map((r) => <Badge key={r.nome}>{r.nome} · {r.leads}</Badge>)}</div>
                  </>
                )}
              </>
            ) : (
              <p className="text-sm text-ptd-muted">Dados de pet ainda pouco preenchidos.</p>
            )}
          </Card>
        </FadeIn>
      </Stagger>

      {/* Agenda */}
      <FadeIn className="mt-6">
        <Card>
          <div className="mb-4 text-sm font-semibold text-ptd-ink">Consultas com data registrada</div>
          {agenda.length === 0 ? (
            <p className="text-sm text-ptd-muted">Nenhuma consulta com data/hora no período.</p>
          ) : (
            <div className="divide-y divide-black/5">
              {agenda.map((c) => (
                <div key={c.lead_id} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-ptd-ink">
                      {c.nome || "—"} {c.nome_pet ? <span className="text-ptd-muted">· {c.nome_pet}</span> : null}
                    </div>
                    <div className="text-xs text-ptd-muted">{[c.unidade, c.profissional, c.tipo_consulta].filter(Boolean).join(" · ")}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {c.futura && <Badge tone="green">próxima</Badge>}
                    {(c.valor_consulta || c.valor) > 0 && <span className="text-xs text-ptd-ink">{brl(c.valor_consulta || c.valor)}</span>}
                    <span className="text-xs text-ptd-muted tabular-nums">
                      {new Date(c.data_consulta!).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </FadeIn>
    </div>
  );
}
