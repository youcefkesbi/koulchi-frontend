-- Audit logging functions
-- These functions help log employee actions for audit purposes

-- Function to log employee actions
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
