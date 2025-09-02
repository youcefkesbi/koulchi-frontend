-- Test script for simplified profile system (full_name only)
-- Run this as an authenticated user to verify the functionality

-- 1. Test SELECT policy - should return current user's profile
SELECT 
    id,
    full_name,
    role,
    updated_at
FROM public.profiles 
WHERE id = auth.uid();

-- 2. Test UPDATE policy - should update full_name
-- This will only work if you have a profile row
UPDATE public.profiles 
SET 
    full_name = COALESCE(full_name, 'Test User'),
    updated_at = NOW()
WHERE id = auth.uid()
RETURNING *;

-- 3. Test INSERT policy - should only allow inserting own profile
-- This will fail if profile already exists due to primary key constraint
-- INSERT INTO public.profiles (id, full_name, role)
-- VALUES (auth.uid(), 'Test User', 'user');

-- 4. Verify the user can only see their own data
-- This query should only return the current user's profile
SELECT 
    'Current user profile' as test_type,
    id,
    full_name,
    role
FROM public.profiles 
WHERE id = auth.uid();

-- 5. Test that RLS prevents access to other profiles
-- This should return no rows due to RLS
SELECT 
    'Other profiles (should be empty due to RLS)' as test_type,
    COUNT(*) as profile_count
FROM public.profiles 
WHERE id != auth.uid();



-- 7. Test full_name field specifically
-- Verify full_name can be updated independently
UPDATE public.profiles 
SET 
    full_name = 'Updated Test User',
    updated_at = NOW()
WHERE id = auth.uid()
RETURNING id, full_name, updated_at;

-- 8. Final verification
-- Show the current state of the user's profile
SELECT 
    'Final profile state' as test_type,
    id,
    full_name,
    role,
    updated_at
FROM public.profiles 
WHERE id = auth.uid();
