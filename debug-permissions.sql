-- Debug script to run in Supabase SQL Editor
-- This will help identify the exact cause of permission denied errors

-- 1. Run comprehensive debug function
SELECT '=== COMPREHENSIVE DEBUG INFO ===' as debug_section;
SELECT * FROM public.debug_admin_permissions();

-- 2. Test pack update with a specific pack (replace with actual pack ID)
SELECT '=== PACK UPDATE TEST ===' as debug_section;
-- First, get a pack ID to test with
SELECT 'Available Pack IDs:' as info, array_agg(id) as pack_ids FROM public.packs LIMIT 1;

-- 3. Check current policies
SELECT '=== CURRENT POLICIES ===' as debug_section;
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename IN ('packs', 'features', 'pack_features', 'user_roles')
ORDER BY tablename, policyname;

-- 4. Check user_roles data for current user
SELECT '=== USER ROLES DATA ===' as debug_section;
SELECT 
    user_id,
    role,
    status,
    created_at
FROM public.user_roles 
WHERE user_id = auth.uid();

-- 5. Check if user has profile
SELECT '=== PROFILE DATA ===' as debug_section;
SELECT 
    id,
    full_name,
    city,
    updated_at
FROM public.profiles 
WHERE id = auth.uid();
