-- Fix RLS Policies for Koulchi E-commerce Platform
-- This script makes the basic tables publicly readable for development

-- First, let's check what policies exist
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE schemaname = 'public';

-- Temporarily disable RLS for development (you can re-enable later)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Or, if you want to keep RLS enabled, create more permissive policies:

-- Enable RLS again
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Sellers can view their own products" ON products;
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;

-- Create more permissive policies for development
CREATE POLICY "Public read access to categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Public read access to active products" ON products
  FOR SELECT USING (is_active = true);

-- Allow public access to view products (for development)
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT USING (true);

-- If you want to keep some security, you can use this instead:
-- CREATE POLICY "Public read access to products" ON products
--   FOR SELECT USING (
--     is_active = true OR 
--     auth.uid() IS NOT NULL
--   );

-- Test the policies
-- SELECT * FROM categories LIMIT 5;
-- SELECT * FROM products LIMIT 5;
