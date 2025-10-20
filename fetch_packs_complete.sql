-- Simple query to fetch both packs with complete information and features
SELECT 
    p.id as pack_id,
    p.name_en,
    p.name_ar,
    p.name_fr,
    p.description_en,
    p.description_ar,
    p.description_fr,
    p.price,
    p.max_announcements,
    p.max_images,
    p.is_active,
    p.created_at,
    p.updated_at,
    -- Features as JSONB
    COALESCE(
        jsonb_build_object(
            'en', COALESCE(
                jsonb_agg(
                    CASE WHEN pf.is_enabled = true THEN f.name_en END
                ) FILTER (WHERE pf.is_enabled = true AND f.name_en IS NOT NULL),
                '[]'::jsonb
            ),
            'ar', COALESCE(
                jsonb_agg(
                    CASE WHEN pf.is_enabled = true THEN f.name_ar END
                ) FILTER (WHERE pf.is_enabled = true AND f.name_ar IS NOT NULL),
                '[]'::jsonb
            ),
            'fr', COALESCE(
                jsonb_agg(
                    CASE WHEN pf.is_enabled = true THEN f.name_fr END
                ) FILTER (WHERE pf.is_enabled = true AND f.name_fr IS NOT NULL),
                '[]'::jsonb
            )
        ),
        '{"en": [], "ar": [], "fr": []}'::jsonb
    ) as features,
    -- Feature names as text
    COALESCE(
        STRING_AGG(DISTINCT f.name_en, E'\n'), 
        'No features'
    )::TEXT as feature_names
FROM public.packs p
LEFT JOIN public.pack_features pf ON p.id = pf.pack_id
LEFT JOIN public.features f ON pf.feature_id = f.id
GROUP BY p.id, p.name_en, p.name_ar, p.name_fr, p.description_en, p.description_ar, p.description_fr, 
         p.price, p.max_announcements, p.max_images, p.is_active, p.created_at, p.updated_at
ORDER BY p.price ASC, p.created_at DESC;
