-- Sharjah Shared Housing MVP
-- Run this file in Supabase SQL Editor, then create the first admin user in Auth.

create extension if not exists pgcrypto;

do $$ begin
  create type user_role as enum ('admin', 'staff', 'owner', 'broker');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type unit_category as enum ('شباب', 'بنات', 'عائلات', 'ميكس');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type unit_type as enum ('سرير', 'غرفة', 'بارتشن');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type unit_status as enum ('متاح', 'محجوز', 'مؤجر');
exception when duplicate_object then null;
end $$;

create table if not exists public.owners (
  owner_code text primary key,
  owner_name text not null,
  phone text,
  whatsapp text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role user_role not null default 'broker',
  owner_code text references public.owners(owner_code) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  unit_code text unique,
  owner_code text not null references public.owners(owner_code) on delete restrict,
  category unit_category not null,
  type unit_type not null,
  area text not null,
  price numeric(12, 2) not null check (price >= 0),
  status unit_status not null default 'متاح',
  description text,
  video_url text,
  image_urls text[] not null default '{}',
  last_update_date timestamptz not null default now(),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  broker_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  unit_code text not null references public.units(unit_code) on delete cascade,
  message text,
  status text not null default 'جديد' check (status in ('جديد', 'قيد المتابعة', 'مغلق')),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id bigserial primary key,
  actor_id uuid default auth.uid(),
  table_name text not null,
  row_id text not null,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.current_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.current_owner_code()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select owner_code from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() = 'admin'
$$;

create or replace function public.is_staff_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() in ('admin', 'staff')
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.assign_unit_code()
returns trigger
language plpgsql
as $$
declare
  next_number int;
begin
  if new.unit_code is null or new.unit_code = '' then
    select coalesce(max((regexp_replace(unit_code, '^.*-', ''))::int), 0) + 1
      into next_number
      from public.units
      where owner_code = new.owner_code
        and unit_code ~ ('^' || new.owner_code || '-[0-9]+$');

    new.unit_code := new.owner_code || '-' || lpad(next_number::text, 2, '0');
  end if;

  new.last_update_date := now();
  new.created_by := coalesce(new.created_by, auth.uid());
  return new;
end;
$$;

create or replace function public.touch_unit_update_date()
returns trigger
language plpgsql
as $$
begin
  new.last_update_date = now();
  return new;
end;
$$;

create or replace function public.protect_owner_unit_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_role() = 'owner' then
    if old.owner_code <> public.current_owner_code() or new.owner_code <> old.owner_code then
      raise exception 'Owner can only update own units';
    end if;

    if (to_jsonb(new) - 'price' - 'status' - 'image_urls' - 'video_url' - 'last_update_date')
       <> (to_jsonb(old) - 'price' - 'status' - 'image_urls' - 'video_url' - 'last_update_date') then
      raise exception 'Owner can update only price, status, images, and video';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  row_key text;
begin
  if tg_op = 'INSERT' then
    row_key := coalesce(to_jsonb(new)->>'id', to_jsonb(new)->>'owner_code', to_jsonb(new)->>'unit_code');
  elsif tg_op = 'UPDATE' then
    row_key := coalesce(to_jsonb(new)->>'id', to_jsonb(old)->>'id', to_jsonb(new)->>'owner_code', to_jsonb(new)->>'unit_code');
  else
    row_key := coalesce(to_jsonb(old)->>'id', to_jsonb(old)->>'owner_code', to_jsonb(old)->>'unit_code');
  end if;

  insert into public.audit_log(table_name, row_id, action, old_data, new_data)
  values (
    tg_table_name,
    row_key,
    tg_op,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );
  return coalesce(new, old);
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists units_assign_code on public.units;
create trigger units_assign_code
before insert on public.units
for each row execute function public.assign_unit_code();

drop trigger if exists units_touch_update_date on public.units;
create trigger units_touch_update_date
before update on public.units
for each row execute function public.touch_unit_update_date();

drop trigger if exists units_protect_owner_update on public.units;
create trigger units_protect_owner_update
before update on public.units
for each row execute function public.protect_owner_unit_update();

drop trigger if exists audit_owners on public.owners;
create trigger audit_owners
after insert or update or delete on public.owners
for each row execute function public.write_audit_log();

drop trigger if exists audit_units on public.units;
create trigger audit_units
after insert or update or delete on public.units
for each row execute function public.write_audit_log();

drop trigger if exists audit_profiles on public.profiles;
create trigger audit_profiles
after insert or update or delete on public.profiles
for each row execute function public.write_audit_log();

create or replace view public.units_public
with (security_invoker = true)
as
select
  id,
  unit_code,
  owner_code,
  category,
  type,
  area,
  price,
  status,
  description,
  video_url,
  image_urls,
  last_update_date
from public.units;

create index if not exists units_unit_code_idx on public.units using btree (unit_code);
create index if not exists units_owner_code_idx on public.units using btree (owner_code);
create index if not exists units_status_idx on public.units using btree (status);
create index if not exists units_type_idx on public.units using btree (type);
create index if not exists units_category_idx on public.units using btree (category);
create index if not exists units_price_idx on public.units using btree (price);
create extension if not exists pg_trgm;
create index if not exists units_area_trgm_idx on public.units using gin (area gin_trgm_ops);

alter table public.owners enable row level security;
alter table public.profiles enable row level security;
alter table public.units enable row level security;
alter table public.contact_requests enable row level security;
alter table public.audit_log enable row level security;

drop policy if exists owners_admin_all on public.owners;
create policy owners_admin_all on public.owners
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists owners_staff_read on public.owners;
create policy owners_staff_read on public.owners
for select using (public.current_role() = 'staff');

drop policy if exists owners_owner_read_self on public.owners;
create policy owners_owner_read_self on public.owners
for select using (owner_code = public.current_owner_code());

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
for select using (id = auth.uid());

drop policy if exists units_admin_staff_all on public.units;
create policy units_admin_staff_all on public.units
for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

drop policy if exists units_owner_read_own on public.units;
create policy units_owner_read_own on public.units
for select using (owner_code = public.current_owner_code());

drop policy if exists units_owner_insert_own on public.units;
create policy units_owner_insert_own on public.units
for insert with check (owner_code = public.current_owner_code());

drop policy if exists units_owner_update_own_limited on public.units;
create policy units_owner_update_own_limited on public.units
for update using (owner_code = public.current_owner_code())
with check (owner_code = public.current_owner_code());

drop policy if exists units_broker_available_read on public.units;
create policy units_broker_available_read on public.units
for select using (public.current_role() = 'broker' and status = 'متاح');

drop policy if exists requests_broker_insert on public.contact_requests;
create policy requests_broker_insert on public.contact_requests
for insert with check (broker_id = auth.uid() and public.current_role() in ('broker', 'admin', 'staff'));

drop policy if exists requests_broker_read_own on public.contact_requests;
create policy requests_broker_read_own on public.contact_requests
for select using (broker_id = auth.uid());

drop policy if exists requests_staff_admin_all on public.contact_requests;
create policy requests_staff_admin_all on public.contact_requests
for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

drop policy if exists audit_admin_read on public.audit_log;
create policy audit_admin_read on public.audit_log
for select using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'unit-media',
  'unit-media',
  true,
  524288000,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do update set public = true;

drop policy if exists media_read_authenticated on storage.objects;
create policy media_read_authenticated on storage.objects
for select using (bucket_id = 'unit-media' and auth.role() = 'authenticated');

drop policy if exists media_write_owner_staff_admin on storage.objects;
create policy media_write_owner_staff_admin on storage.objects
for insert with check (
  bucket_id = 'unit-media'
  and public.current_role() in ('admin', 'staff', 'owner')
);

drop policy if exists media_update_owner_staff_admin on storage.objects;
create policy media_update_owner_staff_admin on storage.objects
for update using (
  bucket_id = 'unit-media'
  and public.current_role() in ('admin', 'staff', 'owner')
);

-- After creating the first Auth user, run this once with that user's UUID:
-- insert into public.profiles (id, full_name, role) values ('AUTH_USER_UUID', 'Admin', 'admin');
