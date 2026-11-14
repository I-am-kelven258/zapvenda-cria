import { useEffect, useState, type FormEvent } from "react";
import { Activity, Clock3, Link2, Loader2, Plus, ShieldCheck, Trash2, WalletCards, Copy } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

const PROVIDERS = [
  { value: "tutora", label: "Tutora" },
  { value: "escalepay", label: "EscalePay" },
  { value: "hotmart", label: "Hotmart" },
  { value: "kiwify", label: "Kiwify" },
  { value: "ratixpay", label: "RatixPay" },
] as const;
const CURRENCIES = ["MZN", "BRL", "USD", "EUR", "AOA"] as const;
type Integration = {
  id: string; provider: string; display_name: string; currency: string;
  amount_format: "units" | "cents"; fixed_fee_minor: number; status: string; created_at: string;
};
const money = (minor: number, currency: string) => new Intl.NumberFormat("pt-PT", {
  style: "currency", currency, maximumFractionDigits: 2,
}).format((Number(minor) || 0) / 100);

export function IntegracoesVendas() {
  const [items, setItems] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [provider, setProvider] = useState<string>("ratixpay");
  const [displayName, setDisplayName] = useState("");
  const [currency, setCurrency] = useState<string>("MZN");
  const [amountFormat, setAmountFormat] = useState<"units" | "cents">("units");
  const [fixedFee, setFixedFee] = useState("0");
  const [providerSecret, setProviderSecret] = useState("");
  const [createdSetup, setCreatedSetup] = useState<{ webhook_url: string | null; setup_instructions: string } | null>(null);

  async function loadIntegrations() {
    setLoading(true);
    const { data, error } = await (supabase.from("sales_integrations" as never) as any)
      .select("id,provider,display_name,currency,amount_format,fixed_fee_minor,status,created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error("Não foi possível carregar as integrações.");
    else setItems((data ?? []) as Integration[]);
    setLoading(false);
  }

  useEffect(() => { void loadIntegrations(); }, []);

  async function createIntegration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fee = Number(fixedFee.replace(",", "."));
    if (!displayName.trim()) return toast.error("Dá um nome a esta integração.");
    if (!Number.isFinite(fee) || fee < 0 || fee > 100000000) return toast.error("Indica uma taxa fixa válida.");
    const needsSecret = provider === "hotmart" || provider === "ratixpay";
    if (needsSecret && providerSecret.trim().length < 8) {
      toast.error(provider === "hotmart" ? "Introduz o Hottok da Hotmart." : "Introduz o Webhook Secret da RatixPay.");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("create-sales-integration", {
      body: {
        provider,
        display_name: displayName.trim(),
        currency,
        amount_format: amountFormat,
        fixed_fee_minor: Math.round(fee * 100),
        provider_secret: providerSecret.trim(),
      },
    });
    setSaving(false);
    if (error || data?.error) {
      toast.error(data?.error ?? "Não foi possível criar. A função do servidor pode ainda não estar publicada.");
      return;
    }
    toast.success("Integração configurada.");
    setCreatedSetup({ webhook_url: data.webhook_url ?? null, setup_instructions: data.setup_instructions });
    setDisplayName("");
    setFixedFee("0");
    setProviderSecret("");
    setShowForm(false);
    await loadIntegrations();
  }

  async function deleteIntegration(id: string) {
    const { error } = await (supabase.from("sales_integrations" as never) as any)
      .delete().eq("id", id);
    if (error) toast.error("Não foi possível remover esta configuração.");
    else {
      toast.success("Configuração removida.");
      setItems((current) => current.filter((item) => item.id !== id));
    }
  }

  return (
    <AppShell back wide>
      <main className="mx-auto w-full max-w-7xl space-y-7 pb-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-rose-500/20 bg-gradient-to-br from-rose-500/[0.12] via-card to-card p-6 shadow-sm md:p-9">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-300 md:h-16 md:w-16"><Activity className="h-8 w-8" /></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">TRAKIFY • CONTROLO COMERCIAL</p>
                <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">Integrações e Vendas</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">Organiza as tuas plataformas de venda e prepara o acompanhamento das transações num só painel.</p>
              </div>
            </div>
            <button type="button" onClick={() => setShowForm((value) => !value)} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition hover:-translate-y-0.5 hover:bg-rose-700">
              <Plus className="h-4 w-4" /> Nova integração
            </button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Link2 className="h-4 w-4 text-rose-500" /> Configurações guardadas</div><p className="mt-3 text-3xl font-extrabold tabular-nums">{items.length}</p></div>
          <div className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock3 className="h-4 w-4 text-amber-500" /> A aguardar ligação</div><p className="mt-3 text-3xl font-extrabold tabular-nums">{items.filter((item) => item.status !== "active").length}</p></div>
          <div className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><WalletCards className="h-4 w-4 text-rose-500" /> Plataformas disponíveis</div><p className="mt-3 text-3xl font-extrabold tabular-nums">5</p></div>
        </section>

        {showForm && (
          <section className="rounded-[1.75rem] border border-rose-500/25 bg-card p-5 shadow-sm md:p-7">
            <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">NOVA LIGAÇÃO</p><h2 className="mt-1 text-xl font-extrabold">Configurar plataforma</h2><p className="mt-1 text-sm text-muted-foreground">Define como os valores desta plataforma devem ser interpretados.</p></div>
            <form onSubmit={createIntegration} className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold">Plataforma
                <select value={provider} onChange={(event) => setProvider(event.target.value)} className="h-12 w-full rounded-xl border border-border bg-background px-3 font-normal outline-none focus:border-rose-500">{PROVIDERS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
              </label>
              <label className="space-y-2 text-sm font-semibold">Nome desta integração
                <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={80} required placeholder="Ex.: Loja principal" className="h-12 w-full rounded-xl border border-border bg-background px-3 font-normal outline-none focus:border-rose-500" />
              </label>
              <label className="space-y-2 text-sm font-semibold">Moeda das vendas
                <select value={currency} onChange={(event) => setCurrency(event.target.value)} className="h-12 w-full rounded-xl border border-border bg-background px-3 font-normal outline-none focus:border-rose-500">{CURRENCIES.map((item) => <option key={item} value={item}>{item}</option>)}</select>
              </label>
              <label className="space-y-2 text-sm font-semibold">Valores enviados pela plataforma
                <select value={amountFormat} onChange={(event) => setAmountFormat(event.target.value as "units" | "cents")} className="h-12 w-full rounded-xl border border-border bg-background px-3 font-normal outline-none focus:border-rose-500"><option value="units">Unidades normais (1 = 1)</option><option value="cents">Em centavos (100 = 1)</option></select>
              </label>
              {(provider === "hotmart" || provider === "ratixpay") && (
                <label className="space-y-2 text-sm font-semibold md:col-span-2">
                  {provider === "hotmart" ? "Hottok da Hotmart" : "Webhook Secret da RatixPay"}
                  <input type="password" autoComplete="off" value={providerSecret} onChange={(event) => setProviderSecret(event.target.value)} required minLength={8} placeholder="Cola aqui o segredo de Webhook da plataforma" className="h-12 w-full rounded-xl border border-border bg-background px-3 font-normal outline-none focus:border-rose-500 md:max-w-xl" />
                  <span className="block text-xs font-normal text-muted-foreground">Este segredo é enviado diretamente ao servidor e não fica disponível na área pública da aplicação.</span>
                </label>
              )}
              <label className="space-y-2 text-sm font-semibold md:col-span-2">Taxa fixa por venda ({currency})
                <input inputMode="decimal" value={fixedFee} onChange={(event) => setFixedFee(event.target.value)} placeholder="0,00" className="h-12 w-full rounded-xl border border-border bg-background px-3 font-normal outline-none focus:border-rose-500 md:max-w-sm" />
                <span className="block text-xs font-normal text-muted-foreground">A taxa será descontada ao calcular o valor líquido de cada venda.</span>
              </label>
              <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5 md:col-span-2">
                <button type="button" onClick={() => setShowForm(false)} className="h-11 rounded-xl border border-border px-5 text-sm font-semibold transition hover:bg-muted">Cancelar</button>
                <button type="submit" disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Guardar configuração</button>
              </div>
            </form>
          </section>
        )}

        {createdSetup && (
          <section className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.05] p-5">
            <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /><div className="min-w-0 flex-1">
              <h2 className="font-bold">Próximo passo da integração</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{createdSetup.setup_instructions}</p>
              {createdSetup.webhook_url && <div className="mt-4">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">URL exclusiva do Webhook</label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input readOnly value={createdSetup.webhook_url} className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-xs" />
                  <button type="button" onClick={() => { void navigator.clipboard.writeText(createdSetup.webhook_url!); toast.success("URL copiada."); }} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted"><Copy className="h-4 w-4" /> Copiar URL</button>
                </div>
              </div>}
              <p className="mt-3 text-xs text-muted-foreground">Guarda esta URL num local seguro. A Trakify não volta a mostrar o segredo que introduziste.</p>
            </div></div>
          </section>
        )}

        <section className="space-y-4">
          <div><h2 className="text-xl font-extrabold">As tuas plataformas</h2><p className="mt-1 text-sm text-muted-foreground">Cada ligação mantém a sua moeda e configuração de taxa.</p></div>
          {loading ? <div className="flex items-center justify-center rounded-2xl border border-border bg-card py-12 text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> A carregar configurações...</div> :
            items.length === 0 ? <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center"><WalletCards className="mx-auto h-9 w-9 text-muted-foreground" /><h3 className="mt-3 font-bold">Ainda não tens integrações</h3><p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Adiciona a primeira plataforma para guardar as preferências de moeda, formato dos valores e taxa fixa.</p><button type="button" onClick={() => setShowForm(true)} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Criar primeira integração</button></div> :
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <article key={item.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-500/40 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">{PROVIDERS.find((p) => p.value === item.provider)?.label ?? item.provider}</p><h3 className="mt-1 text-lg font-bold">{item.display_name}</h3></div><span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${item.status === "active" ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>{item.status === "active" ? <ShieldCheck className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}{item.status === "active" ? "Ligação ativa" : item.status === "provider_docs_pending" ? "A aguardar suporte técnico" : "A aguardar primeiro evento"}</span></div><div className="mt-5 space-y-2 border-t border-border pt-4 text-sm"><div className="flex justify-between gap-3"><span className="text-muted-foreground">Moeda</span><strong>{item.currency}</strong></div><div className="flex justify-between gap-3"><span className="text-muted-foreground">Formato recebido</span><strong>{item.amount_format === "cents" ? "Centavos (100 = 1)" : "Unidades (1 = 1)"}</strong></div><div className="flex justify-between gap-3"><span className="text-muted-foreground">Taxa fixa</span><strong>{money(item.fixed_fee_minor, item.currency)}</strong></div></div><div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4"><span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Configuração guardada</span><button type="button" onClick={() => void deleteIntegration(item.id)} aria-label={`Remover ${item.display_name}`} className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div></article>)}</div>}
        </section>

        <section className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-5">
          <div className="flex items-start gap-3"><Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><div><h3 className="font-bold">Estado das ligações</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">A receção automática está preparada para Hotmart (Hottok) e RatixPay (HMAC-SHA256). Tutora, EscalePay e Kiwify ficam guardadas, mas aguardam confirmação do método oficial de autenticação e do formato dos eventos. Nenhuma venda será registada sem validação.</p></div></div>
        </section>
      </main>
    </AppShell>
  );
}
