-- Function to update sold_count for all products based on order_items
-- This function calculates the total quantity sold for each product from order_items table

CREATE OR REPLACE FUNCTION update_product_sold_count()
RETURNS void AS $$
BEGIN
    -- Update sold_count for all products based on order_items
    UPDATE products 
    SET sold_count = COALESCE(
        (SELECT SUM(oi.quantity) 
         FROM order_items oi 
         JOIN orders o ON oi.order_id = o.id 
         WHERE oi.product_id = products.id 
         AND o.status IN ('confirmed', 'shipped', 'delivered')
        ), 0
    );
END;
$$ LANGUAGE plpgsql;

-- Function to update sold_count for a specific product
CREATE OR REPLACE FUNCTION update_product_sold_count_single(product_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE products 
    SET sold_count = COALESCE(
        (SELECT SUM(oi.quantity) 
         FROM order_items oi 
         JOIN orders o ON oi.order_id = o.id 
         WHERE oi.product_id = product_uuid 
         AND o.status IN ('confirmed', 'shipped', 'delivered')
        ), 0
    )
    WHERE id = product_uuid;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to automatically update sold_count when order_items are inserted/updated/deleted
CREATE OR REPLACE FUNCTION trigger_update_sold_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update sold_count for the affected product
    PERFORM update_product_sold_count_single(COALESCE(NEW.product_id, OLD.product_id));
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update sold_count when order_items change
DROP TRIGGER IF EXISTS update_sold_count_trigger ON order_items;
CREATE TRIGGER update_sold_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_sold_count();

-- Initial update of sold_count for all existing products
SELECT update_product_sold_count();
