CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- store owner

  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT unique_owner UNIQUE(owner_id) -- optional: one store per user
);