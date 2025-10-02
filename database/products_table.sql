-- ================================
-- Products table structure for Supabase
-- ================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_urls TEXT[] DEFAULT '{}',
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    stock_quantity INTEGER DEFAULT 1,
    sold_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_new BOOLEAN DEFAULT true,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


ALTER TABLE public.products ADD COLUMN thumbnail_url TEXT;


-- ================================
-- Indexes
-- ================================
CREATE INDEX IF NOT EXISTS products_category_id_idx ON public.products(category_id);
CREATE INDEX IF NOT EXISTS products_seller_id_idx ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS products_store_id_idx ON public.products(store_id);
CREATE INDEX IF NOT EXISTS products_is_active_idx ON public.products(is_active);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON public.products(created_at);

-- ================================
-- Policies
-- ================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Admin can manage all products
CREATE POLICY "Admin can manage all products"
ON public.products FOR ALL TO authenticated
USING (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
)
WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
);
-------- INSERT --------
-- Vendor and customer can insert products in their own stores
CREATE POLICY "Vendor and customer can manage their own products"
ON public.products FOR ALL TO authenticated
WITH CHECK (
    seller_id = auth.uid() AND 
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('vendor','customer')
    )
);
-------- SELECT --------
-- Anyone can view products
CREATE POLICY "Anyone can view products"
ON public.products FOR SELECT
USING (is_active = true);

-------- UPDATE --------
-- Vendor and customer can update products in their own stores
CREATE POLICY "Vendor and customer can update products in their own stores"
ON public.products FOR UPDATE TO authenticated
WITH CHECK (
    seller_id = auth.uid() AND 
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('vendor','customer')
    )
)
USING (
    seller_id = auth.uid() AND 
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('vendor','customer')
    )
)


-------- DELETE --------
-- Vendor and customer can delete products in their own stores
CREATE POLICY "Vendor and customer can delete products in their own stores"
ON public.products FOR DELETE TO authenticated
USING (
    seller_id = auth.uid() AND 
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('vendor','customer')
    )
)

-- ================================
-- Triggers
-- ================================
CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
