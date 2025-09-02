-- Test RLS policies for profiles table
-- Run this as an authenticated user to verify policies work

-- 1. Test SELECT policy - should only return current user's profile
SELECT 
    id,
    full_name,
    city,
    role,
    updated_at
FROM public.profiles 
WHERE id = auth.uid();

-- 2. Test UPDATE policy - should only update current user's profile
-- This will only work if you have a profile row
UPDATE public.profiles 
SET 
    full_name = COALESCE(full_name, 'Test User'),
    city = COALESCE(city, 'Test City'),
    updated_at = NOW()
WHERE id = auth.uid()
RETURNING *;

-- 3. Test INSERT policy - should only allow inserting own profile
-- This will fail if profile already exists due to primary key constraint
-- INSERT INTO public.profiles (id, full_name, role, city)
-- VALUES (auth.uid(), 'Test User', 'user', 'Test City');

-- 4. Verify the user can only see their own data
-- This query should only return the current user's profile
SELECT 
    'Current user profile' as test_type,
    id,
    full_name,
    city
FROM public.profiles 
WHERE id = auth.uid();

-- 5. Test that RLS prevents access to other profiles
-- This should return no rows due to RLS
SELECT 
    'Other profiles (should be empty due to RLS)' as test_type,
    COUNT(*) as profile_count
FROM public.profiles 
WHERE id != auth.uid();
