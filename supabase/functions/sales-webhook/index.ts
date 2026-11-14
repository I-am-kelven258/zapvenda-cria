import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}
async function hmacHex(secret: string, body: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(signature), (value) => value.toString(16).padStart(2, "0")).join("");
}
function getPath(obj: unknown, paths: string[]): unknown {
  for (const path of paths) {
    const value = path.split(".").reduce<unknown>((current, key) => {
      if (typeof current !== "object" || current === null) return undefined;
      return (current as Record<string, unknown>)[key];
    }, obj);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}
function normalizeStatus(value: unknown): "pending" | "approved" | "refunded" | "cancelled" | "chargeback" {
  const status = String(value ?? "").toLowerCase();
  if (/refund|reembols|estorn/.test(status)) return "refunded";
  if (/chargeback|charge_back|contest/.test(status)) return "chargeback";
  if (/cancel|expire|failed|falh|recus/.test(status)) return "cancelled";
  if (/approved|paid|complete|completed|aprov|pago|success/.test(status)) return "approved";
  return "pending";
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return json({ error: "Backend environment is incomplete" }, 500);

  const endpointToken = new URL(request.url).pathname.split("/").filter(Boolean).pop() ?? "";
  if (!/^[a-f0-9]{64}$/.test(endpointToken)) return json({ error: "Invalid endpoint" }, 404);
  const admin = createClient(url, serviceKey);
  const { data: integration, error: lookupError } = await admin
    .from("sales_integrations")
    .select("id,user_id,provider,currency,amount_format,fixed_fee_minor,status,endpoint_token_hash")
    .eq("endpoint_token_hash", await sha256(endpointToken))
    .maybeSingle();
  if (lookupError || !integration || !["setup_pending", "active"].includes(integration.status)) return json({ error: "Integration not found or inactive" }, 404);

  const { data: secretRow } = await admin.from("sales_integration_secrets")
    .select("provider_secret").eq("integration_id", integration.id).maybeSingle();
  const providerSecret = secretRow?.provider_secret;
  if (!providerSecret) return json({ error: "Webhook credentials are not configured" }, 401);

  const rawBody = await request.text();
  if (rawBody.length > 1024 * 1024) return json({ error: "Payload too large" }, 413);
  let payload: unknown;
  try { payload = JSON.parse(rawBody); } catch { return json({ error: "Invalid JSON" }, 400); }

  let verified = false;
  if (integration.provider === "hotmart") {
    const received = request.headers.get("X-HOTMART-HOTTOK") ?? "";
    verified = safeEqual(received, providerSecret);
  } else if (integration.provider === "ratixpay") {
    const received = (request.headers.get("X-RatixPay-Signature") ?? request.headers.get("X-Ratix-Signature") ?? "").replace(/^sha256=/i, "").toLowerCase();
    verified = safeEqual(received, await hmacHex(providerSecret, rawBody));
  } else {
    return json({ error: "Provider webhook authentication is not yet enabled" }, 501);
  }
  if (!verified) return json({ error: "Webhook authentication failed" }, 401);

  const eventId = String(getPath(payload, ["payment_id", "transaction_id", "data.purchase.transaction", "data.purchase.id", "id", "event_id", "reference"]) ?? "");
  const orderId = String(getPath(payload, ["order_id", "purchase.order_id", "data.purchase.order_id", "data.purchase.transaction", "payment_id", "transaction_id", "dados.venda_id", "reference"]) ?? eventId);
  const rawAmount = Number(getPath(payload, ["amount", "valor", "data.purchase.price.value", "data.purchase.price", "purchase.price.value", "dados.valor"]));
  const currency = String(getPath(payload, ["currency", "data.purchase.price.currency_code", "purchase.price.currency_code", "dados.currency"]) ?? integration.currency);
  const rawStatus = getPath(payload, ["status", "event", "data.purchase.status", "purchase.status", "event_name", "evento", "dados.status"]);
  if (!eventId || !Number.isFinite(rawAmount) || rawAmount < 0 || currency !== integration.currency) {
    return json({ error: "Missing transaction identifier, invalid amount, or currency mismatch" }, 400);
  }
  const grossMinor = Math.round(integration.amount_format === "cents" ? rawAmount : rawAmount * 100);
  const feeMinor = Number(integration.fixed_fee_minor);
  const status = normalizeStatus(rawStatus);
  const transaction = {
    user_id: integration.user_id,
    integration_id: integration.id,
    provider_event_id: eventId,
    provider_order_id: orderId || null,
    product_name: getPath(payload, ["product.name", "data.product.name", "data.purchase.product.name", "purchase.product.name"]) == null ? null : String(getPath(payload, ["product.name", "data.product.name", "data.purchase.product.name", "purchase.product.name"])),
    gross_minor: grossMinor,
    fee_minor: feeMinor,
    net_minor: Math.max(0, grossMinor - feeMinor),
    currency,
    status,
    utm_source: getPath(payload, ["tracking.utm_source", "data.purchase.tracking.utm_source", "utm_source"]) == null ? null : String(getPath(payload, ["tracking.utm_source", "data.purchase.tracking.utm_source", "utm_source"])),
    utm_medium: getPath(payload, ["tracking.utm_medium", "data.purchase.tracking.utm_medium", "utm_medium"]) == null ? null : String(getPath(payload, ["tracking.utm_medium", "data.purchase.tracking.utm_medium", "utm_medium"])),
    utm_campaign: getPath(payload, ["tracking.utm_campaign", "data.purchase.tracking.utm_campaign", "utm_campaign"]) == null ? null : String(getPath(payload, ["tracking.utm_campaign", "data.purchase.tracking.utm_campaign", "utm_campaign"])),
    utm_content: getPath(payload, ["tracking.utm_content", "data.purchase.tracking.utm_content", "utm_content"]) == null ? null : String(getPath(payload, ["tracking.utm_content", "data.purchase.tracking.utm_content", "utm_content"])),
    occurred_at: getPath(payload, ["created_at", "paid_at", "data.purchase.approved_date", "purchase.approved_date"]) == null ? new Date().toISOString() : String(getPath(payload, ["created_at", "paid_at", "data.purchase.approved_date", "purchase.approved_date"])),
  };

  const { data: existing } = await admin.from("sales_transactions")
    .select("id").eq("integration_id", integration.id).eq("provider_order_id", orderId).maybeSingle();
  let writeError;
  if (existing?.id) {
    const result = await admin.from("sales_transactions").update(transaction).eq("id", existing.id);
    writeError = result.error;
  } else {
    const result = await admin.from("sales_transactions").insert(transaction);
    writeError = result.error;
  }
  if (writeError) {
    console.error("Sales webhook persistence failed", writeError.message);
    return json({ error: "Could not persist transaction" }, 500);
  }
  await admin.from("sales_integrations").update({ status: "active" }).eq("id", integration.id);
  return json({ received: true });
});
