// Browser-safe provider catalogue and pure webhook parsing (no secrets here).
export type ProviderId = "hotmart" | "kiwify" | "ratixpay" | "tutora" | "escalepay";
export type SaleStatus = "pending" | "approved" | "refunded" | "cancelled" | "chargeback";

export const PROVIDERS: Array<{ value: ProviderId; label: string; supported: boolean; secretLabel?: string; docs?: string; missing?: string }> = [
  { value: "hotmart", label: "Hotmart", supported: true, secretLabel: "Hottok (Hotmart → Ferramentas → Webhook)", docs: "https://developers.hotmart.com/docs/pt-BR/2.0.0/webhook/purchase-webhook/" },
  { value: "kiwify", label: "Kiwify", supported: true, secretLabel: "Token do Webhook (Kiwify → Apps → Webhooks)", docs: "https://docs.kiwify.com.br/api-reference/webhooks/receiving" },
  { value: "ratixpay", label: "RatixPay", supported: true, secretLabel: "Segredo de Webhook (RatixPay → Credenciais da API)", docs: "https://ratixpay.co.mz/docs/" },
  { value: "tutora", label: "Tutora", supported: false, missing: "Não existe documentação pública de Webhook com método de assinatura. É preciso a documentação oficial (formato do evento e validação) fornecida pela Tutora." },
  { value: "escalepay", label: "EscalePay (Calipay)", supported: false, missing: "Não existe documentação pública de API/Webhook. É preciso a documentação oficial fornecida pela EscalePay." },
];

export const providerInfo = (id: string) => PROVIDERS.find((p) => p.value === id);

function get(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((cur, key) => (cur && typeof cur === "object" ? (cur as Record<string, unknown>)[key] : undefined), obj);
}
function first(obj: unknown, paths: string[]): unknown {
  for (const p of paths) { const v = get(obj, p); if (v !== undefined && v !== null && v !== "") return v; }
  return undefined;
}
const str = (v: unknown) => (v === undefined || v === null || v === "" ? null : String(v).slice(0, 300));

export function mapStatus(provider: ProviderId, raw: string): SaleStatus | null {
  const s = raw.toUpperCase();
  if (provider === "hotmart") {
    if (["PURCHASE_APPROVED", "PURCHASE_COMPLETE", "APPROVED", "COMPLETE"].includes(s)) return "approved";
    if (["PURCHASE_REFUNDED", "REFUNDED", "PARTIALLY_REFUNDED"].includes(s)) return "refunded";
    if (["PURCHASE_CHARGEBACK", "CHARGEBACK", "PURCHASE_PROTEST", "DISPUTE"].includes(s)) return "chargeback";
    if (["PURCHASE_CANCELED", "PURCHASE_EXPIRED", "CANCELLED", "EXPIRED", "BLOCKED", "NO_FUNDS"].includes(s)) return "cancelled";
    if (["PURCHASE_BILLET_PRINTED", "PURCHASE_DELAYED", "WAITING_PAYMENT", "PRINTED_BILLET", "STARTED", "OVERDUE", "UNDER_ANALISYS", "PROCESSING_TRANSACTION"].includes(s)) return "pending";
    return null;
  }
  if (provider === "kiwify") {
    if (s === "ORDER_APPROVED" || s === "PAID") return "approved";
    if (s === "ORDER_REFUNDED" || s === "REFUNDED") return "refunded";
    if (s === "CHARGEBACK" || s === "CHARGEDBACK") return "chargeback";
    if (s === "ORDER_REJECTED" || s === "REFUSED") return "cancelled";
    if (s === "BILLET_CREATED" || s === "PIX_CREATED" || s === "WAITING_PAYMENT") return "pending";
    return null;
  }
  if (provider === "ratixpay") {
    if (/APROVAD|APPROVED|PAID/.test(s)) return "approved";
    if (/REEMBOLS|REFUND/.test(s)) return "refunded";
    if (/CHARGEBACK/.test(s)) return "chargeback";
    if (/CANCEL|FAIL|EXPIR|RECUS/.test(s)) return "cancelled";
    if (/PEND|CREATED/.test(s)) return "pending";
    return null;
  }
  return null;
}

export type ParsedSale = {
  orderId: string; eventType: string; status: SaleStatus; amount: number; currency: string | null;
  productName: string | null; occurredAt: string;
  utm: { source: string | null; medium: string | null; campaign: string | null; content: string | null };
};

/** Parses an already-authenticated payload. Returns an error string when the event is not a sale event. */
export function parseSale(provider: ProviderId, p: unknown): ParsedSale | { ignored: string } | { error: string } {
  let orderId: unknown, eventType: unknown, rawStatus: unknown, amount: unknown, currency: unknown, product: unknown, date: unknown;
  let utmBase = "tracking";
  if (provider === "hotmart") {
    orderId = get(p, "data.purchase.transaction"); eventType = get(p, "event");
    rawStatus = eventType; amount = first(p, ["data.purchase.price.value", "data.purchase.full_price.value"]);
    currency = first(p, ["data.purchase.price.currency_value", "data.purchase.full_price.currency_value"]);
    product = get(p, "data.product.name"); date = first(p, ["data.purchase.approved_date", "creation_date"]);
    utmBase = "data.purchase.origin";
  } else if (provider === "kiwify") {
    orderId = get(p, "order_id"); eventType = first(p, ["webhook_event_type", "order_status"]);
    rawStatus = eventType; amount = first(p, ["Commissions.charge_amount", "Commissions.product_base_price"]);
    currency = first(p, ["Commissions.currency", "Commissions.product_base_price_currency"]);
    product = first(p, ["Product.product_name", "product_name"]); date = first(p, ["approved_date", "created_at", "updated_at"]);
    utmBase = "TrackingParameters";
  } else if (provider === "ratixpay") {
    orderId = first(p, ["payment_id", "reference", "order_id"]); eventType = first(p, ["event", "status"]);
    rawStatus = first(p, ["status", "event"]); amount = get(p, "amount"); currency = get(p, "currency");
    product = first(p, ["product.name", "product_name"]); date = first(p, ["paid_at", "created_at"]);
  } else return { error: "Plataforma sem validação oficial disponível." };

  if (!eventType || !orderId) return { ignored: "Evento sem identificador de venda." };
  const status = mapStatus(provider, String(rawStatus ?? ""));
  if (!status) return { ignored: `Evento não relacionado com vendas: ${String(eventType).slice(0, 60)}` };
  const value = Number(amount);
  if (!Number.isFinite(value) || value < 0 || value > 1e12) return { error: "Valor da venda inválido ou ausente." };
  const ts = typeof date === "number" ? new Date(date) : date ? new Date(String(date)) : new Date();
  return {
    orderId: String(orderId).slice(0, 200), eventType: String(eventType).slice(0, 100), status, amount: value,
    currency: currency ? String(currency).toUpperCase().slice(0, 3) : null,
    productName: str(product), occurredAt: Number.isNaN(ts.getTime()) ? new Date().toISOString() : ts.toISOString(),
    utm: {
      source: str(first(p, [`${utmBase}.utm_source`, `${utmBase}.src`])), medium: str(get(p, `${utmBase}.utm_medium`)),
      campaign: str(first(p, [`${utmBase}.utm_campaign`, `${utmBase}.sck`])), content: str(get(p, `${utmBase}.utm_content`)),
    },
  };
}

export type ConnectionState = "functional" | "needs_config" | "error";
export function connectionState(i: { provider: string; status: string; last_event_at: string | null; last_error: string | null; has_endpoint: boolean }): ConnectionState {
  const info = providerInfo(i.provider);
  if (!info?.supported || !i.has_endpoint) return "needs_config";
  if (i.status === "error" || i.last_error) return "error";
  if (i.status === "active" && i.last_event_at) return "functional";
  return "needs_config";
}
