-- Pack Features junction table structure for Supabase
-- This table links packs to their available features

CREATE TABLE IF NOT EXISTS public.pack_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id UUID NOT NULL REFERENCES public.packs(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES public.features(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Ensure unique combination of pack and feature
    UNIQUE(pack_id, feature_id)
);

-- Enable Row Level Security
ALTER TABLE public.pack_features ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
-- Anyone can view pack features
CREATE POLICY "Anyone can view pack features" ON public.pack_features
    FOR SELECT USING (true);

-- Only admins can manage pack features
CREATE POLICY "Admins can manage pack features" ON public.pack_features
    FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Grant necessary permissions
-- All authenticated users can read (RLS still applies)
GRANT SELECT ON public.pack_features TO authenticated;

-- Anonymous users can only read (if you want your site visitors to see features)
GRANT SELECT ON public.pack_features TO anon;


-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS pack_features_pack_id_idx ON public.pack_features(pack_id);
CREATE INDEX IF NOT EXISTS pack_features_feature_id_idx ON public.pack_features(feature_id);
CREATE INDEX IF NOT EXISTS pack_features_enabled_idx ON public.pack_features(is_enabled);

-- Insert default pack-feature relationships
-- Basic Pack features (limited)
INSERT INTO public.pack_features (pack_id, feature_id, is_enabled)
SELECT p.id, f.id, true
FROM public.packs p, public.features f
WHERE p.name = 'Basic Pack' 
AND f.name IN ('external_buttons', 'location_input')
ON CONFLICT (pack_id, feature_id) DO NOTHING;

-- Pro Pack features (all features)
INSERT INTO public.pack_features (pack_id, feature_id, is_enabled)
SELECT p.id, f.id, true
FROM public.packs p, public.features f
WHERE p.name = 'Pro Pack'
ON CONFLICT (pack_id, feature_id) DO NOTHING;

-- Seed data for pack_features table
-- Insert pack-feature relationships

-- Basic Pack features (limited)
INSERT INTO public.pack_features (pack_id, feature_id, is_enabled)
SELECT p.id, f.id, true
FROM public.packs p, public.features f
WHERE p.name = 'Basic Pack' 
AND f.name IN ('external_buttons', 'location_input')
ON CONFLICT (pack_id, feature_id) DO NOTHING;

-- Pro Pack features (all features)
INSERT INTO public.pack_features (pack_id, feature_id, is_enabled)
SELECT p.id, f.id, true
FROM public.packs p, public.features f
WHERE p.name = 'Pro Pack'
ON CONFLICT (pack_id, feature_id) DO NOTHING;
