-- Verifications table structure for Supabase
-- This table stores verification documents and their status

CREATE TABLE IF NOT EXISTS public.verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    verification_type TEXT NOT NULL, -- 'id_card', 'driving_license', 'passport', 'commerce_register', 'payment_receipt'
    document_url TEXT NOT NULL, -- URL to the uploaded document
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Employee who reviewed
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT, -- Reason for rejection if status is 'rejected'
    metadata JSONB DEFAULT '{}', -- Additional metadata (file size, type, etc.)
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Ensure unique combination of user and verification type
    UNIQUE(user_id, verification_type)
);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_verifications_updated_at ON verifications;
CREATE TRIGGER update_verifications_updated_at 
    BEFORE UPDATE ON verifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS verifications_user_id_idx ON public.verifications(user_id);
CREATE INDEX IF NOT EXISTS verifications_status_idx ON public.verifications(status);
CREATE INDEX IF NOT EXISTS verifications_type_idx ON public.verifications(verification_type);
CREATE INDEX IF NOT EXISTS verifications_reviewed_by_idx ON public.verifications(reviewed_by);
