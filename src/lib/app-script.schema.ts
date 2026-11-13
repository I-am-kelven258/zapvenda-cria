import { z } from "zod";

const answer = z.string().trim().min(1, "Responda a todas as perguntas.").max(4000, "Cada resposta pode ter até 4.000 caracteres.");

export const appScriptSchema = z.object({
  nome_app: answer,
  o_que_faz: answer,
  publico: answer,
  monetizacao: answer,
  objetivo: answer,
  estilo: z.enum(["minimalista", "moderno"]),
});

export type AppScriptAnswers = z.infer<typeof appScriptSchema>;