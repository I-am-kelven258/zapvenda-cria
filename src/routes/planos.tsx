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
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border px-5 py-5">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <Link to="/auth" className="font-display text-xl font-bold">Trakify<span className="text-primary">mz</span></Link>
          <Button asChild variant="ghost" size="sm"><Link to="/auth"><ArrowLeft />Entrar</Link></Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 sm:py-16">
        <h1 className="font-display text-3xl font-bold">Planos de acesso</h1>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {PLANOS.map((plano) => (
            <article key={plano.id} className={`flex flex-col rounded-lg border bg-card p-6 ${plano.premium ? "border-primary" : "border-border"}`}>
              <div className="flex min-h-7 items-center gap-2 text-primary">
                {plano.premium && <><Crown className="h-5 w-5" /><span className="text-sm font-semibold">PREMIUM</span></>}
              </div>
              <h2 className="mt-3 font-display text-xl font-semibold">{plano.nome}</h2>
              <p className="mt-6"><span className="font-display text-4xl font-bold">{plano.preco}</span><span className="ml-2 text-sm text-muted-foreground">Meticais</span></p>
              <p className="mt-1 text-sm text-muted-foreground">por {plano.periodo}</p>
              <Button asChild variant={plano.premium ? "default" : "secondary"} className="mt-8 h-12 w-full">
                <a href={plano.checkout} aria-label={`Aderir ao ${plano.nome.toLowerCase()}`}>Aderir acesso<ArrowUpRight /></a>
              </Button>
            </article>
          ))}
        </div>
      </main>
      <footer className="px-5 pb-8"><AjudaEmail /></footer>
    </div>
  );
}