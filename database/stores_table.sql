CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- store owner

  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT unique_owner UNIQUE(owner_id) -- optional: one store per user
);


create policy "users can insert their own store"
on stores
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "users can select their own store"
on stores
for select
to authenticated
using (owner_id = auth.uid());

create policy "users can update their own store"
on stores
for update
to authenticated
using (user_id = auth.uid())
with check (owner_id = auth.uid());

create policy "users can delete their own store"
on stores
for delete
to authenticated
using (owner_id = auth.uid());

create policy "everyone can view stores"
on stores
for select
to public
using (true);  -- all rows are visible