import { createFileRoute } from "@tanstack/react-router";
import { parseSale, providerInfo, type ProviderId } from "@/lib/sales-providers";
import { sha256, verifyWebhook } from "@/lib/sales-webhook.server";

const json = (body: unknown, status = 200) => Response.json(body, { status });

export const Route = createFileRoute("/api/public/vendas/$token")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        if (!/^[a-f0-9]{64}$/.test(params.token)) return json({ error: "Invalid endpoint" }, 404);
        const rawBody = await request.text();
        if (rawBody.length > 1024 * 1024) return json({ error: "Payload too large" }, 413);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: integ } = await supabaseAdmin.from("sales_integrations")
          .select("id,user_id,provider,currency,amount_format,fixed_fee_minor,status")
          .eq("endpoint_token_hash", sha256(params.token)).maybeSingle();
        if (!integ || integ.status === "paused") return json({ error: "Integration not found" }, 404);
        const provider = integ.provider as ProviderId;
        if (!providerInfo(provider)?.supported) return json({ error: "Provider not supported" }, 501);
        const { data: sec } = await supabaseAdmin.from("sales_integration_secrets").select("provider_secret").eq("integration_id", integ.id).maybeSingle();
        const fail = async (msg: string, code: number) => {
          await supabaseAdmin.from("sales_integrations").update({ last_error: msg, updated_at: new Date().toISOString() }).eq("id", integ.id);
          return json({ error: msg }, code);
        };
        if (!verifyWebhook(provider, sec?.provider_secret ?? "", rawBody, request.headers, new URL(request.url))) {
          return fail("Autenticação do Webhook falhou: o segredo/token configurado não corresponde ao da plataforma.", 401);
        }
        let payload: unknown;
        try { payload = JSON.parse(rawBody); } catch { return fail("A plataforma enviou dados que não são JSON válido.", 400); }
        const sale = parseSale(provider, payload);
        if ("ignored" in sale) {
          await supabaseAdmin.from("sales_integrations").update({ status: "active", last_event_at: new Date().toISOString(), last_error: null }).eq("id", integ.id);
          return json({ received: true, ignored: sale.ignored });
        }
        if ("error" in sale) return fail(sale.error, 422);
        const currency = sale.currency ?? integ.currency;
        if (currency !== integ.currency) return fail(`Moeda recebida (${currency}) diferente da configurada (${integ.currency}).`, 422);
        const gross = Math.round(integ.amount_format === "cents" ? sale.amount : sale.amount * 100);
        const fee = Number(integ.fixed_fee_minor);
        const row = {
          user_id: integ.user_id, integration_id: integ.id, provider_event_id: sale.orderId, provider_order_id: sale.orderId,
          product_name: sale.productName, gross_minor: gross, fee_minor: fee, net_minor: Math.max(0, gross - fee), currency,
          status: sale.status, utm_source: sale.utm.source, utm_medium: sale.utm.medium, utm_campaign: sale.utm.campaign,
          utm_content: sale.utm.content, occurred_at: sale.occurredAt,
        };
        // One row per order: repeated deliveries or later status changes update the same sale.
        const { error } = await supabaseAdmin.from("sales_transactions").upsert(row, { onConflict: "integration_id,provider_event_id" });
        if (error) { console.error("sales webhook write failed", error.message); return fail("Não foi possível guardar a venda.", 500); }
        await supabaseAdmin.from("sales_integrations").update({ status: "active", last_event_at: new Date().toISOString(), last_error: null }).eq("id", integ.id);
        return json({ received: true });
      },
    },
  },
});
