import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, ShieldCheck, UserPlus, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/painel-adm")({
  head: () => ({
    meta: [
      { title: "Painel Adm — Trakify" },
      { name: "description", content: "Área de administração da Trakify." },
    ],
  }),
  component: PainelAdmPage,
});

function PainelAdmPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        const allowed = !error && data?.role === "admin";
        setIsAdmin(allowed);
        if (!allowed) navigate({ to: "/", replace: true });
      });
    return () => {
      active = false;
    };
  }, [navigate, user.id]);

  if (isAdmin === null) {
    return (
      <AppShell>
        <div className="mx-auto max-w-xl py-16 text-center text-sm text-muted-foreground">
          A verificar autorização...
        </div>
      </AppShell>
    );
  }
  if (!isAdmin) return null;

  const actions = [
    {
      to: "/usuarios" as const,
      title: "Adicionar utilizadores",
      description: "Criar novas contas, definir os dados de acesso e estabelecer a validade.",
      icon: UserPlus,
      label: "Criar utilizador",
    },
    {
      to: "/utilizadores" as const,
      title: "Ver utilizadores",
      description: "Consultar contas registadas, pesquisar utilizadores e gerir o estado de acesso.",
      icon: Users,
      label: "Gerir utilizadores",
    },
  ];

  return (
    <AppShell wide>
      <div className="mx-auto w-full max-w-5xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:-translate-x-0.5 hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao painel
        </Link>

        <section className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-500/[0.12] via-card to-card p-6 shadow-sm sm:p-9">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-red-500/10 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600 dark:text-red-400">
                TRAKIFY · ÁREA RESTRITA
              </p>
              <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Painel Adm
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Gere as contas e os acessos da tua plataforma num único lugar.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {actions.map(({ to, title, description, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="group relative flex min-h-56 flex-col justify-between overflow-hidden rounded-3xl border border-red-500/20 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-500/50 hover:shadow-[0_18px_42px_rgba(220,38,38,0.12)] sm:p-7"
            >
              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-red-500/[0.05] transition-transform duration-300 group-hover:scale-125" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 transition-colors group-hover:bg-red-600 group-hover:text-white dark:text-red-300">
                  <Icon className="h-7 w-7" />
                </div>
                <h2 className="mt-6 text-xl font-bold tracking-tight text-foreground">{title}</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
              <div className="relative mt-6 flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm font-bold text-red-600 dark:text-red-400">{label}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10 text-red-600 transition-all group-hover:translate-x-1 group-hover:bg-red-600 group-hover:text-white dark:text-red-300">
                  <ChevronRight className="h-5 w-5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
