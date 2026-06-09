"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { GrupoMetrica } from "@/lib/data";

const CORES: Record<string, string> = {
  "Google ADS": "#4285F4",
  "Meta - Petderma": "#1877F2",
  "Meta - Douglas": "#0A66C2",
  "Tráfego Pago": "#55C48B",
  Instagram: "#E1306C",
  TikTok: "#010101",
  Indicação: "#F59E0B",
  "(não informado)": "#C9CDD4",
};
const FALLBACK = ["#0A768F", "#00345A", "#55C48B", "#3aa873", "#7E7986", "#F59E0B"];

export function CanalChart({ grupos }: { grupos: GrupoMetrica[] }) {
  const data = grupos.map((g, i) => ({
    name: g.nome,
    value: g.leads,
    fill: CORES[g.nome] ?? FALLBACK[i % FALLBACK.length],
  }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
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
  );
}
