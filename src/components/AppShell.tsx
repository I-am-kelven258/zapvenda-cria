import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, Home, User, LogOut, ArrowLeft, Mail } from "lucide-react";
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
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-4 backdrop-blur">
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
        <div className="flex max-w-[55%] shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
            title={theme === "dark" ? "Tema escuro" : "Tema claro"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-xl transition-colors hover:bg-secondary"
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
          {userName && <span className="truncate text-sm font-semibold text-foreground">{userName}</span>}
        </div>
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="overflow-y-auto border-border bg-card">
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
