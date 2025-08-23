create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete cascade, -- user who owns the store
  name text not null,
  description text,
  logo_url text,   -- small logo image
  banner_url text, -- wide banner image
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Index to quickly find all stores owned by a user --
create index idx_stores_owner_id on public.stores (owner_id);
