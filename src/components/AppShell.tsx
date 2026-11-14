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

export function AppShell({ children, back }: { children: ReactNode; back?: boolean }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [userName, setUserName] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("trakify-theme");
    const initialTheme: Theme = savedTheme === "dark" ? "dark" : "light";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");

    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      const name = user?.user_metadata?.["full_name"] || user?.user_metadata?.["name"] || user?.email?.split("@")[0] || "";
      setUserName(String(name).split(" ")[0]);
    });
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
    <div className="flex min-h-screen flex-col bg-background pb-24 text-foreground">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b-2 border-red-200 bg-background/95 px-4 py-4 shadow-sm backdrop-blur dark:border-red-900">
        <button onClick={() => setOpen(true)} aria-label="Abrir menu" className="shrink-0 text-foreground">
          <Menu className="h-6 w-6" />
        </button>
        {back && (
          <button onClick={() => window.history.back()} aria-label="Voltar" className="shrink-0 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <Link to="/" className="min-w-0 flex-1 text-left font-display text-xl font-bold tracking-tight text-foreground">
          Trakify
        </Link>
        <button
          type="button"
          onClick={() => { setSearchQuery(""); setSearchOpen(true); }}
          aria-label="Pesquisar páginas e ferramentas"
          title="Pesquisar (Ctrl+K)"
          className="flex h-10 min-w-10 items-center justify-center gap-2 rounded-full border border-red-300 bg-card px-3 text-muted-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-500 hover:text-red-600 hover:shadow-md dark:border-red-800 dark:hover:text-red-300 sm:min-w-40 sm:justify-start"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="hidden text-sm sm:inline">Pesquisar...</span>
          <kbd className="ml-auto hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground lg:inline">Ctrl K</kbd>
        </button>
        <div className="flex max-w-[55%] shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
            title={theme === "dark" ? "Tema escuro" : "Tema claro"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-300 bg-card text-red-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-500 hover:bg-red-50 hover:shadow-md dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
          >
            {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          {userName && <span className="truncate text-sm font-semibold text-foreground">{userName}</span>}
        </div>
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
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="overflow-y-auto border-r-2 border-red-200 bg-card dark:border-red-900">
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
      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-6">{children}</main>
      <footer className="mt-10 px-4"><AjudaEmail /></footer>
      <AssistenteIA />
    </div>
  );
}
