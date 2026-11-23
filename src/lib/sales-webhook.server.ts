import { createHash, createHmac, timingSafeEqual } from "crypto";
import type { ProviderId } from "./sales-providers";

export const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");
function safeEq(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
}

/** Verifies the request using each platform's officially documented mechanism. */
export function verifyWebhook(provider: ProviderId, secret: string, rawBody: string, headers: Headers, url: URL): boolean {
  if (!secret) return false;
  if (provider === "hotmart") return safeEq(headers.get("x-hotmart-hottok") ?? "", secret);
  if (provider === "kiwify") {
    const sig = (url.searchParams.get("signature") ?? "").toLowerCase();
    return safeEq(sig, createHmac("sha1", secret).update(rawBody).digest("hex"));
  }
  if (provider === "ratixpay") {
    const sig = (headers.get("x-ratixpay-signature") ?? "").replace(/^sha256=/i, "").toLowerCase();
    if (safeEq(sig, createHmac("sha256", secret).update(rawBody).digest("hex"))) return true;
    // RatixPay's documented example signs JSON.stringify(body); accept that canonical form too.
    try { return safeEq(sig, createHmac("sha256", secret).update(JSON.stringify(JSON.parse(rawBody))).digest("hex")); } catch { return false; }
  }
  return false;
}
