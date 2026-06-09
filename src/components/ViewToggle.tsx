"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ViewToggle({ atual, opcoes }: { atual: string; opcoes: { v: string; label: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  function set(v: string) {
    const params = new URLSearchParams(sp.toString());
    params.set("view", v);
    router.push(`${pathname}?${params.toString()}`);
  }
  return (
    <div className="inline-flex rounded-xl border border-black/10 bg-white p-1 text-sm shadow-sm">
      {opcoes.map((o) => (
        <button
          key={o.v}
          onClick={() => set(o.v)}
          className={`rounded-lg px-3 py-1.5 font-medium transition ${
            atual === o.v ? "bg-ptd-navy text-white" : "text-ptd-muted hover:text-ptd-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
