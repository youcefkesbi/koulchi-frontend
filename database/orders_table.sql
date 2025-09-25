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
-- Customer can insert his own orders
CREATE POLICY "Customer can insert his own orders"
ON public.orders FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'customer'
  )
);
-------- SELECT --------
-- Vendor and Customer can view their own orders
CREATE POLICY "Vendor and Customer can view their own orders"
ON public.orders FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN user_roles ur ON ur.user_id = auth.uid()
    WHERE o.id = orders.id
      AND (
        (o.user_id = auth.uid() AND ur.role = 'customer')
        OR
        (o.user_id = auth.uid() AND ur.role = 'vendor')
      )
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