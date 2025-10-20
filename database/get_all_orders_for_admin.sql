-- ================================
-- RPC Function: Get all orders for admin
-- ================================
CREATE OR REPLACE FUNCTION public.get_all_orders_for_admin()
RETURNS TABLE (
    order_id UUID,
    user_id UUID,
    customer_name TEXT,
    customer_email TEXT,
    order_status TEXT,
    total_amount NUMERIC,
    shipping_address TEXT,
    notes TEXT,
    store_id UUID,
    store_name TEXT,
    items_count INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id as order_id,
        o.user_id,
        COALESCE(p.full_name, 'No Name')::TEXT as customer_name,
        au.email::TEXT as customer_email,
        o.status::TEXT as order_status,
        o.total_amount,
        o.shipping_address,
        o.notes,
        o.store_id,
        COALESCE(s.name, 'No Store')::TEXT as store_name,
        COALESCE(oi_count.items_count, 0)::INTEGER as items_count,
        o.created_at,
        o.updated_at
    FROM public.orders o
    LEFT JOIN public.profiles p ON o.user_id = p.id
    LEFT JOIN auth.users au ON o.user_id = au.id
    LEFT JOIN public.stores s ON o.store_id = s.id
    LEFT JOIN (
        SELECT 
            oi.order_id,
            COUNT(*) as items_count
        FROM public.order_items oi
        GROUP BY oi.order_id
    ) oi_count ON o.id = oi_count.order_id
    ORDER BY o.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_all_orders_for_admin() TO authenticated;
