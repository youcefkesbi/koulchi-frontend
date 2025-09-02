-- Test script for updated profile system with phone_number field
-- Run this as an authenticated user to verify the new functionality

-- 1. Test SELECT policy - should return current user's profile with phone_number
SELECT 
    id,
    full_name,
    phone_number,
    role,
    updated_at
FROM public.profiles 
WHERE id = auth.uid();

-- 2. Test UPDATE policy - should update full_name and phone_number
-- This will only work if you have a profile row
UPDATE public.profiles 
SET 
    full_name = COALESCE(full_name, 'Test User'),
    phone_number = COALESCE(phone_number, '+213123456789'),
    updated_at = NOW()
WHERE id = auth.uid()
RETURNING *;

-- 3. Test INSERT policy - should only allow inserting own profile
-- This will fail if profile already exists due to primary key constraint
-- INSERT INTO public.profiles (id, full_name, phone_number, role)
-- VALUES (auth.uid(), 'Test User', '+213123456789', 'user');

-- 4. Verify the user can only see their own data
-- This query should only return the current user's profile
SELECT 
    'Current user profile' as test_type,
    id,
    full_name,
    phone_number,
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

-- 6. Test phone_number field specifically
-- Verify phone_number can be updated independently
UPDATE public.profiles 
SET 
    phone_number = '+213987654321',
    updated_at = NOW()
WHERE id = auth.uid()
RETURNING id, full_name, phone_number, updated_at;

-- 7. Test full_name field specifically
-- Verify full_name can be updated independently
UPDATE public.profiles 
SET 
    full_name = 'Updated Test User',
    updated_at = NOW()
WHERE id = auth.uid()
RETURNING id, full_name, phone_number, updated_at;

-- 8. Final verification
-- Show the current state of the user's profile
SELECT 
    'Final profile state' as test_type,
    id,
    full_name,
    phone_number,
    role,
    updated_at
FROM public.profiles 
WHERE id = auth.uid();
