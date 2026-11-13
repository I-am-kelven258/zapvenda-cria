import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, Home, User, LogOut, ArrowLeft, Mail } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { CARDS } from "@/lib/cards";
import { AssistenteIA, AjudaEmail } from "@/components/AssistenteIA";
import { SUPORTE_EMAIL } from "@/lib/assistente.functions";

export function AppShell({ children, back }: { children: ReactNode; back?: boolean }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function sair() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const item = "flex items-center gap-3 rounded-lg p-3 hover:bg-secondary";

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24 text-foreground">
      <header className="sticky top-0 z-40 grid grid-cols-[40px_1fr_40px] items-center border-b border-border bg-background/90 px-4 py-4 backdrop-blur">
        <button onClick={() => setOpen(true)} aria-label="Menu" className="text-foreground">
          <Menu className="h-6 w-6" />
        </button>
        <Link to="/" className="text-center font-display text-xl font-bold tracking-tight text-foreground">
          Trakify
        </Link>
        {back ? (
          <button onClick={() => window.history.back()} aria-label="Voltar" className="justify-self-end text-muted-foreground">
            <ArrowLeft className="h-6 w-6" />
          </button>
        ) : (
          <span />
        )}
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
