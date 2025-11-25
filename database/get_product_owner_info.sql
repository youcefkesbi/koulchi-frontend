-- ================================
-- Get Product Owner Information
-- Handles two cases:
-- 1. Owner has a store (vendor) - returns store + owner info
-- 2. Owner doesn't have a store (customer) - returns only owner info
-- ================================

CREATE OR REPLACE FUNCTION public.get_product_owner_info(owner_user_id UUID)
RETURNS TABLE(
    -- Profile info (always returned)
    profile_id UUID,
    full_name TEXT,
    phone_num TEXT,
    email TEXT,
    profile_status TEXT,
    
    -- Store info (null if no store)
    has_store BOOLEAN,
    store_id UUID,
    store_name TEXT,
    store_description TEXT,
    store_logo_url TEXT,
    store_banner_url TEXT,
    store_location TEXT,
    store_status TEXT,
    store_created_at TIMESTAMPTZ,
    pack_name_en TEXT,
    pack_name_ar TEXT,
    pack_name_fr TEXT,
    
    -- Store statistics (null if no store)
    total_orders INTEGER,
    total_products INTEGER,
    total_sales NUMERIC(10,2),
    total_visitors INTEGER
) AS $$
DECLARE
    v_profile_id UUID;
    v_full_name TEXT;
    v_phone_num TEXT;
    v_email TEXT;
    v_profile_status TEXT;
    v_user_store_id UUID;
    v_user_has_store BOOLEAN := FALSE;
    v_store_name TEXT;
    v_store_description TEXT;
    v_store_logo_url TEXT;
    v_store_banner_url TEXT;
    v_store_location TEXT;
    v_store_status TEXT;
    v_store_created_at TIMESTAMPTZ;
    v_pack_name_en TEXT;
    v_pack_name_ar TEXT;
    v_pack_name_fr TEXT;
    v_total_orders INTEGER;
    v_total_products INTEGER;
    v_total_sales NUMERIC(10,2);
    v_total_visitors INTEGER;
BEGIN
    -- Get profile information
    SELECT 
        p.id,
        p.full_name,
        p.phone_num,
        u.email,
        p.status
    INTO 
        v_profile_id,
        v_full_name,
        v_phone_num,
        v_email,
        v_profile_status
    FROM public.profiles p
    LEFT JOIN auth.users u ON p.id = u.id
    WHERE p.id = owner_user_id;
    
    -- Check if user has a store
    SELECT 
        s.id
    INTO 
        v_user_store_id
    FROM public.stores s
    WHERE s.owner_id = owner_user_id
      AND s.status = 'approved'
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    -- Set has_store flag
    IF v_user_store_id IS NOT NULL THEN
        v_user_has_store := TRUE;
        
        -- Get store information
        SELECT 
            s.id,
            s.name,
            s.description,
            s.logo_url,
            s.banner_url,
            s.location,
            s.status::TEXT,
            s.created_at,
            pack.name_en,
            pack.name_ar,
            pack.name_fr
        INTO 
            v_user_store_id,
            v_store_name,
            v_store_description,
            v_store_logo_url,
            v_store_banner_url,
            v_store_location,
            v_store_status,
            v_store_created_at,
            v_pack_name_en,
            v_pack_name_ar,
            v_pack_name_fr
        FROM public.stores s
        LEFT JOIN public.packs pack ON s.pack_id = pack.id
        WHERE s.id = v_user_store_id;
        
        -- Get store statistics
        SELECT 
            public.get_store_total_orders(v_user_store_id),
            public.get_store_total_products(v_user_store_id),
            public.get_store_total_sales(v_user_store_id),
            public.get_store_total_visitors(v_user_store_id)
        INTO 
            v_total_orders,
            v_total_products,
            v_total_sales,
            v_total_visitors;
    ELSE
        -- No store, set all store-related fields to NULL
        v_user_store_id := NULL;
        v_store_name := NULL;
        v_store_description := NULL;
        v_store_logo_url := NULL;
        v_store_banner_url := NULL;
        v_store_location := NULL;
        v_store_status := NULL;
        v_store_created_at := NULL;
        v_pack_name_en := NULL;
        v_pack_name_ar := NULL;
        v_pack_name_fr := NULL;
        v_total_orders := NULL;
        v_total_products := NULL;
        v_total_sales := NULL;
        v_total_visitors := NULL;
    END IF;
    
    -- Return the result
    RETURN QUERY SELECT 
        v_profile_id,
        v_full_name,
        v_phone_num,
        v_email,
        v_profile_status,
        v_user_has_store,
        v_user_store_id,
        v_store_name,
        v_store_description,
        v_store_logo_url,
        v_store_banner_url,
        v_store_location,
        v_store_status,
        v_store_created_at,
        v_pack_name_en,
        v_pack_name_ar,
        v_pack_name_fr,
        v_total_orders,
        v_total_products,
        v_total_sales,
        v_total_visitors;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_product_owner_info(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_product_owner_info(UUID) TO anon;

