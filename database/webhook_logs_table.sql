-- ==================== PHASE 4: ERROR HANDLING & RETRY TABLES ====================

-- Webhook Logs Table
-- Tracks all webhook processing attempts with retry logic
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id text NOT NULL,
  payload jsonb NOT NULL,
  status text DEFAULT 'pending', -- 'pending', 'processing', 'success', 'failed', 'dead_letter'
  attempt_number integer DEFAULT 0,
  last_attempt_at timestamptz,
  last_error text,
  last_error_at timestamptz,
  error_count integer DEFAULT 0,
  final_error text,
  moved_to_dead_letter_at timestamptz,
  processed_at timestamptz,
  result_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Polling Logs Table
-- Tracks polling service operations and results
CREATE TABLE IF NOT EXISTS public.polling_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status text,
  new_status text,
  status text NOT NULL, -- 'success', 'error'
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- ================================
-- Indexes
-- ================================
-- Webhook logs indexes
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON public.webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON public.webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON public.webhook_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_attempt_number ON public.webhook_logs(attempt_number);

-- Polling logs indexes
CREATE INDEX IF NOT EXISTS idx_polling_logs_order_id ON public.polling_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_polling_logs_status ON public.polling_logs(status);
CREATE INDEX IF NOT EXISTS idx_polling_logs_created_at ON public.polling_logs(created_at);

-- ================================
-- Policies
-- ================================
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polling_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can view all webhook logs" ON public.webhook_logs;
DROP POLICY IF EXISTS "Store owners can view their webhook logs" ON public.webhook_logs;
DROP POLICY IF EXISTS "Admins can view all polling logs" ON public.polling_logs;
DROP POLICY IF EXISTS "Store owners can view their polling logs" ON public.polling_logs;

-- Admins can view all webhook logs
CREATE POLICY "Admins can view all webhook logs"
ON public.webhook_logs FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Store owners can view webhook logs for their orders
CREATE POLICY "Store owners can view their webhook logs"
ON public.webhook_logs FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = (webhook_logs.payload->>'external_order_id')::uuid
    AND orders.store_id IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
  )
);

-- Admins can view all polling logs
CREATE POLICY "Admins can view all polling logs"
ON public.polling_logs FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Store owners can view polling logs for their orders
CREATE POLICY "Store owners can view their polling logs"
ON public.polling_logs FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = polling_logs.order_id 
    AND orders.store_id IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
  )
);

-- ================================
-- Utility Functions
-- ================================

-- Function to get webhook retry statistics
CREATE OR REPLACE FUNCTION public.get_webhook_retry_stats(days_back integer DEFAULT 7)
RETURNS TABLE (
  status text,
  total_count bigint,
  avg_attempts numeric,
  success_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wl.status,
    COUNT(*) as total_count,
    ROUND(AVG(wl.attempt_number), 2) as avg_attempts,
    ROUND(
      COUNT(CASE WHEN wl.status = 'success' THEN 1 END) * 100.0 / COUNT(*), 2
    ) as success_rate
  FROM public.webhook_logs wl
  WHERE wl.created_at >= NOW() - INTERVAL '1 day' * days_back
  GROUP BY wl.status
  ORDER BY total_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get polling statistics
CREATE OR REPLACE FUNCTION public.get_polling_stats(days_back integer DEFAULT 7)
RETURNS TABLE (
  status text,
  total_count bigint,
  success_rate numeric,
  last_activity timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pl.status,
    COUNT(*) as total_count,
    ROUND(
      COUNT(CASE WHEN pl.status = 'success' THEN 1 END) * 100.0 / COUNT(*), 2
    ) as success_rate,
    MAX(pl.created_at) as last_activity
  FROM public.polling_logs pl
  WHERE pl.created_at >= NOW() - INTERVAL '1 day' * days_back
  GROUP BY pl.status
  ORDER BY total_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get dead letter queue items
CREATE OR REPLACE FUNCTION public.get_dead_letter_queue(limit_count integer DEFAULT 50)
RETURNS TABLE (
  id uuid,
  webhook_id text,
  status text,
  attempt_number integer,
  final_error text,
  moved_to_dead_letter_at timestamptz,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wl.id,
    wl.webhook_id,
    wl.status,
    wl.attempt_number,
    wl.final_error,
    wl.moved_to_dead_letter_at,
    wl.created_at
  FROM public.webhook_logs wl
  WHERE wl.status = 'dead_letter'
  ORDER BY wl.moved_to_dead_letter_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get webhook processing health
CREATE OR REPLACE FUNCTION public.get_webhook_health_status()
RETURNS TABLE (
  total_webhooks bigint,
  successful_webhooks bigint,
  failed_webhooks bigint,
  dead_letter_webhooks bigint,
  success_rate numeric,
  avg_processing_time numeric,
  last_activity timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_webhooks,
    COUNT(CASE WHEN wl.status = 'success' THEN 1 END) as successful_webhooks,
    COUNT(CASE WHEN wl.status = 'failed' THEN 1 END) as failed_webhooks,
    COUNT(CASE WHEN wl.status = 'dead_letter' THEN 1 END) as dead_letter_webhooks,
    ROUND(
      COUNT(CASE WHEN wl.status = 'success' THEN 1 END) * 100.0 / COUNT(*), 2
    ) as success_rate,
    ROUND(AVG(
      EXTRACT(EPOCH FROM (wl.processed_at - wl.created_at))
    ), 2) as avg_processing_time,
    MAX(wl.created_at) as last_activity
  FROM public.webhook_logs wl
  WHERE wl.created_at >= NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- Comments
-- ================================
COMMENT ON TABLE public.webhook_logs IS 'Tracks all webhook processing attempts with retry logic and error handling';
COMMENT ON TABLE public.polling_logs IS 'Tracks polling service operations and status synchronization results';
COMMENT ON COLUMN public.webhook_logs.status IS 'Webhook processing status: pending, processing, success, failed, dead_letter';
COMMENT ON COLUMN public.webhook_logs.attempt_number IS 'Number of processing attempts made';
COMMENT ON COLUMN public.webhook_logs.final_error IS 'Final error message for dead letter items';
COMMENT ON COLUMN public.polling_logs.status IS 'Polling operation status: success, error';
COMMENT ON FUNCTION public.get_webhook_retry_stats IS 'Returns webhook retry statistics for monitoring';
COMMENT ON FUNCTION public.get_polling_stats IS 'Returns polling service statistics';
COMMENT ON FUNCTION public.get_dead_letter_queue IS 'Returns items in dead letter queue for manual processing';
COMMENT ON FUNCTION public.get_webhook_health_status IS 'Returns overall webhook processing health status';

