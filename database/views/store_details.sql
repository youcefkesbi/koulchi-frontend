-- Drop and recreate the view without features.name
DROP VIEW IF EXISTS public.store_details CASCADE;

CREATE VIEW public.store_details AS
SELECT 
    s.*,
    p.name_en as pack_name,
    p.name_ar as pack_name_ar,
    p.name_fr as pack_name_fr,
    p.max_announcements,
    p.max_images,
    p.price as pack_price,
    pf.features
FROM public.stores s
LEFT JOIN public.packs p ON s.pack_id = p.id
LEFT JOIN (
    SELECT 
        pf.pack_id,
        json_agg(
            json_build_object(
                'id', f.id,
                'name_en', f.name_en,
                'name_ar', f.name_ar,
                'name_fr', f.name_fr,
                'description_en', f.description_en,
                'description_ar', f.description_ar,
                'description_fr', f.description_fr,
                'enabled', pf.is_enabled
            )
        ) as features
    FROM public.pack_features pf
    JOIN public.features f ON pf.feature_id = f.id
    WHERE pf.is_enabled = true
    GROUP BY pf.pack_id
) pf ON s.pack_id = pf.pack_id;

-- Grant permissions on the view
GRANT SELECT ON public.store_details TO authenticated;
GRANT SELECT ON public.store_details TO anon;