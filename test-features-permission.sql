-- Test script to verify features table permission fix
-- Run this in Supabase SQL Editor

-- Test 1: Check current user and roles
SELECT 
    auth.uid() as current_user_id,
    array_agg(ur.role) as user_roles
FROM user_roles ur 
WHERE ur.user_id = auth.uid();

-- Test 2: Test has_role_debug function
SELECT 
    public.has_role_debug(auth.uid(), 'admin') as has_admin_role_debug,
    public.has_role(auth.uid(), 'admin') as has_admin_role;

-- Test 3: Test features table access
-- This should work for admin users
SELECT 
    id,
    name_en,
    name_ar,
    name_fr,
    is_active
FROM features 
LIMIT 3;

-- Test 4: Test features table update (this was failing before)
-- This should work for admin users
UPDATE features 
SET description_en = 'Test update - ' || now()::text
WHERE name_en = 'Store Logo'
RETURNING id, name_en, description_en;

-- Test 5: Debug admin permissions
SELECT * FROM public.debug_admin_permissions();
