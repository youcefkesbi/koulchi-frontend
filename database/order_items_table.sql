-- Order items table
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity int not null check (quantity > 0),
  price numeric(10,2) not null,     -- snapshot of product price at purchase
  variant jsonb,                     -- size/color/etc.
  created_at timestamptz default now(),
  updated_at timestamptz NOT NULL default now()
);

-- ================================
-- Indexes
-- ================================
create index idx_order_items_order_id on order_items(order_id);           -- fetch items of an order
create index idx_order_items_product_id on order_items(product_id);       -- analytics / reports
create index idx_order_items_created_at on order_items(created_at);       -- recent items / reporting
create index idx_order_items_order_product on order_items(order_id, product_id); -- common join queries



-- ================================
-- Policies
-- ================================

-- Enable ROW LEVEL SECURITY
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Admin can manage all order items
CREATE POLICY "Admin can manage all order items"
ON order_items FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
);

-------- INSERT --------
-- Customer can insert their own order items -- 
CREATE POLICY "Customer can insert order items"
ON order_items FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'customer'
  )
);

-------- SELECT --------
-- Employee can view all order items --
CREATE POLICY "Employee can view all order items"
ON order_items FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'employee'
  )
);

-- Vendor and customer can view only their own order items
CREATE POLICY "Vendor and customer can view only their order items"
ON order_items FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM orders o
    JOIN user_roles ur ON ur.user_id = auth.uid()
    WHERE o.id = order_items.order_id
      AND (
        (o.user_id = auth.uid() AND ur.role = 'customer')
        OR
        (o.user_id = auth.uid() AND ur.role = 'vendor')
      )
  )
);


-- ================================
-- Permissions (GRANT statements)
-- ================================
-- Grant permissions to service_role for backend operations
-- This allows backend to access order_items while RLS policies still apply
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO postgres, anon, authenticated, service_role;

-- ================================
-- Triggers
-- ================================
CREATE TRIGGER set_order_items_updated_at
BEFORE UPDATE ON public.order_items
FOR EACH ROW