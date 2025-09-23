-- ================================
-- Packs table structure
-- ================================
CREATE TABLE IF NOT EXISTS public.packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- e.g., 'Basic Pack', 'Pro Pack'
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0, -- Price in DZD
    max_announcements INTEGER NOT NULL DEFAULT 0, -- Max product announcements
    max_images INTEGER NOT NULL DEFAULT 0, -- Max storage images
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ================================
-- Indexes
-- ================================
CREATE INDEX IF NOT EXISTS packs_is_active_idx ON public.packs(is_active);
CREATE INDEX IF NOT EXISTS packs_name_idx ON public.packs(name);

-- ================================
-- Policies
-- ================================
ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;

-- Admins can manage packs
CREATE POLICY "Admins can manage packs"
ON public.packs
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
);
-------- SELECT --------
-- Anyone can view active packs (SELECT)
CREATE POLICY "Anyone can view active packs"
ON public.packs
FOR SELECT
USING (is_active = true);

-- ================================
-- Permissions
-- ================================
REVOKE ALL ON public.packs FROM anon;
REVOKE ALL ON public.packs FROM authenticated;
GRANT SELECT ON public.packs TO anon;
GRANT SELECT ON public.packs TO authenticated;

-- ================================
-- Triggers
-- ================================
CREATE TRIGGER set_packs_updated_at
BEFORE UPDATE ON public.packs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- Seed data
-- ================================
INSERT INTO public.packs (name, description, price, max_announcements, max_images) VALUES
('Basic Pack', 'Free pack with basic features', 0.00, 150, 300),
('Pro Pack', 'Premium pack with advanced features', 1000.00, 3000, 6000)
ON CONFLICT (name) DO NOTHING;
