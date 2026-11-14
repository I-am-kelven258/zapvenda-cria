-- Trakify: user-owned sales integration settings and normalized sales ledger.
-- Provider webhook ingestion is intentionally not enabled by this migration alone.

create table if not exists public.sales_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('tutora', 'escalepay', 'hotmart', 'kiwify', 'ratixpay')),
  display_name text not null check (char_length(trim(display_name)) between 1 and 80),
  currency text not null check (currency in ('MZN', 'BRL', 'USD', 'EUR', 'AOA')),
  amount_format text not null default 'units' check (amount_format in ('units', 'cents')),
  fixed_fee_minor bigint not null default 0 check (fixed_fee_minor >= 0),
  status text not null default 'setup_pending' check (status in ('setup_pending', 'active', 'paused', 'error')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sales_integrations_user_created_idx
  on public.sales_integrations (user_id, created_at desc);

alter table public.sales_integrations enable row level security;
drop policy if exists "Users can view own sales integrations" on public.sales_integrations;
create policy "Users can view own sales integrations"
  on public.sales_integrations for select to authenticated
  using (auth.uid() = user_id);
drop policy if exists "Users can create own sales integrations" on public.sales_integrations;
create policy "Users can create own sales integrations"
  on public.sales_integrations for insert to authenticated
  with check (auth.uid() = user_id and public.has_valid_access(auth.uid()));
drop policy if exists "Users can delete own sales integrations" on public.sales_integrations;
create policy "Users can delete own sales integrations"
  on public.sales_integrations for delete to authenticated
  using (auth.uid() = user_id and public.has_valid_access(auth.uid()));

revoke all on public.sales_integrations from anon;
grant select, insert, delete on public.sales_integrations to authenticated;
grant all on public.sales_integrations to service_role;

create table if not exists public.sales_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  integration_id uuid not null references public.sales_integrations(id) on delete cascade,
  provider_event_id text not null,
  provider_order_id text,
  product_name text,
  gross_minor bigint not null check (gross_minor >= 0),
  fee_minor bigint not null default 0 check (fee_minor >= 0),
  net_minor bigint not null check (net_minor >= 0),
  currency text not null check (currency in ('MZN', 'BRL', 'USD', 'EUR', 'AOA')),
  status text not null check (status in ('pending', 'approved', 'refunded', 'cancelled', 'chargeback')),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  occurred_at timestamptz,
  created_at timestamptz not null default now(),
  unique (integration_id, provider_event_id)
);

create index if not exists sales_transactions_user_date_idx
  on public.sales_transactions (user_id, occurred_at desc);
create index if not exists sales_transactions_integration_idx
  on public.sales_transactions (integration_id, occurred_at desc);

alter table public.sales_transactions enable row level security;
drop policy if exists "Users can view own sales transactions" on public.sales_transactions;
create policy "Users can view own sales transactions"
  on public.sales_transactions for select to authenticated
  using (auth.uid() = user_id and public.has_valid_access(auth.uid()));

revoke all on public.sales_transactions from anon, authenticated;
grant select on public.sales_transactions to authenticated;
grant all on public.sales_transactions to service_role;
