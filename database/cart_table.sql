-- Cart table - Each user has one cart
CREATE TABLE cart (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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

-- Customer can manage only their own cart
CREATE POLICY "Customer can manage only own cart"
ON public.cart
FOR ALL TO authenticated
USING (
  user_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid()
);

-- ================================
-- Functions
-- ================================

-- Create a function to add items to the cart
CREATE OR REPLACE FUNCTION public.add_to_cart(
  p_product_id uuid,
  p_quantity int DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_cart_id uuid;
BEGIN
  -- 1. Find the current user's cart
  SELECT id INTO v_cart_id 
  FROM public.cart 
  WHERE user_id = auth.uid();
  
  -- 2. Create cart if it doesn't exist
  IF NOT FOUND THEN
    INSERT INTO public.cart(user_id) 
    VALUES (auth.uid()) 
    RETURNING id INTO v_cart_id;
  END IF;

  -- 3. Insert or update item in cart_items
  INSERT INTO public.cart_items(cart_id, product_id, quantity)
  VALUES (v_cart_id, p_product_id, p_quantity)
  ON CONFLICT (cart_id, product_id)
  DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity;

END;
$$;




-- Function to decrease or remove cart item
CREATE OR REPLACE FUNCTION public.decrease_or_remove_row(
  p_product_id uuid,
  p_quantity int DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_cart_id uuid;
BEGIN
  -- 1. Find the user's cart
  SELECT id INTO v_cart_id FROM public.cart WHERE user_id = auth.uid();

  IF v_cart_id IS NULL THEN
    RAISE NOTICE 'No cart found for user %', auth.uid();
    RETURN;
  END IF;

  -- 2. Decrease the quantity
  UPDATE public.cart_items
  SET quantity = quantity - p_quantity
  WHERE cart_id = v_cart_id
    AND product_id = p_product_id;

  -- 3. Remove item if quantity <= 0
  DELETE FROM public.cart_items
  WHERE cart_id = v_cart_id
    AND product_id = p_product_id
    AND quantity <= 0;
END;
$$;




-- Function to clear all items from user's cart
CREATE OR REPLACE FUNCTION public.clear_user_cart()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_cart_id uuid;
BEGIN
  -- 1. Find the user's cart
  SELECT id INTO v_cart_id FROM public.cart WHERE user_id = auth.uid();

  IF v_cart_id IS NULL THEN
    RAISE NOTICE 'No cart found for user %', auth.uid();
    RETURN;
  END IF;

  -- 2. Delete all cart items
  DELETE FROM public.cart_items WHERE cart_id = v_cart_id;
END;
$$;

-- ================================
-- Indexes
-- ================================

-- Speed up user cart lookups
CREATE INDEX cart_user_id_idx ON cart(user_id);

-- ================================
-- Constraints
-- ================================

-- Unique constraint (prevents duplicate carts for the same user)
ALTER TABLE cart ADD CONSTRAINT cart_user_unique UNIQUE(user_id);

-- ================================
-- Triggers
-- ================================

CREATE TRIGGER update_cart_updated_at
BEFORE UPDATE ON cart
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- Permissions (GRANT statements)
-- ================================
-- Grant permissions to service_role for backend operations
-- This allows backend to access cart while RLS policies still apply
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart TO postgres, anon, authenticated, service_role;