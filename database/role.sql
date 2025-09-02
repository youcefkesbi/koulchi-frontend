-- Give yourself admin role
update auth.users
set raw_app_meta_data = jsonb_set(raw_app_meta_data, '{role}', '"admin"')
where email = 'ykesbi@gmail.com';

-- Function to sync role from auth.users into profiles.role
create or replace function public.sync_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role text;
begin
  -- Fetch the role from app_metadata in auth.users
  select raw_app_meta_data->>'role'
  into user_role
  from auth.users
  where id = new.id;

  -- Default to "user" if role is null
  if user_role is null then
    user_role := 'user';
  end if;

  -- Set the role column
  new.role := user_role;

  return new;
end;
$$;


create trigger sync_profile_role_trigger
before insert on profiles
for each row
execute function public.sync_profile_role();
