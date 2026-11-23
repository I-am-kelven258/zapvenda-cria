import { describe, expect, it } from "vitest";
import { connectionState, mapStatus, parseSale } from "./sales-providers";
import { verifyWebhook } from "./sales-webhook.server";

describe("sales webhooks", () => {
  it("validates Kiwify with the official HMAC-SHA1 test vector", () => {
    const body = '{"order_id":"9b1c2d3e-0000-4000-8000-000000000001","order_status":"paid","webhook_event_type":"order_approved"}';
    const url = new URL("https://x.test/h?signature=bf18f352a4f981b91dfa3f6d8742a81080ab8c86");
    expect(verifyWebhook("kiwify", "kiwify-token-de-teste", body, new Headers(), url)).toBe(true);
    expect(verifyWebhook("kiwify", "outro-token", body, new Headers(), url)).toBe(false);
  });
  it("rejects Hotmart without the matching hottok", () => {
    const u = new URL("https://x.test");
    expect(verifyWebhook("hotmart", "abc12345", "{}", new Headers({ "x-hotmart-hottok": "abc12345" }), u)).toBe(true);
    expect(verifyWebhook("hotmart", "abc12345", "{}", new Headers(), u)).toBe(false);
  });
  it("never verifies platforms without official documentation", () => {
    expect(verifyWebhook("tutora", "segredo123", "{}", new Headers(), new URL("https://x.test"))).toBe(false);
  });
  it("maps approved, pending, cancelled and refunded events", () => {
    expect(mapStatus("hotmart", "PURCHASE_APPROVED")).toBe("approved");
    expect(mapStatus("hotmart", "PURCHASE_BILLET_PRINTED")).toBe("pending");
    expect(mapStatus("kiwify", "order_rejected")).toBe("cancelled");
    expect(mapStatus("ratixpay", "venda.reembolsada")).toBe("refunded");
  });
  it("uses the Hotmart transaction as the unique order key", () => {
    const s = parseSale("hotmart", { event: "PURCHASE_APPROVED", data: { purchase: { transaction: "HP1", price: { value: 10, currency_value: "BRL" } } } });
    expect("orderId" in s && s.orderId).toBe("HP1");
  });
  it("only shows FUNCIONAL after a real authenticated event", () => {
    const base = { provider: "hotmart", has_endpoint: true, last_error: null };
    expect(connectionState({ ...base, status: "setup_pending", last_event_at: null })).toBe("needs_config");
    expect(connectionState({ ...base, status: "active", last_event_at: "2026-01-01" })).toBe("functional");
    expect(connectionState({ ...base, status: "active", last_event_at: "2026-01-01", last_error: "x" })).toBe("error");
  });
});
