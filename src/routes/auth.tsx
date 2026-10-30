import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AjudaEmail } from "@/components/AssistenteIA";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Zapvenda MZ" },
      { name: "description", content: "Entre no Zapvenda MZ ou compre seu acesso pelos planos mensal e trimestral Premium." },
      { property: "og:title", content: "Entrar — Zapvenda MZ" },
      { property: "og:description", content: "Entre no Zapvenda MZ ou escolha um plano de acesso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) { toast.error("Email ou senha inválidos"); return; }
      navigate({ to: "/" });
    } catch {
      toast.error("Não foi possível entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) { toast.error("Não foi possível entrar com Google"); return; }
    if (r.redirected) return;
    navigate({ to: "/" });
  }

  const input = "w-full rounded-xl border border-border bg-card px-4 py-3.5 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 text-foreground">
      <div className="w-full max-w-sm">
        <h1 className="text-center font-display text-4xl font-bold">zapvenda<span className="text-primary">mz</span></h1>
        <p className="mt-2 text-center text-muted-foreground">Crie apps, páginas e funis em minutos.</p>
        <Button onClick={google} className="mt-8 h-auto w-full gap-3 rounded-xl bg-foreground py-3.5 font-semibold text-background hover:bg-foreground/90">
          <span className="font-bold">G</span> Continuar com Google
        </Button>
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />ou<div className="h-px flex-1 bg-border" /></div>
        <form onSubmit={submit} className="space-y-3">
          <input className={input} type="email" aria-label="Email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className={input} type="password" aria-label="Senha" autoComplete="current-password" placeholder="Senha" minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} required />
          <Button type="submit" disabled={loading} className="h-auto w-full rounded-xl py-3.5 font-semibold disabled:opacity-60">
            {loading ? "Aguarde..." : "Entrar"}
          </Button>
        </form>
        <Button asChild variant="link" className="mt-5 w-full font-semibold">
          <Link to="/planos">COMPRAR ACESSO</Link>
        </Button>
      </div>
      <div className="mt-8"><AjudaEmail /></div>
    </div>
  );
}
