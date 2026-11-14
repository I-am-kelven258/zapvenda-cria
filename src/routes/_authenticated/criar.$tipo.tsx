import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/criar/$tipo")({
  head: () => ({
    meta: [
      { title: "Em breve — Zapvenda MZ" },
      { name: "description", content: "Esta ferramenta do Zapvenda MZ chega em breve." },
      { property: "og:title", content: "Em breve — Zapvenda MZ" },
      { property: "og:description", content: "Esta ferramenta chega em breve." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EmBreve,
});

function EmBreve() {
  return (
    <AppShell back>
      <section className="relative mx-auto mt-8 max-w-2xl overflow-hidden rounded-[2rem] border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-card to-card p-6 text-center shadow-xl shadow-rose-950/5 sm:mt-14 sm:p-10">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400"><Clock className="h-10 w-10" /></div>
        <p className="relative mt-6 text-xs font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">Estúdio Trakify</p>
        <h1 className="relative mt-2 font-display text-3xl font-extrabold tracking-tight">Esta ferramenta está a caminho.</h1>
        <p className="relative mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Estamos a preparar esta experiência. Enquanto isso, podes continuar a criar com as ferramentas já disponíveis.</p>
        <Link to="/criar/app" className="relative mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-rose-600 px-6 font-semibold text-white shadow-lg shadow-rose-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-xl">Criar Aplicativo agora</Link>
      </section>
    </AppShell>
  );
}
