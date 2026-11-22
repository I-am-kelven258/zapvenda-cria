import { describe, expect, it } from "vitest";
import { gerarScript } from "./script";

describe("gerarScript", () => {
  it("inclui as respostas e o estilo escolhido", () => {
    const s = gerarScript({
      nome_app: "FinApp",
      o_que_faz: "controla gastos",
      publico: "jovens",
      monetizacao: "assinatura",
      objetivo: "economizar",
      estilo: "moderno",
    });
    expect(s).toContain("📱 PLANO COMPLETO DO APLICATIVO — FinApp");
    expect(s).toContain("verde-neon");
  });
});
