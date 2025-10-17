
CREATE TABLE IF NOT EXISTS public.pack_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id UUID NOT NULL REFERENCES public.packs(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES public.features(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Ensure unique combination of pack and feature
    UNIQUE(pack_id, feature_id)
);

-- ================================
-- Indexes
-- ================================
CREATE INDEX IF NOT EXISTS pack_features_pack_id_idx ON public.pack_features(pack_id);
CREATE INDEX IF NOT EXISTS pack_features_feature_id_idx ON public.pack_features(feature_id);
CREATE INDEX IF NOT EXISTS pack_features_enabled_idx ON public.pack_features(is_enabled);

-- ================================
-- Policies
-- ================================
ALTER TABLE public.pack_features ENABLE ROW LEVEL SECURITY;

-- Only admins can manage pack features (multi-role support) - DEBUG VERSION
DROP POLICY IF EXISTS "Admins can manage pack features" ON public.pack_features;
CREATE POLICY "Admins can manage pack features"
ON public.pack_features
FOR ALL TO authenticated
USING (public.has_role_debug(auth.uid(), 'admin'))
WITH CHECK (public.has_role_debug(auth.uid(), 'admin'));



-------- SELECT --------
-- Anyone can view pack features
CREATE POLICY "Anyone can view pack features"
ON public.pack_features
FOR SELECT
USING (true);

-- Grant necessary permissions
GRANT SELECT ON public.pack_features TO authenticated;
GRANT SELECT ON public.pack_features TO anon;

-- ================================
-- Seed data
-- ================================
-- Basic Pack features (limited)
INSERT INTO public.pack_features (pack_id, feature_id, is_enabled)
SELECT p.id, f.id, true
FROM public.packs p
JOIN public.features f ON f.name IN ('external_buttons', 'location_input')
WHERE p.name = 'Basic Pack'
ON CONFLICT (pack_id, feature_id) DO NOTHING;

-- Pro Pack features (all features)
INSERT INTO public.pack_features (pack_id, feature_id, is_enabled)
SELECT p.id, f.id, true
FROM public.packs p
JOIN public.features f
WHERE p.name = 'Pro Pack'
ON CONFLICT (pack_id, feature_id) DO NOTHING;
