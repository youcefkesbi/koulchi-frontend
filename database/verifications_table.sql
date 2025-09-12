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
