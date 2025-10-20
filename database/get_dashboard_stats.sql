-- RPC function to get comprehensive dashboard statistics for admin
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS TABLE (
    -- Products statistics
    total_products INTEGER,
    products_pending INTEGER,
    products_approved INTEGER,
    products_rejected INTEGER,
    products_inactive INTEGER,
    
    -- Stores statistics
    total_stores INTEGER,
    pro_stores INTEGER,
    basic_stores INTEGER,
    
    -- Users statistics
    total_users INTEGER,
    customers INTEGER,
    vendors INTEGER,
    
    -- Orders statistics
    total_orders INTEGER,
    orders_today INTEGER,
    orders_this_month INTEGER,
    
    -- Revenue statistics
    revenue_today NUMERIC,
    revenue_this_month NUMERIC,
    
    -- Alerts
    low_stock_count INTEGER,
    pending_approvals INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH product_stats AS (
        SELECT 
            COUNT(*)::INTEGER as total_products,
            COUNT(*) FILTER (WHERE status = 'pending')::INTEGER as products_pending,
            COUNT(*) FILTER (WHERE status = 'approved')::INTEGER as products_approved,
            COUNT(*) FILTER (WHERE status = 'rejected')::INTEGER as products_rejected,
            COUNT(*) FILTER (WHERE status = 'inactive')::INTEGER as products_inactive
        FROM public.products
    ),
    store_stats AS (
        SELECT 
            COUNT(*) FILTER (WHERE s.status = 'approved')::INTEGER as total_stores,
            COUNT(*) FILTER (WHERE s.status = 'approved' AND p.name_en = 'Pro Plan')::INTEGER as pro_stores,
            COUNT(*) FILTER (WHERE s.status = 'approved' AND p.name_en = 'Basic Plan')::INTEGER as basic_stores
        FROM public.stores s
        LEFT JOIN public.packs p ON s.pack_id = p.id
    ),
    user_stats AS (
        SELECT 
            COUNT(DISTINCT p.id)::INTEGER as total_users,
            COUNT(DISTINCT p.id) FILTER (WHERE ur.role = 'customer')::INTEGER as customers,
            COUNT(DISTINCT p.id) FILTER (WHERE ur.role = 'vendor')::INTEGER as vendors
        FROM public.profiles p
        LEFT JOIN public.user_roles ur ON p.id = ur.user_id
        WHERE COALESCE(p.status, 'active') != 'deleted'
    ),
    order_stats AS (
        SELECT 
            COUNT(*)::INTEGER as total_orders,
            COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE)::INTEGER as orders_today,
            COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE))::INTEGER as orders_this_month
        FROM public.orders
    ),
    revenue_stats AS (
        SELECT 
            COALESCE(SUM(total_amount) FILTER (WHERE DATE(created_at) = CURRENT_DATE), 0) as revenue_today,
            COALESCE(SUM(total_amount) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)), 0) as revenue_this_month
        FROM public.orders
        WHERE status IN ('confirmed', 'shipped', 'delivered')
    ),
    alert_stats AS (
        SELECT 
            COUNT(*) FILTER (WHERE stock_quantity <= 10)::INTEGER as low_stock_count,
            COUNT(*) FILTER (WHERE status = 'pending')::INTEGER as pending_approvals
        FROM public.products
    )
    SELECT 
        ps.total_products,
        ps.products_pending,
        ps.products_approved,
        ps.products_rejected,
        ps.products_inactive,
        ss.total_stores,
        ss.pro_stores,
        ss.basic_stores,
        us.total_users,
        us.customers,
        us.vendors,
        os.total_orders,
        os.orders_today,
        os.orders_this_month,
        rs.revenue_today,
        rs.revenue_this_month,
        als.low_stock_count,
        als.pending_approvals
    FROM product_stats ps
    CROSS JOIN store_stats ss
    CROSS JOIN user_stats us
    CROSS JOIN order_stats os
    CROSS JOIN revenue_stats rs
    CROSS JOIN alert_stats als;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;
