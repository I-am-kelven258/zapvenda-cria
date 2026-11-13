import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AjudaEmail } from "@/components/AssistenteIA";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LogIn } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Trakify — Transforme ideias em negócios digitais" },
      { name: "description", content: "Crie aplicativos, páginas de vendas e estruturas completas com IA, mesmo sem saber programar." },
      { property: "og:title", content: "Trakify" },
      { property: "og:description", content: "As ferramentas para criar e começar a vender num só lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [ver, setVer] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session?.user) navigate({ to: "/" });
      else setCheckingSession(false);
    }).catch(() => {
      if (active) setCheckingSession(false);
    });
    return () => { active = false; };
  }, [navigate]);

  async function openAccount() {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (data.session?.user) {
        navigate({ to: "/" });
      } else {
        setShowLogin(true);
      }
    } catch {
      toast.error("Não foi possível verificar a tua sessão. Tenta novamente.");
      setShowLogin(true);
    } finally {
      setLoading(false);
    }
  }

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

  const input = "w-full rounded-xl border border-border bg-card px-4 py-3.5 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary";

  if (checkingSession) {
    return <main className="flex min-h-screen items-center justify-center bg-white"><span className="text-sm text-neutral-500">A preparar a Trakify...</span></main>;
  }

  if (!showLogin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 py-16 text-black">
        <section className="mx-auto flex w-full max-w-5xl flex-col items-start">
          <h1 className="max-w-4xl font-display text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl md:text-7xl">
            Transforme uma ideia em um negócio digital <span className="underline decoration-4 underline-offset-8">pronto para vender.</span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-neutral-700 sm:text-xl md:text-2xl">
            Crie aplicativos, páginas de vendas e estruturas completas com IA, mesmo sem saber programar.
          </p>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-neutral-600 sm:text-lg">
            A Trakify coloca as ferramentas que precisas para criar e começar a vender num só lugar.
          </p>
          <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button
              type="button"
              onClick={() => setShowLogin(true)}
              className="h-14 rounded-xl bg-black px-7 text-base font-semibold text-white hover:bg-neutral-800"
            >
              Começar agora <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={openAccount}
              className="h-14 rounded-xl border-2 border-black bg-white px-7 text-base font-semibold text-black hover:bg-neutral-100"
            >
              <LogIn className="mr-2 h-5 w-5" /> Entrar na minha conta
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 text-foreground">
      <div className="w-full max-w-sm">
        <button
          type="button"
          onClick={() => setShowLogin(false)}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <h1 className="text-center font-display text-4xl font-bold">Trakify</h1>
        <p className="mt-2 text-center text-muted-foreground">Entre para continuar a criar e crescer.</p>
        <form onSubmit={submit} className="mt-8 space-y-3">
          <input className={input} type="email" aria-label="Email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <div className="relative"><input className={`${input} pr-12`} type={ver ? "text" : "password"} aria-label="Senha" autoComplete="current-password" placeholder="Senha" minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} required /><button type="button" onClick={() => setVer(!ver)} aria-label={ver ? "Esconder senha" : "Mostrar senha"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{ver ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
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
