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
