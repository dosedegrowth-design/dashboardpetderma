"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPCOES: { v: string; label: string }[] = [
  { v: "7", label: "7 dias" },
  { v: "30", label: "30 dias" },
  { v: "90", label: "90 dias" },
  { v: "mes", label: "Mês atual" },
  { v: "tudo", label: "Tudo" },
];

export function PeriodFilter({ atual }: { atual: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function setP(v: string) {
    const params = new URLSearchParams(sp.toString());
    params.set("p", v);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="inline-flex rounded-xl border border-black/10 bg-white p-1 text-sm shadow-sm">
      {OPCOES.map((o) => (
        <button
          key={o.v}
          onClick={() => setP(o.v)}
          className={`rounded-lg px-3 py-1.5 font-medium transition ${
            atual === o.v ? "bg-ptd-green text-white" : "text-ptd-muted hover:text-ptd-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
