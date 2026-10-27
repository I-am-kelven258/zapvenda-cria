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
      <div className="flex gap-1.5">{PERGUNTAS.map((_, i) => <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`} />)}</div>
      <p className="mt-4 text-sm text-muted-foreground">Pergunta {step + 1} de 6</p>
      <div className="mt-3 rounded-2xl border-2 border-primary bg-card p-5">
        <h2 className="font-display text-xl font-bold">{p.q}</h2>
        {p.key === "estilo" ? (
          <div className="mt-4"><Chips opcoes={["Minimalista", "Moderno dark neon", "Urgente / Escassez", "Elegante premium"]} valor={r.estilo} onChange={(v) => setR({ ...r, estilo: v })} /></div>
        ) : (
          <textarea key={p.key} autoFocus rows={4} value={r[p.key]} placeholder={p.ph} onChange={(e) => setR({ ...r, [p.key]: e.target.value })} className={`mt-4 resize-none ${campo}`} />
        )}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button onClick={() => (step === 0 ? navigate({ to: "/" }) : setStep(step - 1))} className="rounded-xl bg-secondary py-3.5 font-semibold text-secondary-foreground">Voltar</button>
        <button onClick={proximo} className="rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground">{step === 5 ? "Gerar Copy" : "Próximo"}</button>
      </div>
    </AppShell>
  );
}
