-- Consolidated Database Migration
-- This script sets up the complete database schema with proper organization

-- 1. Create utility functions
\i functions/update_updated_at.sql

-- 2. Create core tables
\i profiles.sql
\i packs.sql
\i features.sql
\i stores.sql
\i verifications.sql
\i audit_logs.sql

-- 3. Create pack_features junction table
CREATE TABLE IF NOT EXISTS public.pack_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id UUID NOT NULL REFERENCES public.packs(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES public.features(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Ensure unique combination of pack and feature
    UNIQUE(pack_id, feature_id)
);

-- Create indexes for pack_features
CREATE INDEX IF NOT EXISTS pack_features_pack_id_idx ON public.pack_features(pack_id);
CREATE INDEX IF NOT EXISTS pack_features_feature_id_idx ON public.pack_features(feature_id);
CREATE INDEX IF NOT EXISTS pack_features_enabled_idx ON public.pack_features(is_enabled);

-- 4. Apply RLS policies
\i policies/profiles.sql
\i policies/packs.sql
\i policies/stores.sql
\i policies/verifications.sql
\i policies/audit_logs.sql

-- 5. Create additional functions
\i functions/store_limits.sql
\i functions/verification_checks.sql
\i functions/audit_logging.sql

-- 6. Create views
\i views/store_details.sql

-- 7. Insert seed data
\i seeds/packs.sql
\i seeds/features.sql
\i seeds/pack_features.sql

-- 8. Create storage buckets (requires manual creation in Supabase dashboard)
-- Note: These need to be created in Supabase Dashboard or via API
-- INSERT INTO storage.buckets (id, name, public) VALUES 
-- ('verification-documents', 'verification-documents', false),
-- ('stores-logos', 'stores-logos', true),
-- ('stores-banners', 'stores-banners', true);

-- 9. Create storage policies (requires manual creation in Supabase dashboard)
-- Note: These need to be created in Supabase Dashboard or via API
-- See STORE_SYSTEM_DOCUMENTATION.md for complete storage policies

-- 10. Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.packs TO authenticated;
GRANT ALL ON public.features TO authenticated;
GRANT ALL ON public.pack_features TO authenticated;
GRANT ALL ON public.stores TO authenticated;
GRANT ALL ON public.verifications TO authenticated;
GRANT ALL ON public.audit_logs TO authenticated;

-- Grant SELECT permissions to anonymous users where needed
GRANT SELECT ON public.packs TO anon;
GRANT SELECT ON public.features TO anon;
GRANT SELECT ON public.pack_features TO anon;
GRANT SELECT ON public.stores TO anon;
