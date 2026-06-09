import React from "react";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-ptd-ink">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-ptd-muted">{subtitle}</p>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-black/5 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${className}`}>
      {children}
    </div>
  );
}

export function Kpi({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: "green" | "navy" | "teal" }) {
  const color = accent === "navy" ? "text-ptd-navy" : accent === "teal" ? "text-ptd-teal" : "text-ptd-green-dark";
  return (
    <Card>
      <div className="text-xs font-semibold uppercase tracking-wide text-ptd-muted">{label}</div>
      <div className={`mt-2 text-3xl font-extrabold ${color}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-ptd-muted">{sub}</div>}
    </Card>
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
