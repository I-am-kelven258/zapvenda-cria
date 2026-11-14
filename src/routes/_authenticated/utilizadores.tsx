import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Clock3, Search, ShieldCheck, Users, UserRound } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { listarUtilizadoresAdmin } from "@/lib/admin-users.functions";

const ADMIN_EMAIL = "ednercioazariasbonhane2@gmail.com";

type ListedUser = {
  email: string;
  name: string;
  created_at: string;
  valid_until: string | null;
  revoked_at: string | null;
  access_record_missing: boolean;
};

export const Route = createFileRoute("/_authenticated/utilizadores")({
  component: UtilizadoresPage,
});

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(value));
}

function UtilizadoresPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<ListedUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        const session = sessionData.session;
        if (sessionError || !session) throw new Error("A tua sessão terminou. Entra novamente.");
        const allowed = session.user.email?.toLowerCase() === ADMIN_EMAIL;
        if (!active) return;
        setIsAdmin(allowed);
        if (!allowed) {
          navigate({ to: "/", replace: true });
          return;
        }
        const result = await listarUtilizadoresAdmin({ data: { accessToken: session.access_token } });
        if (!active) return;
        setUsers(result.users);
        setTotal(result.total);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Não foi possível carregar os utilizadores.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [navigate]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt");
    if (!query) return users;
    return users.filter((user) => user.name.toLocaleLowerCase("pt").includes(query) || user.email.toLocaleLowerCase("pt").includes(query));
  }, [search, users]);

  if (isAdmin === null && loading) {
    return <AppShell><div className="py-16 text-center text-sm text-muted-foreground">A verificar autorização...</div></AppShell>;
  }
  if (isAdmin === false) return null;

  return (
    <AppShell wide>
      <div className="mx-auto w-full max-w-6xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:-translate-x-0.5 hover:bg-secondary hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar ao painel
        </Link>

        <section className="overflow-hidden rounded-3xl border border-red-500/20 bg-card shadow-sm">
          <div className="border-b border-border bg-gradient-to-br from-red-500/10 via-card to-card p-6 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-500"><ShieldCheck className="h-6 w-6" /></div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-red-600 dark:text-red-400">Administração exclusiva</p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Utilizadores da Trakify</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Consulta todas as contas registadas na aplicação e acompanha a validade de cada acesso.</p>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><Users className="h-4 w-4 text-red-500" /> Total de utilizadores</div>
              <p className="mt-3 text-4xl font-bold tabular-nums text-foreground">{loading ? "—" : total}</p>
              <p className="mt-1 text-xs text-muted-foreground">Contas registadas na Trakify</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><UserRound className="h-4 w-4 text-red-500" /> A mostrar</div>
              <p className="mt-3 text-4xl font-bold tabular-nums text-foreground">{loading ? "—" : filteredUsers.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Utilizadores nesta lista</p>
            </div>
          </div>

          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            <div className="relative mb-5">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar por nome ou email..." className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/15" />
            </div>

            {error && <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-300">{error}</div>}
            {loading ? (
              <div className="rounded-2xl border border-border p-10 text-center text-sm text-muted-foreground">A carregar utilizadores...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="rounded-2xl border border-border p-10 text-center text-sm text-muted-foreground">{users.length === 0 ? "Ainda não existem utilizadores para mostrar." : "Nenhum utilizador corresponde à pesquisa."}</div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border">
                <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4 bg-muted/50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted-foreground md:grid">
                  <span>Utilizador</span><span>Email</span><span>Registado em</span><span>Validade</span>
                </div>
                <div className="divide-y divide-border">
                  {filteredUsers.map((user) => {
                    const expired = user.revoked_at !== null || (user.valid_until !== null && new Date(user.valid_until).getTime() <= Date.now());
                    const status = user.access_record_missing ? "Sem registo de acesso" : user.revoked_at ? "Acesso revogado" : user.valid_until === null ? "Sem expiração" : expired ? "Expirado" : "Ativo";
                    const statusClass = user.access_record_missing || user.revoked_at || expired ? "border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-300" : "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
                    return (
                      <div key={user.email} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-4">
                        <div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{user.name}</p><p className="mt-1 text-xs text-muted-foreground md:hidden">{user.email}</p></div>
                        <p className="hidden truncate text-sm text-muted-foreground md:block">{user.email}</p>
                        <p className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="h-4 w-4 shrink-0 text-red-500" /> {formatDate(user.created_at)}</p>
                        <div className="flex flex-wrap items-center gap-2"><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass}`}>{status}</span>{user.valid_until && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" /> Até {formatDate(user.valid_until)}</span>}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
