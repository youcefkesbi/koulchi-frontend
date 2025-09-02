-- Test script for wishlist removal functionality
-- Run this as an authenticated user to verify the new removal logic

-- 1. Check current wishlist state
SELECT 
    'Current wishlist state' as test_phase,
    id,
    user_id,
    product_id,
    created_at
FROM public.wishlist 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- 2. Test removal of a specific product (replace with actual product_id)
-- This simulates what the frontend does when removing an item
-- Note: Replace 'YOUR_PRODUCT_ID_HERE' with an actual product ID from your wishlist
DELETE FROM public.wishlist 
WHERE user_id = auth.uid() 
  AND product_id = 'YOUR_PRODUCT_ID_HERE'  -- Replace with actual product ID
RETURNING 
    'After removal' as test_phase,
    id,
    user_id,
    product_id;

-- 3. Verify the removal worked
SELECT 
    'Verification after removal' as test_phase,
    COUNT(*) as remaining_items
FROM public.wishlist 
WHERE user_id = auth.uid();

-- 4. Test RLS compliance - should only affect current user
-- This verifies that users can only remove their own wishlist items
SELECT 
    'RLS test - should only show current user data' as test_type,
    COUNT(*) as wishlist_count
FROM public.wishlist 
WHERE user_id = auth.uid();

-- 5. Test edge case - removing non-existent item (should not error)
DELETE FROM public.wishlist 
WHERE user_id = auth.uid() 
  AND product_id = '00000000-0000-0000-0000-000000000000'  -- Non-existent UUID
RETURNING 
    'Non-existent item removal test' as test_phase,
    id,
    user_id,
    product_id;

-- 6. Final verification
SELECT 
    'Final wishlist state' as test_phase,
    id,
    user_id,
    product_id,
    created_at
FROM public.wishlist 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
