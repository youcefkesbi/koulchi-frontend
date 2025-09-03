CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE ON UPDATE CASCADE, -- store owner
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
);

-- Enable Row Level Security --
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

create policy "users can insert their own store"
on stores
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "users can update their own store"
on stores
for update
to authenticated
using (owner_id = auth.uid())
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

-- Create the trigger function (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add the trigger to your stores table
CREATE TRIGGER update_stores_updated_at 
    BEFORE UPDATE ON stores 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();