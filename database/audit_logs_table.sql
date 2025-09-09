-- Audit Logs table structure for Supabase
-- This table stores all employee actions for audit purposes

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'approve_store', 'reject_store', 'approve_product', 'reject_product', 'edit_store', 'review_store'
    target_type TEXT NOT NULL, -- 'store', 'product', 'verification', 'user'
    target_id UUID NOT NULL, -- ID of the target entity
    details JSONB DEFAULT '{}', -- Additional details about the action
    ip_address INET, -- IP address of the employee
    user_agent TEXT, -- User agent string
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
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

-- Grant necessary permissions
GRANT ALL ON public.audit_logs TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS audit_logs_employee_id_idx ON public.audit_logs(employee_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_target_type_idx ON public.audit_logs(target_type);
CREATE INDEX IF NOT EXISTS audit_logs_target_id_idx ON public.audit_logs(target_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs(created_at);

-- Create a function to log employee actions
CREATE OR REPLACE FUNCTION log_employee_action(
    p_employee_id UUID,
    p_action TEXT,
    p_target_type TEXT,
    p_target_id UUID,
    p_details JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (
        employee_id,
        action,
        target_type,
        target_id,
        details,
        ip_address,
        user_agent
    ) VALUES (
        p_employee_id,
        p_action,
        p_target_type,
        p_target_id,
        p_details,
        p_ip_address,
        p_user_agent
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION log_employee_action TO authenticated;
