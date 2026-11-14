import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, Home, User, LogOut, ArrowLeft, Mail, Sun, Moon, Search, X, ArrowUpRight } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { CARDS } from "@/lib/cards";
import { AssistenteIA, AjudaEmail } from "@/components/AssistenteIA";
import { SUPORTE_EMAIL } from "@/lib/assistente.functions";

type Theme = "light" | "dark";

export function AppShell({ children, back, wide = false }: { children: ReactNode; back?: boolean; wide?: boolean }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("trakify-theme");
    const initialTheme: Theme = savedTheme === "dark" ? "dark" : "light";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");

    const applyUser = (user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"]) => {
      const name = user?.user_metadata?.["full_name"] || user?.user_metadata?.["name"] || user?.email?.split("@")[0] || "";
      setUserName(String(name).split(" ")[0] ?? "");
      setUserAvatar(String(user?.user_metadata?.["avatar_url"] || user?.user_metadata?.["picture"] || ""));
    };
    supabase.auth.getSession().then(({ data }) => applyUser(data.session?.user ?? null));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user ?? null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleSearchShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") setSearchOpen(false);
    }
    window.addEventListener("keydown", handleSearchShortcut);
    return () => window.removeEventListener("keydown", handleSearchShortcut);
  }, []);

  const normalizedSearch = searchQuery.trim().toLocaleLowerCase("pt");
  const matchingCards = CARDS.filter(({ label }) => label.toLocaleLowerCase("pt").includes(normalizedSearch));
  const quickPages = [
    { label: "Início", description: "Voltar ao painel principal", to: "/" as const, icon: Home },
    { label: "Perfil e histórico", description: "Consultar a tua conta e atividade", to: "/perfil" as const, icon: User },
  ].filter(({ label, description }) => `${label} ${description}`.toLocaleLowerCase("pt").includes(normalizedSearch));

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem("trakify-theme", nextTheme);
  }

  async function sair() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const item = "flex items-center gap-3 rounded-lg p-3 hover:bg-secondary";

  return (
    <div className="flex min-h-screen flex-col bg-background pb-6 text-foreground">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 shadow-sm backdrop-blur md:px-6">
        <button onClick={() => setOpen(true)} aria-label="Abrir menu" className="shrink-0 rounded-lg p-2 text-foreground transition hover:bg-secondary md:hidden">
          <Menu className="h-5 w-5" />
        </button>
        {back && (
          <button onClick={() => window.history.back()} aria-label="Voltar" className="shrink-0 rounded-lg p-2 text-muted-foreground transition hover:bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <Link to="/" className="min-w-0 flex-1 text-left font-display text-xl font-bold tracking-tight text-foreground md:flex-none">
          <span className="text-red-600">Trak</span>ify
        </Link>
        <div className="hidden h-7 w-px bg-border md:block" />
        <span className="hidden text-base font-semibold tracking-wide text-foreground md:block">Workspace</span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => { setSearchQuery(""); setSearchOpen(true); }}
          aria-label="Pesquisar páginas e ferramentas"
          title="Pesquisar (Ctrl+K)"
          className="flex h-10 min-w-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-red-400 hover:text-red-600 hover:shadow-sm sm:min-w-40 sm:justify-start"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="hidden text-sm sm:inline">Pesquisar...</span>
          <kbd className="ml-auto hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground lg:inline">Ctrl K</kbd>
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
          title={theme === "dark" ? "Tema escuro" : "Tema claro"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-400 hover:shadow-sm dark:text-red-300"
        >
          {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
        {userName && (
          <Link to="/perfil" aria-label="Abrir perfil e histórico" className="flex min-w-0 items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-secondary">
            {userAvatar ? (
              <img src={userAvatar} alt="" className="h-9 w-9 shrink-0 rounded-full border-2 border-red-500/70 object-cover" />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-red-500/50 bg-red-500/10 text-sm font-bold text-red-600">{userName.charAt(0).toUpperCase()}</span>
            )}
            <span className="hidden max-w-32 truncate text-sm font-semibold text-foreground sm:block">{userName}</span>
          </Link>
        )}
      </header>
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/70 px-3 pt-[12vh] backdrop-blur-sm sm:px-6"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setSearchOpen(false); }}
        >
          <section className="w-full max-w-xl overflow-hidden rounded-2xl border border-red-500/30 bg-card shadow-[0_24px_90px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
            <div className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-5">
              <Search className="h-5 w-5 shrink-0 text-red-500" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="O que procuras na Trakify?"
                aria-label="Pesquisar na Trakify"
                className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Fechar pesquisa" className="rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[55vh] overflow-y-auto p-3 sm:p-4">
              <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Acesso rápido</p>
              <div className="space-y-1">
                {quickPages.map(({ label, description, to, icon: Icon }) => (
                  <Link key={label} to={to} onClick={() => setSearchOpen(false)} className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition-all hover:-translate-y-0.5 hover:border-red-500/30 hover:bg-red-500/5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500"><Icon className="h-5 w-5" /></span>
                    <span className="min-w-0 flex-1"><span className="block font-semibold text-foreground">{label}</span><span className="block text-xs text-muted-foreground">{description}</span></span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-red-500" />
                  </Link>
                ))}
                {matchingCards.map(({ tipo, label, icon: Icon }) => (
                  <Link key={tipo} to="/criar/$tipo" params={{ tipo }} onClick={() => setSearchOpen(false)} className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition-all hover:-translate-y-0.5 hover:border-red-500/30 hover:bg-red-500/5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500"><Icon className="h-5 w-5" /></span>
                    <span className="min-w-0 flex-1"><span className="block font-semibold text-foreground">{label}</span><span className="block text-xs text-muted-foreground">Ferramenta da Trakify</span></span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-red-500" />
                  </Link>
                ))}
                {quickPages.length === 0 && matchingCards.length === 0 && (
                  <div className="px-3 py-8 text-center"><Search className="mx-auto h-8 w-8 text-muted-foreground/50" /><p className="mt-3 font-semibold text-foreground">Nenhum resultado encontrado</p><p className="mt-1 text-sm text-muted-foreground">Experimenta pesquisar com outras palavras.</p></div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/30 px-4 py-3 text-[11px] text-muted-foreground sm:px-5">
              <span>Pesquisa rápida da Trakify</span><span><kbd className="rounded border border-border px-1.5 py-0.5">ESC</kbd> para fechar</span>
            </div>
          </section>
        </div>
      )}
      <div className="flex min-h-0 flex-1">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col border-r border-border bg-card/70 px-4 py-6 md:flex">
          <p className="border-l-[3px] border-red-600 px-3 text-xs font-extrabold uppercase tracking-[0.16em] text-foreground">Workspace</p>
          <nav className="mt-3 flex flex-col gap-1">
            <Link to="/" className="flex items-center gap-3 rounded-xl px-3.5 py-3.5 text-base font-semibold text-foreground transition hover:bg-secondary hover:text-foreground">
              <Home className="h-[22px] w-[22px] text-red-500" /> Visão geral
            </Link>
            <p className="mb-1 mt-6 border-l-[3px] border-red-600 px-3 text-xs font-extrabold uppercase tracking-[0.16em] text-foreground">Ferramentas</p>
            {CARDS.map(({ tipo, label, icon: Icon }) => (
              <Link key={tipo} to="/criar/$tipo" params={{ tipo }} className="group flex items-center gap-3 rounded-xl px-3.5 py-3.5 text-base font-medium text-foreground transition-all hover:translate-x-0.5 hover:bg-secondary hover:text-foreground">
                <Icon className="h-[22px] w-[22px] shrink-0 text-red-500" /> <span className="flex-1">{label}</span><ArrowUpRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
              </Link>
            ))}
            <p className="mb-1 mt-6 border-l-[3px] border-red-600 px-3 text-xs font-extrabold uppercase tracking-[0.16em] text-foreground">Conta</p>
            <Link to="/perfil" className="flex items-center gap-3 rounded-xl px-3.5 py-3.5 text-base font-medium text-foreground transition hover:bg-secondary hover:text-foreground">
              <User className="h-[22px] w-[22px] text-red-500" /> Perfil e histórico
            </Link>
            <a href={`mailto:${SUPORTE_EMAIL}`} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground">
              <Mail className="h-[22px] w-[22px] text-red-500" /> Ajuda e suporte
            </a>
            <button onClick={sair} className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground">
              <LogOut className="h-[22px] w-[22px] text-red-500" /> Sair
            </button>
          </nav>
          <div className="mt-auto rounded-2xl border border-red-500/15 bg-gradient-to-br from-red-500/10 to-transparent p-4">
            <p className="text-sm font-semibold">Trakify</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">As tuas ferramentas, num só espaço.</p>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <main className={`w-full flex-1 ${wide ? "max-w-none" : "mx-auto max-w-md"} px-4 py-6 md:px-8 md:py-8`}>{children}</main>
          <footer className="px-4 pb-4 md:px-8"><AjudaEmail /></footer>
        </div>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="overflow-y-auto border-r border-border bg-card">
          <SheetTitle className="font-display text-foreground">Menu</SheetTitle>
          <nav className="mt-6 flex flex-col gap-1">
            <Link to="/" onClick={() => setOpen(false)} className={item}><Home className="h-5 w-5 text-primary" /> Início</Link>
            {CARDS.map(({ tipo, label, icon: Icon }) => (
              <Link key={tipo} to="/criar/$tipo" params={{ tipo }} onClick={() => setOpen(false)} className={item}>
                <Icon className="h-5 w-5 text-primary" /> {label}
              </Link>
            ))}
            <Link to="/perfil" onClick={() => setOpen(false)} className={item}><User className="h-5 w-5 text-primary" /> Perfil e histórico</Link>
            <a href={`mailto:${SUPORTE_EMAIL}`} className={item}><Mail className="h-5 w-5 text-primary" /> Ajuda</a>
            <button onClick={sair} className={`${item} text-left`}><LogOut className="h-5 w-5 text-primary" /> Sair</button>
          </nav>
        </SheetContent>
      </Sheet>
      <AssistenteIA />
    </div>
  );
}
