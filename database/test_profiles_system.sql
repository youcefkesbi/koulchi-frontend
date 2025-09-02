-- Test script for the profiles system
-- Run this after setting up the profiles system to verify it works

-- 1. Test RLS policies (run as authenticated user)
-- This should work and return the user's own profile
SELECT * FROM public.profiles WHERE id = auth.uid();

-- 2. Test profile update (run as authenticated user)
-- This should work and update only the current user's profile
UPDATE public.profiles 
SET full_name = 'Test User', city = 'Test City', updated_at = NOW()
WHERE id = auth.uid()
RETURNING *;

-- 3. Test profile creation (this should be handled by the trigger)
-- When a new user signs up, a profile should be automatically created

-- 4. Verify the trigger works by checking if profiles exist for all users
-- (Run this as a superuser or service role)
SELECT 
    u.id,
    u.email,
    p.full_name,
    p.city,
    p.role,
    p.updated_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;

-- 5. Test that users cannot access other users' profiles
-- This should fail due to RLS
-- SELECT * FROM public.profiles WHERE id != auth.uid();

-- 6. Test that the updated_at field is automatically updated
SELECT 
    id,
    full_name,
    city,
    updated_at
FROM public.profiles 
WHERE id = auth.uid();
