import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { WhatsAppButton } from "@/components/AppShell";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Zapvenda MZ" },
      { name: "description", content: "Entre ou crie sua conta no Zapvenda MZ e gere scripts de apps, vendas e mais." },
      { property: "og:title", content: "Entrar — Zapvenda MZ" },
      { property: "og:description", content: "Entre ou crie sua conta no Zapvenda MZ." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (modo === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      setLoading(false);
      if (error) return toast.error("Email ou senha inválidos");
      navigate({ to: "/" });
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { emailRedirectTo: window.location.origin, data: { full_name: nome } },
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Conta criada! Confirme pelo link enviado ao seu email.");
      setModo("entrar");
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) return toast.error("Não foi possível entrar com Google");
    if (r.redirected) return;
    navigate({ to: "/" });
  }

  const input = "w-full rounded-xl border border-border bg-card px-4 py-3.5 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 text-foreground">
      <div className="w-full max-w-sm">
        <h1 className="text-center font-display text-4xl font-bold">zapvenda<span className="text-primary">mz</span></h1>
        <p className="mt-2 text-center text-muted-foreground">Crie apps, páginas e funis em minutos.</p>
        <button onClick={google} className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-foreground py-3.5 font-semibold text-background">
          <span className="font-bold">G</span> Continuar com Google
        </button>
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />ou<div className="h-px flex-1 bg-border" /></div>
        <form onSubmit={submit} className="space-y-3">
          {modo === "criar" && <input className={input} placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} required />}
          <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className={input} type="password" placeholder="Senha" minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} required />
          <button disabled={loading} className="w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground disabled:opacity-60">
            {loading ? "Aguarde..." : modo === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        </form>
        <button onClick={() => setModo(modo === "entrar" ? "criar" : "entrar")} className="mt-5 w-full text-center text-sm text-muted-foreground">
          {modo === "entrar" ? "Não tem conta? " : "Já tem conta? "}
          <span className="font-semibold text-primary">{modo === "entrar" ? "Cadastre-se" : "Entrar"}</span>
        </button>
      </div>
      <WhatsAppButton />
    </div>
  );
}
