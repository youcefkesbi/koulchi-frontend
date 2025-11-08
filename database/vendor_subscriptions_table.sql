-- ================================
-- Vendor Subscriptions Table
-- ================================

CREATE TABLE IF NOT EXISTS public.vendor_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL, -- e.g., 'basic', 'pro', or pack name
    start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_date TIMESTAMPTZ, -- NULL for lifetime subscriptions
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'cancelled', 'pending'
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ================================
-- Indexes
-- ================================
CREATE INDEX IF NOT EXISTS vendor_subscriptions_vendor_id_idx ON public.vendor_subscriptions(vendor_id);
CREATE INDEX IF NOT EXISTS vendor_subscriptions_status_idx ON public.vendor_subscriptions(status);
CREATE INDEX IF NOT EXISTS vendor_subscriptions_plan_type_idx ON public.vendor_subscriptions(plan_type);
CREATE INDEX IF NOT EXISTS vendor_subscriptions_end_date_idx ON public.vendor_subscriptions(end_date);
CREATE INDEX IF NOT EXISTS vendor_subscriptions_vendor_status_idx ON public.vendor_subscriptions(vendor_id, status);

-- ================================
-- Constraints
-- ================================
-- Ensure end_date is after start_date if both are provided
ALTER TABLE public.vendor_subscriptions
ADD CONSTRAINT vendor_subscriptions_date_check 
CHECK (end_date IS NULL OR end_date >= start_date);

-- Ensure status is one of the allowed values
ALTER TABLE public.vendor_subscriptions
ADD CONSTRAINT vendor_subscriptions_status_check 
CHECK (status IN ('active', 'expired', 'cancelled', 'pending'));

-- ================================
-- Policies
-- ================================
ALTER TABLE public.vendor_subscriptions ENABLE ROW LEVEL SECURITY;

-- Vendors can view their own subscriptions
CREATE POLICY "Vendors can view their own subscriptions"
ON public.vendor_subscriptions FOR SELECT TO authenticated
USING (
    vendor_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'employee')
    )
);

-- Vendors can insert their own subscriptions (for initial subscription)
CREATE POLICY "Vendors can insert their own subscriptions"
ON public.vendor_subscriptions FOR INSERT TO authenticated
WITH CHECK (
    vendor_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'employee')
    )
);

-- Vendors can update their own subscriptions
CREATE POLICY "Vendors can update their own subscriptions"
ON public.vendor_subscriptions FOR UPDATE TO authenticated
USING (
    vendor_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'employee')
    )
)
WITH CHECK (
    vendor_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'employee')
    )
);

-- Admins and employees can manage all subscriptions
CREATE POLICY "Admins can manage all subscriptions"
ON public.vendor_subscriptions FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'employee')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'employee')
    )
);

-- ================================
-- Functions
-- ================================

-- Function to get current active subscription for a vendor
CREATE OR REPLACE FUNCTION public.get_vendor_active_subscription(p_vendor_id UUID)
RETURNS TABLE(
    id UUID,
    vendor_id UUID,
    plan_type TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vs.id,
        vs.vendor_id,
        vs.plan_type,
        vs.start_date,
        vs.end_date,
        vs.status,
        vs.created_at,
        vs.updated_at
    FROM public.vendor_subscriptions vs
    WHERE vs.vendor_id = p_vendor_id
        AND vs.status = 'active'
        AND (vs.end_date IS NULL OR vs.end_date > NOW())
    ORDER BY vs.start_date DESC
    LIMIT 1;
END;
$$;

-- Function to check if vendor has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(p_vendor_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    subscription_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO subscription_count
    FROM public.vendor_subscriptions
    WHERE vendor_id = p_vendor_id
        AND status = 'active'
        AND (end_date IS NULL OR end_date > NOW());
    
    RETURN subscription_count > 0;
END;
$$;

-- Function to automatically expire subscriptions
CREATE OR REPLACE FUNCTION public.expire_old_subscriptions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE public.vendor_subscriptions
    SET status = 'expired',
        updated_at = NOW()
    WHERE status = 'active'
        AND end_date IS NOT NULL
        AND end_date < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$;

-- ================================
-- Triggers
-- ================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_vendor_subscriptions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER vendor_subscriptions_updated_at_trigger
    BEFORE UPDATE ON public.vendor_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_vendor_subscriptions_updated_at();

-- ================================
-- Permissions (GRANT statements)
-- ================================

-- Grant permissions to service_role for backend operations
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendor_subscriptions TO postgres, anon, authenticated, service_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_vendor_active_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_old_subscriptions() TO authenticated;





