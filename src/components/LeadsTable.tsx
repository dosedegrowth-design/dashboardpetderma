import type { LeadRaw } from "@/lib/data";
import { brl, Badge } from "./ui";

export function LeadsTable({ leads }: { leads: LeadRaw[] }) {
  if (!leads.length) return <p className="text-sm text-ptd-muted">Nenhum lead encontrado.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/5 text-left text-xs uppercase tracking-wide text-ptd-muted">
            <th className="py-2.5 pr-4 font-semibold">Nome</th>
            <th className="py-2.5 pr-4 font-semibold">Canal</th>
            <th className="py-2.5 pr-4 font-semibold">Unidade</th>
            <th className="py-2.5 pr-4 font-semibold">Etapa</th>
            <th className="py-2.5 pr-4 font-semibold">Valor</th>
            <th className="py-2.5 pr-4 font-semibold">Criado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {leads.map((l) => (
            <tr key={l.lead_id} className="hover:bg-black/[0.015]">
              <td className="py-2.5 pr-4 font-medium text-ptd-ink">
                <div className="flex items-center gap-2">
                  <span className="truncate">{l.nome || "—"}</span>
                  {l.ganho && <Badge tone="green">consulta</Badge>}
                  {l.perdido && <Badge tone="muted">perdido</Badge>}
                </div>
                <div className="text-xs text-ptd-muted">{l.telefone || ""}</div>
              </td>
              <td className="py-2.5 pr-4 text-ptd-muted">{l.origem || "—"}</td>
              <td className="py-2.5 pr-4 text-ptd-muted">{l.unidade || "—"}</td>
              <td className="py-2.5 pr-4 text-ptd-ink">{l.status_nome || "—"}</td>
              <td className="py-2.5 pr-4 text-ptd-ink">
                {(l.valor_consulta || l.valor) > 0 ? brl(l.valor_consulta || l.valor) : "—"}
              </td>
              <td className="py-2.5 pr-4 text-ptd-muted">
                {l.criado_em ? new Date(l.criado_em).toLocaleDateString("pt-BR") : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
