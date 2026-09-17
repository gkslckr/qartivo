-- Qartivo production database foundation.
-- All tables are created before dependent functions, triggers, grants, and RLS policies.

create extension if not exists pgcrypto;

-- Base tables and foreign-key dependencies.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  cover_image_url text,
  address text,
  city text,
  postal_code text,
  country text not null default 'DE',
  phone text,
  website_url text,
  google_review_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.restaurant_members (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  unique (restaurant_id, user_id)
);

create table if not exists public.menus (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  is_published boolean not null default false,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, slug)
);

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.menus(id) on delete cascade,
  name text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.menu_categories(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  currency text not null default 'EUR',
  image_url text,
  allergens text[],
  tags text[],
  sort_order integer not null default 0,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  menu_id uuid not null references public.menus(id) on delete cascade,
  name text,
  code text unique not null,
  type text not null default 'menu' check (type in ('menu', 'table', 'review')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Indexes for membership, menu traversal, and QR lookups.
create index if not exists restaurant_members_user_id_idx on public.restaurant_members(user_id);
create index if not exists restaurant_members_restaurant_id_idx on public.restaurant_members(restaurant_id);
create index if not exists menus_restaurant_id_idx on public.menus(restaurant_id);
create index if not exists menu_categories_menu_id_idx on public.menu_categories(menu_id);
create index if not exists menu_items_category_id_idx on public.menu_items(category_id);
create index if not exists qr_codes_restaurant_id_idx on public.qr_codes(restaurant_id);
create index if not exists qr_codes_menu_id_idx on public.qr_codes(menu_id);

-- Functions that depend on the tables above.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_restaurant_member(target_restaurant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.restaurant_members
    where restaurant_id = target_restaurant_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.has_restaurant_role(
  target_restaurant_id uuid,
  allowed_roles text[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.restaurant_members
    where restaurant_id = target_restaurant_id
      and user_id = auth.uid()
      and role = any(allowed_roles)
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    nullif(trim(concat_ws(' ', new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name')), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.add_restaurant_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  insert into public.restaurant_members (restaurant_id, user_id, role)
  values (new.id, auth.uid(), 'owner')
  on conflict (restaurant_id, user_id) do nothing;
  return new;
end;
$$;

create or replace function public.validate_qr_menu_restaurant()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.menus
    where id = new.menu_id
      and restaurant_id = new.restaurant_id
  ) then
    raise exception 'QR-Code menu must belong to the same restaurant';
  end if;
  return new;
end;
$$;

-- Triggers are created after all referenced functions and tables exist.
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists restaurants_set_updated_at on public.restaurants;
create trigger restaurants_set_updated_at
before update on public.restaurants
for each row execute function public.set_updated_at();

drop trigger if exists menus_set_updated_at on public.menus;
create trigger menus_set_updated_at
before update on public.menus
for each row execute function public.set_updated_at();

drop trigger if exists menu_categories_set_updated_at on public.menu_categories;
create trigger menu_categories_set_updated_at
before update on public.menu_categories
for each row execute function public.set_updated_at();

drop trigger if exists menu_items_set_updated_at on public.menu_items;
create trigger menu_items_set_updated_at
before update on public.menu_items
for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists restaurants_add_owner on public.restaurants;
create trigger restaurants_add_owner
after insert on public.restaurants
for each row execute function public.add_restaurant_owner();

drop trigger if exists qr_codes_validate_menu_restaurant on public.qr_codes;
create trigger qr_codes_validate_menu_restaurant
before insert or update on public.qr_codes
for each row execute function public.validate_qr_menu_restaurant();

-- Explicit PostgREST grants; RLS below remains the source of row-level access control.
grant usage on schema public to anon, authenticated;
grant select on public.restaurants, public.menus, public.menu_categories, public.menu_items to anon;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.restaurants, public.restaurant_members, public.menus, public.menu_categories, public.menu_items, public.qr_codes to authenticated;

alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.restaurant_members enable row level security;
alter table public.menus enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.qr_codes enable row level security;

-- Re-running the migration replaces only policies owned by this schema migration.
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_select_own on public.profiles
for select to authenticated using (id = auth.uid());
create policy profiles_update_own on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists restaurants_select_member_or_public_menu on public.restaurants;
drop policy if exists restaurants_insert_authenticated on public.restaurants;
drop policy if exists restaurants_update_admin on public.restaurants;
drop policy if exists restaurants_delete_owner on public.restaurants;
create policy restaurants_select_member_or_public_menu on public.restaurants
for select using (
  public.is_restaurant_member(id)
  or exists (
    select 1
    from public.menus
    where restaurant_id = restaurants.id
      and is_published
      and restaurants.is_active
  )
);
create policy restaurants_insert_authenticated on public.restaurants
for insert to authenticated with check (auth.uid() is not null);
create policy restaurants_update_admin on public.restaurants
for update to authenticated
using (public.has_restaurant_role(id, array['owner', 'admin']))
with check (public.has_restaurant_role(id, array['owner', 'admin']));
create policy restaurants_delete_owner on public.restaurants
for delete to authenticated using (public.has_restaurant_role(id, array['owner']));

drop policy if exists restaurant_members_select_member on public.restaurant_members;
drop policy if exists restaurant_members_insert_admin on public.restaurant_members;
drop policy if exists restaurant_members_update_admin on public.restaurant_members;
drop policy if exists restaurant_members_delete_admin on public.restaurant_members;
create policy restaurant_members_select_member on public.restaurant_members
for select to authenticated
using (user_id = auth.uid() or public.has_restaurant_role(restaurant_id, array['owner', 'admin']));
create policy restaurant_members_insert_admin on public.restaurant_members
for insert to authenticated
with check (public.has_restaurant_role(restaurant_id, array['owner', 'admin']) and role in ('admin', 'editor', 'viewer'));
create policy restaurant_members_update_admin on public.restaurant_members
for update to authenticated
using (role <> 'owner' and public.has_restaurant_role(restaurant_id, array['owner', 'admin']))
with check (role <> 'owner' and public.has_restaurant_role(restaurant_id, array['owner', 'admin']));
create policy restaurant_members_delete_admin on public.restaurant_members
for delete to authenticated
using (role <> 'owner' and public.has_restaurant_role(restaurant_id, array['owner', 'admin']));

drop policy if exists menus_select_member_or_published on public.menus;
drop policy if exists menus_insert_editor on public.menus;
drop policy if exists menus_update_editor on public.menus;
drop policy if exists menus_delete_editor on public.menus;
create policy menus_select_member_or_published on public.menus
for select using (is_published or public.is_restaurant_member(restaurant_id));
create policy menus_insert_editor on public.menus
for insert to authenticated with check (public.has_restaurant_role(restaurant_id, array['owner', 'admin', 'editor']));
create policy menus_update_editor on public.menus
for update to authenticated
using (public.has_restaurant_role(restaurant_id, array['owner', 'admin', 'editor']))
with check (public.has_restaurant_role(restaurant_id, array['owner', 'admin', 'editor']));
create policy menus_delete_editor on public.menus
for delete to authenticated using (public.has_restaurant_role(restaurant_id, array['owner', 'admin', 'editor']));

drop policy if exists menu_categories_select_published on public.menu_categories;
drop policy if exists menu_categories_insert_editor on public.menu_categories;
drop policy if exists menu_categories_update_editor on public.menu_categories;
drop policy if exists menu_categories_delete_editor on public.menu_categories;
create policy menu_categories_select_published on public.menu_categories
for select using (
  public.is_restaurant_member((select restaurant_id from public.menus where id = menu_id))
  or (
    is_active
    and exists (select 1 from public.menus where id = menu_id and is_published)
  )
);
create policy menu_categories_insert_editor on public.menu_categories
for insert to authenticated
with check (public.has_restaurant_role((select restaurant_id from public.menus where id = menu_id), array['owner', 'admin', 'editor']));
create policy menu_categories_update_editor on public.menu_categories
for update to authenticated
using (public.has_restaurant_role((select restaurant_id from public.menus where id = menu_id), array['owner', 'admin', 'editor']))
with check (public.has_restaurant_role((select restaurant_id from public.menus where id = menu_id), array['owner', 'admin', 'editor']));
create policy menu_categories_delete_editor on public.menu_categories
for delete to authenticated
using (public.has_restaurant_role((select restaurant_id from public.menus where id = menu_id), array['owner', 'admin', 'editor']));

drop policy if exists menu_items_select_published on public.menu_items;
drop policy if exists menu_items_insert_editor on public.menu_items;
drop policy if exists menu_items_update_editor on public.menu_items;
drop policy if exists menu_items_delete_editor on public.menu_items;
create policy menu_items_select_published on public.menu_items
for select using (
  public.is_restaurant_member((select restaurant_id from public.menus where id = (select menu_id from public.menu_categories where id = category_id)))
  or (
    is_available
    and exists (
      select 1
      from public.menus m
      join public.menu_categories c on c.menu_id = m.id
      where c.id = category_id
        and m.is_published
        and c.is_active
    )
  )
);
create policy menu_items_insert_editor on public.menu_items
for insert to authenticated
with check (public.has_restaurant_role((select restaurant_id from public.menus m join public.menu_categories c on c.menu_id = m.id where c.id = category_id), array['owner', 'admin', 'editor']));
create policy menu_items_update_editor on public.menu_items
for update to authenticated
using (public.has_restaurant_role((select restaurant_id from public.menus m join public.menu_categories c on c.menu_id = m.id where c.id = category_id), array['owner', 'admin', 'editor']))
with check (public.has_restaurant_role((select restaurant_id from public.menus m join public.menu_categories c on c.menu_id = m.id where c.id = category_id), array['owner', 'admin', 'editor']));
create policy menu_items_delete_editor on public.menu_items
for delete to authenticated
using (public.has_restaurant_role((select restaurant_id from public.menus m join public.menu_categories c on c.menu_id = m.id where c.id = category_id), array['owner', 'admin', 'editor']));

drop policy if exists qr_codes_select_member on public.qr_codes;
drop policy if exists qr_codes_insert_admin on public.qr_codes;
drop policy if exists qr_codes_update_admin on public.qr_codes;
drop policy if exists qr_codes_delete_admin on public.qr_codes;
create policy qr_codes_select_member on public.qr_codes
for select to authenticated using (public.is_restaurant_member(restaurant_id));
create policy qr_codes_insert_admin on public.qr_codes
for insert to authenticated with check (public.has_restaurant_role(restaurant_id, array['owner', 'admin']));
create policy qr_codes_update_admin on public.qr_codes
for update to authenticated
using (public.has_restaurant_role(restaurant_id, array['owner', 'admin']))
with check (public.has_restaurant_role(restaurant_id, array['owner', 'admin']));
create policy qr_codes_delete_admin on public.qr_codes
for delete to authenticated using (public.has_restaurant_role(restaurant_id, array['owner', 'admin']));

revoke all on function public.is_restaurant_member(uuid) from public;
revoke all on function public.has_restaurant_role(uuid, text[]) from public;
grant execute on function public.is_restaurant_member(uuid) to anon, authenticated;
grant execute on function public.has_restaurant_role(uuid, text[]) to authenticated;
revoke all on function public.handle_new_user() from public;
revoke all on function public.add_restaurant_owner() from public;
revoke all on function public.validate_qr_menu_restaurant() from public;
