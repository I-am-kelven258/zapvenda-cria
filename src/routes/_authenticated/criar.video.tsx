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
      <section className="relative mb-6 overflow-hidden rounded-[2rem] border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-card to-card p-5 shadow-xl shadow-rose-950/5 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400"><span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.7)]" />Estúdio de vídeo Trakify</div>
        <h1 className="relative mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Dá vida à tua ideia.</h1>
        <p className="relative mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Define os detalhes do vídeo, etapa por etapa, e prepara um roteiro completo.</p>
        <div className="relative mt-6 flex items-center justify-between gap-3"><span className="rounded-full border border-rose-500/20 bg-background/80 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">ETAPA {step + 1} / {TOTAL}</span><span className="text-xs font-medium text-muted-foreground">{Math.round(((step + 1) / TOTAL) * 100)}% concluído</span></div>
        <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-to-r from-rose-600 to-red-400 transition-all duration-500" style={{ width: ((step + 1) / TOTAL * 100) + "%" }} /></div>
      </section>
      <div className="relative overflow-hidden rounded-[2rem] border border-rose-500/20 bg-card p-5 shadow-2xl shadow-rose-950/5 sm:p-8">
        <div className="mb-5 flex items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-lg font-black text-rose-600 dark:text-rose-400">{String(step + 1).padStart(2, "0")}</div><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-600 dark:text-rose-400">Detalhes da produção</p><p className="text-xs text-muted-foreground">Preenche os detalhes desta etapa</p></div></div>
        <h2 className="font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{t.q}</h2>
        {t.body}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button onClick={() => (step === 0 ? navigate({ to: "/" }) : setStep(step - 1))} className="h-12 rounded-xl bg-secondary font-semibold text-secondary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">Voltar</button>
        <button onClick={proximo} className="h-12 rounded-xl bg-rose-600 font-semibold text-white shadow-lg shadow-rose-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-xl">{step === TOTAL - 1 ? "Gerar Roteiro" : "Continuar →"}</button>
      </div>
    </AppShell>
  );
}
