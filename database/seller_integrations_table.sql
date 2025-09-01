create table seller_integrations (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  provider text not null, -- e.g. 'maystro'
  account_id text,        -- seller's Maystro account ID
  access_token text,      -- encrypted, stored via Edge Function
  refresh_token text,     -- encrypted, stored via Edge Function
  expires_at timestamptz, -- Maystro token expiry
  enabled boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ensure each seller has only one Maystro integration
create unique index uniq_seller_provider
on seller_integrations (seller_id, provider);

-- Basic RLS setup
alter table seller_integrations enable row level security;

create policy "Sellers can manage their own integrations"
on seller_integrations
for all
using (auth.uid() = seller_id);
