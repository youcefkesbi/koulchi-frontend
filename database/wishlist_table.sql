-- ================================
-- Wishlist Table
-- ================================
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- ================================
-- Indexes
-- ================================
CREATE INDEX IF NOT EXISTS wishlist_user_id_idx ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS wishlist_product_id_idx ON public.wishlist(product_id);

-- ================================
-- Policies
-- ================================
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Admin can manage all wishlist
CREATE POLICY "Admin can manage all wishlist"
ON public.wishlist FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
);

-- Vendor can manage his own wishlist
CREATE POLICY "Vendor can manage his own wishlist"
ON public.wishlist FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'vendor'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'vendor'
    )
);


-- ================================
-- Grants
-- ================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlist TO authenticated;


-- ================================
-- Triggers
-- ================================

CREATE TRIGGER update_wishlists_updated_at 
    BEFORE UPDATE ON public.wishlists 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
