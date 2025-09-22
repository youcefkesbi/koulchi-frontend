-- ================================
-- Verifications Table
-- ================================
CREATE TABLE IF NOT EXISTS public.verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    verification_type TEXT NOT NULL, -- 'id_card', 'driving_license', 'passport', 'commerce_register', 'payment_receipt'
    document_url TEXT NOT NULL, -- URL to the uploaded document
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Ensure unique combination of user and verification type
    UNIQUE(user_id, verification_type)
);

-- Enable Row Level Security
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

-- ================================
-- Policies
-- ================================
-- Users can view their own verifications
CREATE POLICY "Users can view own verifications"
ON public.verifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own verifications
CREATE POLICY "Users can insert own verifications"
ON public.verifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own verifications (only if pending)
CREATE POLICY "Users can update own pending verifications"
ON public.verifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

-- Employees and admins can view all verifications
CREATE POLICY "Employees can view all verifications"
ON public.verifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin','employee')
  )
);

-- Employees and admins can update verification status
CREATE POLICY "Employees can update verification status"
ON public.verifications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin','employee')
  )
);

-- ================================
-- Grants
-- ================================
GRANT SELECT, INSERT, UPDATE ON public.verifications TO authenticated;
GRANT SELECT ON public.verifications TO anon;

-- ================================
-- Indexes
-- ================================
CREATE INDEX IF NOT EXISTS verifications_user_id_idx ON public.verifications(user_id);
CREATE INDEX IF NOT EXISTS verifications_status_idx ON public.verifications(status);
CREATE INDEX IF NOT EXISTS verifications_type_idx ON public.verifications(verification_type);
CREATE INDEX IF NOT EXISTS verifications_reviewed_by_idx ON public.verifications(reviewed_by);

-- ================================
-- Trigger for updated_at
-- ================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_verifications_updated_at 
    BEFORE UPDATE ON public.verifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for verifications table

-- Enable Row Level Security
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own verifications" ON verifications;
DROP POLICY IF EXISTS "Users can insert own verifications" ON verifications;
DROP POLICY IF EXISTS "Users can update own pending verifications" ON verifications;
DROP POLICY IF EXISTS "Employees can view all verifications" ON verifications;
DROP POLICY IF EXISTS "Employees can update verification status" ON verifications;

-- Users can view their own verifications
CREATE POLICY "Users can view own verifications" ON public.verifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own verifications
CREATE POLICY "Users can insert own verifications" ON public.verifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own verifications (only if pending)
CREATE POLICY "Users can update own pending verifications" ON public.verifications
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending')
    WITH CHECK (auth.uid() = user_id);

-- Employees and admins can view all verifications
CREATE POLICY "Employees can view all verifications" ON public.verifications
    FOR SELECT USING (auth.jwt()->>'role' IN ('admin', 'employee'));

-- Employees and admins can update verification status
CREATE POLICY "Employees can update verification status" ON public.verifications
    FOR UPDATE USING (auth.jwt()->>'role' IN ('admin', 'employee'));

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
