"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { GrupoMetrica } from "@/lib/data";

const CORES: Record<string, string> = {
  "Google ADS": "#4285F4",
  "Meta - Petderma": "#1877F2",
  "Meta - Douglas": "#0A66C2",
  "Tráfego Pago": "#55C48B",
  Instagram: "#E1306C",
  TikTok: "#111111",
  Indicação: "#F59E0B",
  "(não informado)": "#D4D8DE",
};
const FALLBACK = ["#0A768F", "#00345A", "#55C48B", "#3aa873", "#7E7986", "#F59E0B"];

export function CanalChart({ grupos }: { grupos: GrupoMetrica[] }) {
  const total = grupos.reduce((a, g) => a + g.leads, 0);
  const data = grupos.map((g, i) => ({
    name: g.nome,
    value: g.leads,
    fill: CORES[g.nome] ?? FALLBACK[i % FALLBACK.length],
  }));
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[180px] w-[180px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={56}
              outerRadius={84}
              paddingAngle={2}
              stroke="none"
              animationDuration={700}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 13 }}
              formatter={(v: number, n: string) => [`${v} leads`, n]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-extrabold text-ptd-ink tabular-nums">{total}</div>
          <div className="text-[10px] uppercase tracking-wide text-ptd-muted">leads</div>
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        {data.slice(0, 6).map((d) => (
          <div key={d.name} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.fill }} />
            <span className="min-w-0 flex-1 truncate text-ptd-ink">{d.name}</span>
            <span className="font-semibold text-ptd-ink tabular-nums">{d.value}</span>
            <span className="w-10 text-right text-xs text-ptd-muted tabular-nums">
              {total ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
