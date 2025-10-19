-- RPC function to get sales trend data for the last 30 days
CREATE OR REPLACE FUNCTION public.get_dashboard_sales_trend()
RETURNS TABLE (
    labels TEXT[],
    datasets JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT 
            generate_series(
                CURRENT_DATE - INTERVAL '29 days',
                CURRENT_DATE,
                INTERVAL '1 day'
            )::DATE as sale_date
    ),
    daily_sales AS (
        SELECT 
            ds.sale_date,
            COALESCE(SUM(o.total_amount), 0) as daily_sales
        FROM date_series ds
        LEFT JOIN public.orders o ON DATE(o.created_at) = ds.sale_date
            AND o.status IN ('confirmed', 'shipped', 'delivered')
        GROUP BY ds.sale_date
        ORDER BY ds.sale_date
    )
    SELECT 
        ARRAY(
            SELECT TO_CHAR(sale_date, 'Mon DD')
            FROM daily_sales
            ORDER BY sale_date
        ) as labels,
        jsonb_build_object(
            'data', to_jsonb(ARRAY(
                SELECT daily_sales
                FROM daily_sales
                ORDER BY sale_date
            )),
            'label', 'Daily Sales',
            'borderColor', 'rgb(59, 130, 246)',
            'backgroundColor', 'rgba(59, 130, 246, 0.1)',
            'tension', 0.4
        ) as datasets;
END;
$$;

-- RPC function to get orders by status data
CREATE OR REPLACE FUNCTION public.get_dashboard_orders_by_status()
RETURNS TABLE (
    labels TEXT[],
    datasets JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH status_counts AS (
        SELECT 
            o.status,
            COUNT(*) as count,
            CASE o.status
                WHEN 'delivered' THEN 'rgb(34, 197, 94)'
                WHEN 'pending' THEN 'rgb(251, 191, 36)'
                WHEN 'confirmed' THEN 'rgb(59, 130, 246)'
                WHEN 'shipped' THEN 'rgb(147, 51, 234)'
                WHEN 'cancelled' THEN 'rgb(239, 68, 68)'
                ELSE 'rgb(107, 114, 128)'
            END as color
        FROM public.orders o
        GROUP BY o.status
        ORDER BY count DESC
    )
    SELECT 
        ARRAY(
            SELECT INITCAP(status)
            FROM status_counts
            ORDER BY count DESC
        ) as labels,
        jsonb_build_object(
            'data', to_jsonb(ARRAY(
                SELECT count
                FROM status_counts
                ORDER BY count DESC
            )),
            'backgroundColor', to_jsonb(ARRAY(
                SELECT color
                FROM status_counts
                ORDER BY count DESC
            )),
            'borderColor', to_jsonb(ARRAY(
                SELECT color
                FROM status_counts
                ORDER BY count DESC
            )),
            'borderWidth', 1
        ) as datasets;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_dashboard_sales_trend() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_orders_by_status() TO authenticated;
