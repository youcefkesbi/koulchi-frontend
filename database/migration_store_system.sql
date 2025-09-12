-- Migration script for Store System Enhancement
-- This script applies all the new store system changes

-- 1. Create packs table
\i packs_table.sql

-- 2. Create features table
\i features_table.sql

-- 3. Create pack_features junction table
\i pack_features_table.sql

-- 4. Create verifications table
\i verifications_table.sql

-- 5. Create audit_logs table
\i audit_logs_table.sql

-- 6. Update stores table
\i stores_table_updated.sql

-- 7. Create storage buckets for verification documents
-- Note: These need to be created in Supabase Dashboard or via API
-- INSERT INTO storage.buckets (id, name, public) VALUES 
-- ('verification-documents', 'verification-documents', false);

-- 8. Create storage policies for verification documents
-- Users can upload their own verification documents
-- CREATE POLICY "Users can upload own verification documents" ON storage.objects
-- FOR INSERT WITH CHECK (bucket_id = 'verification-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can view their own verification documents
-- CREATE POLICY "Users can view own verification documents" ON storage.objects
-- FOR SELECT USING (bucket_id = 'verification-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Employees can view all verification documents
-- CREATE POLICY "Employees can view verification documents" ON storage.objects
-- FOR SELECT USING (bucket_id = 'verification-documents' AND auth.jwt()->>'role' IN ('admin', 'employee'));

-- 9. Create a view for store information with pack details
create view public.store_details with (security_invoker = on) as
 SELECT s.id,
    s.owner_id,
    s.name,
    s.description,
    s.pack_id,
    s.created_at,
    s.updated_at,
    p.name AS pack_name,
    p.max_announcements,
    p.max_images,
    p.price AS pack_price,
    pf.features
   FROM stores s
     LEFT JOIN packs p ON s.pack_id = p.id
     LEFT JOIN ( SELECT pf_1.pack_id,
            json_agg(json_build_object('id', f.id, 'name', f.name, 'display_name', f.display_name, 'enabled', pf_1.is_enabled)) AS features
           FROM pack_features pf_1
             JOIN features f ON pf_1.feature_id = f.id
          WHERE pf_1.is_enabled = true
          GROUP BY pf_1.pack_id) pf ON s.pack_id = pf.pack_id;

-- Grant access again
GRANT SELECT ON public.store_details TO authenticated;
GRANT SELECT ON public.store_details TO anon; -- optional

-- 10. Create a function to get user's verification status
CREATE OR REPLACE FUNCTION get_user_verification_status(p_user_id UUID)
RETURNS TABLE (
    verification_type TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.verification_type,
        v.status,
        v.created_at,
        v.reviewed_at,
        v.rejection_reason
    FROM public.verifications v
    WHERE v.user_id = p_user_id
    ORDER BY v.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_verification_status TO authenticated;

-- 11. Create a function to check if user can create store
CREATE OR REPLACE FUNCTION can_user_create_store(p_user_id UUID, p_pack_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    pack_id UUID;
    required_verifications TEXT[];
    user_verifications TEXT[];
BEGIN
    -- Get pack ID
    SELECT id INTO pack_id
    FROM public.packs
    WHERE name = p_pack_name AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Define required verifications based on pack
    IF p_pack_name = 'Basic Pack' THEN
        -- user needs at least one of these
        required_verifications := ARRAY['id_card', 'driving_license', 'passport'];
        
        -- Get user's approved verifications
        SELECT ARRAY_AGG(verification_type)
        INTO user_verifications
        FROM public.verifications
        WHERE user_id = p_user_id AND status = 'approved';
        
        -- Check if user has at least one
        RETURN required_verifications && COALESCE(user_verifications, ARRAY[]::TEXT[]);
        
    ELSIF p_pack_name = 'Pro Pack' THEN
        -- user needs BOTH of these
        required_verifications := ARRAY['commerce_register', 'payment_receipt'];
        
        -- Get user's approved verifications
        SELECT ARRAY_AGG(verification_type)
        INTO user_verifications
        FROM public.verifications
        WHERE user_id = p_user_id AND status = 'approved';
        
        -- Check if user has all required verifications
        RETURN required_verifications <@ COALESCE(user_verifications, ARRAY[]::TEXT[]);
        
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION can_user_create_store TO authenticated;

-- 12. Create a function to get store creation requirements
CREATE OR REPLACE FUNCTION get_store_creation_requirements(p_pack_name TEXT)
RETURNS TABLE (
    verification_type TEXT,
    display_name TEXT,
    description TEXT
) AS $$
DECLARE
    required_verifications TEXT[];
    verification_info RECORD;
BEGIN
    -- Define required verifications based on pack
    IF p_pack_name = 'Basic Pack' THEN
        required_verifications := ARRAY['id_card', 'driving_license', 'passport'];
    ELSIF p_pack_name = 'Pro Pack' THEN
        required_verifications := ARRAY['commerce_register', 'payment_receipt'];
    ELSE
        RETURN;
    END IF;
    
    -- Return verification requirements
    FOR verification_info IN
        SELECT 
            verification_type,
            CASE verification_type
                WHEN 'id_card' THEN 'ID Card'
                WHEN 'driving_license' THEN 'Driving License'
                WHEN 'passport' THEN 'Passport'
                WHEN 'commerce_register' THEN 'Commerce Register'
                WHEN 'payment_receipt' THEN 'Payment Receipt (BaridiMob)'
                ELSE verification_type
            END as display_name,
            CASE verification_type
                WHEN 'id_card' THEN 'Upload a clear photo of your national ID card'
                WHEN 'driving_license' THEN 'Upload a clear photo of your driving license'
                WHEN 'passport' THEN 'Upload a clear photo of your passport'
                WHEN 'commerce_register' THEN 'Upload a clear photo of your commerce register document'
                WHEN 'payment_receipt' THEN 'Upload a clear photo of your BaridiMob payment receipt'
                ELSE 'Upload required document'
            END as description
        FROM unnest(required_verifications) as verification_type
    LOOP
        verification_type := verification_info.verification_type;
        display_name := verification_info.display_name;
        description := verification_info.description;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_store_creation_requirements TO authenticated;
