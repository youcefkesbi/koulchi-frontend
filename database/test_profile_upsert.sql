-- Test script for profile upsert operations
-- Run this as an authenticated user to verify the new upsert functionality

-- 1. Test profile upsert - should work for both insert and update
-- This uses the same pattern as the refactored Profile.vue component

-- First, check if profile exists
SELECT 
    'Before upsert' as test_phase,
    id,
    full_name,
    role,
    updated_at
FROM public.profiles 
WHERE id = auth.uid();

-- Test upsert operation (insert if not exists, update if exists)
-- This simulates what the frontend does
INSERT INTO public.profiles (id, full_name, role)
VALUES (auth.uid(), 'Test User from Upsert', 'user')
ON CONFLICT (id) 
DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    updated_at = NOW()
RETURNING *;

-- Verify the upsert worked
SELECT 
    'After upsert' as test_phase,
    id,
    full_name,
    role,
    updated_at
FROM public.profiles 
WHERE id = auth.uid();

-- Test another upsert to verify update functionality
INSERT INTO public.profiles (id, full_name, role)
VALUES (auth.uid(), 'Updated Test User', 'user')
ON CONFLICT (id) 
DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    updated_at = NOW()
RETURNING *;

-- Final verification
SELECT 
    'Final state' as test_phase,
    id,
    full_name,
    role,
    updated_at
FROM public.profiles 
WHERE id = auth.uid();

-- Test that RLS still works - this should only return current user's profile
SELECT 
    'RLS test (should only show current user)' as test_type,
    COUNT(*) as profile_count,
    STRING_AGG(full_name, ', ') as found_profiles
FROM public.profiles;
