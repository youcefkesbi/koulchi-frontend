-- Debug Supabase Connection and Permissions
-- Run this in your Supabase SQL Editor to identify the exact issue

-- Step 1: Check if tables exist and their structure
SELECT 
  table_name,
  table_type,
  is_insertable_into,
  is_typed
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('categories', 'products', 'profiles', 'orders', 'wishlist')
ORDER BY table_name;

-- Step 2: Check RLS status on all tables
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN 'RLS ENABLED' 
    ELSE 'RLS DISABLED' 
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('categories', 'products', 'profiles', 'orders', 'wishlist')
ORDER BY tablename;

-- Step 3: Check if there are any RLS policies still active
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('categories', 'products', 'profiles', 'orders', 'wishlist')
ORDER BY tablename, policyname;

-- Step 4: Check table permissions for the anon role
SELECT 
  grantee,
  table_name,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name IN ('categories', 'products', 'profiles', 'orders', 'wishlist')
  AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY table_name, grantee, privilege_type;

-- Step 5: Check if there's any data in the tables
SELECT 
  'categories' as table_name, 
  COUNT(*) as record_count,
  CASE WHEN COUNT(*) > 0 THEN 'HAS DATA' ELSE 'EMPTY' END as status
FROM categories
UNION ALL
SELECT 
  'products' as table_name, 
  COUNT(*) as record_count,
  CASE WHEN COUNT(*) > 0 THEN 'HAS DATA' ELSE 'EMPTY' END as status
FROM products
UNION ALL
SELECT 
  'profiles' as table_name, 
  COUNT(*) as record_count,
  CASE WHEN COUNT(*) > 0 THEN 'HAS DATA' ELSE 'EMPTY' END as status
FROM profiles;

-- Step 6: Test basic queries as the anon role
-- This simulates what your frontend is trying to do
SELECT 'Testing categories access...' as test_step;
SELECT COUNT(*) as categories_count FROM categories;

SELECT 'Testing products access...' as test_step;
SELECT COUNT(*) as products_count FROM products WHERE is_active = true;

SELECT 'Testing products with category join...' as test_step;
SELECT 
  p.name,
  p.name_ar,
  p.price,
  c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true
LIMIT 3;

-- Step 7: Check if there are any triggers or functions blocking access
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND event_object_table IN ('categories', 'products', 'profiles', 'orders', 'wishlist');

-- Step 8: Grant explicit permissions to anon role (if needed)
-- Uncomment these if the tables exist but permissions are missing:

/*
-- Grant SELECT permissions to anon role
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant SELECT permissions to authenticated role
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Make sure future tables get these permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO authenticated;
*/
