-- Store details view
-- This view provides comprehensive store information with pack details

CREATE OR REPLACE VIEW store_details AS
SELECT 
    s.*,
    p.name as pack_name,
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
                'name', f.name,
                'display_name', f.display_name,
                'enabled', pf.is_enabled
            )
        ) as features
    FROM public.pack_features pf
    JOIN public.features f ON pf.feature_id = f.id
    WHERE pf.is_enabled = true
    GROUP BY pf.pack_id
) pf ON s.pack_id = pf.pack_id;

-- Grant permissions on the view
GRANT SELECT ON store_details TO authenticated;
GRANT SELECT ON store_details TO anon;
