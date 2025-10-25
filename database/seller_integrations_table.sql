-- ================================
-- Seller Integrations Table
-- ================================

CREATE TABLE IF NOT EXISTS public.seller_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  provider TEXT NOT NULL,
  account_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ensure one integration per seller per provider
  UNIQUE(seller_id, provider)
);

-- ================================
-- Indexes
-- ================================
CREATE INDEX IF NOT EXISTS seller_integrations_seller_id_idx ON public.seller_integrations(seller_id);
CREATE INDEX IF NOT EXISTS seller_integrations_provider_idx ON public.seller_integrations(provider);
CREATE INDEX IF NOT EXISTS seller_integrations_enabled_idx ON public.seller_integrations(enabled);

-- ================================
-- Policies
-- ================================
ALTER TABLE public.seller_integrations ENABLE ROW LEVEL SECURITY;

-- Admin can manage all integrations
CREATE POLICY "Admin can manage all seller_integrations"
ON public.seller_integrations FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
);

-- Users can manage their own integrations
CREATE POLICY "Users can manage their own integrations"
ON public.seller_integrations FOR ALL TO authenticated
USING (seller_id = auth.uid())
WITH CHECK (seller_id = auth.uid());

-- ================================
-- Triggers
-- ================================
CREATE TRIGGER update_seller_integrations_updated_at
BEFORE UPDATE ON public.seller_integrations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

