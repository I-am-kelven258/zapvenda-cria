import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Save, Check, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { getValidatedUser } from "@/lib/auth-session";

export function Gerando({ texto }: { texto: string }) {
  return (
    <AppShell>
      <div className="mt-24 flex flex-col items-center text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-6 font-display text-lg font-semibold">{texto}</p>
      </div>
    </AppShell>
  );
}

export function ScriptResult({ titulo, subtitulo, script, tipo }: { titulo: string; subtitulo: string; script: string; tipo: string }) {
  const navigate = useNavigate();
  const [salvo, setSalvo] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    try {
    const user = await getValidatedUser(supabase);
    if (!user) { toast.error("Entre novamente para salvar o script."); return; }
    const { error } = await supabase.from("scripts").insert({
      user_id: user.id, tipo, titulo: subtitulo, conteudo: script, script_completo: script,
    });
    if (error) { toast.error("Não foi possível salvar"); return; }
    setSalvo(true);
    toast.success("Salvo no seu histórico!");
    } catch {
      toast.error("Não foi possível salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <AppShell>
      <section className="relative mb-5 overflow-hidden rounded-[2rem] border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-card to-card p-5 shadow-xl shadow-rose-950/5 sm:p-8">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">Resultado preparado pela Trakify</div>
        <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{titulo}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{subtitulo}</p>
      </section>
      <section className="overflow-hidden rounded-[2rem] border border-rose-500/20 bg-card shadow-2xl shadow-rose-950/5">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4"><span className="font-display font-bold">Conteúdo completo</span><span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">EDITÁVEL</span></div>
        <pre className="whitespace-pre-wrap break-words p-5 font-sans text-sm leading-7 sm:p-7">{script}</pre>
      </section>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button onClick={() => { navigator.clipboard.writeText(script); toast.success("Copiado!"); }} className="flex items-center justify-center gap-2 rounded-xl bg-secondary py-3.5 font-semibold text-secondary-foreground"><Copy className="h-5 w-5" /> Copiar</button>
        <button onClick={salvo ? () => navigate({ to: "/perfil" }) : salvar} disabled={salvando} className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground disabled:opacity-60">
          {salvo ? <><Check className="h-5 w-5" /> Ver histórico</> : <><Save className="h-5 w-5" /> {salvando ? "Salvando..." : "Salvar"}</>}
        </button>
      </div>
    </AppShell>
  );
}

export function Chips({ opcoes, valor, onChange }: { opcoes: readonly string[]; valor: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {opcoes.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)} className={`rounded-xl border px-4 py-3 text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${valor === o ? "border-primary bg-primary/10 text-primary shadow-md shadow-primary/10 ring-2 ring-primary/10" : "border-primary/20 bg-background/80 hover:border-primary/50 hover:bg-accent/50"}`}>{o}</button>
      ))}
    </div>
  );
}

export const campo = "w-full min-h-12 rounded-xl border border-primary/25 bg-background/80 px-4 py-3 text-base leading-relaxed text-foreground shadow-sm shadow-primary/5 outline-none transition-all duration-200 placeholder:text-muted-foreground/75 hover:border-primary/50 hover:shadow-md hover:shadow-primary/10 focus:border-primary focus:ring-4 focus:ring-primary/15";
