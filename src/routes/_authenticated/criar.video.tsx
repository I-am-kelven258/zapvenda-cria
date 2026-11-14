import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Chips, Gerando, ScriptResult, campo } from "@/components/ScriptResult";
import { gerarRoteiroVideo, type RespostasVideo } from "@/lib/video";

export const Route = createFileRoute("/_authenticated/criar/video")({
  head: () => ({
    meta: [
      { title: "Criar Vídeo — Zapvenda MZ" },
      { name: "description", content: "Responda 7 perguntas e receba um roteiro de vídeo pronto para Veo 3, Sora ou CapCut." },
      { property: "og:title", content: "Criar Vídeo — Zapvenda MZ" },
      { property: "og:description", content: "Roteiro de vídeo completo pronto para Veo 3, Sora ou CapCut." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VideoWizard,
});

const TOTAL = 7;
const vazio: RespostasVideo = { objetivo: "", apresentar: "", pessoa: "", tom: "", voz: "", sotaque: "", idade: "", ritmo: "", cenario: "", estilo_visual: "", iluminacao: "", enquadramento: "", publico: "", obrigatorio: "", formato: "", duracao: "" };
const OBRIGATORIOS: (keyof RespostasVideo)[][] = [
  ["objetivo"], ["apresentar"], ["pessoa", "tom", "voz", "sotaque", "idade", "ritmo"],
  ["cenario", "estilo_visual", "iluminacao", "enquadramento"], ["publico"], ["obrigatorio"], ["formato", "duracao"],
];

function VideoWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [r, setR] = useState<RespostasVideo>(vazio);
  const [gerando, setGerando] = useState(false);
  const [script, setScript] = useState<string | null>(null);
  const set = (k: keyof RespostasVideo) => (v: string) => setR((x) => ({ ...x, [k]: v }));

  function proximo() {
    if (OBRIGATORIOS[step]!.some((k) => !r[k].trim())) { toast.error("Preencha tudo para continuar"); return; }
    if (step < TOTAL - 1) { setStep(step + 1); return; }
    setGerando(true);
    setTimeout(() => { setScript(gerarRoteiroVideo(r)); setGerando(false); }, 1800);
  }

  if (gerando) return <Gerando texto="Gerando seu roteiro de vídeo..." />;
  if (script) return <ScriptResult titulo="Roteiro pronto 🎬" subtitulo={r.objetivo} script={script} tipo="video" />;

  const sub = (label: string, k: keyof RespostasVideo, opcoes: readonly string[]) => (
    <div className="mt-4"><p className="mb-2 text-sm font-semibold text-muted-foreground">{label}</p><Chips opcoes={opcoes} valor={r[k]} onChange={set(k)} /></div>
  );
  const texto = (label: string, k: keyof RespostasVideo, ph: string) => (
    <div className="mt-4"><p className="mb-2 text-sm font-semibold text-muted-foreground">{label}</p><input className={campo} value={r[k]} placeholder={ph} onChange={(e) => set(k)(e.target.value)} /></div>
  );

  const telas = [
    { q: "Qual o objetivo do vídeo?", body: <input autoFocus className={`mt-4 ${campo}`} value={r.objetivo} placeholder="Ex: Vender produto, Anúncio, Apresentação" onChange={(e) => set("objetivo")(e.target.value)} /> },
    { q: "O que quer apresentar no vídeo?", body: <textarea autoFocus rows={6} className={`mt-4 resize-none ${campo}`} value={r.apresentar} placeholder="Descreva o produto, serviço ou ideia..." onChange={(e) => set("apresentar")(e.target.value)} /> },
    { q: "Quem deve aparecer no vídeo?", body: <>
      <div className="mt-4"><Chips opcoes={["Homem", "Mulher", "Mais de uma pessoa", "Nenhuma pessoa / Apenas voz"]} valor={r.pessoa} onChange={set("pessoa")} /></div>
      <h3 className="mt-6 font-display text-lg font-bold">Como a personagem deve falar e se comportar?</h3>
      {sub("Tom", "tom", ["Feliz", "Sério", "Vendedor"])}
      {sub("Voz", "voz", ["Grave", "Fina"])}
      {sub("Sotaque / País", "sotaque", ["Moçambique", "Brasil", "Portugal", "EUA"])}
      {sub("Idade", "idade", ["Jovem", "Adulto"])}
      {sub("Ritmo", "ritmo", ["Lento", "Normal", "Rápido"])}
    </> },
    { q: "Onde e como deve ser o vídeo?", body: <>
      {texto("Cenário / Local", "cenario", "Ex: Loja moderna, praia em Maputo")}
      {texto("Estilo visual", "estilo_visual", "Ex: Cinematográfico, UGC, minimalista")}
      {texto("Iluminação", "iluminacao", "Ex: Luz natural, neon, estúdio")}
      {texto("Enquadramento", "enquadramento", "Ex: Close-up, plano médio, selfie")}
    </> },
    { q: "Para quem e onde será publicado esse vídeo?", body: <input autoFocus className={`mt-4 ${campo}`} value={r.publico} placeholder="Ex: TikTok, Facebook, WhatsApp Status, Público jovem" onChange={(e) => set("publico")(e.target.value)} /> },
    { q: "O que obrigatoriamente deve aparecer ou ser dito no vídeo?", body: <textarea autoFocus rows={5} className={`mt-4 resize-none ${campo}`} value={r.obrigatorio} placeholder="Ex: Logo, preço, número de WhatsApp, 'Compre agora'..." onChange={(e) => set("obrigatorio")(e.target.value)} /> },
    { q: "Qual deve ser o formato e duração?", body: <>
      {sub("Formato", "formato", ["9:16 Vertical", "16:9 Horizontal", "1:1 Quadrado"])}
      {sub("Duração", "duracao", ["15s", "30s", "60s", "3 min"])}
    </> },
  ];
  const t = telas[step]!;

  return (
    <AppShell>
      <div className="flex gap-1.5">{telas.map((_, i) => <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`} />)}</div>
      <p className="mt-4 text-sm text-muted-foreground">Pergunta {step + 1} de {TOTAL}</p>
      <div className="mt-3 rounded-3xl border border-primary/25 bg-card p-5 shadow-xl shadow-primary/5 sm:p-7">
        <h2 className="font-display text-xl font-bold">{t.q}</h2>
        {t.body}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button onClick={() => (step === 0 ? navigate({ to: "/" }) : setStep(step - 1))} className="rounded-xl bg-secondary py-3.5 font-semibold text-secondary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">Voltar</button>
        <button onClick={proximo} className="rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground shadow-md shadow-primary/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">{step === TOTAL - 1 ? "Gerar Roteiro" : "Próximo"}</button>
      </div>
    </AppShell>
  );
}
