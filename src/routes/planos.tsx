import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AjudaEmail } from "@/components/AssistenteIA";
import { PLANOS } from "@/lib/planos";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos de acesso — Trakify" },
      { name: "description", content: "Compre acesso ao Trakify: plano mensal de 247 Meticais ou trimestral Premium de 597 Meticais." },
      { property: "og:title", content: "Planos de acesso — Trakify" },
      { property: "og:description", content: "Escolha seu acesso mensal ou trimestral Premium ao Trakify." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlanosPage,
});

function PlanosPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <header className="sticky top-0 z-50 border-b border-red-200 bg-white px-5 py-4 shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <Link to="/auth" className="font-display text-3xl font-extrabold tracking-tight text-black">Trakify<span className="text-red-700">.</span></Link>
          <Button asChild variant="outline" size="sm" className="border-2 border-black bg-white font-semibold text-black transition-all duration-200 hover:-translate-y-1 hover:bg-neutral-100 hover:shadow-md">
            <Link to="/auth"><ArrowLeft className="mr-1 h-4 w-4" />Entrar</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start px-5 py-12 text-left sm:px-6 sm:py-16">
        <section className="w-full">
          <h1 className="text-center text-3xl font-bold tracking-tight text-black sm:text-4xl">Escolhe o teu plano</h1>
          <p className="mx-auto mt-3 max-w-2xl text-center text-base leading-relaxed text-neutral-600 sm:text-lg">
            Escolhe o acesso ideal para começares a usar a Trakify.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {PLANOS.map((plano) => (
              <article key={plano.id} className={`relative flex h-full min-h-[420px] flex-col rounded-2xl border bg-white p-8 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:min-h-[460px] sm:p-10 ${plano.premium ? "border-red-500" : "border-red-300"}`}>
                {plano.premium ? (
                  <div className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap bg-white px-3 text-red-700">
                    <Crown className="h-5 w-5" />
                    <span className="text-sm font-bold tracking-wide">PREMIUM</span>
                  </div>
                ) : <div className="min-h-7" />}
                <h2 className="mt-5 text-2xl font-bold text-black sm:text-3xl">{plano.nome}</h2>
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
      </main>

      <footer className="border-t border-neutral-200 px-5 py-8">
        <div className="mx-auto max-w-4xl"><AjudaEmail /></div>
      </footer>
    </div>
  );
}
