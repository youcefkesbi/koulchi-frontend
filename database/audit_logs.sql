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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS audit_logs_employee_id_idx ON public.audit_logs(employee_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_target_type_idx ON public.audit_logs(target_type);
CREATE INDEX IF NOT EXISTS audit_logs_target_id_idx ON public.audit_logs(target_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs(created_at);
