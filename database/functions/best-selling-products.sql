-- SQL Functions for Best-Selling Products

-- Top 10 best selling products (all categories)
CREATE OR REPLACE FUNCTION public.get_best_selling_products(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  product_id uuid,
  product_name text,
  category_id uuid,
  total_quantity bigint
) LANGUAGE sql AS $$
  SELECT
    p.id AS product_id,
    p.name AS product_name,
    p.category_id,
    SUM(oi.quantity) AS total_quantity
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  GROUP BY p.id, p.name, p.category_id
  ORDER BY total_quantity DESC
  LIMIT p_limit;
$$;

-- Top 10 best selling products by category
CREATE OR REPLACE FUNCTION public.get_best_selling_products_by_category(p_category_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  product_id uuid,
  product_name text,
  category_id uuid,
  total_quantity bigint
) LANGUAGE sql AS $$
  SELECT
    p.id AS product_id,
    p.name AS product_name,
    p.category_id,
    SUM(oi.quantity) AS total_quantity
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  WHERE p.category_id = p_category_id
  GROUP BY p.id, p.name, p.category_id
  ORDER BY total_quantity DESC
  LIMIT p_limit;
$$;