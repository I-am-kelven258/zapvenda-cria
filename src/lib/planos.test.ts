import { describe, expect, it } from "vitest";
import { PLANOS } from "./planos";

describe("Planos de acesso", () => {
  it("define o plano mensal em 247 Meticais", () => {
    expect(PLANOS.find((p) => p.id === "mensal")?.preco).toBe(247);
  });
  it("destina o plano mensal ao checkout indicado", () => {
    expect(PLANOS.find((p) => p.id === "mensal")?.checkout).toBe("https://pay.tutora.co.mz/993a1110a026416da9eb9815d1569fee");
  });
  it("define o plano trimestral em 597 Meticais", () => {
    expect(PLANOS.find((p) => p.id === "trimestral")?.preco).toBe(597);
  });
  it("destina o plano trimestral ao checkout indicado", () => {
    expect(PLANOS.find((p) => p.id === "trimestral")?.checkout).toBe("https://pay.tutora.co.mz/0628eb9010c748faa655c9cda528bc9d");
  });
  it("identifica o plano trimestral como Premium", () => {
    expect(PLANOS.find((p) => p.id === "trimestral")?.premium).toBe(true);
  });
});