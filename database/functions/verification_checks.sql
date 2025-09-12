-- Verification checking functions
-- These functions help check verification requirements and user eligibility

-- Function to get user's verification status
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

-- Function to check if user can create store
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
        required_verifications := ARRAY['id_card', 'driving_license', 'passport'];
    ELSIF p_pack_name = 'Pro Pack' THEN
        required_verifications := ARRAY['id_card', 'driving_license', 'passport', 'commerce_register', 'payment_receipt'];
    ELSE
        RETURN false;
    END IF;
    
    -- Get user's approved verifications
    SELECT ARRAY_AGG(verification_type)
    INTO user_verifications
    FROM public.verifications
    WHERE user_id = p_user_id AND status = 'approved';
    
    -- Check if user has at least one required verification
    RETURN required_verifications && COALESCE(user_verifications, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get store creation requirements
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
        required_verifications := ARRAY['id_card', 'driving_license', 'passport', 'commerce_register', 'payment_receipt'];
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_verification_status TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_create_store TO authenticated;
GRANT EXECUTE ON FUNCTION get_store_creation_requirements TO authenticated;
