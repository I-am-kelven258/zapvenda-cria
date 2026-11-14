import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Chips, Gerando, ScriptResult, campo } from "@/components/ScriptResult";
import { gerarCopyVendas, type RespostasVendas } from "@/lib/vendas";

export const Route = createFileRoute("/_authenticated/criar/pagina-vendas")({
  head: () => ({
    meta: [
      { title: "Criar Página de Vendas — Zapvenda MZ" },
      { name: "description", content: "Responda 6 perguntas e receba a copy completa da sua página de vendas." },
      { property: "og:title", content: "Criar Página de Vendas — Zapvenda MZ" },
      { property: "og:description", content: "Copy completa de página de vendas em minutos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VendasWizard,
});

const PERGUNTAS: { key: keyof RespostasVendas; q: string; ph: string }[] = [
  { key: "produto", q: "Qual o nome do produto?", ph: "Ex: Curso de Marketing Digital" },
  { key: "o_que_faz", q: "O que o produto faz?", ph: "Ex: Ensina a vender pelo WhatsApp..." },
  { key: "publico", q: "Quem é o público?", ph: "Ex: Pequenos empreendedores em Moçambique" },
  { key: "preco", q: "Qual o preço?", ph: "Ex: 1.500 MT" },
  { key: "prova", q: "Qual a prova social?", ph: "Ex: +500 alunos, depoimentos, resultados..." },
  { key: "estilo", q: "Qual o estilo da página?", ph: "" },
];

function VendasWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [r, setR] = useState<RespostasVendas>({ produto: "", o_que_faz: "", publico: "", preco: "", prova: "", estilo: "" });
  const [gerando, setGerando] = useState(false);
  const [script, setScript] = useState<string | null>(null);
  const p = PERGUNTAS[step]!;

  function proximo() {
    if (!r[p.key].trim()) { toast.error("Responda a pergunta para continuar"); return; }
    if (step < 5) { setStep(step + 1); return; }
    setGerando(true);
    setTimeout(() => { setScript(gerarCopyVendas(r)); setGerando(false); }, 1800);
  }

  if (gerando) return <Gerando texto="Escrevendo sua copy de vendas..." />;
  if (script) return <ScriptResult titulo="Copy pronta 🛒" subtitulo={r.produto} script={script} tipo="pagina-vendas" />;

  return (
    <AppShell>
      <section className="relative mb-6 overflow-hidden rounded-[2rem] border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-card to-card p-5 shadow-xl shadow-rose-950/5 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400"><span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.7)]" />Estúdio de vendas Trakify</div>
        <h1 className="relative mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Cria uma página que apresenta e vende.</h1>
        <p className="relative mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Responde às etapas e recebe uma estrutura de copy completa, pronta para personalizar.</p>
        <div className="relative mt-6 flex items-center justify-between gap-3"><span className="rounded-full border border-rose-500/20 bg-background/80 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">ETAPA {step + 1} / 6</span><span className="text-xs font-medium text-muted-foreground">{Math.round(((step + 1) / 6) * 100)}% concluído</span></div>
        <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-to-r from-rose-600 to-red-400 transition-all duration-500" style={{ width: ((step + 1) / 6 * 100) + "%" }} /></div>
      </section>
      <div className="relative overflow-hidden rounded-[2rem] border border-rose-500/20 bg-card p-5 shadow-2xl shadow-rose-950/5 sm:p-8">
        <div className="mb-5 flex items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-lg font-black text-rose-600 dark:text-rose-400">{String(step + 1).padStart(2, "0")}</div><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-600 dark:text-rose-400">Estratégia de vendas</p><p className="text-xs text-muted-foreground">Preenche os detalhes desta etapa</p></div></div>
        <h2 className="font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{p.q}</h2>
        {p.key === "estilo" ? (
          <div className="mt-5"><Chips opcoes={["Minimalista", "Moderno dark neon", "Urgente / Escassez", "Elegante premium"]} valor={r.estilo} onChange={(v) => setR({ ...r, estilo: v })} /></div>
        ) : (
          <textarea key={p.key} autoFocus rows={4} value={r[p.key]} placeholder={p.ph} onChange={(e) => setR({ ...r, [p.key]: e.target.value })} className={`mt-6 min-h-44 resize-y ${campo}`} />
        )}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button onClick={() => (step === 0 ? navigate({ to: "/" }) : setStep(step - 1))} className="h-12 rounded-xl bg-secondary font-semibold text-secondary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">Voltar</button>
        <button onClick={proximo} className="h-12 rounded-xl bg-rose-600 font-semibold text-white shadow-lg shadow-rose-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-xl">{step === 5 ? "Gerar Copy" : "Continuar →"}</button>
      </div>
    </AppShell>
  );
}
