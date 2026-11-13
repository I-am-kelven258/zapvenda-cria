import { beforeEach, describe, expect, it, vi } from "vitest";
import { appScriptSchema } from "./app-script.schema";
import { buildAppScriptPrompt, generateAppScript } from "./app-script.server";

const mocks = vi.hoisted(() => ({ generateText: vi.fn(), createOpenAI: vi.fn() }));
vi.mock("ai", () => ({ generateText: mocks.generateText }));
vi.mock("@ai-sdk/openai", () => ({ createOpenAI: mocks.createOpenAI }));

const answers = { nome_app: "Mercado Local", o_que_faz: "liga agricultores a compradores", publico: "agricultores de Maputo", monetizacao: "comissão por venda", objetivo: "reduzir desperdício alimentar", estilo: "moderno" as const };

beforeEach(() => {
  vi.resetAllMocks();
  mocks.createOpenAI.mockReturnValue({ responses: () => "openai-model" });
});

describe("application AI generation", () => {
  it("uses all six answers in the personalised prompt", () => {
    const prompt = buildAppScriptPrompt(answers);
    for (const value of Object.values(answers)) expect(prompt).toContain(value);
  });
  it("rejects incomplete answers before generation", () => {
    expect(appScriptSchema.safeParse({ ...answers, publico: " " }).success).toBe(false);
  });
  it("uses direct OpenAI with the supplied server credential", async () => {
    mocks.generateText.mockResolvedValue({ text: "Documento personalizado completo", finishReason: "stop" });
    expect(await generateAppScript(answers, "test-only-credential")).toEqual({ ok: true, script: "Documento personalizado completo" });
    expect(mocks.createOpenAI).toHaveBeenCalledWith({ apiKey: "test-only-credential", baseURL: "https://api.openai.com/v1" });
    expect(mocks.generateText).toHaveBeenCalledWith(expect.objectContaining({ providerOptions: { openai: { store: false } } }));
  });
  it("does not call OpenAI without the server secret", async () => {
    expect((await generateAppScript(answers, undefined)).ok).toBe(false);
    expect(mocks.generateText).not.toHaveBeenCalled();
  });
  it.each([401, 403, 402, 429, 500])("returns a safe error for status %s without exposing provider details", async (statusCode) => {
    mocks.generateText.mockRejectedValue({ statusCode, message: "private provider details" });
    const result = await generateAppScript(answers, "test-only-credential");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).not.toContain("private provider details");
  });
  it("rejects empty responses instead of returning a fake script", async () => {
    mocks.generateText.mockResolvedValue({ text: " ", finishReason: "stop" });
    expect((await generateAppScript(answers, "test-only-credential")).ok).toBe(false);
  });
  it("rejects truncated responses", async () => {
    mocks.generateText.mockResolvedValue({ text: "incomplete", finishReason: "length" });
    expect((await generateAppScript(answers, "test-only-credential")).ok).toBe(false);
  });
});