import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

function randomToken(bytes = 32) {
  const data = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(data, (value) => value.toString(16).padStart(2, "0")).join("");
}
async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return json({ error: "Backend environment is incomplete" }, 500);

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401);

  const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: "Invalid session" }, 401);
  const { data: validAccess, error: accessError } = await userClient.rpc("has_valid_access", { check_user_id: userData.user.id });
  if (accessError || !validAccess) return json({ error: "Account access is not active" }, 403);

  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const allowedProviders = ["tutora", "escalepay", "hotmart", "kiwify", "ratixpay"];
  const provider = String(input.provider ?? "");
  const displayName = String(input.display_name ?? "").trim();
  const currency = String(input.currency ?? "");
  const amountFormat = String(input.amount_format ?? "units");
  const fee = Number(input.fixed_fee_minor ?? 0);
  const providerSecret = String(input.provider_secret ?? "").trim();

  if (!allowedProviders.includes(provider)) return json({ error: "Unsupported platform" }, 400);
  if (!displayName || displayName.length > 80) return json({ error: "Invalid integration name" }, 400);
  if (!["MZN", "BRL", "USD", "EUR", "AOA"].includes(currency)) return json({ error: "Invalid currency" }, 400);
  if (!["units", "cents"].includes(amountFormat)) return json({ error: "Invalid amount format" }, 400);
  if (!Number.isSafeInteger(fee) || fee < 0) return json({ error: "Invalid fixed fee" }, 400);

  const providerSupported = provider === "hotmart" || provider === "ratixpay";
  if (providerSupported && (providerSecret.length < 8 || providerSecret.length > 512)) {
    return json({ error: provider === "hotmart" ? "Enter the Hottok from Hotmart" : "Enter the Webhook Secret from RatixPay" }, 400);
  }

  const admin = createClient(url, serviceKey);
  const endpointToken = providerSupported ? randomToken(32) : null;
  const insertPayload = {
    user_id: userData.user.id,
    provider,
    display_name: displayName,
    currency,
    amount_format: amountFormat,
    fixed_fee_minor: fee,
    status: providerSupported ? "setup_pending" : "provider_docs_pending",
    endpoint_token_hash: endpointToken ? await sha256(endpointToken) : null,
  };
  const { data: integration, error: insertError } = await admin
    .from("sales_integrations")
    .insert(insertPayload)
    .select("id,provider,display_name,currency,amount_format,fixed_fee_minor,status,created_at")
    .single();
  if (insertError || !integration) {
    console.error("Integration insert failed", insertError?.message);
    return json({ error: "Could not save integration" }, 500);
  }

  if (providerSupported) {
    const { error: secretError } = await admin.from("sales_integration_secrets").insert({
      integration_id: integration.id,
      provider_secret: providerSecret,
    });
    if (secretError) {
      await admin.from("sales_integrations").delete().eq("id", integration.id);
      console.error("Integration secret storage failed", secretError.message);
      return json({ error: "Could not securely store provider credentials" }, 500);
    }
  }

  const webhookUrl = endpointToken ? `${url.replace(/\/+$/, "")}/functions/v1/sales-webhook/${endpointToken}` : null;
  return json({
    integration,
    webhook_url: webhookUrl,
    setup_instructions: provider === "hotmart"
      ? "Na Hotmart, cria um Webhook e cola esta URL. O Hottok fica guardado no servidor e será validado no cabeçalho X-HOTMART-HOTTOK."
      : provider === "ratixpay"
      ? "Na RatixPay, configura esta URL nas credenciais de Webhook. Usa o mesmo Webhook Secret que introduziste aqui; a assinatura HMAC-SHA256 será validada."
      : "A configuração foi guardada. A ativação do recebimento aguarda confirmação da documentação de autenticação e do formato dos eventos desta plataforma.",
  });
});
