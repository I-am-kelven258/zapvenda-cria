import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AjudaEmail } from "@/components/AssistenteIA";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ArrowUpRight, Crown, Eye, EyeOff, LogIn, LockKeyhole, MessageCircle, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { PLANOS, WHATSAPP_SUPPORT_DISPLAY, WHATSAPP_SUPPORT_URL } from "@/lib/planos";
import { getValidatedUser } from "@/lib/auth-session";

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
    if (window.location.search.includes("acesso=expirado")) {
      toast.error("O teu período de acesso à Trakify terminou. Contacta o administrador para renovar.");
      window.history.replaceState({}, "", "/auth");
    }
  }, []);

  useEffect(() => {
    let active = true;
    getValidatedUser(supabase).then((user) => {
      if (!active) return;
      if (user) navigate({ to: "/" });
      else setCheckingSession(false);
    }).catch(() => {
      if (active) setCheckingSession(false);
    });
    return () => { active = false; };
  }, [navigate]);

  async function openAccount() {
    setLoading(true);
    try {
      const user = await getValidatedUser(supabase);
      if (user) {
        navigate({ to: "/" });
      } else {
        toast.error("Nenhuma conta encontrada neste Dispositivo, por favor escolhe um plano a assinar e comece hoje.", { duration: 9000, style: { background: "#dc2626", color: "#ffffff", border: "2px solid #991b1b", fontSize: "16px", fontWeight: 700, padding: "18px 20px", minWidth: "min(420px, calc(100vw - 32px))", boxShadow: "0 12px 32px rgba(127, 29, 29, 0.35)" } });
        document.getElementById("planos-acesso")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch {
      toast.error("Não foi possível verificar a tua sessão. Tenta novamente.");
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

  const input = "w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3.5 text-white placeholder:text-slate-400 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-500/20";

  if (checkingSession) {
    return <main className="flex min-h-screen items-center justify-center bg-white"><span className="text-sm text-neutral-500">A preparar a Trakify...</span></main>;
  }

  if (!showLogin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 py-16 text-black">
        <section className="mx-auto flex w-full max-w-5xl flex-col items-start text-left">
          <header className="sticky top-0 z-50 -mx-6 mb-10 flex w-[calc(100%+3rem)] items-center justify-between border-b border-red-200 bg-white px-6 py-4 shadow-sm">
            <span className="font-display text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
              Trakify<span className="text-red-700">.</span>
            </span>
          </header>
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
          <section id="planos-acesso" className="mt-10 w-full max-w-4xl scroll-mt-6 text-center">
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
                  <a href={WHATSAPP_SUPPORT_URL} target="_blank" rel="noreferrer" aria-label={`Falar com o suporte da Trakify pelo WhatsApp: ${WHATSAPP_SUPPORT_DISPLAY}`} className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-green-600 bg-white px-4 py-3 text-sm font-semibold text-green-700 transition-all duration-200 hover:-translate-y-1 hover:bg-green-50 hover:shadow-md active:translate-y-0">
                    <MessageCircle className="h-5 w-5" /> Suporte WhatsApp · {WHATSAPP_SUPPORT_DISPLAY}
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070b16] px-4 py-8 text-white sm:px-6 lg:py-12">
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-red-600/20 blur-[110px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -right-32 h-[28rem] w-[28rem] rounded-full bg-blue-600/15 blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.18) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
        <section className="mx-auto w-full max-w-xl lg:mx-0">
          <button
            type="button"
            onClick={() => setShowLogin(false)}
            className="mb-10 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-300 transition-all duration-200 hover:-translate-y-1 hover:text-white hover:drop-shadow-[0_6px_12px_rgba(255,255,255,0.18)] active:translate-y-0"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>

          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-red-300">
            <Sparkles className="h-4 w-4" /> PLATAFORMA INTELIGENTE
          </div>
          <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl">
            Trakify<span className="text-red-500">.</span>
          </h1>
          <h2 className="mt-5 max-w-lg text-3xl font-bold leading-tight sm:text-4xl">
            As tuas ideias. <span className="text-red-400">O próximo nível.</span>
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg">
            Entra na tua área de trabalho e continua a criar, organizar e acompanhar o crescimento dos teus projectos digitais.
          </p>

          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
              <span className="rounded-xl border border-red-400/25 bg-red-500/10 p-2 text-red-300"><Zap className="h-5 w-5" /></span>
              <div><p className="font-semibold text-white">Mais produtividade</p><p className="mt-1 text-sm leading-relaxed text-slate-400">Ferramentas para acelerar as tuas ideias.</p></div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
              <span className="rounded-xl border border-red-400/25 bg-red-500/10 p-2 text-red-300"><ShieldCheck className="h-5 w-5" /></span>
              <div><p className="font-semibold text-white">Acesso protegido</p><p className="mt-1 text-sm leading-relaxed text-slate-400">A tua conta, no teu espaço de trabalho.</p></div>
            </div>
          </div>
          <p className="mt-8 hidden items-center gap-2 text-xs tracking-wide text-slate-500 sm:flex">
            <LockKeyhole className="h-3.5 w-3.5" /> ACESSO SEGURO À TRAKIFY
          </p>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="rounded-[2rem] border border-white/15 bg-white/[0.08] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-9">
            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/15 text-red-300 shadow-[0_0_30px_rgba(239,68,68,0.18)]">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold tracking-[0.2em] text-red-300">BEM-VINDO DE VOLTA</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">Entrar na conta</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">Introduz os teus dados para continuares.</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-200">Endereço de e-mail</span>
                <input className={input} type="email" aria-label="Email" autoComplete="email" placeholder="nome@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-200">Palavra-passe</span>
                <div className="relative">
                  <input className={`${input} pr-12`} type={ver ? "text" : "password"} aria-label="Senha" autoComplete="current-password" placeholder="A tua palavra-passe" minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} required />
                  <button type="button" onClick={() => setVer(!ver)} aria-label={ver ? "Esconder senha" : "Mostrar senha"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-all duration-200 hover:-translate-y-1 hover:text-white hover:drop-shadow-[0_4px_8px_rgba(255,255,255,0.25)] active:translate-y-0">{ver ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                </div>
              </label>
              <Button type="submit" disabled={loading} className="h-14 w-full rounded-xl border border-red-400/40 bg-red-600 text-base font-bold text-white shadow-[0_8px_28px_rgba(220,38,38,0.28)] transition-all duration-200 hover:-translate-y-1 hover:bg-red-500 hover:shadow-[0_14px_38px_rgba(220,38,38,0.48)] active:translate-y-0 disabled:opacity-60">
                {loading ? "Aguarde..." : "Entrar na Trakify"} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-white/10" /><span className="text-xs text-slate-500">AINDA NÃO TENS ACESSO?</span><div className="h-px flex-1 bg-white/10" /></div>
            <Button asChild variant="outline" className="h-12 w-full rounded-xl border-white/20 bg-white/[0.04] font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-red-400/50 hover:bg-red-500/10 hover:text-white hover:shadow-[0_12px_28px_rgba(220,38,38,0.2)] active:translate-y-0">
              <Link to="/planos">Ver planos e comprar acesso <ArrowUpRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="mt-5 text-center text-slate-400"><AjudaEmail /></div>
          <p className="mt-5 text-center text-xs text-slate-600">© {new Date().getFullYear()} Trakify. Todos os direitos reservados.</p>
        </section>
      </div>
    </main>
  );
}
