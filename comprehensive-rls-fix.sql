-- Comprehensive RLS Policy Fix for Koulchi E-commerce Platform
-- This script fixes the permission issues preventing data access

-- Step 1: Check current RLS status
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('categories', 'products', 'profiles', 'orders', 'wishlist');

-- Step 2: Temporarily disable RLS for development (recommended for testing)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist DISABLE ROW LEVEL SECURITY;

-- Step 3: Alternative approach - Keep RLS but create permissive policies
-- Uncomment the following if you want to keep RLS enabled:

/*
-- Re-enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Sellers can view their own products" ON products;
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create new permissive policies for development
CREATE POLICY "Public read access to categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Public read access to active products" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access to profiles" ON profiles
  FOR SELECT USING (true);

-- Allow authenticated users to manage their own data
CREATE POLICY "Users can manage own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Sellers can manage own products" ON products
  FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "Users can manage own orders" ON orders
  FOR ALL USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can manage own wishlist" ON wishlist
  FOR ALL USING (auth.uid() = user_id);
*/

-- Step 4: Verify the fix by testing queries
-- These should now work without permission errors:

-- Test categories access
SELECT COUNT(*) as category_count FROM categories;

-- Test products access  
SELECT COUNT(*) as product_count FROM products WHERE is_active = true;

-- Test products with category join
SELECT 
  p.name,
  p.name_ar,
  p.price,
  c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true
LIMIT 5;

-- Step 5: Check if there's data in the tables
SELECT 'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'products' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles;

-- If tables are empty, you may need to seed them with the data from supabase-setup.sql
