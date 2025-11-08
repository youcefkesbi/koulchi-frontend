-- ================================
-- Seller Shipping Table
-- ================================

create table if not exists public.seller_shipping (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade on update cascade,
  store_id uuid not null references public.stores(id) on delete cascade on update cascade,
  provider text not null,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ================================
-- Indexes
-- ================================
CREATE INDEX IF NOT EXISTS seller_shipping_store_id_idx ON public.seller_shipping(store_id);
CREATE INDEX IF NOT EXISTS seller_shipping_seller_id_idx ON public.seller_shipping(seller_id);
CREATE INDEX IF NOT EXISTS seller_shipping_provider_idx ON public.seller_shipping(provider);
CREATE INDEX IF NOT EXISTS seller_shipping_enabled_idx ON public.seller_shipping(enabled);

-- ================================
-- Policies
-- ================================
ALTER TABLE public.seller_shipping ENABLE ROW LEVEL SECURITY;

-- Admin can manage all seller_shipping
CREATE POLICY "Admin can manage all seller_shipping"
ON public.seller_shipping FOR ALL TO authenticated
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

-------- INSERT --------
-- Vendor and customer can insert shipping for their own stores
CREATE POLICY "Vendor and customer can insert shipping for their own stores"
ON public.seller_shipping FOR INSERT TO authenticated
WITH CHECK (
    seller_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('vendor','customer')
    )
);

-------- SELECT --------
-- Vendor and customer can view their own store shippings 
CREATE POLICY "Vendor and customer can view their own store shippings"
ON public.seller_shipping FOR SELECT TO authenticated
USING (
    seller_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('vendor','customer')
    )
);

-- Employee can viw all sellers shippings
CREATE POLICY "Employee can viw all sellers shippings"
ON public.seller_shipping FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'employee'
    )
);


-------- UPDATE --------
-- Vendor and customer can update own store shippings
CREATE POLICY "Vendor and customer can update own store shippings"
ON public.seller_shipping FOR UPDATE TO authenticated
USING (
    seller_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('vendor','customer')
    )
)
WITH CHECK (
    seller_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('vendor','customer')
    )
);


-------- DELETE --------
-- Vendor and customer can delete own store shippings --
CREATE POLICY "Vendor and customer can delete own store shippings"
ON public.seller_shipping FOR DELETE TO authenticated
USING (
    seller_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('vendor','customer')
    )
);

-- ================================
-- Permissions (GRANT statements)
-- ================================
-- Grant permissions to service_role for backend operations
-- This allows backend to access seller_shipping while RLS policies still apply
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seller_shipping TO postgres, anon, authenticated, service_role;

-- ================================
-- Triggers
-- ================================
CREATE TRIGGER update_seller_shipping_updated_at
BEFORE UPDATE ON public.seller_shipping
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
