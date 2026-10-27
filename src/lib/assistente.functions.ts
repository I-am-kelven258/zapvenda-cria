import { createServerFn } from "@tanstack/react-start";

export const SUPORTE_EMAIL = "ednerciotutora@gmail.com";

const INSTRUCOES = `Você é a assistente virtual do Zapvenda MZ, um app moçambicano. Responda sempre em português, de forma curta e simpática, em texto simples sem markdown (sem asteriscos).
Informações do app:
- O Zapvenda MZ ajuda a criar conteúdos com assistentes de perguntas.
- Criar Aplicativo: 6 perguntas (nome, o que faz, público, monetização, objetivo, estilo) e gera um script/prompt completo para criar um app.
- Criar Vídeo: 7 perguntas (objetivo, o que apresentar, público/plataforma, o que deve aparecer, etc., formato 9:16, 16:9 ou 1:1 e duração 15s, 30s, 60s ou 3 min). Gera roteiro para Veo 3, Sora ou CapCut.
- Criar Página de Vendas: 6 perguntas (nome do produto, o que faz, público, preço, prova social, estilo) e gera a copy completa.
- Criar Página de Documentos e Criar Prompt: em breve.
- Todos os resultados têm botões Copiar e Salvar; os salvos ficam em "Perfil e histórico" no menu ☰ (lado direito).
- Conta: entrar com Google ou email e senha, sem confirmação por email. Para sair, use o menu ☰ > Sair.
Se a pergunta não estiver coberta por estas informações ou não tiver certeza, NÃO invente: diga para o usuário contactar o suporte pelo email ${SUPORTE_EMAIL}.`;

type Msg = { role: "user" | "assistant"; content: string };

export const perguntarAssistente = createServerFn({ method: "POST" })
  .inputValidator((d: { messages: Msg[] }) => {
    if (!Array.isArray(d?.messages)) throw new Error("Mensagens inválidas");
    return { messages: d.messages.slice(-12).map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, 2000) }) as Msg) };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false as const, error: "Assistente indisponível." };
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText } = await import("ai");
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    try {
      let erro: unknown;
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        system: INSTRUCOES,
        messages: data.messages,
        maxRetries: 0,
        onError: ({ error }) => { erro = error; },
        providerOptions: {
          openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] },
        },
      });
      const text = await result.text;
      if (erro || !text) throw erro ?? new Error("vazio");
      return { ok: true as const, text };
    } catch (e: any) {
      const status = e?.statusCode ?? e?.cause?.statusCode;
      const msg = status === 429 ? "Muitas perguntas agora, tente em instantes." : status === 402 ? "Assistente sem créditos no momento." : `Não consegui responder agora. Contacte ${SUPORTE_EMAIL}.`;
      return { ok: false as const, error: msg };
    }
  });
