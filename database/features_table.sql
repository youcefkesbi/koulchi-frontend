-- Features table structure for Supabase
-- This table stores individual features that can be enabled/disabled per pack

CREATE TABLE IF NOT EXISTS public.features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- e.g., 'store_logo', 'store_banner', 'color_customization'
    display_name TEXT NOT NULL, -- Human-readable name
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can view active features
CREATE POLICY "Anyone can view active features"
    ON public.features
    FOR SELECT
    USING (is_active = true);

-- Only admins can insert/update/delete features
CREATE POLICY "Admins can manage features"
    ON public.features
    FOR ALL
    USING (auth.jwt()->>'role' = 'admin')
    WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Permissions
REVOKE ALL ON public.features FROM anon;
REVOKE ALL ON public.features FROM authenticated;

GRANT SELECT ON public.features TO anon;
GRANT SELECT ON public.features TO authenticated;

-- Indexes
CREATE INDEX IF NOT EXISTS features_is_active_idx ON public.features(is_active);
CREATE INDEX IF NOT EXISTS features_name_idx ON public.features(name);

-- Default features
INSERT INTO public.features (name, display_name, description) VALUES
('store_logo', 'Store Logo', 'Ability to upload and display a store logo'),
('store_banner', 'Store Banner', 'Ability to upload and display a store banner'),
('color_customization', 'Color Customization', 'Ability to customize store colors and design'),
('external_buttons', 'External Buttons', 'Ability to add external buttons (WhatsApp, Telegram, etc.)'),
('store_name', 'Store Name', 'Ability to set a custom store name'),
('location_input', 'Location Input', 'Single large input for store location (3 lines)')
ON CONFLICT (name) DO NOTHING;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_features_updated_at 
    BEFORE UPDATE ON public.features 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Seed data for features table
-- Insert default features

INSERT INTO public.features (name, display_name, description) VALUES
('store_logo', 'Store Logo', 'Ability to upload and display a store logo'),
('store_banner', 'Store Banner', 'Ability to upload and display a store banner'),
('color_customization', 'Color Customization', 'Ability to customize store colors and design'),
('external_buttons', 'External Buttons', 'Ability to add external buttons (WhatsApp, Telegram, etc.)'),
('store_name', 'Store Name', 'Ability to set a custom store name'),
('location_input', 'Location Input', 'Single large input for store location (3 lines)')
ON CONFLICT (name) DO NOTHING;
