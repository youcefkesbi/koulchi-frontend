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
