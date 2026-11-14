import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Copy, Save, Loader2, Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { gerarScript, type Respostas } from "@/lib/script";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getValidatedUser } from "@/lib/auth-session";

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
      <h1 className="font-display text-2xl font-bold">Script pronto ✨</h1>
      <p className="mt-1 text-muted-foreground">{r.nome_app}</p>
      <pre className="mt-5 whitespace-pre-wrap break-words rounded-2xl border border-primary bg-card p-5 font-sans text-sm leading-relaxed">{script}</pre>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={async () => { try { await navigator.clipboard.writeText(script); toast.success("Script copiado!"); } catch { toast.error("Não foi possível copiar o script."); } }} className="h-auto whitespace-normal py-3.5 font-semibold"><Copy className="h-5 w-5" /> Copiar Script</Button>
        <Button onClick={salvo ? () => navigate({ to: "/perfil" }) : salvar} disabled={salvando} className="h-auto whitespace-normal py-3.5 font-semibold">
          {salvo ? <><Check className="h-5 w-5" /> Ver histórico</> : <><Save className="h-5 w-5" /> {salvando ? "Salvando..." : "Salvar"}</>}
        </Button>
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
              <Button variant="outline" aria-pressed={r.estilo === v} key={v} onClick={() => { setErro(null); setR({ ...r, estilo: v }); }} className={`h-auto w-full flex-col items-start whitespace-normal border-2 p-5 text-left ${r.estilo === v ? "border-primary bg-accent" : "border-border bg-background"}`}>
                <div className="font-display text-lg font-bold">{t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{d}</div>
              </Button>
            ))}
          </div>
        ) : (
          <textarea autoFocus aria-label={p.q} maxLength={4000} rows={4} value={valor} placeholder={p.ph} onChange={(e) => setR({ ...r, [p.key]: e.target.value })}
            className="mt-4 w-full resize-none rounded-xl border border-border bg-background p-4 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" />
        )}
      </div>
      {erro && <p role="alert" className="mt-4 text-sm text-destructive">{erro}</p>}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => { setErro(null); if (step === 0) navigate({ to: "/" }); else setStep(step - 1); }} className="h-auto py-3.5 font-semibold">Voltar</Button>
        <Button onClick={proximo} disabled={gerando} className="h-auto py-3.5 font-semibold">{step === 5 ? "Gerar Script" : "Próximo"}</Button>
      </div>
    </AppShell>
  );
}
