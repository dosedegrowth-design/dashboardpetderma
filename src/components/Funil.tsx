import type { FunilEtapa } from "@/lib/data";

export function Funil({ etapas }: { etapas: FunilEtapa[] }) {
  const max = Math.max(1, ...etapas.map((e) => e.n));
  const cor = (tipo: string) =>
    tipo === "ganho" ? "bg-ptd-green" : tipo === "perdido" ? "bg-ptd-muted/50" : tipo === "entrada" ? "bg-ptd-teal/70" : "bg-ptd-navy/70";
  return (
    <div className="flex flex-col gap-3">
      {etapas.map((e) => (
        <div key={e.nome} className="flex items-center gap-3">
          <div className="w-44 shrink-0 truncate text-sm font-medium text-ptd-ink" title={e.nome}>
            {e.nome}
          </div>
          <div className="relative h-7 flex-1 overflow-hidden rounded-lg bg-black/[0.04]">
            <div
              className={`h-full rounded-lg ${cor(e.tipo)} transition-all`}
              style={{ width: `${(e.n / max) * 100}%`, minWidth: e.n ? 28 : 0 }}
            />
          </div>
          <div className="w-10 shrink-0 text-right text-sm font-bold text-ptd-ink">{e.n}</div>
        </div>
      ))}
    </div>
  );
}
