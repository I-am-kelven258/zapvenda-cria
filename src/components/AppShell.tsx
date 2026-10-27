import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, Headset, Home, User, LogOut, ArrowLeft } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";

export const WHATSAPP_URL = `https://wa.me/258858941859?text=${encodeURIComponent("Olá, preciso de suporte no Zapvenda MZ")}`;

export function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Suporte no WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_30px_-6px_var(--primary)] transition-transform hover:scale-105"
    >
      <Headset className="h-6 w-6" />
    </a>
  );
}

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

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <header className="sticky top-0 z-40 grid grid-cols-[40px_1fr_40px] items-center border-b border-border bg-background/90 px-4 py-4 backdrop-blur">
        {back ? (
          <button onClick={() => window.history.back()} aria-label="Voltar" className="text-muted-foreground">
            <ArrowLeft className="h-6 w-6" />
          </button>
        ) : (
          <span />
        )}
        <Link to="/" className="text-center font-display text-xl font-bold tracking-tight text-foreground">
          zapvenda<span className="text-primary">mz</span>
        </Link>
        <button onClick={() => setOpen(true)} aria-label="Menu" className="justify-self-end text-foreground">
          <Menu className="h-6 w-6" />
        </button>
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="border-border bg-card">
          <SheetTitle className="font-display text-foreground">Menu</SheetTitle>
          <nav className="mt-6 flex flex-col gap-2">
            <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg p-3 hover:bg-secondary"><Home className="h-5 w-5 text-primary" /> Início</Link>
            <Link to="/perfil" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg p-3 hover:bg-secondary"><User className="h-5 w-5 text-primary" /> Perfil e histórico</Link>
            <button onClick={sair} className="flex items-center gap-3 rounded-lg p-3 text-left hover:bg-secondary"><LogOut className="h-5 w-5 text-primary" /> Sair</button>
          </nav>
        </SheetContent>
      </Sheet>
      <main className="mx-auto max-w-md px-4 pt-6">{children}</main>
      <WhatsAppButton />
    </div>
  );
}
