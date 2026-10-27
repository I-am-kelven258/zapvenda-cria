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
    ],
  }),
  component: EmBreve,
});

function EmBreve() {
  return (
    <AppShell back>
      <div className="mt-16 flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent"><Clock className="h-10 w-10 text-primary" /></div>
        <h1 className="mt-6 font-display text-2xl font-bold">Em breve</h1>
        <p className="mt-2 text-muted-foreground">Estamos preparando esta ferramenta para você.</p>
        <Link to="/criar/app" className="mt-8 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground">Criar Aplicativo agora</Link>
      </div>
    </AppShell>
  );
}
