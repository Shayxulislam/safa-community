-- Restricted registration of ALREADY CREATED Auth users, using an Admin client locally.
-- This never creates users or accepts passwords; only service_role may invoke it.
create function safa_private.register_staff(owner_id uuid, admin_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.role()) is distinct from 'service_role' then
    raise exception 'Service role required' using errcode = '42501';
  end if;
  if owner_id is null or admin_id is null or owner_id = admin_id then
    raise exception 'Two distinct Auth users are required' using errcode = '22023';
  end if;
  if not exists (select 1 from auth.users where id = owner_id and email = 'owner@staff.safa-community.invalid' and email_confirmed_at is not null)
    or not exists (select 1 from auth.users where id = admin_id and email = 'admin@staff.safa-community.invalid' and email_confirmed_at is not null) then
    raise exception 'Expected confirmed staff Auth users' using errcode = '22023';
  end if;
  insert into safa_private.staff_accounts(admin_type,user_id) values ('owner',owner_id),('admin',admin_id)
  on conflict (admin_type) do nothing;
  if not exists (select 1 from safa_private.staff_accounts where admin_type='owner' and user_id=owner_id)
    or not exists (select 1 from safa_private.staff_accounts where admin_type='admin' and user_id=admin_id) then
    raise exception 'Existing staff mapping differs; no changes applied' using errcode='22023';
  end if;
end $$;
revoke execute on function safa_private.register_staff(uuid,uuid) from public, anon, authenticated;
grant execute on function safa_private.register_staff(uuid,uuid) to service_role;
create function public.safa_register_staff(owner_id uuid, admin_id uuid) returns void
language sql security invoker set search_path = '' as $$
  select safa_private.register_staff(owner_id,admin_id);
$$;
revoke execute on function public.safa_register_staff(uuid,uuid) from public, anon, authenticated;
grant execute on function public.safa_register_staff(uuid,uuid) to service_role;
