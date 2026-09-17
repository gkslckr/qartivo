-- Create the initial restaurant and owner membership as part of signup.
-- This runs in the auth transaction, so it also works when email confirmation is enabled.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_restaurant_id uuid;
  restaurant_name text;
begin
  restaurant_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'restaurant_name'), ''),
    'Mein Restaurant'
  );

  insert into public.profiles (id, full_name)
  values (
    new.id,
    nullif(trim(concat_ws(' ', new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name')), '')
  )
  on conflict (id) do nothing;

  insert into public.restaurants (name, slug)
  values (
    restaurant_name,
    'restaurant-' || replace(new.id::text, '-', '')
  )
  returning id into new_restaurant_id;

  insert into public.restaurant_members (restaurant_id, user_id, role)
  values (new_restaurant_id, new.id, 'owner')
  on conflict (restaurant_id, user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

revoke all on function public.handle_new_user() from public;
