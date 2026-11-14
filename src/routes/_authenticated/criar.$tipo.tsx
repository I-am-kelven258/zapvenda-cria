import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BrainCircuit, MessageCircle, Search, Globe, BookOpen, PenTool, Image,
  Video, Code2, Palette, AudioLines, Sparkles, ArrowUpRight, Filter,
  Clock, FileText, Languages, Lightbulb, WandSparkles, MonitorPlay,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { IntegracoesVendas } from "@/components/IntegracoesVendas";

export const Route = createFileRoute("/_authenticated/criar/$tipo")({
  head: () => ({
    meta: [
      { title: "Banco de IA — Trakify" },
      { name: "description", content: "Descobre 28 ferramentas externas de inteligência artificial, organizadas por área." },
    ],
  }),
  component: CriarTipo,
});

const AI_TOOLS = [
  { name: "ChatGPT", area: "Assistentes", role: "Assistente de IA", description: "Ajuda a escrever, estudar, organizar ideias, analisar informação e resolver tarefas.", url: "https://chatgpt.com", icon: MessageCircle, logo: "https://www.google.com/s2/favicons?domain=chatgpt.com&sz=128" },
  { name: "Google Gemini", area: "Assistentes", role: "Assistente multimodal", description: "Responde a perguntas e ajuda a trabalhar com texto, imagens e outras tarefas.", url: "https://gemini.google.com", icon: Sparkles, logo: "https://www.google.com/s2/favicons?domain=gemini.google.com&sz=128" },
  { name: "Claude", area: "Assistentes", role: "Assistente de escrita e análise", description: "Útil para compreender documentos, desenvolver ideias e trabalhar com textos longos.", url: "https://claude.ai", icon: BookOpen, logo: "https://www.google.com/s2/favicons?domain=claude.ai&sz=128" },
  { name: "Microsoft Copilot", area: "Assistentes", role: "Assistente de produtividade", description: "Ajuda com perguntas, criação de conteúdo e tarefas de produtividade.", url: "https://copilot.microsoft.com", icon: MonitorPlay, logo: "https://www.google.com/s2/favicons?domain=copilot.microsoft.com&sz=128" },
  { name: "DeepSeek", area: "Assistentes", role: "Assistente de raciocínio", description: "Ferramenta conversacional para perguntas, explicações e apoio à programação.", url: "https://www.deepseek.com", icon: Lightbulb, logo: "https://www.google.com/s2/favicons?domain=deepseek.com&sz=128" },
  { name: "Mistral Le Chat", area: "Assistentes", role: "Assistente de IA", description: "Assistente para conversar, pesquisar ideias e executar tarefas com IA.", url: "https://chat.mistral.ai", icon: BrainCircuit, logo: "https://www.google.com/s2/favicons?domain=chat.mistral.ai&sz=128" },
  { name: "Lovable", area: "Programação", role: "Criação de aplicações com IA", description: "Transforma instruções em aplicações web e ajuda a construir interfaces e funcionalidades.", url: "https://lovable.dev", icon: Code2, logo: "https://www.google.com/s2/favicons?domain=lovable.dev&sz=128" },
  { name: "Perplexity", area: "Pesquisa", role: "Motor de pesquisa com IA", description: "Pesquisa temas e apresenta respostas acompanhadas de fontes para consulta.", url: "https://www.perplexity.ai", icon: Search, logo: "https://www.google.com/s2/favicons?domain=perplexity.ai&sz=128" },
  { name: "NotebookLM", area: "Pesquisa", role: "Assistente de pesquisa", description: "Ajuda a estudar e resumir informação a partir das fontes que forneceres.", url: "https://notebooklm.google.com", icon: BookOpen, logo: "https://www.google.com/s2/favicons?domain=notebooklm.google.com&sz=128" },
  { name: "You.com", area: "Pesquisa", role: "Pesquisa com IA", description: "Ajuda a pesquisar na web, explorar assuntos e organizar informação.", url: "https://you.com", icon: Globe, logo: "https://www.google.com/s2/favicons?domain=you.com&sz=128" },
  { name: "Grammarly", area: "Escrita", role: "Revisão de texto", description: "Ajuda a rever gramática, clareza, tom e qualidade da escrita.", url: "https://www.grammarly.com", icon: Languages, logo: "https://www.google.com/s2/favicons?domain=grammarly.com&sz=128" },
  { name: "QuillBot", area: "Escrita", role: "Reescrita e resumo", description: "Ferramentas para reformular, resumir e melhorar textos.", url: "https://quillbot.com", icon: FileText, logo: "https://www.google.com/s2/favicons?domain=quillbot.com&sz=128" },
  { name: "Writesonic", area: "Escrita", role: "Criação de conteúdo", description: "Apoia a criação de textos, conteúdos digitais e materiais de marketing.", url: "https://writesonic.com", icon: PenTool, logo: "https://www.google.com/s2/favicons?domain=writesonic.com&sz=128" },
  { name: "Jasper", area: "Escrita", role: "Conteúdo de marketing", description: "Ajuda equipas a planear e produzir conteúdos para comunicação e marketing.", url: "https://www.jasper.ai", icon: WandSparkles, logo: "https://www.google.com/s2/favicons?domain=jasper.ai&sz=128" },
  { name: "Canva Magic Studio", area: "Design e imagem", role: "Design com IA", description: "Cria e edita peças visuais e apresentações com ferramentas de IA.", url: "https://www.canva.com/magic/", icon: Palette, logo: "https://www.google.com/s2/favicons?domain=canva.com&sz=128" },
  { name: "Adobe Firefly", area: "Design e imagem", role: "Criação visual", description: "Gera e transforma imagens e elementos visuais através de IA.", url: "https://firefly.adobe.com", icon: Image, logo: "https://www.google.com/s2/favicons?domain=firefly.adobe.com&sz=128" },
  { name: "Leonardo AI", area: "Design e imagem", role: "Gerador de imagens", description: "Cria imagens e recursos visuais a partir de descrições.", url: "https://leonardo.ai", icon: Sparkles, logo: "https://www.google.com/s2/favicons?domain=leonardo.ai&sz=128" },
  { name: "Ideogram", area: "Design e imagem", role: "Imagens e tipografia", description: "Gera imagens e designs, incluindo composições com texto.", url: "https://ideogram.ai", icon: Image, logo: "https://www.google.com/s2/favicons?domain=ideogram.ai&sz=128" },
  { name: "Google ImageFX", area: "Design e imagem", role: "Gerador de imagens", description: "Experimenta criar imagens a partir de instruções escritas.", url: "https://labs.google/fx/tools/image-fx", icon: WandSparkles, logo: "https://www.google.com/s2/favicons?domain=labs.google&sz=128" },
  { name: "Runway", area: "Vídeo", role: "Criação e edição de vídeo", description: "Ferramentas de IA para gerar, transformar e editar conteúdos em vídeo.", url: "https://runwayml.com", icon: Video, logo: "https://www.google.com/s2/favicons?domain=runwayml.com&sz=128" },
  { name: "Pika", area: "Vídeo", role: "Geração de vídeo", description: "Transforma ideias e imagens em pequenos conteúdos de vídeo com IA.", url: "https://pika.art", icon: MonitorPlay, logo: "https://www.google.com/s2/favicons?domain=pika.art&sz=128" },
  { name: "Luma Dream Machine", area: "Vídeo", role: "Geração de vídeo", description: "Cria sequências de vídeo a partir de instruções e imagens.", url: "https://lumalabs.ai/dream-machine", icon: Video, logo: "https://www.google.com/s2/favicons?domain=lumalabs.ai&sz=128" },
  { name: "Kling AI", area: "Vídeo", role: "Geração de vídeo", description: "Ferramenta para criar vídeos com IA a partir de texto ou imagens.", url: "https://klingai.com", icon: Video, logo: "https://www.google.com/s2/favicons?domain=klingai.com&sz=128" },
  { name: "ElevenLabs", area: "Áudio", role: "Voz e áudio com IA", description: "Cria vozes sintéticas e trabalha com narração e áudio.", url: "https://elevenlabs.io", icon: AudioLines, logo: "https://www.google.com/s2/favicons?domain=elevenlabs.io&sz=128" },
  { name: "Suno", area: "Áudio", role: "Criação musical", description: "Experimenta criar músicas e ideias sonoras a partir de descrições.", url: "https://suno.com", icon: AudioLines, logo: "https://www.google.com/s2/favicons?domain=suno.com&sz=128" },
  { name: "GitHub Copilot", area: "Programação", role: "Assistente de código", description: "Ajuda a escrever, compreender e melhorar código durante o desenvolvimento.", url: "https://github.com/features/copilot", icon: Code2, logo: "https://www.google.com/s2/favicons?domain=github.com&sz=128" },
  { name: "Cursor", area: "Programação", role: "Editor de código com IA", description: "Ambiente de programação com assistência de IA para trabalhar em projetos.", url: "https://cursor.com", icon: Code2, logo: "https://www.google.com/s2/favicons?domain=cursor.com&sz=128" },
  { name: "Replit", area: "Programação", role: "Desenvolvimento de aplicações", description: "Cria, executa e partilha projetos de software num ambiente online.", url: "https://replit.com", icon: Code2, logo: "https://www.google.com/s2/favicons?domain=replit.com&sz=128" },
] as const;

const AREAS = ["Todas as áreas", ...Array.from(new Set(AI_TOOLS.map((tool) => tool.area)))];

function BancoIA() {
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("Todas as áreas");
  const filteredTools = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return AI_TOOLS.filter((tool) => {
      const matchesArea = area === "Todas as áreas" || tool.area === area;
      const matchesSearch = !term || [tool.name, tool.role, tool.description, tool.area].some((value) => value.toLocaleLowerCase().includes(term));
      return matchesArea && matchesSearch;
    });
  }, [search, area]);

  return (
    <AppShell back wide>
      <main className="mx-auto w-full max-w-7xl pb-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-rose-500/20 bg-gradient-to-br from-rose-500/[0.11] via-card to-card p-6 shadow-sm md:p-9">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-300 md:h-16 md:w-16"><BrainCircuit className="h-8 w-8 md:h-9 md:w-9" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">TRAKIFY • FERRAMENTAS</p>
              <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">Banco de IA</h1>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">28 ferramentas externas de IA. Organizadas por área.</p>
            </div>
          </div>
        </section>

        <section className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_260px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar IAs por nome ou função..." className="h-14 w-full rounded-2xl border border-border bg-card pl-12 pr-4 text-sm text-foreground outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15" />
          </label>
          <label className="relative block">
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <select value={area} onChange={(event) => setArea(event.target.value)} className="h-14 w-full appearance-none rounded-2xl border border-border bg-card pl-12 pr-4 text-sm font-medium text-foreground outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15">
              {AREAS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </section>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-foreground">Explorar ferramentas</h2>
            <p className="mt-1 text-sm text-muted-foreground">{filteredTools.length} {filteredTools.length === 1 ? "ferramenta encontrada" : "ferramentas encontradas"}</p>
          </div>
          {(search || area !== "Todas as áreas") && <button type="button" onClick={() => { setSearch(""); setArea("Todas as áreas"); }} className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-rose-500 hover:text-rose-600">Limpar filtros</button>}
        </div>

        {filteredTools.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <article key={tool.name} className="group flex min-h-[248px] flex-col rounded-[1.5rem] border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-500/50 hover:shadow-[0_16px_36px_rgba(220,38,38,0.10)] md:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-white p-2 shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md"><Icon className="absolute h-6 w-6 text-slate-400" /><img src={tool.logo} alt={`Logótipo ${tool.name}`} loading="lazy" referrerPolicy="no-referrer" className="relative z-10 h-full w-full object-contain" /></div>
                    <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-[11px] font-semibold text-muted-foreground">{tool.area}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold tracking-tight text-foreground">{tool.name}</h3>
                  <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">{tool.role}</p>
                  <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{tool.description}</p>
                  <a href={tool.url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-600/20">
                    Aceder à IA <ArrowUpRight className="h-4 w-4" />
                  </a>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-3xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
            <Search className="mx-auto h-9 w-9 text-muted-foreground" />
            <h3 className="mt-4 font-bold text-foreground">Nenhuma IA encontrada</h3>
            <p className="mt-1 text-sm text-muted-foreground">Experimenta outro nome ou escolhe uma área diferente.</p>
          </div>
        )}

        <footer className="mt-8 rounded-2xl border border-rose-500/20 bg-rose-500/[0.05] px-5 py-4 text-center">
          <p className="text-sm font-medium leading-6 text-muted-foreground">Estas ferramentas são sites externos e abrem numa nova aba. Não estão integradas no Trakify.</p>
        </footer>
      </main>
    </AppShell>
  );
}

function EmBreve() {
  return (
    <AppShell back>
      <section className="relative mx-auto mt-8 max-w-2xl overflow-hidden rounded-[2rem] border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-card to-card p-6 text-center shadow-xl shadow-rose-950/5 sm:mt-14 sm:p-10">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400"><Clock className="h-10 w-10" /></div>
        <p className="relative mt-6 text-xs font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">Estúdio Trakify</p>
        <h1 className="relative mt-2 font-display text-3xl font-extrabold tracking-tight">Esta ferramenta está a caminho.</h1>
        <p className="relative mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Estamos a preparar esta experiência. Enquanto isso, podes continuar a criar com as ferramentas já disponíveis.</p>
        <Link to="/criar/app" className="relative mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-rose-600 px-6 font-semibold text-white shadow-lg shadow-rose-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-xl">Criar Aplicativo agora</Link>
      </section>
    </AppShell>
  );
}

function CriarTipo() {
  const { tipo } = Route.useParams();
  if (tipo === "pagina-documentos") return <BancoIA />;
  if (tipo === "integracoes") return <IntegracoesVendas />;
  return <EmBreve />;
}
