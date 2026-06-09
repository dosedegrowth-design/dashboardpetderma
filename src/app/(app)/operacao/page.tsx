import {
  getLeadsPeriodo,
  primeiraMsgClusters,
  porProfissional,
  perfilPet,
  proximasConsultas,
  periodoLabel,
  type Periodo,
} from "@/lib/data";
import { Card, PageHeader, brl, Badge } from "@/components/ui";
import { PeriodFilter } from "@/components/PeriodFilter";
import { MetricTable } from "@/components/MetricTable";

export const dynamic = "force-dynamic";

function Barra({ nome, n, max }: { nome: string; n: number; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-40 shrink-0 truncate text-sm text-ptd-ink" title={nome}>{nome}</div>
      <div className="h-6 flex-1 overflow-hidden rounded-lg bg-black/[0.04]">
        <div className="h-full rounded-lg bg-ptd-teal/70" style={{ width: `${max ? (n / max) * 100 : 0}%`, minWidth: n ? 24 : 0 }} />
      </div>
      <div className="w-10 text-right text-sm font-bold text-ptd-ink">{n}</div>
    </div>
  );
}

export default async function OperacaoPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const sp = await searchParams;
  const p = (["7", "30", "90", "mes", "tudo"].includes(sp.p || "") ? sp.p : "tudo") as Periodo;
  const leads = await getLeadsPeriodo(p);

  const { clusters, comMsg, total } = primeiraMsgClusters(leads);
  const prof = porProfissional(leads);
  const { animal, raca } = perfilPet(leads);
  const agenda = proximasConsultas(leads);
  const maxAssunto = Math.max(1, ...clusters.map((c) => c.n));
  const maxAnimal = Math.max(1, ...animal.map((a) => a.leads));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <PageHeader title="Operação & Demanda" subtitle={`O que pedem, quem atende e os pacientes · ${periodoLabel(p)}`} />
        <PeriodFilter atual={p} />
      </div>

      {/* 1a mensagem */}
      <Card>
        <div className="mb-1 text-sm font-semibold text-ptd-ink">O que os leads pedem (1ª mensagem)</div>
        <p className="mb-4 text-xs text-ptd-muted">
          Classificação automática das primeiras mensagens — {comMsg} de {total} leads têm mensagem registrada.
        </p>
        <div className="flex flex-col gap-2.5">
          {clusters.map((c) => (
            <Barra key={c.nome} nome={c.nome} n={c.n} max={maxAssunto} />
          ))}
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profissional */}
        <Card>
          <div className="mb-4 text-sm font-semibold text-ptd-ink">Por profissional</div>
          {prof.length ? <MetricTable grupos={prof} titleCol="Profissional" /> : <p className="text-sm text-ptd-muted">Ainda pouco preenchido no CRM.</p>}
        </Card>
        {/* Pet */}
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
                  <div className="flex flex-wrap gap-1.5">
                    {raca.map((r) => <Badge key={r.nome}>{r.nome} · {r.leads}</Badge>)}
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-sm text-ptd-muted">Dados de pet ainda pouco preenchidos.</p>
          )}
        </Card>
      </div>

      {/* Agenda */}
      <Card className="mt-6">
        <div className="mb-4 text-sm font-semibold text-ptd-ink">Consultas com data registrada</div>
        {agenda.length === 0 ? (
          <p className="text-sm text-ptd-muted">Nenhuma consulta com data/hora preenchida no período.</p>
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
                  <span className="text-xs text-ptd-muted">
                    {new Date(c.data_consulta!).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
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
