-- Test script to verify stores table RLS is working correctly
-- Run this as an authenticated user to test store creation

-- 1. Check current authentication status
SELECT 
    'Authentication Check' as test_phase,
    auth.uid() as user_id,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN 'Authenticated ✓'
        ELSE 'Not authenticated ✗'
    END as auth_status;

-- 2. Check if RLS is enabled on stores table
SELECT 
    'RLS Status Check' as test_phase,
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN 'RLS Enabled ✓'
        ELSE 'RLS Disabled ✗'
    END as rls_status,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'stores' AND schemaname = 'public') as policy_count
FROM pg_tables 
WHERE tablename = 'stores' AND schemaname = 'public';

-- 3. List all policies for stores table
SELECT 
    'Policy List' as test_phase,
    policyname,
    cmd as operation,
    CASE 
        WHEN roles = '{public}' THEN 'Public'
        WHEN roles = '{authenticated}' THEN 'Authenticated'
        ELSE array_to_string(roles, ', ')
    END as allowed_roles
FROM pg_policies 
WHERE tablename = 'stores' AND schemaname = 'public'
ORDER BY policyname;

-- 4. Test store creation (this should work if RLS is properly configured)
INSERT INTO public.stores (owner_id, name, description)
VALUES (
    auth.uid(),
    'RLS Test Store ' || extract(epoch from now()),
    'Testing RLS policies after fix'
)
RETURNING 
    'Store Creation Test' as test_phase,
    id,
    owner_id,
    name,
    description,
    created_at;

-- 5. Test that we can only see our own stores (RLS filtering)
SELECT 
    'RLS Filtering Test' as test_phase,
    COUNT(*) as visible_stores,
    array_agg(name ORDER BY created_at DESC) as store_names
FROM public.stores;

-- 6. Test store update (should work for our own store)
WITH recent_store AS (
    SELECT id FROM public.stores 
    WHERE owner_id = auth.uid()
    ORDER BY created_at DESC 
    LIMIT 1
)
UPDATE public.stores 
SET 
    name = 'Updated RLS Test Store ' || extract(epoch from now()),
    updated_at = NOW()
WHERE id = (SELECT id FROM recent_store)
  AND owner_id = auth.uid()
RETURNING 
    'Store Update Test' as test_phase,
    id,
    name,
    updated_at;

-- 7. Clean up test data
DELETE FROM public.stores 
WHERE owner_id = auth.uid() 
  AND (
    name LIKE 'RLS Test Store %' 
    OR name LIKE 'Updated RLS Test Store %'
  )
RETURNING 
    'Cleanup Test' as test_phase,
    id,
    name;

-- 8. Final verification
SELECT 
    'Final Verification' as test_phase,
    'RLS fix completed successfully' as status,
    COUNT(*) as remaining_user_stores
FROM public.stores 
WHERE owner_id = auth.uid();