import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PROVIDERS } from "./sales-providers";

type Input = { provider: string; display_name: string; currency: string; amount_format: string; fixed_fee_minor: number; provider_secret: string; origin: string };
function validate(v: unknown): Input {
  const d = (v ?? {}) as Record<string, unknown>;
  const out = {
    provider: String(d["provider"] ?? ""), display_name: String(d["display_name"] ?? "").trim(), currency: String(d["currency"] ?? ""),
    amount_format: String(d["amount_format"] ?? "units"), fixed_fee_minor: Number(d["fixed_fee_minor"] ?? 0),
    provider_secret: String(d["provider_secret"] ?? "").trim(), origin: String(d["origin"] ?? ""),
  };
  if (!PROVIDERS.some((p) => p.value === out.provider)) throw new Error("Plataforma inválida.");
  if (!out.display_name || out.display_name.length > 80) throw new Error("Nome da integração inválido.");
  if (!["MZN", "BRL", "USD", "EUR", "AOA"].includes(out.currency)) throw new Error("Moeda inválida.");
  if (!["units", "cents"].includes(out.amount_format)) throw new Error("Formato de valores inválido.");
  if (!Number.isSafeInteger(out.fixed_fee_minor) || out.fixed_fee_minor < 0) throw new Error("Taxa fixa inválida.");
  if (!/^https?:\/\/[^/]+$/.test(out.origin)) throw new Error("Endereço da aplicação inválido.");
  return out;
}

export const criarIntegracaoVendas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validate)
  .handler(async ({ data, context }) => {
    const { data: ok } = await context.supabase.rpc("has_valid_access", { check_user_id: context.userId });
    if (!ok) throw new Error("O teu acesso não está ativo.");
    const info = PROVIDERS.find((p) => p.value === data.provider)!;
    if (info.supported && (data.provider_secret.length < 8 || data.provider_secret.length > 512)) throw new Error("Introduz o segredo/token do Webhook da plataforma.");
    const { randomBytes } = await import("crypto");
    const { sha256 } = await import("./sales-webhook.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const token = info.supported ? randomBytes(32).toString("hex") : null;
    const { data: row, error } = await supabaseAdmin.from("sales_integrations").insert({
      user_id: context.userId, provider: data.provider, display_name: data.display_name, currency: data.currency,
      amount_format: data.amount_format, fixed_fee_minor: data.fixed_fee_minor,
      status: info.supported ? "setup_pending" : "provider_docs_pending", endpoint_token_hash: token ? sha256(token) : null,
    }).select("id").single();
    if (error || !row) throw new Error("Não foi possível guardar a integração.");
    if (token) {
      const { error: se } = await supabaseAdmin.from("sales_integration_secrets").insert({ integration_id: row.id, provider_secret: data.provider_secret });
      if (se) { await supabaseAdmin.from("sales_integrations").delete().eq("id", row.id); throw new Error("Não foi possível guardar a credencial com segurança."); }
    }
    return { webhook_url: token ? `${data.origin}/api/public/vendas/${token}` : null };
  });
