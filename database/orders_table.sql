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


 ALTER TABLE orders ADD COLUMN store_id UUID REFERENCES stores(id);
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
    WHERE o.store_id = user_store_id
    ORDER BY o.created_at DESC, p.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_my_orders TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_vendor_orders TO authenticated;