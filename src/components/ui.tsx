import React from "react";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ptd-ink">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-ptd-muted">{subtitle}</p>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-black/5 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(0,52,90,0.08)] ${className}`}
    >
      {children}
    </div>
  );
}

const ACCENTS = {
  green: { text: "text-ptd-green-dark", bar: "bg-ptd-green" },
  navy: { text: "text-ptd-navy", bar: "bg-ptd-navy" },
  teal: { text: "text-ptd-teal", bar: "bg-ptd-teal" },
};

export function Kpi({
  label,
  value,
  sub,
  accent = "green",
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "green" | "navy" | "teal";
}) {
  const a = ACCENTS[accent];
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,52,90,0.1)]">
      <div className={`absolute left-0 top-0 h-full w-1 ${a.bar} opacity-70`} />
      <div className="text-[11px] font-semibold uppercase tracking-wide text-ptd-muted">{label}</div>
      <div className={`mt-2 text-3xl font-extrabold tabular-nums ${a.text}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-ptd-muted">{sub}</div>}
    </div>
  );
}

export function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function Badge({ children, tone = "muted" }: { children: React.ReactNode; tone?: "green" | "muted" | "navy" }) {
  const cls =
    tone === "green"
      ? "bg-ptd-green/15 text-ptd-green-dark"
      : tone === "navy"
      ? "bg-ptd-navy/10 text-ptd-navy"
      : "bg-black/5 text-ptd-muted";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}
