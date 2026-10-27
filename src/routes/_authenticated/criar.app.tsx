import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Save, Loader2, Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { gerarScript, type Respostas } from "@/lib/script";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/criar/app")({
  head: () => ({
    meta: [
      { title: "Criar Aplicativo — Zapvenda MZ" },
      { name: "description", content: "Responda 6 perguntas e receba o script completo do seu aplicativo." },
      { property: "og:title", content: "Criar Aplicativo — Zapvenda MZ" },
      { property: "og:description", content: "Responda 6 perguntas e receba o script do seu app." },
    ],
  }),
  component: Wizard,
});

const PERGUNTAS: { key: keyof Respostas; q: string; ph: string }[] = [
  { key: "nome_app", q: "Qual o nome do aplicativo?", ph: "Ex: Meu App de Finanças..." },
  { key: "o_que_faz", q: "O que o app faz?", ph: "Ex: O app ajuda a controlar..." },
  { key: "publico", q: "Quem é o público-alvo?", ph: "Ex: Jovens de 18-35 anos, donos de negócios..." },
  { key: "monetizacao", q: "Qual o modelo de monetização?", ph: "Ex: Assinatura mensal/Premium" },
  { key: "objetivo", q: "Qual o objetivo principal?", ph: "Ex: Ajudar pessoas a economizar tempo e dinheiro..." },
  { key: "estilo", q: "Qual o estilo de design?", ph: "" },
];

function Wizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [r, setR] = useState<Respostas>({ nome_app: "", o_que_faz: "", publico: "", monetizacao: "", objetivo: "", estilo: "" });
  const [gerando, setGerando] = useState(false);
  const [script, setScript] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const p = PERGUNTAS[step]!;
  const valor = r[p.key];

  function proximo() {
    if (!valor.trim()) { toast.error("Responda a pergunta para continuar"); return; }
    if (step < 5) { setStep(step + 1); return; }
    setGerando(true);
    setTimeout(() => { setScript(gerarScript(r)); setGerando(false); }, 1800);
  }

  async function salvar() {
    if (!script) return;
    setSalvando(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("scripts").insert({
      user_id: u.user!.id, tipo: "app", titulo: r.nome_app, conteudo: script, script_completo: script,
      nome_app: r.nome_app, o_que_faz: r.o_que_faz, publico: r.publico, monetizacao: r.monetizacao, objetivo: r.objetivo, estilo: r.estilo,
    });
    setSalvando(false);
    if (error) { toast.error("Não foi possível salvar"); return; }
    setSalvo(true);
    toast.success("Script salvo no seu histórico!");
  }

  if (gerando) return (
    <AppShell>
      <div className="mt-24 flex flex-col items-center text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-6 font-display text-lg font-semibold">Gerando seu script com IA...</p>
        <p className="mt-1 text-sm text-muted-foreground">Organizando ideias, telas e funcionalidades</p>
      </div>
    </AppShell>
  );

  if (script) return (
    <AppShell>
      <h1 className="font-display text-2xl font-bold">Script pronto ✨</h1>
      <p className="mt-1 text-muted-foreground">{r.nome_app}</p>
      <pre className="mt-5 whitespace-pre-wrap rounded-2xl border border-primary bg-card p-5 font-sans text-sm leading-relaxed">{script}</pre>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button onClick={() => { navigator.clipboard.writeText(script); toast.success("Script copiado!"); }} className="flex items-center justify-center gap-2 rounded-xl bg-secondary py-3.5 font-semibold text-secondary-foreground"><Copy className="h-5 w-5" /> Copiar Script</button>
        <button onClick={salvo ? () => navigate({ to: "/perfil" }) : salvar} disabled={salvando} className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground disabled:opacity-60">
          {salvo ? <><Check className="h-5 w-5" /> Ver histórico</> : <><Save className="h-5 w-5" /> {salvando ? "Salvando..." : "Salvar"}</>}
        </button>
      </div>
    </AppShell>
  );

  return (
    <AppShell>
      <div className="flex gap-1.5">
        {PERGUNTAS.map((_, i) => <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`} />)}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Pergunta {step + 1} de 6</p>
      <div className="mt-3 rounded-2xl border-2 border-primary bg-card p-5">
        <h2 className="font-display text-xl font-bold">{p.q}</h2>
        {p.key === "estilo" ? (
          <div className="mt-5 space-y-3">
            {([["minimalista", "MINIMALISTA", "Limpo, branco, simples"], ["moderno", "MODERNO", "Dark mode, preto, verde neon, futurista"]] as const).map(([v, t, d]) => (
              <button key={v} onClick={() => setR({ ...r, estilo: v })} className={`w-full rounded-xl border-2 p-5 text-left transition-colors ${r.estilo === v ? "border-primary bg-accent" : "border-border bg-background"}`}>
                <div className="font-display text-lg font-bold">{t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{d}</div>
              </button>
            ))}
          </div>
        ) : (
          <textarea autoFocus rows={4} value={valor} placeholder={p.ph} onChange={(e) => setR({ ...r, [p.key]: e.target.value })}
            className="mt-4 w-full resize-none rounded-xl border border-border bg-background p-4 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" />
        )}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button onClick={() => (step === 0 ? navigate({ to: "/" }) : setStep(step - 1))} className="rounded-xl bg-secondary py-3.5 font-semibold text-secondary-foreground">Voltar</button>
        <button onClick={proximo} className="rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground">{step === 5 ? "Gerar Script" : "Próximo"}</button>
      </div>
    </AppShell>
  );
}
