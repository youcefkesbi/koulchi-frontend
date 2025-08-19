-- Create the profiles table
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'user',
  city text,
  updated_at timestamptz not null default now()
);