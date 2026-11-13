import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Smartphone, ChevronDown } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil e histórico — Zapvenda MZ" },
      { name: "description", content: "Veja todos os scripts que você criou no Zapvenda MZ." },
      { property: "og:title", content: "Perfil e histórico — Zapvenda MZ" },
      { property: "og:description", content: "Todos os seus scripts em um só lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const { user } = Route.useRouteContext();
  const [aberto, setAberto] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["scripts", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("scripts").select("id,tipo,titulo,conteudo,created_at").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const nome = user.user_metadata?.["full_name"] || user.user_metadata?.["name"] || "Usuário";

  return (
    <AppShell back>
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary font-display text-2xl font-bold text-primary-foreground">{String(nome)[0]?.toUpperCase()}</div>
        <div>
          <h1 className="font-display text-xl font-bold">{nome}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <h2 className="mt-8 font-display text-lg font-semibold">Histórico de scripts</h2>
      {isLoading && <p className="mt-4 text-muted-foreground">Carregando...</p>}
      {data?.length === 0 && <p className="mt-4 rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground">Nenhum script ainda. Crie seu primeiro aplicativo!</p>}
      <div className="mt-4 space-y-3">
        {data?.map((s) => (
          <div key={s.id} className="rounded-2xl border border-border bg-card">
            <button onClick={() => setAberto(aberto === s.id ? null : s.id)} className="flex w-full items-center gap-3 p-4 text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent"><Smartphone className="h-5 w-5 text-primary" /></div>
              <div className="flex-1">
                <div className="font-semibold">{s.titulo}</div>
                <div className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString("pt-PT")} · {s.tipo}</div>
              </div>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${aberto === s.id ? "rotate-180" : ""}`} />
            </button>
            {aberto === s.id && (
              <div className="border-t border-border p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{s.conteudo}</pre>
                <button onClick={() => { navigator.clipboard.writeText(s.conteudo); toast.success("Copiado!"); }} className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"><Copy className="h-4 w-4" /> Copiar</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
