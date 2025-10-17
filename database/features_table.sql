-- Features table structure for Supabase
-- This table stores individual features that can be enabled/disabled per pack

CREATE TABLE IF NOT EXISTS public.features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- Add multi-language columns to features table
ALTER TABLE public.features 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS name_ar TEXT,
ADD COLUMN IF NOT EXISTS name_fr TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS description_fr TEXT;


-- ================================
-- Indexes
-- ================================
CREATE INDEX IF NOT EXISTS features_is_active_idx ON public.features(is_active);
CREATE INDEX IF NOT EXISTS features_name_idx ON public.features(name);

-- ================================
-- Policies
-- ================================
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

-- Admins can manage features (multi-role support) - DEBUG VERSION
DROP POLICY IF EXISTS "Admins can manage features" ON public.features;
CREATE POLICY "Admins can manage features"
ON public.features
FOR ALL TO authenticated
USING (public.has_role_debug(auth.uid(), 'admin'))
WITH CHECK (public.has_role_debug(auth.uid(), 'admin'));

-------- SELECT --------
-- Anyone can view active features
CREATE POLICY "Anyone can view active features"
    ON public.features
    FOR SELECT
    USING (is_active = true);



-- Permissions
GRANT SELECT ON public.features TO anon;
GRANT SELECT ON public.features TO authenticated;

-- ================================
-- Triggers
-- ================================
CREATE TRIGGER update_features_updated_at 
    BEFORE UPDATE ON public.features 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- Seed data
-- ================================
INSERT INTO public.features (name, display_name, description) VALUES
('store_logo', 'Store Logo', 'Ability to upload and display a store logo'),
('store_banner', 'Store Banner', 'Ability to upload and display a store banner'),
('color_customization', 'Color Customization', 'Ability to customize store colors and design'),
('external_buttons', 'External Buttons', 'Ability to add external buttons (WhatsApp, Telegram, etc.)'),
('store_name', 'Store Name', 'Ability to set a custom store name'),
('location_input', 'Location Input', 'Single large input for store location (3 lines)')
ON CONFLICT (name) DO NOTHING;

