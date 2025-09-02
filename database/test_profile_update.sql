-- Test script for profile update operations (no upsert)
-- Run this as an authenticated user to verify the new update-only functionality

-- 1. Check current profile state
SELECT 
    'Current profile state' as test_phase,
    id,
    full_name,
    role,
    created_at,
    updated_at
FROM public.profiles 
WHERE id = auth.uid();

-- 2. Test update operation (simulates what the frontend does)
-- This should work since profile is auto-created on signup
UPDATE public.profiles 
SET 
    full_name = 'Updated Test Name',
    updated_at = NOW()
WHERE id = auth.uid()
RETURNING 
    'After update' as test_phase,
    id,
    full_name,
    role,
    updated_at;

-- 3. Verify the update worked
SELECT 
    'Final verification' as test_phase,
    id,
    full_name,
    role,
    created_at,
    updated_at
FROM public.profiles 
WHERE id = auth.uid();

-- 4. Test that RLS still works - should only affect current user
SELECT 
    'RLS test (should only show current user)' as test_type,
    COUNT(*) as profile_count
FROM public.profiles 
WHERE full_name = 'Updated Test Name';

-- 5. Verify role column is not updated (should remain unchanged)
-- This tests that only full_name is updated, not role
UPDATE public.profiles 
SET 
    full_name = 'Final Test Name'
WHERE id = auth.uid()
RETURNING 
    'Role should remain unchanged' as test_phase,
    id,
    full_name,
    role;

-- 6. Test edge case - empty full_name
UPDATE public.profiles 
SET 
    full_name = ''
WHERE id = auth.uid()
RETURNING 
    'Empty name test' as test_phase,
    id,
    full_name,
    role;
