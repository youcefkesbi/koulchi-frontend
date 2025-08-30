-- Cart and Wishlist SQL Functions
-- These functions implement the exact query format specified

-- Function to add/update cart item
-- Matches: insert into cart (user_id, product_id, quantity, created_at)
--          values ('<user_id>', '<product_id>', <quantity>, now())
--          on conflict (user_id, product_id) do update set quantity = excluded.quantity;

CREATE OR REPLACE FUNCTION add_to_cart(
  p_user_id UUID,
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO cart (user_id, product_id, quantity, created_at)
  VALUES (p_user_id, p_product_id, p_quantity, now())
  ON CONFLICT (user_id, product_id) 
  DO UPDATE SET 
    quantity = EXCLUDED.quantity,
    updated_at = now();
END;
$$;

-- Function to add wishlist item
-- Matches: insert into wishlist (user_id, product_id)
--          values ('<user_id>', '<product_id>')
--          on conflict (user_id, product_id) do nothing;

CREATE OR REPLACE FUNCTION add_to_wishlist(
  p_user_id UUID,
  p_product_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO wishlist (user_id, product_id)
  VALUES (p_user_id, p_product_id)
  ON CONFLICT (user_id, product_id) 
  DO NOTHING;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION add_to_cart(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION add_to_wishlist(UUID, UUID) TO authenticated;

-- Enable RLS on cart table if not already enabled
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cart table
CREATE POLICY "Users can view own cart" ON cart
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON cart
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON cart
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON cart
    FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on wishlist table if not already enabled
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for wishlist table
CREATE POLICY "Users can view own wishlist" ON wishlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist items" ON wishlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist items" ON wishlist
    FOR DELETE USING (auth.uid() = user_id);
