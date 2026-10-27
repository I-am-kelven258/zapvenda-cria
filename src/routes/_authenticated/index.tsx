import { createFileRoute, Link } from "@tanstack/react-router";
import { Smartphone, Video, Image, ShoppingCart, FileText, Sparkles, FileSignature, MessageCircle, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const CARDS = [
  { tipo: "app", label: "Criar Aplicativo", icon: Smartphone },
  { tipo: "video", label: "Criar Vídeo", icon: Video },
  { tipo: "imagem", label: "Criar Imagem", icon: Image },
  { tipo: "pagina-vendas", label: "Criar Página de Vendas", icon: ShoppingCart },
  { tipo: "pagina-documentos", label: "Criar Página de Documentos", icon: FileText },
  { tipo: "prompt", label: "Criar Prompt", icon: Sparkles },
  { tipo: "contratos", label: "Criar Contratos", icon: FileSignature },
  { tipo: "funil-whatsapp", label: "Funil de Vendas no WhatsApp", icon: MessageCircle },
] as const;

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Zapvenda MZ — Painel" },
      { name: "description", content: "Crie aplicativos, vídeos, páginas de vendas e funis de WhatsApp com o Zapvenda MZ." },
      { property: "og:title", content: "Zapvenda MZ — Painel" },
      { property: "og:description", content: "Crie aplicativos, páginas de vendas e funis de WhatsApp." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const nome = (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "").split(" ")[0];
  return (
    <AppShell>
      <h1 className="font-display text-2xl font-bold">Olá, {nome} 👋</h1>
      <p className="mt-1 text-muted-foreground">O que vamos criar hoje?</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {CARDS.map(({ tipo, label, icon: Icon }) => (
          <Link
            key={tipo}
            to={tipo === "app" ? "/criar/app" : "/criar/$tipo"}
            params={tipo === "app" ? undefined : { tipo }}
            className="group flex min-h-36 flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex items-end justify-between gap-2">
              <span className="text-sm font-semibold leading-tight">{label}</span>
              <ChevronRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
