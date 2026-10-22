-- Canonical schema; copied into the CLI-generated migration before deployment.
create schema if not exists safa_private;
revoke all on schema safa_private from public, anon, authenticated;
grant usage on schema safa_private to authenticated, service_role;

create table safa_private.staff_accounts (
  admin_type text primary key check (admin_type in ('owner', 'admin')),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table safa_private.staff_accounts enable row level security;
revoke all on safa_private.staff_accounts from public, anon, authenticated;

-- Supabase validates the JWT; checking auth.sessions also makes revocation immediate.
create function safa_private.staff_session() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare profile jsonb;
begin
  select jsonb_build_object(
    'id', a.user_id, 'name', case a.admin_type when 'owner' then 'Owner' else 'Admin' end,
    'email', '', 'role', case a.admin_type when 'owner' then 'super_admin' else 'admin' end,
    'adminType', a.admin_type, 'status', 'active', 'createdAt', a.created_at
  ) into profile from safa_private.staff_accounts a
  where a.user_id = (select auth.uid()) and exists (
    select 1 from auth.sessions s where s.user_id = a.user_id
    and s.id::text = (select auth.jwt()->>'session_id')
    and (s.not_after is null or s.not_after > now())
  );
  if profile is null then raise exception 'Staff session required' using errcode = '28000'; end if;
  return profile;
end $$;

create function public.safa_staff_session() returns jsonb
language sql stable security invoker set search_path = '' as $$
  select safa_private.staff_session();
$$;

create function safa_private.staff_directory() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if safa_private.staff_session()->>'adminType' <> 'owner' then
    raise exception 'Owner access required' using errcode = '42501';
  end if;
  return (select jsonb_agg(jsonb_build_object(
    'id', a.user_id, 'name', case a.admin_type when 'owner' then 'Owner' else 'Admin' end,
    'email', '', 'role', case a.admin_type when 'owner' then 'super_admin' else 'admin' end,
    'adminType', a.admin_type, 'status', 'active', 'createdAt', a.created_at
  ) order by a.admin_type desc) from safa_private.staff_accounts a);
end $$;
create function public.safa_staff_directory() returns jsonb
language sql stable security invoker set search_path = '' as $$
  select safa_private.staff_directory();
$$;

create function safa_private.revoke_staff_sessions(target_type text) returns void
language plpgsql security definer set search_path = '' as $$
declare actor jsonb := safa_private.staff_session();
begin
  if target_type not in ('owner','admin') or target_type is null then
    raise exception 'Invalid admin type' using errcode = '22023';
  end if;
  if actor->>'adminType' <> 'owner' and actor->>'adminType' <> target_type then
    raise exception 'Owner access required' using errcode = '42501';
  end if;
  delete from auth.sessions where user_id = (
    select user_id from safa_private.staff_accounts where admin_type = target_type
  );
end $$;
create function public.safa_revoke_staff_sessions(target_type text) returns void
language sql security invoker set search_path = '' as $$
  select safa_private.revoke_staff_sessions(target_type);
$$;

revoke execute on all functions in schema safa_private from public, anon;
grant execute on function safa_private.staff_session(), safa_private.staff_directory(), safa_private.revoke_staff_sessions(text) to authenticated;
revoke execute on function public.safa_staff_session(), public.safa_staff_directory(), public.safa_revoke_staff_sessions(text) from public, anon;
grant execute on function public.safa_staff_session(), public.safa_staff_directory(), public.safa_revoke_staff_sessions(text) to authenticated;

-- Durable throttling shared by all Edge Function instances, callable only by service_role.
create table safa_private.auth_attempts (
  bucket text primary key, window_start timestamptz not null default now(), attempts integer not null
);
create index on safa_private.auth_attempts(window_start);
alter table safa_private.auth_attempts enable row level security;
revoke all on safa_private.auth_attempts from public, anon, authenticated;
grant select, insert, update, delete on safa_private.auth_attempts to service_role;
create function public.safa_auth_attempt(bucket_key text, maximum integer, seconds integer) returns boolean
language plpgsql security invoker set search_path = '' as $$
declare used integer;
begin
  delete from safa_private.auth_attempts where window_start < now() - interval '2 days';
  insert into safa_private.auth_attempts as a(bucket, attempts) values (bucket_key, 1)
  on conflict (bucket) do update set
    attempts = case when a.window_start < now() - make_interval(secs => seconds) then 1 else a.attempts + 1 end,
    window_start = case when a.window_start < now() - make_interval(secs => seconds) then now() else a.window_start end
  returning attempts into used;
  return used <= maximum;
end $$;
revoke execute on function public.safa_auth_attempt(text,integer,integer) from public, anon, authenticated;
grant execute on function public.safa_auth_attempt(text,integer,integer) to service_role;

-- Retired custom auth tables contain private hashes/tokens; direct API access is forbidden.
alter table public.safa_admin_accounts enable row level security;
alter table public.safa_admin_sessions enable row level security;
revoke all on public.safa_admin_accounts, public.safa_admin_sessions from anon, authenticated;
