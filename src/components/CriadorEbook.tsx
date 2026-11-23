import { useMemo, useState } from "react";
import { Download, FileText, BookOpen, Sparkles, Printer, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/AppShell";

type EbookDraft = {
  title: string;
  subject: string;
  audience: string;
  goal: string;
  tone: string;
  chapters: number;
};

const CHAPTER_GUIDES = [
  "Fundamentos e conceitos essenciais",
  "Preparação e primeiros passos",
  "Métodos e estratégias práticas",
  "Aplicação passo a passo",
  "Erros frequentes e como evitá-los",
  "Exemplos e exercícios práticos",
  "Como melhorar os resultados",
  "Plano de ação e próximos passos",
];

function makeChapter(title: string, subject: string, audience: string, goal: string, index: number) {
  const safeSubject = subject.trim();
  const openers = [
    `Neste capítulo, vamos explorar ${title.toLowerCase()} no contexto de ${safeSubject}. Começa por compreender os conceitos principais e a razão pela qual são importantes para ${audience}.`,
    `Antes de avançar, organiza os recursos de que precisas e define um pequeno objetivo. Ao trabalhar ${title.toLowerCase()}, mantém o foco em soluções que possam ser aplicadas à tua realidade.`,
    `Segue estas etapas: identifica a situação atual, escolhe uma ação simples, aplica-a com consistência e observa o que pode ser melhorado. Regista as tuas dúvidas e ajusta o processo sempre que necessário.`,
    `Para colocar este conteúdo em prática, experimenta um exemplo relacionado com ${safeSubject}. Divide a tarefa em passos curtos e confirma cada resultado antes de passar ao seguinte.`,
    `Revê o que aprendeste e pergunta a ti próprio: esta estratégia ajuda-me a aproximar do objetivo de ${goal.toLowerCase()}? Se necessário, adapta os passos ao teu nível de experiência.`,
  ];
  return `## Capítulo ${index + 1} — ${title}\n\n${openers.join("\n\n")}\n\n### Exercício prático\nEscreve uma ação concreta que podes realizar hoje sobre ${safeSubject}. Define quando a vais executar e como vais avaliar o resultado.\n\n### Resumo do capítulo\n- Identifica a ideia mais importante deste capítulo.\n- Aplica uma ação pequena e realista.\n- Regista os resultados e define o próximo passo.\n`;
}

function buildMarkdown(draft: EbookDraft) {
  const chapters = CHAPTER_GUIDES.slice(0, draft.chapters).map((title, index) =>
    makeChapter(title, draft.subject, draft.audience, draft.goal, index),
  );
  return `# ${draft.title}\n\n**Um guia prático sobre ${draft.subject}**\n\nPúblico-alvo: ${draft.audience}\n\n## Direitos e utilização\nMaterial de trabalho criado no Trakify. Revê, personaliza e confirma os factos antes de publicar ou comercializar.\n\n## Introdução\nEste e-book foi preparado para ${draft.audience}, com foco em ${draft.goal.toLowerCase()}. O conteúdo utiliza uma linguagem ${draft.tone.toLowerCase()} e foi organizado para ajudar o leitor a compreender o tema e avançar com passos práticos.\n\nAo longo do guia, encontrarás explicações, sugestões e exercícios. Adapta os exemplos à tua realidade e procura fontes fiáveis sempre que precisares de confirmar informação específica.\n\n${chapters.join("\n\n")}\n\n## Conclusão\nChegaste ao fim deste guia sobre ${draft.subject}. Retoma os pontos principais, escolhe as ações mais relevantes para a tua realidade e avança gradualmente. A consistência, a revisão e a aprendizagem contínua ajudam a transformar conhecimento em prática.\n\n## Plano de ação\n1. Escolhe a ideia mais útil deste e-book.\n2. Define uma ação simples e uma data para a executar.\n3. Regista o que funcionou e o que precisa de ser ajustado.\n4. Continua a aprender através de fontes credíveis.\n`;
}

export function CriadorEbook() {
  const [draft, setDraft] = useState<EbookDraft>({
    title: "",
    subject: "",
    audience: "",
    goal: "",
    tone: "Simples e profissional",
    chapters: 5,
  });
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const wordCount = useMemo(() => content.trim() ? content.trim().split(/\s+/).length : 0, [content]);

  function generate() {
    if (!draft.title.trim() || !draft.subject.trim() || !draft.audience.trim() || !draft.goal.trim()) {
      setError("Preenche o título, tema, público-alvo e objetivo para criar o teu e-book.");
      return;
    }
    setError("");
    setContent(buildMarkdown(draft));
  }

  function download() {
    if (!content) return;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${draft.title.trim().replace(/[^\p{L}\p{N}-]+/gu, "-").toLowerCase() || "meu-ebook"}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell back wide>
      <div className="mx-auto w-full max-w-5xl pb-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-rose-500/20 bg-gradient-to-br from-rose-500/[0.12] via-card to-card p-6 shadow-sm md:p-9">
          <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-rose-500/10 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-300"><BookOpen className="h-8 w-8" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">ESTÚDIO TRAKIFY</p>
              <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">Criar E-book</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Organiza a tua ideia num guia estruturado, com capítulos, exercícios e plano de ação.</p>
            </div>
          </div>
        </section>

        <section className="mt-7 rounded-3xl border border-border bg-card p-5 shadow-sm md:p-7">
          <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-rose-500" /><h2 className="text-lg font-bold">Informações do e-book</h2></div>
          <p className="mt-1 text-sm text-muted-foreground">Preenche os campos para preparar a primeira versão do teu conteúdo.</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="block md:col-span-2"><span className="mb-2 block text-sm font-semibold">Título do e-book</span><input value={draft.title} onChange={e => setDraft(v => ({ ...v, title: e.target.value }))} placeholder="Ex.: Guia prático para começar um negócio" className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15" /></label>
            <label className="block md:col-span-2"><span className="mb-2 block text-sm font-semibold">Tema ou assunto</span><textarea value={draft.subject} onChange={e => setDraft(v => ({ ...v, subject: e.target.value }))} rows={3} placeholder="Explica o tema que o e-book deve abordar..." className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15" /></label>
            <label className="block"><span className="mb-2 block text-sm font-semibold">Público-alvo</span><input value={draft.audience} onChange={e => setDraft(v => ({ ...v, audience: e.target.value }))} placeholder="Ex.: iniciantes, empreendedores..." className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15" /></label>
            <label className="block"><span className="mb-2 block text-sm font-semibold">Objetivo do e-book</span><input value={draft.goal} onChange={e => setDraft(v => ({ ...v, goal: e.target.value }))} placeholder="Ex.: ensinar a vender online" className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15" /></label>
            <label className="block"><span className="mb-2 block text-sm font-semibold">Estilo de escrita</span><select value={draft.tone} onChange={e => setDraft(v => ({ ...v, tone: e.target.value }))} className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-rose-500"><option>Simples e profissional</option><option>Didático e detalhado</option><option>Persuasivo e comercial</option><option>Descontraído e próximo</option></select></label>
            <label className="block"><span className="mb-2 block text-sm font-semibold">Número de capítulos</span><select value={draft.chapters} onChange={e => setDraft(v => ({ ...v, chapters: Number(e.target.value) }))} className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-rose-500"><option value={4}>4 capítulos</option><option value={5}>5 capítulos</option><option value={6}>6 capítulos</option><option value={7}>7 capítulos</option><option value={8}>8 capítulos</option></select></label>
          </div>
          {error && <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600">{error}</p>}
          <button type="button" onClick={generate} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition hover:-translate-y-0.5 hover:bg-rose-700 sm:w-auto"><Sparkles className="h-4 w-4" /> Gerar estrutura e conteúdo</button>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">Esta primeira versão é gerada por modelos locais de conteúdo. Não utiliza uma API de IA nem substitui a revisão humana.</p>
        </section>

        {content && (
          <section className="mt-7 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5 md:px-7">
              <div><h2 className="font-bold">Pré-visualização do e-book</h2><p className="mt-1 text-xs text-muted-foreground">{wordCount.toLocaleString("pt")} palavras · Markdown editável após descarregar</p></div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={download} className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-600 px-4 text-xs font-bold text-white transition hover:bg-rose-700"><Download className="h-4 w-4" /> Descarregar</button>
                <button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-xs font-semibold transition hover:bg-muted"><Printer className="h-4 w-4" /> Imprimir / PDF</button>
                <button type="button" onClick={() => setContent("")} aria-label="Limpar pré-visualização" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:bg-muted"><RotateCcw className="h-4 w-4" /></button>
              </div>
            </div>
            <article className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap p-5 text-sm leading-7 md:p-8">{content}</article>
          </section>
        )}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-4 text-xs leading-5 text-muted-foreground"><FileText className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /><p>Antes de publicar ou vender, revê o conteúdo, acrescenta exemplos próprios e confirma todas as informações. A exportação em PDF pode ser feita através da opção Imprimir / Guardar como PDF do navegador.</p></div>
      </div>
    </AppShell>
  );
}
