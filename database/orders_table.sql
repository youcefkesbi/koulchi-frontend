CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- buyer
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  shipping_address text,
  notes text,                        -- buyer notes
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add store_id column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id);

-- Add Maystro delivery columns (required for Maystro integration)
-- Note: customer phone is now stored in profiles.phone_num instead
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_wilaya_id integer;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_commune_id integer;
-- ================================
-- Indexes
-- ================================
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- ================================
-- Policies
-- ================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admin can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Vendor and Customer can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Vendor can view orders for own store" ON public.orders;
DROP POLICY IF EXISTS "Employee can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Vendor can update status of his own orders" ON public.orders;
DROP POLICY IF EXISTS "Employee can update all orders" ON public.orders;

-- Admin can manage all orders
CREATE POLICY "Admin can manage all orders"
ON public.orders FOR ALL TO authenticated
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
-- Anyone (authenticated) can insert their own orders
CREATE POLICY "Anyone can insert own orders"
ON public.orders FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
);
-------- SELECT --------
-- Vendor and Customer can view their own orders
CREATE POLICY "Vendor and Customer can view their own orders"
ON public.orders FOR SELECT TO authenticated
USING (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('customer', 'vendor')
  )
);

-- Vendors can view orders for their store
CREATE POLICY "Vendor can view orders for own store"
ON public.orders FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.stores s
    WHERE s.id = orders.store_id
      AND s.owner_id = auth.uid()
  )
);


-- Employee can view all orders
CREATE POLICY "Employee can view all orders"
ON public.orders FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'employee'
  )
);
-------- UPDATE --------
-- Vendor can update status of his own orders
CREATE POLICY "Vendor can update status of his own orders"
ON public.orders FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'vendor'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'vendor'
  )
);

-- Employee can update all orders
CREATE POLICY "Employee can update all orders"
ON public.orders FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'employee'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'employee'
  )
);

-- ================================
-- Permissions (GRANT statements)
-- ================================
-- Grant permissions to service_role for backend operations
-- This allows backend to access orders while RLS policies still apply
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO postgres, anon, authenticated, service_role;

-- ================================
-- Triggers
-- ================================
CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();



-- New - by Youcef - 2025-09-25

-- Drop any existing ENUM type if it exists
DROP TYPE IF EXISTS order_status_enum CASCADE;

-- Ensure the CHECK constraint is properly set
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'));

-- (Standardize on 'cancelled' instead of 'canceled')
UPDATE public.orders 
SET status = 'cancelled' 
WHERE status = 'canceled';

-- ================================
-- Functions
-- ================================


-- Function to get orders for the authenticated user
CREATE OR REPLACE FUNCTION public.get_my_orders()
RETURNS TABLE(
    order_id UUID,
    product_id UUID,
    product_name TEXT,
    product_image TEXT,
    store_name TEXT,
    order_date TIMESTAMPTZ,
    product_price NUMERIC(10,2),
    quantity INTEGER,
    order_status TEXT,
    total_amount NUMERIC(10,2),
    shipping_address TEXT,
    notes TEXT
) AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get the current user ID
    current_user_id := auth.uid();
    
    -- Return empty if no user
    IF current_user_id IS NULL THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        o.id as order_id,
        p.id as product_id,
        p.name as product_name,
        COALESCE(p.image_urls[1], '') as product_image, -- Get first image or empty string
        COALESCE(s.name, 'Unknown Store') as store_name,
        o.created_at as order_date,
        oi.price as product_price,
        oi.quantity,
        o.status as order_status,
        o.total_amount,
        o.shipping_address,
        o.notes
    FROM public.orders o
    JOIN public.order_items oi ON o.id = oi.order_id
    JOIN public.products p ON oi.product_id = p.id
    LEFT JOIN public.stores s ON o.store_id = s.id
    WHERE o.user_id = current_user_id
    ORDER BY o.created_at DESC, p.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get orders for vendors (store owners) - orders they receive from customers
CREATE OR REPLACE FUNCTION public.get_vendor_orders()
RETURNS TABLE(
    order_id UUID,
    product_id UUID,
    product_name TEXT,
    product_image TEXT,
    customer_name TEXT,
    order_date TIMESTAMPTZ,
    product_price NUMERIC(10,2),
    quantity INTEGER,
    item_total NUMERIC(10,2),
    order_status TEXT,
    total_amount NUMERIC(10,2),
    shipping_address TEXT,
    notes TEXT
) AS $$
DECLARE
    current_user_id UUID;
    user_store_id UUID;
BEGIN
    -- Disable RLS for this function to prevent infinite recursion
    -- The function already performs its own security checks
    SET LOCAL row_security = off;
    
    -- Get the current user ID
    current_user_id := auth.uid();
    
    -- Return empty if no user
    IF current_user_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Get the user's store ID
    SELECT s.id INTO user_store_id
    FROM public.stores s
    WHERE s.owner_id = current_user_id AND s.status = 'approved';
    
    -- Return empty if no store found
    IF user_store_id IS NULL THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        o.id as order_id,
        p.id as product_id,
        p.name as product_name,
        COALESCE(p.image_urls[1], '') as product_image, -- Get first image or empty string
        COALESCE(prof.full_name, 'Unknown Customer') as customer_name,
        o.created_at as order_date,
        oi.price as product_price,
        oi.quantity,
        COALESCE((oi.price::NUMERIC * oi.quantity::NUMERIC), 0) as item_total, -- Calculate item total
        o.status as order_status,
        o.total_amount,
        o.shipping_address,
        o.notes
    FROM public.orders o
    JOIN public.order_items oi ON o.id = oi.order_id
    JOIN public.products p ON oi.product_id = p.id
    JOIN public.profiles prof ON o.user_id = prof.id
    WHERE p.store_id = user_store_id
    ORDER BY o.created_at DESC, p.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get vendor orders with filtering options
CREATE OR REPLACE FUNCTION public.get_vendor_orders_filtered(
    p_sort_by TEXT DEFAULT 'date',
    p_sort_order TEXT DEFAULT 'desc',
    p_status_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
    order_id UUID,
    product_id UUID,
    product_name TEXT,
    product_image TEXT,
    customer_name TEXT,
    order_date TIMESTAMPTZ,
    product_price NUMERIC(10,2),
    quantity INTEGER,
    item_total NUMERIC(10,2),
    order_status TEXT,
    total_amount NUMERIC(10,2),
    shipping_address TEXT,
    notes TEXT
) AS $$
DECLARE
    current_user_id UUID;
    user_store_id UUID;
    sort_clause TEXT;
BEGIN
    -- Disable RLS for this function to prevent infinite recursion
    -- The function already performs its own security checks
    SET LOCAL row_security = off;
    
    -- Get the current user ID
    current_user_id := auth.uid();
    
    -- Return empty if no user
    IF current_user_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Get the user's store ID
    SELECT s.id INTO user_store_id
    FROM public.stores s
    WHERE s.owner_id = current_user_id AND s.status = 'approved';
    
    -- Return empty if no store found
    IF user_store_id IS NULL THEN
        RETURN;
    END IF;
    
    -- If no special filtering, just return all orders (same as get_vendor_orders)
    IF p_sort_by = 'date' AND p_sort_order = 'desc' AND (p_status_filter IS NULL OR p_status_filter = '') THEN
        RETURN QUERY
        SELECT 
            o.id as order_id,
            p.id as product_id,
            p.name as product_name,
            COALESCE(p.image_urls[1], '') as product_image,
            COALESCE(prof.full_name, 'Unknown Customer') as customer_name,
            o.created_at as order_date,
            oi.price as product_price,
            oi.quantity,
            COALESCE((oi.price::NUMERIC * oi.quantity::NUMERIC), 0) as item_total,
            o.status as order_status,
            o.total_amount,
            o.shipping_address,
            o.notes
        FROM public.orders o
        JOIN public.order_items oi ON o.id = oi.order_id
        JOIN public.products p ON oi.product_id = p.id
        JOIN public.profiles prof ON o.user_id = prof.id
        WHERE p.store_id = user_store_id
        ORDER BY o.created_at DESC, p.name ASC;
        RETURN;
    END IF;
    
    -- Build sort clause for filtering
    CASE p_sort_by
        WHEN 'date' THEN
            sort_clause := 'o.created_at ' || UPPER(p_sort_order);
        WHEN 'quantity' THEN
            sort_clause := 'oi.quantity ' || UPPER(p_sort_order);
        WHEN 'status' THEN
            sort_clause := 'o.status ' || UPPER(p_sort_order);
        ELSE
            sort_clause := 'o.created_at DESC';
    END CASE;
    
    -- Return filtered orders
    RETURN QUERY
    EXECUTE format('
        SELECT 
            o.id as order_id,
            p.id as product_id,
            p.name as product_name,
            COALESCE(p.image_urls[1], '''') as product_image,
            COALESCE(prof.full_name, ''Unknown Customer'') as customer_name,
            o.created_at as order_date,
            oi.price as product_price,
            oi.quantity,
            COALESCE((oi.price::NUMERIC * oi.quantity::NUMERIC), 0) as item_total,
            o.status as order_status,
            o.total_amount,
            o.shipping_address,
            o.notes
        FROM public.orders o
        JOIN public.order_items oi ON o.id = oi.order_id
        JOIN public.products p ON oi.product_id = p.id
        JOIN public.profiles prof ON o.user_id = prof.id
        WHERE p.store_id = %L
        %s
        ORDER BY %s, p.name ASC',
        user_store_id,
        CASE WHEN p_status_filter IS NOT NULL THEN 'AND o.status = ' || quote_literal(p_status_filter) ELSE '' END,
        sort_clause
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get 3 best selling products for the authenticated user's store
CREATE OR REPLACE FUNCTION public.get_best_selling_products()
RETURNS TABLE(
    product_id UUID,
    product_name TEXT,
    product_image TEXT,
    total_quantity_sold BIGINT,
    total_revenue NUMERIC(10,2),
    store_id UUID
) AS $$
DECLARE
    user_store_id UUID;
BEGIN
    -- Get the current user's store ID
    SELECT s.id INTO user_store_id
    FROM public.stores s
    JOIN public.user_roles ur ON s.owner_id = ur.user_id
    WHERE ur.user_id = auth.uid() 
      AND ur.role = 'vendor'
      AND s.status = 'approved'
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    -- If no store found, return empty result
    IF user_store_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Return the 3 best selling products for the store
    RETURN QUERY
    SELECT 
        p.id as product_id,
        p.name as product_name,
        COALESCE(p.image_urls[1], '') as product_image,
        SUM(oi.quantity) as total_quantity_sold,
        SUM(oi.quantity * oi.price) as total_revenue,
        o.store_id
    FROM public.orders o
    JOIN public.order_items oi ON o.id = oi.order_id
    JOIN public.products p ON oi.product_id = p.id
    WHERE o.store_id = user_store_id
      AND o.status IN ('confirmed', 'shipped', 'delivered') -- Only count completed orders
    GROUP BY p.id, p.name, p.image_urls, o.store_id
    ORDER BY total_quantity_sold DESC, total_revenue DESC
    LIMIT 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get buyer orders with complete product and category information
CREATE OR REPLACE FUNCTION public.get_buyer_orders_with_details()
RETURNS TABLE(
    order_id UUID,
    order_status TEXT,
    total_amount NUMERIC(10,2),
    shipping_address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    order_items JSONB
) AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Disable RLS for this function to prevent infinite recursion
    -- The function already performs its own security checks
    SET LOCAL row_security = off;
    
    -- Get the current user ID
    current_user_id := auth.uid();
    
    -- Return empty if no user
    IF current_user_id IS NULL THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        o.id as order_id,
        o.status as order_status,
        o.total_amount,
        o.shipping_address,
        o.notes,
        o.created_at,
        o.updated_at,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', oi.id,
                    'quantity', oi.quantity,
                    'price', oi.price,
                    'product', jsonb_build_object(
                        'id', p.id,
                        'name', p.name,
                        'description', p.description,
                        'price', p.price,
                        'image_urls', p.image_urls,
                        'thumbnail_url', p.thumbnail_url,
                        'category_id', p.category_id,
                        'category_name', c.name_en,
                        'seller', jsonb_build_object(
                            'id', prof.id,
                            'full_name', prof.full_name,
                            'shipping_address', prof.shipping_address
                        )
                    )
                )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'::jsonb
        ) as order_items
    FROM public.orders o
    LEFT JOIN public.order_items oi ON o.id = oi.order_id
    LEFT JOIN public.products p ON oi.product_id = p.id
    LEFT JOIN public.categories c ON p.category_id = c.id
    LEFT JOIN public.profiles prof ON p.seller_id = prof.id
    WHERE o.user_id = current_user_id
    GROUP BY o.id, o.status, o.total_amount, o.shipping_address, o.notes, o.created_at, o.updated_at
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- TRIGGER FOR ORDER CONFIRMATION NOTIFICATIONS
-- ================================

-- Trigger function to notify buyer and seller when an order is confirmed
CREATE OR REPLACE FUNCTION public.notify_on_order_confirmed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    buyer_user_id UUID;
    seller_user_id UUID;
    store_id_val UUID;
    order_total NUMERIC(10,2);
    product_names TEXT[];
    buyer_name TEXT;
    seller_name TEXT;
BEGIN
    -- Only trigger when status changes to 'confirmed'
    IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
        -- Get order details
        buyer_user_id := NEW.user_id;
        store_id_val := NEW.store_id;
        order_total := NEW.total_amount;
        
        -- Get buyer name
        SELECT full_name INTO buyer_name
        FROM public.profiles
        WHERE id = buyer_user_id;
        
        -- Get product names from order_items
        SELECT ARRAY_AGG(p.name)
        INTO product_names
        FROM public.order_items oi
        JOIN public.products p ON oi.product_id = p.id
        WHERE oi.order_id = NEW.id;
        
        -- 1. Notification for Buyer (Customer)
        INSERT INTO public.notifications (
            user_id,
            type,
            template_key,
            metadata,
            link,
            target_role,
            is_read,
            created_at
        ) VALUES (
            buyer_user_id,
            'order_confirmed',
            'notifications.orderConfirmed',
            jsonb_build_object(
                'message', format('Your order #%s has been confirmed', substring(NEW.id::text, 1, 8)),
                'order_id', NEW.id,
                'order_total', order_total,
                'product_names', product_names,
                'order_status', NEW.status,
                'shipping_address', NEW.shipping_address
            ),
            format('/mypurchases'),
            'customer',
            FALSE,
            NOW()
        );
        
        -- 2. Notification for Seller(s) - Get unique sellers from order items
        FOR seller_user_id IN 
            SELECT DISTINCT p.seller_id
            FROM public.order_items oi
            JOIN public.products p ON oi.product_id = p.id
            WHERE oi.order_id = NEW.id
              AND p.seller_id IS NOT NULL
        LOOP
            -- Get seller name
            SELECT full_name INTO seller_name
            FROM public.profiles
            WHERE id = seller_user_id;
            
            -- Create notification for each seller
            INSERT INTO public.notifications (
                user_id,
                type,
                template_key,
                metadata,
                link,
                target_role,
                is_read,
                created_at
            ) VALUES (
                seller_user_id,
                'order_confirmed',
                'notifications.orderConfirmedForSeller',
                jsonb_build_object(
                    'message', format('New confirmed order #%s from %s', substring(NEW.id::text, 1, 8), COALESCE(buyer_name, 'Customer')),
                    'order_id', NEW.id,
                    'buyer_id', buyer_user_id,
                    'buyer_name', COALESCE(buyer_name, 'Customer'),
                    'order_total', order_total,
                    'product_names', product_names,
                    'order_status', NEW.status,
                    'shipping_address', NEW.shipping_address
                ),
                format('/dashboard'),
                'vendor',
                FALSE,
                NOW()
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS trigger_notify_on_order_confirmed ON public.orders;
CREATE TRIGGER trigger_notify_on_order_confirmed
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    WHEN (NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed'))
    EXECUTE FUNCTION public.notify_on_order_confirmed();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_my_orders TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_vendor_orders TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_buyer_orders_with_details TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_vendor_orders_filtered TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_best_selling_products TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_on_order_confirmed TO authenticated;