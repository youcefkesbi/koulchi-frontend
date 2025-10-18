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
    rejection_reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


ALTER TABLE public.products ADD COLUMN thumbnail_url TEXT;

-- ================================
-- Enum and Constraints
-- ================================

-- Create the enum type for product status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
        CREATE TYPE product_status AS ENUM ('active', 'inactive', 'approved', 'rejected', 'pending');
    END IF;
END$$;

-- Add constraint to ensure status is one of the enum values
ALTER TABLE public.products 
ADD CONSTRAINT products_status_check 
CHECK (status IN ('active', 'inactive', 'approved', 'rejected', 'pending'));

-- ================================
-- Indexes
-- ================================
CREATE INDEX IF NOT EXISTS products_category_id_idx ON public.products(category_id);
CREATE INDEX IF NOT EXISTS products_seller_id_idx ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS products_store_id_idx ON public.products(store_id);
CREATE INDEX IF NOT EXISTS products_is_active_idx ON public.products(is_active);
CREATE INDEX IF NOT EXISTS products_status_idx ON public.products(status);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON public.products(created_at);

-- ================================
-- Policies
-- ================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Admin can manage all products
CREATE POLICY "Admin can manage all products"
ON public.products FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
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

-- ================================
-- RPC Functions
-- ================================

-- Function to get products without store (for employee dashboard)
CREATE OR REPLACE FUNCTION public.get_products_without_store()
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    product_description TEXT,
    product_price DECIMAL(10,2),
    product_image TEXT,
    thumbnail_url TEXT,
    category_id UUID,
    category_name TEXT,
    seller_id UUID,
    seller_name TEXT,
    stock_quantity INTEGER,
    sold_count INTEGER,
    is_active BOOLEAN,
    is_new BOOLEAN,
    status TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as product_id,
        p.name as product_name,
        p.description as product_description,
        p.price as product_price,
        COALESCE(p.thumbnail_url, p.image_urls[1], '') as product_image,
        p.thumbnail_url,
        p.category_id,
        COALESCE(c.name_en, 'No Category') as category_name,
        p.seller_id,
        COALESCE(prof.full_name, 'Unknown Seller') as seller_name,
        p.stock_quantity,
        p.sold_count,
        p.is_active,
        p.is_new,
        p.status::TEXT as status,
        p.rejection_reason,
        p.created_at,
        p.updated_at
    FROM public.products p
    LEFT JOIN public.categories c ON p.category_id = c.id
    LEFT JOIN public.profiles prof ON p.seller_id = prof.id
    WHERE p.store_id IS NULL
    ORDER BY p.created_at DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_products_without_store() TO authenticated;