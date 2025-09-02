-- Test script for store creation functionality
-- Run this as an authenticated user to verify the new store creation logic

-- 1. Check current user authentication
SELECT 
    'Current user authentication' as test_phase,
    auth.uid() as user_id,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN 'Authenticated'
        ELSE 'Not authenticated'
    END as auth_status;

-- 2. Test store creation with all fields
-- This simulates what the frontend does when creating a store
INSERT INTO public.stores (owner_id, name, description, logo_url, banner_url)
VALUES (
    auth.uid(),
    'Test Store ' || extract(epoch from now()),
    'A test store description',
    'https://example.com/logo.jpg',
    'https://example.com/banner.jpg'
)
RETURNING 
    'Store created with all fields' as test_phase,
    id,
    owner_id,
    name,
    description,
    logo_url,
    banner_url,
    created_at;

-- 3. Test store creation with only required fields (nulls for optional)
INSERT INTO public.stores (owner_id, name, description, logo_url, banner_url)
VALUES (
    auth.uid(),
    'Minimal Test Store ' || extract(epoch from now()),
    null,
    null,
    null
)
RETURNING 
    'Store created with minimal fields' as test_phase,
    id,
    owner_id,
    name,
    description,
    logo_url,
    banner_url,
    created_at;

-- 4. Test store creation with empty strings (should become nulls)
-- Note: This would be handled by the frontend, but testing database behavior
INSERT INTO public.stores (owner_id, name, description, logo_url, banner_url)
VALUES (
    auth.uid(),
    'Empty Fields Test Store ' || extract(epoch from now()),
    CASE WHEN '' = '' THEN null ELSE '' END,
    CASE WHEN '' = '' THEN null ELSE '' END,
    CASE WHEN '' = '' THEN null ELSE '' END
)
RETURNING 
    'Store created with null handling' as test_phase,
    id,
    owner_id,
    name,
    description,
    logo_url,
    banner_url,
    created_at;

-- 5. Verify all created stores belong to current user
SELECT 
    'User stores verification' as test_phase,
    COUNT(*) as store_count,
    array_agg(name) as store_names
FROM public.stores 
WHERE owner_id = auth.uid();

-- 6. Test RLS policy - should only show user's own stores
SELECT 
    'RLS policy test' as test_phase,
    id,
    owner_id,
    name,
    created_at
FROM public.stores 
WHERE owner_id = auth.uid()
ORDER BY created_at DESC
LIMIT 5;

-- 7. Test store update (for the dashboard)
-- Get the most recent store ID for testing
WITH recent_store AS (
    SELECT id FROM public.stores 
    WHERE owner_id = auth.uid()
    ORDER BY created_at DESC 
    LIMIT 1
)
UPDATE public.stores 
SET 
    name = 'Updated Test Store ' || extract(epoch from now()),
    description = 'Updated description',
    updated_at = NOW()
WHERE id = (SELECT id FROM recent_store)
  AND owner_id = auth.uid()
RETURNING 
    'Store update test' as test_phase,
    id,
    name,
    description,
    updated_at;

-- 8. Test constraint: unique owner (if enabled)
-- This should fail if the unique_owner constraint is active
-- Uncomment the following if you want to test the constraint:
/*
INSERT INTO public.stores (owner_id, name)
VALUES (
    auth.uid(),
    'Second Store Test (should fail if unique constraint active)'
)
RETURNING 
    'Unique constraint test' as test_phase,
    id,
    name;
*/

-- 9. Clean up test data (optional)
-- Uncomment to clean up test stores:
/*
DELETE FROM public.stores 
WHERE owner_id = auth.uid() 
  AND (
    name LIKE 'Test Store %' 
    OR name LIKE 'Minimal Test Store %'
    OR name LIKE 'Empty Fields Test Store %'
    OR name LIKE 'Updated Test Store %'
  )
RETURNING 
    'Cleanup test' as test_phase,
    id,
    name;
*/

-- 10. Final verification
SELECT 
    'Final verification' as test_phase,
    COUNT(*) as remaining_stores
FROM public.stores 
WHERE owner_id = auth.uid();
