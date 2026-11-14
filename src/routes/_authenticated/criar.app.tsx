import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Copy, Save, Loader2, Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { gerarScript, type Respostas } from "@/lib/script";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getValidatedUser } from "@/lib/auth-session";
import { AcaoCriarComIA } from "@/components/ScriptResult";

export const Route = createFileRoute("/_authenticated/criar/app")({
  head: () => ({
    meta: [
      { title: "Criar Aplicativo — Zapvenda MZ" },
      { name: "description", content: "Responda 6 perguntas e receba o script completo do seu aplicativo." },
      { property: "og:title", content: "Criar Aplicativo — Zapvenda MZ" },
      { property: "og:description", content: "Responda 6 perguntas e receba o script do seu app." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
  const [erro, setErro] = useState<string | null>(null);
  const pedidoEmCurso = useRef(false);

  const p = PERGUNTAS[step] ?? PERGUNTAS[0];
  if (!p) return null;
  const valor = r[p.key];

  async function proximo() {
    if (pedidoEmCurso.current) return;
    if (!valor.trim()) { toast.error("Responda a pergunta para continuar"); return; }
    if (step < 5) { setStep(step + 1); return; }
    pedidoEmCurso.current = true;
    setErro(null);
    setGerando(true);
    try {
      await new Promise((res) => setTimeout(res, 1200));
      setScript(gerarScript(r));
    } catch {
      setErro("Não foi possível gerar o script. As suas respostas foram mantidas; tente novamente.");
    } finally {
      pedidoEmCurso.current = false;
      setGerando(false);
    }
  }

  async function salvar() {
    if (!script) return;
    setSalvando(true);
    try {
    const user = await getValidatedUser(supabase);
    if (!user) { toast.error("Entre novamente para salvar o script."); return; }
    const { error } = await supabase.from("scripts").insert({
      user_id: user.id, tipo: "app", titulo: r.nome_app, conteudo: script, script_completo: script,
      nome_app: r.nome_app, o_que_faz: r.o_que_faz, publico: r.publico, monetizacao: r.monetizacao, objetivo: r.objetivo, estilo: r.estilo,
    });
    if (error) { toast.error("Não foi possível salvar"); return; }
    setSalvo(true);
    toast.success("Script salvo no seu histórico!");
    } catch {
      toast.error("Não foi possível salvar. O script continua disponível; tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  if (gerando) return (
    <AppShell>
      <div className="mt-24 flex flex-col items-center text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-6 font-display text-lg font-semibold">Gerando seu script ...</p>
        <p className="mt-1 text-sm text-muted-foreground">Organizando ideias, telas e funcionalidades</p>
      </div>
    </AppShell>
  );

  if (script) return (
    <AppShell>
      <section className="relative mb-5 overflow-hidden rounded-[2rem] border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-card to-card p-5 shadow-xl shadow-rose-950/5 sm:p-8">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">Resultado preparado pela Trakify</div>
        <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Plano do aplicativo pronto ✨</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{r.nome_app} · Estrutura detalhada e prompt para desenvolvimento</p>
      </section>
      <section className="overflow-hidden rounded-[2rem] border border-rose-500/20 bg-card shadow-2xl shadow-rose-950/5">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4"><span className="font-display font-bold">Conteúdo completo</span><span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">EDITÁVEL</span></div>
        <pre className="whitespace-pre-wrap break-words p-5 font-sans text-sm leading-7 sm:p-7">{script}</pre>
      </section>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={async () => { try { await navigator.clipboard.writeText(script); toast.success("Script copiado!"); } catch { toast.error("Não foi possível copiar o script."); } }} className="h-auto whitespace-normal rounded-xl py-3.5 font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"><Copy className="h-5 w-5" /> Copiar Script</Button>
        <Button onClick={salvo ? () => navigate({ to: "/perfil" }) : salvar} disabled={salvando} className="h-auto whitespace-normal rounded-xl bg-rose-600 py-3.5 font-semibold text-white shadow-lg shadow-rose-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-xl">
          {salvo ? <><Check className="h-5 w-5" /> Ver histórico</> : <><Save className="h-5 w-5" /> {salvando ? "Salvando..." : "Salvar"}</>}
        </Button>
      </div>
      <AcaoCriarComIA tipo="app" />
    </AppShell>
  );

  return (
    <AppShell>
      <section className="relative mb-6 overflow-hidden rounded-[2rem] border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-card to-card p-5 shadow-xl shadow-rose-950/5 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400"><span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.7)]" />Estúdio de criação Trakify</div>
        <h1 className="relative mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Vamos criar o teu aplicativo?</h1>
        <p className="relative mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Responde às etapas abaixo. Vamos transformar a tua ideia num projeto organizado.</p>
        <div className="relative mt-6 flex items-center justify-between gap-3"><span className="rounded-full border border-rose-500/20 bg-background/80 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">ETAPA {step + 1} / 6</span><span className="text-xs font-medium text-muted-foreground">{Math.round(((step + 1) / 6) * 100)}% concluído</span></div>
        <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-to-r from-rose-600 to-red-400 transition-all duration-500" style={{ width: ((step + 1) / 6 * 100) + "%" }} /></div>
      </section>
      <div className="relative overflow-hidden rounded-[2rem] border border-rose-500/20 bg-card p-5 shadow-2xl shadow-rose-950/5 sm:p-8">
        <div className="mb-5 flex items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-lg font-black text-rose-600 dark:text-rose-400">{String(step + 1).padStart(2, "0")}</div><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-600 dark:text-rose-400">A tua ideia</p><p className="text-xs text-muted-foreground">Preenche os detalhes desta etapa</p></div></div>
        <h2 className="font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{p.q}</h2>
        {p.key === "estilo" ? (
          <div className="mt-5 space-y-3">
            {([["minimalista", "MINIMALISTA", "Limpo, branco, simples"], ["moderno", "MODERNO", "Dark mode, preto, verde neon, futurista"]] as const).map(([v, t, d]) => (
              <Button variant="outline" aria-pressed={r.estilo === v} key={v} onClick={() => { setErro(null); setR({ ...r, estilo: v }); }} className={`h-auto w-full flex-col items-start whitespace-normal rounded-2xl border-2 p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${r.estilo === v ? "border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/10 ring-2 ring-rose-500/15" : "border-border bg-background hover:border-rose-500/40"}`}>
                <div className="font-display text-lg font-bold">{t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{d}</div>
              </Button>
            ))}
          </div>
        ) : (
          <textarea autoFocus aria-label={p.q} maxLength={4000} rows={4} value={valor} placeholder={p.ph} onChange={(e) => setR({ ...r, [p.key]: e.target.value })}
            className="mt-6 min-h-44 w-full resize-y rounded-2xl border border-rose-500/25 bg-background px-5 py-5 text-base leading-7 text-foreground shadow-inner shadow-rose-950/[0.03] outline-none transition-all duration-200 placeholder:text-muted-foreground/60 hover:border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10" />
        )}
      </div>
      {erro && <p role="alert" className="mt-4 text-sm text-destructive">{erro}</p>}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => { setErro(null); if (step === 0) navigate({ to: "/" }); else setStep(step - 1); }} className="h-12 rounded-xl font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">Voltar</Button>
        <Button onClick={proximo} disabled={gerando} className="h-12 rounded-xl bg-rose-600 font-semibold text-white shadow-lg shadow-rose-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-xl">{step === 5 ? "Gerar Script" : "Continuar →"}</Button>
      </div>
    </AppShell>
  );
}
