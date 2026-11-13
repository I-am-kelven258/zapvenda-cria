import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AjudaEmail } from "@/components/AssistenteIA";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ArrowUpRight, Crown, Eye, EyeOff, LogIn } from "lucide-react";
import { PLANOS } from "@/lib/planos";

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
        <section className="mx-auto flex w-full max-w-5xl flex-col items-start text-left">
          <h1 className="max-w-4xl font-display text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl md:text-7xl">
            Transforme uma ideia em um negócio digital <span className="text-red-700 underline decoration-4 decoration-red-700 underline-offset-8">pronto para vender.</span>
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
              variant="outline"
              disabled={loading}
              onClick={openAccount}
              className="h-14 rounded-xl border-2 border-black bg-white px-7 text-base font-semibold text-black transition-all duration-200 hover:-translate-y-1 hover:bg-neutral-100 hover:shadow-lg active:translate-y-0"
            >
              <LogIn className="mr-2 h-5 w-5" /> Entrar na minha conta
            </Button>
            <Button
              type="button"
              onClick={() => setShowLogin(true)}
              className="h-14 rounded-xl bg-black px-7 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-1 hover:bg-neutral-800 hover:shadow-lg active:translate-y-0"
            >
              Começar agora <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <section className="mt-12 w-full max-w-4xl text-center">
            <h2 className="mb-5 text-center text-2xl font-bold tracking-tight text-black sm:text-3xl">O que oferece</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                "Criador de app com IA",
                "Criador de Página de vendas",
                "Criador de criativos em vídeos virais",
                "Rastreamento de vendas",
              ].map((title, index) => (
                <div key={title} className="flex min-h-36 flex-col items-start justify-between rounded-2xl border border-red-300 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:border-red-500 hover:shadow-lg sm:min-h-40 sm:p-5">
                  <span className="text-sm font-bold tracking-wider text-red-700">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-5 text-left text-lg font-semibold leading-tight text-black sm:text-xl">{title}</h3>
                </div>
              ))}
            </div>
          </section>
          <div className="mt-12 w-full border-t border-neutral-200" />
          <section className="mt-10 w-full max-w-4xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">Para quem é a Trakify?</h2>
            <p className="mx-auto mt-3 max-w-4xl text-2xl font-bold uppercase tracking-wide text-red-700 sm:text-3xl md:text-4xl">
              Para quem quer vender mais pela internet
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3 text-left sm:grid-cols-3">
              {[
                { title: "Empreendedores digitais", description: "Transforma ideias em projectos online." },
                { title: "Afiliados", description: "Divulga ofertas e acompanha resultados." },
                { title: "Pequenos negócios", description: "Apresenta produtos e conquista clientes." },
                { title: "Criadores de conteúdo", description: "Cria conteúdos para atrair público." },
                { title: "Quem está a começar", description: "Dá os primeiros passos nas vendas online." },
              ].map(({ title, description }) => (
                <div key={title} className="flex min-h-28 flex-col justify-center rounded-xl border border-red-200 bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:border-red-400 hover:shadow-md">
                  <h3 className="text-base font-semibold leading-tight text-black sm:text-lg">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600 sm:text-base">{description}</p>
                </div>
              ))}
            </div>
          </section>
          <div className="mt-12 w-full border-t border-neutral-200" />
          <section className="mt-10 w-full max-w-4xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">Escolhe o teu plano</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
              Escolhe o acesso ideal para começares a usar a Trakify.
            </p>
            <div className="mt-7 grid gap-4 text-left sm:grid-cols-2">
              {PLANOS.map((plano) => (
                <article key={plano.id} className={`relative flex h-full min-h-[420px] flex-col rounded-2xl border bg-white p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:min-h-[460px] sm:p-10 ${plano.premium ? "border-red-500" : "border-red-300"}`}>
                  {plano.premium ? (
                    <div className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap bg-white px-3 text-red-700">
                      <Crown className="h-5 w-5" />
                      <span className="text-sm font-bold tracking-wide">PREMIUM</span>
                    </div>
                  ) : <div className="min-h-7" />}
                  <h3 className="mt-5 text-2xl font-bold text-black sm:text-3xl">{plano.nome}</h3>
                  <p className="mt-5 text-black">
                    <span className="text-5xl font-bold sm:text-6xl">{plano.preco}</span>
                    <span className="ml-2 text-sm text-neutral-600">Meticais</span>
                  </p>
                  <p className="mt-1 text-sm text-neutral-600">por {plano.periodo}</p>
                  <a href={plano.checkout} target="_blank" rel="noreferrer" aria-label={`Aderir ao ${plano.nome.toLowerCase()}`} className="mt-auto inline-flex h-14 w-full items-center justify-center rounded-xl bg-black px-5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-1 hover:bg-neutral-800 hover:shadow-lg active:translate-y-0">
                    Aderir acesso <ArrowUpRight className="ml-2 h-4 w-4" />
                  </a>
                </article>
              ))}
            </div>
          </section>
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
          className="mb-8 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-muted-foreground transition-all duration-200 hover:-translate-y-1 hover:text-foreground hover:shadow-md active:translate-y-0"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <h1 className="text-center font-display text-4xl font-bold">Trakify</h1>
        <p className="mt-2 text-center text-muted-foreground">Entre para continuar a criar e crescer.</p>
        <form onSubmit={submit} className="mt-8 space-y-3">
          <input className={input} type="email" aria-label="Email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <div className="relative"><input className={`${input} pr-12`} type={ver ? "text" : "password"} aria-label="Senha" autoComplete="current-password" placeholder="Senha" minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} required /><button type="button" onClick={() => setVer(!ver)} aria-label={ver ? "Esconder senha" : "Mostrar senha"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md text-muted-foreground transition-all duration-200 hover:-translate-y-1 hover:text-foreground hover:shadow-md active:translate-y-0">{ver ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
          <Button type="submit" disabled={loading} className="h-auto w-full rounded-xl py-3.5 font-semibold transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 disabled:opacity-60">
            {loading ? "Aguarde..." : "Entrar"}
          </Button>
        </form>
        <Button asChild variant="link" className="mt-5 w-full font-semibold transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:translate-y-0">
          <Link to="/planos">COMPRAR ACESSO</Link>
        </Button>
      </div>
      <div className="mt-8"><AjudaEmail /></div>
    </div>
  );
}
