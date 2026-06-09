"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Logo } from "./Logo";

const NAV = [
  { href: "/", label: "Visão Geral", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/analise", label: "Análise", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { href: "/leads", label: "Leads", icon: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4z" },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-black/5 bg-white px-4 py-6 hidden md:flex md:flex-col">
      <div className="px-2">
        <Logo />
      </div>
      <nav className="mt-8 flex flex-col gap-1">
        {NAV.map((item) => {
          const active = path === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "text-ptd-navy" : "text-ptd-muted hover:bg-black/[0.03] hover:text-ptd-ink"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="navActive"
                  className="absolute inset-0 -z-10 rounded-xl bg-ptd-green/15"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <svg className={`h-5 w-5 ${active ? "text-ptd-green" : "text-ptd-muted"}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-2 pt-6 text-[10px] text-ptd-muted">Dose de Growth · dados do CRM</div>
    </aside>
  );
}
