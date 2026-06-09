"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

export default function Login() {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro(false);
    const r = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha }),
    });
    if (r.ok) router.push("/");
    else {
      setErro(true);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-ptd-mint to-[#eaf3f7] px-4">
      <form onSubmit={entrar} className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-8 shadow-lg">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="mb-1 text-center text-lg font-bold text-ptd-ink">Painel Comercial</h1>
        <p className="mb-6 text-center text-sm text-ptd-muted">Acesso restrito</p>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Senha"
          className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-ptd-green"
          autoFocus
        />
        {erro && <p className="mt-2 text-xs text-red-500">Senha incorreta.</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-ptd-green py-3 text-sm font-semibold text-white transition hover:bg-ptd-green-dark disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
