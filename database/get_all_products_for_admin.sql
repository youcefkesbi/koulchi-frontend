-- ================================
-- RPC Function: Get all products for admin
-- ================================
CREATE OR REPLACE FUNCTION public.get_all_products_for_admin()
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
    seller_email TEXT,
    store_id UUID,
    store_name TEXT,
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
        p.id,
        p.name,
        p.description,
        p.price,
        COALESCE(p.thumbnail_url, p.image_urls[1], '')::TEXT,
        p.thumbnail_url,
        p.category_id,
        COALESCE(c.name_en, 'No Category')::TEXT,
        p.seller_id,
        COALESCE(prof.full_name, 'Unknown Seller')::TEXT,
        COALESCE(au.email, 'No Email')::TEXT,
        p.store_id,
        COALESCE(s.name, 'No Store')::TEXT,
        p.stock_quantity,
        p.sold_count,
        p.is_active,
        p.is_new,
        p.status::TEXT,
        p.rejection_reason,
        p.created_at,
        p.updated_at
    FROM public.products p
    LEFT JOIN public.categories c ON p.category_id = c.id
    LEFT JOIN public.profiles prof ON p.seller_id = prof.id
    LEFT JOIN auth.users au ON p.seller_id = au.id
    LEFT JOIN public.stores s ON p.store_id = s.id
    ORDER BY p.created_at DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_all_products_for_admin() TO authenticated;