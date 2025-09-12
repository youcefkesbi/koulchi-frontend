-- RLS Policies for audit_logs table

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "No updates to audit logs" ON audit_logs;
DROP POLICY IF EXISTS "No deletes to audit logs" ON audit_logs;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (auth.jwt()->>'role' = 'admin');

-- Only admins can insert audit logs (system inserts)
CREATE POLICY "Admins can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'admin');

-- No updates or deletes allowed (audit logs are immutable)
CREATE POLICY "No updates to audit logs" ON public.audit_logs
    FOR UPDATE USING (false);

CREATE POLICY "No deletes to audit logs" ON public.audit_logs
    FOR DELETE USING (false);
