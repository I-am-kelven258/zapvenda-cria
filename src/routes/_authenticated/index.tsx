import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, UserPlus, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CARDS } from "@/lib/cards";
export { CARDS };

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Trakify — Painel" },
      { name: "description", content: "Crie aplicativos, vídeos, páginas de vendas e funis de WhatsApp com a Trakify." },
      { property: "og:title", content: "Trakify — Painel" },
      { property: "og:description", content: "Crie aplicativos, páginas de vendas e funis de WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const isAdmin = user?.email?.toLowerCase() === "ednercioazariasbonhane2@gmail.com";
  return (
    <AppShell wide>
      <div className="mx-auto w-full max-w-7xl">
        <section className="relative overflow-hidden rounded-3xl border border-red-500/15 bg-gradient-to-br from-red-500/[0.09] via-card to-card p-6 shadow-sm md:p-9">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-red-500/10 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600 dark:text-red-400">PAINEL DE CONTROLO</p>
            <h1 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">O que vamos criar hoje?</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">Acede às ferramentas da Trakify e transforma as tuas ideias em novos projetos.</p>
            {isAdmin && (
              <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row">
                <Link to="/usuarios" className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-600 px-5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(220,38,38,0.2)] transition-all duration-200 hover:-translate-y-1 hover:bg-red-500 hover:shadow-[0_14px_32px_rgba(220,38,38,0.32)] active:translate-y-0">
                  <UserPlus className="h-4 w-4" /> Adicionar utilizadores <ChevronRight className="h-4 w-4" />
                </Link>
                <Link to="/utilizadores" className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-card px-5 text-sm font-bold text-foreground shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-red-500 hover:text-red-600 hover:shadow-[0_14px_32px_rgba(220,38,38,0.12)] active:translate-y-0">
                  <Users className="h-4 w-4" /> Ver utilizadores <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
          <div className="pointer-events-none absolute bottom-0 right-8 hidden h-36 w-36 items-center justify-center rounded-full border border-red-500/10 md:flex">
            <div className="h-24 w-24 rounded-full border border-red-500/15" />
          </div>
        </section>
        <div className="mt-9 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">O TEU WORKSPACE</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground md:text-2xl">Ferramentas de criação</h2>
            <p className="mt-1 text-sm text-muted-foreground">Escolhe uma ferramenta para começar.</p>
          </div>
          <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">{CARDS.length} ferramentas disponíveis</span>
        </div>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CARDS.map(({ tipo, label, icon: Icon }) => (
          <Link
            key={tipo}
            to="/criar/$tipo"
            params={{ tipo }}
            className="group relative flex min-h-44 w-full min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-red-500/60 hover:shadow-[0_16px_40px_rgba(220,38,38,0.10)] active:translate-y-0 md:p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 transition-all duration-200 group-hover:scale-105 group-hover:bg-red-500 group-hover:text-white dark:text-red-300 dark:group-hover:text-white">
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex items-end justify-between gap-2">
              <span className="text-base font-semibold leading-tight md:text-lg">{label}<span className="mt-1 block text-xs font-normal text-muted-foreground">Abrir ferramenta</span></span>
              <ChevronRight className="h-5 w-5 shrink-0 text-red-600 transition-transform group-hover:translate-x-1 dark:text-red-300" />
            </div>
          </Link>
        ))}
      </div>
      </div>
    </AppShell>
  );
}
