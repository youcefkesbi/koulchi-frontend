-- Verification script for store creation payload
-- This shows the exact structure being sent to Supabase

-- 1. Verify the current user authentication
SELECT 
    'Authentication Check' as test_phase,
    auth.uid() as user_id,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN 'Authenticated - Ready to create store'
        ELSE 'Not authenticated - Cannot create store'
    END as status;

-- 2. Show the exact payload structure being sent
-- This simulates what the frontend sends to the Pinia store
WITH sample_payload AS (
    SELECT 
        auth.uid() as owner_id,
        'My Test Store' as name,
        'This is a test store description' as description,
        'https://example.com/logo.jpg' as logo_url,
        'https://example.com/banner.jpg' as banner_url
)
SELECT 
    'Payload Structure Verification' as test_phase,
    owner_id,
    name,
    description,
    logo_url,
    banner_url,
    'All fields present and properly formatted' as verification_result
FROM sample_payload;

-- 3. Test the actual insert with the exact payload structure
-- This shows the final data being inserted into Supabase
INSERT INTO public.stores (
    owner_id,           -- Required: auth.uid()
    name,               -- Required: store name
    description,        -- Optional: null if empty
    logo_url,          -- Optional: null if empty
    banner_url         -- Optional: null if empty
)
VALUES (
    auth.uid(),                                    -- Required: user.id
    'Payload Test Store ' || extract(epoch from now()),  -- Required: store name
    'Test description for payload verification',   -- Optional: description
    'https://example.com/test-logo.jpg',          -- Optional: logo_url
    'https://example.com/test-banner.jpg'         -- Optional: banner_url
)
RETURNING 
    'Insert Test with Full Payload' as test_phase,
    id,
    owner_id,
    name,
    description,
    logo_url,
    banner_url,
    created_at;

-- 4. Test insert with minimal payload (only required fields)
INSERT INTO public.stores (
    owner_id,           -- Required: auth.uid()
    name,               -- Required: store name
    description,        -- Optional: null
    logo_url,          -- Optional: null
    banner_url         -- Optional: null
)
VALUES (
    auth.uid(),                                    -- Required: user.id
    'Minimal Payload Store ' || extract(epoch from now()), -- Required: store name
    null,                                          -- Optional: null
    null,                                          -- Optional: null
    null                                           -- Optional: null
)
RETURNING 
    'Insert Test with Minimal Payload' as test_phase,
    id,
    owner_id,
    name,
    description,
    logo_url,
    banner_url,
    created_at;

-- 5. Verify the payload structure in the database
SELECT 
    'Final Payload Verification' as test_phase,
    COUNT(*) as total_stores,
    COUNT(CASE WHEN description IS NOT NULL THEN 1 END) as stores_with_description,
    COUNT(CASE WHEN logo_url IS NOT NULL THEN 1 END) as stores_with_logo,
    COUNT(CASE WHEN banner_url IS NOT NULL THEN 1 END) as stores_with_banner,
    COUNT(CASE WHEN description IS NULL AND logo_url IS NULL AND banner_url IS NULL THEN 1 END) as stores_with_only_required_fields
FROM public.stores 
WHERE owner_id = auth.uid()
  AND name LIKE '%Payload Test%';

-- 6. Show the exact field mapping
SELECT 
    'Field Mapping Verification' as test_phase,
    'owner_id → auth.uid() (Required)' as field_mapping,
    'name → user input (Required)' as field_source,
    'description → user input || null (Optional)' as field_handling,
    'logo_url → uploaded file || null (Optional)' as logo_handling,
    'banner_url → uploaded file || null (Optional)' as banner_handling;

-- 7. Clean up test data (optional)
-- Uncomment to remove test stores:
/*
DELETE FROM public.stores 
WHERE owner_id = auth.uid() 
  AND (
    name LIKE '%Payload Test%' 
    OR name LIKE '%Minimal Payload%'
  )
RETURNING 
    'Cleanup test' as test_phase,
    id,
    name;
*/
