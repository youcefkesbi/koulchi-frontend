-- ==================== PHASE 2: STATUS SYNCHRONIZATION TABLES ====================

-- Order Status Logs Table
-- Tracks all status changes for orders
CREATE TABLE IF NOT EXISTS public.order_status_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status text NOT NULL,
  new_status text NOT NULL,
  maystro_status_code integer,
  maystro_order_id text,
  triggered_by text DEFAULT 'webhook', -- 'webhook', 'manual', 'system'
  created_at timestamptz DEFAULT now()
);

-- Webhook Errors Table
-- Logs all webhook-related errors for debugging
CREATE TABLE IF NOT EXISTS public.webhook_errors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  error_type text NOT NULL, -- 'unknown_status', 'invalid_transition', 'update_failure', 'webhook_error'
  error_data jsonb, -- Flexible error data storage
  created_at timestamptz DEFAULT now()
);

-- ================================
-- Enhanced Orders Table
-- ================================
-- Add Maystro-specific fields to existing orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS maystro_order_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS maystro_display_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS maystro_status_code integer;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS maystro_last_update timestamptz;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancellation_reason text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS alert_reason text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS alerted_at timestamptz;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS postponed_to timestamptz;

-- ================================
-- Indexes
-- ================================
-- Order Status Logs indexes
CREATE INDEX IF NOT EXISTS idx_order_status_logs_order_id ON public.order_status_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_logs_created_at ON public.order_status_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_order_status_logs_status_change ON public.order_status_logs(old_status, new_status);

-- Webhook Errors indexes
CREATE INDEX IF NOT EXISTS idx_webhook_errors_order_id ON public.webhook_errors(order_id);
CREATE INDEX IF NOT EXISTS idx_webhook_errors_type ON public.webhook_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_webhook_errors_created_at ON public.webhook_errors(created_at);

-- Maystro fields indexes
CREATE INDEX IF NOT EXISTS idx_orders_maystro_order_id ON public.orders(maystro_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_maystro_status_code ON public.orders(maystro_status_code);

-- ================================
-- Policies
-- ================================
ALTER TABLE public.order_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_errors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own order status logs" ON public.order_status_logs;
DROP POLICY IF EXISTS "Store owners can view their order status logs" ON public.order_status_logs;
DROP POLICY IF EXISTS "Admins can view all webhook errors" ON public.webhook_errors;
DROP POLICY IF EXISTS "Store owners can view their webhook errors" ON public.webhook_errors;

-- Users can view their own order status logs
CREATE POLICY "Users can view their own order status logs"
ON public.order_status_logs FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_status_logs.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Store owners can view order status logs for their orders
CREATE POLICY "Store owners can view their order status logs"
ON public.order_status_logs FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_status_logs.order_id 
    AND orders.store_id IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
  )
);

-- Admins can view all webhook errors
CREATE POLICY "Admins can view all webhook errors"
ON public.webhook_errors FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Store owners can view webhook errors for their orders
CREATE POLICY "Store owners can view their webhook errors"
ON public.webhook_errors FOR SELECT TO authenticated
USING (
  order_id IS NULL OR EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = webhook_errors.order_id 
    AND orders.store_id IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
  )
);

-- ================================
-- Utility Functions
-- ================================

-- Function to get order status history
CREATE OR REPLACE FUNCTION public.get_order_status_history(order_uuid uuid)
RETURNS TABLE (
  id uuid,
  old_status text,
  new_status text,
  maystro_status_code integer,
  triggered_by text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    osl.id,
    osl.old_status,
    osl.new_status,
    osl.maystro_status_code,
    osl.triggered_by,
    osl.created_at
  FROM public.order_status_logs osl
  WHERE osl.order_id = order_uuid
  ORDER BY osl.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get webhook error summary
CREATE OR REPLACE FUNCTION public.get_webhook_error_summary(days_back integer DEFAULT 7)
RETURNS TABLE (
  error_type text,
  error_count bigint,
  latest_error timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    we.error_type,
    COUNT(*) as error_count,
    MAX(we.created_at) as latest_error
  FROM public.webhook_errors we
  WHERE we.created_at >= NOW() - INTERVAL '1 day' * days_back
  GROUP BY we.error_type
  ORDER BY error_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check order status consistency
CREATE OR REPLACE FUNCTION public.check_order_status_consistency(order_uuid uuid)
RETURNS TABLE (
  is_consistent boolean,
  current_status text,
  last_logged_status text,
  status_mismatch boolean
) AS $$
DECLARE
  current_order_status text;
  last_log_status text;
BEGIN
  -- Get current order status
  SELECT status INTO current_order_status
  FROM public.orders 
  WHERE id = order_uuid;
  
  -- Get last logged status
  SELECT new_status INTO last_log_status
  FROM public.order_status_logs 
  WHERE order_id = order_uuid
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN QUERY
  SELECT 
    (current_order_status = last_log_status) as is_consistent,
    current_order_status,
    last_log_status,
    (current_order_status != last_log_status) as status_mismatch;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- Comments
-- ================================
COMMENT ON TABLE public.order_status_logs IS 'Tracks all status changes for orders from various sources';
COMMENT ON TABLE public.webhook_errors IS 'Logs webhook-related errors for debugging and monitoring';
COMMENT ON COLUMN public.order_status_logs.triggered_by IS 'Source of status change: webhook, manual, system';
COMMENT ON COLUMN public.webhook_errors.error_type IS 'Type of error: unknown_status, invalid_transition, update_failure, webhook_error';
COMMENT ON COLUMN public.webhook_errors.error_data IS 'Flexible JSON storage for error-specific data';
COMMENT ON FUNCTION public.get_order_status_history IS 'Returns complete status history for an order';
COMMENT ON FUNCTION public.get_webhook_error_summary IS 'Returns error summary for monitoring dashboard';
COMMENT ON FUNCTION public.check_order_status_consistency IS 'Validates order status consistency between orders table and logs';