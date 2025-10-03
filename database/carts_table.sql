-- create cart table
CREATE TABLE cart (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ================================
-- Indexes
-- ================================

-- Prevent a user from adding the same product twice
CREATE UNIQUE INDEX cart_user_product_unique 
ON cart(user_id, product_id);

-- ================================
-- Policies
-- ================================

ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

-- Admin can manage all carts
CREATE POLICY "Admin can manage all carts"
ON cart FOR ALL TO authenticated
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

-- Customer can manage only his own cart
CREATE POLICY "Customer can manage only his own cart"
ON cart FOR ALL TO authenticated
USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'customer'
  )
)
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'customer'
  )
);

-- ================================
-- Triggers
-- ================================

CREATE TRIGGER set_cart_updated_at
BEFORE UPDATE ON cart
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- Functions
-- ================================

/* This function matches the frontend behavior when the minus button is used to decrease the quantity
  and delete the row in case quantity =0
*/
CREATE OR REPLACE FUNCTION decrease_or_remove_row(
  p_user_id uuid,
  p_product_id uuid,
  p_quantity int DEFAULT 1
)
RETURNS void AS $$
BEGIN
  -- Decrease quantity
  UPDATE cart
  SET quantity = cart.quantity - p_quantity
  WHERE user_id = p_user_id AND product_id = p_product_id;

  -- If quantity <= 0, delete the row
  DELETE FROM cart
  WHERE user_id = p_user_id AND product_id = p_product_id AND quantity <= 0;
END;
$$ LANGUAGE plpgsql;

-- 10/03/2025
-- Create a function to add items to the cart
create or replace function public.add_to_cart(
  p_user_id uuid,
  p_product_id uuid,
  p_quantity int
)
returns void
language plpgsql
as $$
begin
  insert into public.cart (user_id, product_id, quantity)
  values (p_user_id, p_product_id, p_quantity)
  on conflict (user_id, product_id) 
  do update set quantity = cart.quantity + excluded.quantity;
end;
$$;