import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Save, Check, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

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
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("scripts").insert({
      user_id: u.user!.id, tipo, titulo: subtitulo, conteudo: script, script_completo: script,
    });
    setSalvando(false);
    if (error) { toast.error("Não foi possível salvar"); return; }
    setSalvo(true);
    toast.success("Salvo no seu histórico!");
  }

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-bold">{titulo}</h1>
      <p className="mt-1 text-muted-foreground">{subtitulo}</p>
      <pre className="mt-5 whitespace-pre-wrap rounded-2xl border border-primary bg-card p-5 font-sans text-sm leading-relaxed">{script}</pre>
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
        <button key={o} type="button" onClick={() => onChange(o)} className={`rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-colors ${valor === o ? "border-primary bg-accent text-primary" : "border-border bg-background"}`}>{o}</button>
      ))}
    </div>
  );
}

export const campo = "w-full rounded-xl border border-border bg-background p-4 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary";
