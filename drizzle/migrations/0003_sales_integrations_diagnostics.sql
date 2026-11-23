alter table public.sales_integrations drop constraint if exists sales_integrations_provider_check;
alter table public.sales_integrations add constraint sales_integrations_provider_check check (provider in ('tutora','escalepay','hotmart','kiwify','ratixpay','calipay'));
alter table public.sales_integrations add column if not exists last_event_at timestamptz;
alter table public.sales_integrations add column if not exists last_error text;