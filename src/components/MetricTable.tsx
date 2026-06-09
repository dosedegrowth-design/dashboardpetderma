import type { GrupoMetrica } from "@/lib/data";
import { brl } from "./ui";

export function MetricTable({ grupos, titleCol = "Canal" }: { grupos: GrupoMetrica[]; titleCol?: string }) {
  if (!grupos.length) return <p className="text-sm text-ptd-muted">Sem dados no período.</p>;
  const maxLeads = Math.max(1, ...grupos.map((g) => g.leads));
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/5 text-left text-xs uppercase tracking-wide text-ptd-muted">
            <th className="py-2 pr-3 font-semibold">{titleCol}</th>
            <th className="py-2 pr-3 text-right font-semibold">Leads</th>
            <th className="py-2 pr-3 text-right font-semibold">Consultas</th>
            <th className="py-2 pr-3 text-right font-semibold">Perdidos</th>
            <th className="py-2 pr-3 text-right font-semibold">Conversão</th>
            <th className="py-2 pr-3 text-right font-semibold">Valor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {grupos.map((g) => (
            <tr key={g.nome} className="hover:bg-black/[0.015]">
              <td className="py-2.5 pr-3 font-medium text-ptd-ink">
                <div>{g.nome}</div>
                <div className="mt-1 h-1.5 w-28 overflow-hidden rounded bg-black/5">
                  <div className="h-full rounded bg-ptd-green" style={{ width: `${(g.leads / maxLeads) * 100}%` }} />
                </div>
              </td>
              <td className="py-2.5 pr-3 text-right font-semibold text-ptd-ink">{g.leads}</td>
              <td className="py-2.5 pr-3 text-right text-ptd-green-dark">{g.consultas}</td>
              <td className="py-2.5 pr-3 text-right text-ptd-muted">{g.perdidos}</td>
              <td className="py-2.5 pr-3 text-right text-ptd-ink">{g.conversao.toFixed(1)}%</td>
              <td className="py-2.5 pr-3 text-right text-ptd-ink">{g.valor > 0 ? brl(g.valor) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
