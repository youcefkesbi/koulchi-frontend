-- Step 1: Create the new user_roles table
create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('admin','employee','vendor','customer')),
  created_at timestamp with time zone default now(),
  unique (user_id, role) -- prevent duplicates
);