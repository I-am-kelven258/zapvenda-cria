import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  ArrowRight, BookOpen, CheckCircle2, CircleHelp, FileText, Lightbulb,
  MessageCircle, ShieldCheck, ShoppingCart, Sparkles, Video, WalletCards,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a Trakify — Guia e perguntas frequentes" },
      { name: "description", content: "Descobre o que é a Trakify, como utilizar as ferramentas, acompanhar vendas e configurar integrações." },
    ],
  }),
  component: SobreTrakify,
});

const perguntas = [
  {
    q: "O que é a Trakify?",
    a: "A Trakify é um espaço digital com ferramentas para ajudar a organizar ideias e preparar materiais para negócios online. Reúne assistentes e fluxos guiados para estruturar aplicações, roteiros de vídeo, páginas de vendas, prompts e acompanhamento de integrações de vendas.",
  },
  {
    q: "O que posso fazer na Trakify?",
    a: "No menu Ferramentas podes criar a estrutura de um aplicativo, preparar um roteiro de vídeo, escrever o conteúdo de uma página de vendas, consultar o Banco de IA, criar prompts e configurar integrações para acompanhar notificações de vendas.",
  },
  {
    q: "A Trakify cria e publica um aplicativo automaticamente?",
    a: "A ferramenta Criar Aplicativo ajuda a transformar a tua ideia num plano e num script com funcionalidades e estrutura. Esse resultado é uma base para desenvolvimento. A geração do plano, por si só, não significa que o aplicativo já esteja programado, publicado numa loja ou alojado na Internet.",
  },
  {
    q: "A ferramenta Criar Vídeo entrega um vídeo pronto?",
    a: "A ferramenta prepara um roteiro detalhado com objetivo, público, estilo, cenário, formato e duração. Podes usar esse roteiro numa ferramenta de produção de vídeo, como Veo, Sora ou CapCut. A Trakify não confirma a renderização nem a publicação do vídeo nessas plataformas.",
  },
  {
    q: "Como funciona Criar Página de Vendas?",
    a: "Respondes a perguntas sobre o produto, o que oferece, o público, o preço, as provas que tens e o estilo pretendido. A Trakify organiza essas respostas numa proposta de texto de vendas que podes rever, copiar e adaptar antes de publicar.",
  },
  {
    q: "A Trakify recebe pagamentos dos meus clientes?",
    a: "Não. As integrações de vendas servem para receber e organizar notificações de transações enviadas por plataformas externas. O pagamento é processado pela plataforma de venda ou pelo prestador de pagamentos. A Trakify não deve ser tratada como carteira, banco ou processador de pagamentos.",
  },
  {
    q: "Como aparecem as vendas no painel?",
    a: "Primeiro configuras uma integração e copias o endereço de Webhook apresentado. Depois adicionas esse endereço e a credencial exigida nas definições da plataforma de venda. Quando essa plataforma envia uma notificação válida e autenticada, a Trakify pode registar a transação e apresentá-la no painel. Sem uma notificação válida, não há venda para mostrar.",
  },
  {
    q: "Quais integrações de vendas estão disponíveis?",
    a: "O formulário do projeto apresenta Tutora, EscalePay, Hotmart, Kiwify e RatixPay. A presença de uma opção no formulário não significa que a integração esteja concluída. No código atualmente preparado, Hotmart e RatixPay têm suporte inicial no webhook; as restantes precisam de implementação e validação específicas. Todas precisam de configuração e teste real antes de serem consideradas operacionais.",
  },
  {
    q: "O que significam vendas aprovadas, pendentes ou reembolsadas?",
    a: "O painel organiza as transações de acordo com o estado enviado pela plataforma externa. As métricas de receita aprovada consideram apenas as transações com estado aprovado. Confirma sempre os valores e o estado final na plataforma onde a venda foi processada.",
  },
  {
    q: "Posso confiar nos números do painel como prova de pagamento?",
    a: "O painel é um registo de notificações recebidas, não um extrato bancário. Confirma pagamentos, levantamentos, taxas, reembolsos e disputas diretamente na plataforma de origem. Uma notificação de teste não é uma venda real.",
  },
  {
    q: "Como guardo o meu trabalho?",
    a: "Quando uma ferramenta apresentar a opção Guardar, utiliza-a para associar o resultado ao teu histórico. Algumas ferramentas também permitem copiar o conteúdo. Se não aparecer uma opção de guardar, copia o resultado antes de sair da página.",
  },
  {
    q: "O que faço se uma ferramenta ou integração não funcionar?",
    a: "Verifica a ligação à Internet, confirma que estás na conta correta e tenta novamente. Nas integrações, confirma o URL do Webhook, a credencial e se a plataforma externa está a enviar notificações. Se continuar a falhar, contacta o suporte e inclui o nome da ferramenta, a mensagem de erro e a hora aproximada. Nunca envies palavras-passe, tokens ou chaves secretas por mensagem.",
  },
  {
    q: "A Trakify garante vendas ou resultados comerciais?",
    a: "Não. A Trakify disponibiliza ferramentas de apoio à criação e ao acompanhamento. Vendas e resultados dependem do produto, da oferta, do público, da divulgação, do serviço prestado e das plataformas externas. Não são prometidas vendas automáticas.",
  },
];

function SobreTrakify() {
  const [search, setSearch] = useState("");
  const [openAll, setOpenAll] = useState(false);
  const normalized = search.trim().toLocaleLowerCase("pt");
  const filtered = perguntas.filter((item) => !normalized || (item.q + " " + item.a).toLocaleLowerCase("pt").includes(normalized));

  return (
    <AppShell back wide>
      <div className="mx-auto w-full max-w-5xl space-y-8 pb-12">
        <section className="relative overflow-hidden rounded-[2rem] border border-red-500/20 bg-gradient-to-br from-red-500/[0.12] via-card to-card p-6 shadow-sm md:p-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-red-500/10 blur-3xl" />
          <div className="relative flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-red-600 dark:text-red-400">
            <BookOpen className="h-4 w-4" /> Centro de informação Trakify
          </div>
          <h1 className="relative mt-4 max-w-3xl font-display text-3xl font-extrabold tracking-tight md:text-5xl">Conhece a Trakify.</h1>
          <p className="relative mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            O que é, para que serve, como utilizar as ferramentas e como funciona o acompanhamento de vendas. Um guia para esclarecer as tuas dúvidas.
          </p>
          <div className="relative mt-6 flex flex-wrap gap-3">
            <a href="#como-funciona" className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700">Como funciona <ArrowRight className="h-4 w-4" /></a>
            <a href="#perguntas" className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:border-red-500/40">Ver perguntas frequentes</a>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-600"><Lightbulb className="h-5 w-5" /></div>
            <h2 className="mt-4 text-lg font-bold">O que é a Trakify?</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Uma área de trabalho digital com ferramentas guiadas para transformar ideias em planos, textos, roteiros e materiais que podes desenvolver e utilizar no teu negócio.</p>
          </article>
          <article className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-600"><Sparkles className="h-5 w-5" /></div>
            <h2 className="mt-4 text-lg font-bold">Para que serve?</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Para apoiar a criação de projetos digitais, preparar comunicação comercial e reunir num painel os registos de vendas enviados por plataformas externas compatíveis.</p>
          </article>
        </section>

        <section id="como-funciona" className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">Começar é simples</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight">Como funciona a Trakify?</h2>
            <p className="mt-2 text-sm text-muted-foreground">Segue estes passos para tirares melhor proveito do espaço de trabalho.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "01", title: "Entra na tua conta", body: "Inicia sessão para acederes ao painel e às ferramentas disponíveis.", icon: ShieldCheck },
              { n: "02", title: "Escolhe uma ferramenta", body: "Abre o menu e seleciona o tipo de conteúdo ou tarefa que pretendes preparar.", icon: FileText },
              { n: "03", title: "Responde às etapas", body: "Explica a tua ideia e fornece os detalhes pedidos para obteres um resultado mais útil.", icon: MessageCircle },
              { n: "04", title: "Revê e utiliza", body: "Lê o resultado, corrige o que for necessário e copia ou guarda quando a opção existir.", icon: CheckCircle2 },
            ].map(({ n, title, body, icon: Icon }) => (
              <article key={n} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between"><span className="text-xs font-extrabold tracking-widest text-red-600">{n}</span><Icon className="h-5 w-5 text-red-500" /></div>
                <h3 className="mt-4 font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">O que encontras no menu</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight">As ferramentas</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Criar Aplicativo", body: "Organiza a ideia, o público, as funcionalidades e o estilo num plano/script para desenvolvimento.", icon: FileText },
              { title: "Criar Vídeo", body: "Prepara um roteiro com personagem, cenário, estilo, formato e duração para usar numa ferramenta de vídeo.", icon: Video },
              { title: "Criar Página de Vendas", body: "Estrutura uma proposta de texto comercial a partir dos detalhes do teu produto e público.", icon: ShoppingCart },
              { title: "Banco de IA", body: "Acede ao espaço de recursos e materiais de inteligência artificial disponibilizados no projeto.", icon: Sparkles },
              { title: "Criar Prompt", body: "Prepara instruções mais claras e organizadas para utilizar noutras ferramentas de IA.", icon: MessageCircle },
              { title: "Integrações e Vendas", body: "Configura plataformas externas compatíveis e acompanha notificações de transações recebidas.", icon: WalletCards },
            ].map(({ title, body, icon: Icon }) => (
              <article key={title} className="flex gap-3 rounded-2xl border border-border bg-card p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600"><Icon className="h-5 w-5" /></div>
                <div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.05] p-5 md:p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <h2 className="font-bold">Uma nota importante sobre as vendas</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">A Trakify não processa o pagamento nem transfere dinheiro. Apenas pode organizar os dados que uma plataforma externa envia por Webhook. Uma integração só deve ser considerada operacional depois de configurar as credenciais, receber uma notificação autenticada e confirmar o registo. Confirma sempre os pagamentos na plataforma de origem.</p>
            </div>
          </div>
        </section>

        <section id="perguntas" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">Ajuda e esclarecimentos</p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight">Perguntas frequentes</h2>
              <p className="mt-2 text-sm text-muted-foreground">Procura uma palavra ou abre uma pergunta para ler a resposta.</p>
            </div>
            <button type="button" onClick={() => setOpenAll((value) => !value)} className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold transition hover:border-red-500/40">{openAll ? "Fechar respostas" : "Abrir respostas"}</button>
          </div>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar uma dúvida..." aria-label="Pesquisar perguntas frequentes" className="h-12 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10" />
          <div className="space-y-2">
            {filtered.map((item, index) => (
              <details key={item.q} open={openAll || Boolean(normalized)} className="group rounded-2xl border border-border bg-card px-4 py-4 open:border-red-500/30 sm:px-5">
                <summary className="flex cursor-pointer list-none items-center gap-3 font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                  <CircleHelp className="h-5 w-5 shrink-0 text-red-500" />
                  <span className="flex-1 text-sm leading-6">{item.q}</span>
                  <span className="text-lg text-muted-foreground transition group-open:rotate-45">+</span>
                </summary>
                <p className="ml-8 mt-3 border-l-2 border-red-500/20 pl-4 text-sm leading-7 text-muted-foreground">{item.a}</p>
              </details>
            ))}
            {filtered.length === 0 && <div className="rounded-2xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">Não encontrámos uma resposta com esses termos. Experimenta outra palavra.</div>}
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} de {perguntas.length} perguntas apresentadas.</p>
        </section>

        <section className="rounded-2xl border border-red-500/20 bg-card p-5 md:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-lg font-bold">Ainda tens dúvidas?</h2><p className="mt-1 text-sm text-muted-foreground">Contacta o suporte através da opção Ajuda e suporte no menu da Trakify.</p></div>
            <a href="mailto:suporte@trakify.com" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700">Contactar suporte <ArrowRight className="h-4 w-4" /></a>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
