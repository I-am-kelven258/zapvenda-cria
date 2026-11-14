-- Trakify: per-user access validity.
-- Existing accounts are grandfathered with NULL valid_until to avoid accidental lockout.
-- New accounts created by the protected server function always receive a finite expiry.
-- Corrected with user approval: plain UUID user_id and grants before RLS.

create table if not exists public.user_access (
  user_id uuid primary key,
  valid_until timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

revoke all on public.user_access from anon, authenticated;
grant select on public.user_access to authenticated;
grant all on public.user_access to service_role;

insert into public.user_access (user_id, valid_until)
select id, null
from auth.users
on conflict (user_id) do nothing;

alter table public.user_access enable row level security;

drop policy if exists "Users can view own access" on public.user_access;
create policy "Users can view own access"
on public.user_access
for select
to authenticated
using (auth.uid() = user_id);

create or replace function public.has_valid_access(check_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.user_access ua
    where ua.user_id = check_user_id
      and ua.revoked_at is null
      and (ua.valid_until is null or ua.valid_until > now())
  );
$$;

revoke all on function public.has_valid_access(uuid) from public;
grant execute on function public.has_valid_access(uuid) to authenticated;

drop policy if exists "own select" on public.scripts;
drop policy if exists "own insert" on public.scripts;
drop policy if exists "own delete" on public.scripts;

create policy "own select"
on public.scripts
for select
to authenticated
using (auth.uid() = user_id and public.has_valid_access(auth.uid()));

create policy "own insert"
on public.scripts
for insert
to authenticated
with check (auth.uid() = user_id and public.has_valid_access(auth.uid()));

create policy "own delete"
on public.scripts
for delete
to authenticated
using (auth.uid() = user_id and public.has_valid_access(auth.uid()));

revoke all on public.scripts from anon;