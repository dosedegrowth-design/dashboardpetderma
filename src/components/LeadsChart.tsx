"use client";

import { Area, AreaChart, CartesianGrid, Line, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SerieDia } from "@/lib/data";

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
function rotulo(k: string) {
  if (k.length === 7) {
    const [y, m] = k.split("-");
    return `${MESES[Number(m) - 1]}/${y.slice(2)}`;
  }
  const [, m, d] = k.split("-");
  return `${d}/${m}`;
}

export function LeadsChart({ data }: { data: SerieDia[] }) {
  const d = data.map((p) => ({ ...p, label: rotulo(p.dia) }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={d} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#55C48B" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#55C48B" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#f0f0f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#7E7986" }} axisLine={false} tickLine={false} minTickGap={16} />
        <YAxis tick={{ fontSize: 12, fill: "#7E7986" }} axisLine={false} tickLine={false} width={40} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 13 }}
          labelStyle={{ color: "#180A32", fontWeight: 600 }}
        />
        <Area type="monotone" dataKey="leads" name="Leads" stroke="#3aa873" strokeWidth={2.5} fill="url(#g)" />
        <Line type="monotone" dataKey="consultas" name="Consultas" stroke="#00345A" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
