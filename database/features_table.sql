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
CREATE INDEX IF NOT EXISTS features_name_en_idx ON public.features(name_en);

-- ================================
-- Policies
-- ================================
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

-- Admins can manage features (multi-role support) - DEBUG VERSION
DROP POLICY IF EXISTS "Admins can manage features" ON public.features;
CREATE POLICY "Admins can manage features"
ON public.features
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-------- SELECT --------
-- Anyone can view active features
CREATE POLICY "Anyone can view active features"
    ON public.features
    FOR SELECT
    USING (is_active = true);



-- Permissions
REVOKE ALL ON public.features FROM anon;
REVOKE ALL ON public.features FROM authenticated;
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
INSERT INTO public.features (name_en, name_ar, name_fr, description_en, description_ar, description_fr) VALUES
('Store Logo', 'شعار المتجر', 'Logo du magasin', 'Ability to upload and display a store logo', 'القدرة على رفع وعرض شعار المتجر', 'Capacité de télécharger et afficher un logo de magasin'),
('Store Banner', 'لافتة المتجر', 'Bannière du magasin', 'Ability to upload and display a store banner', 'القدرة على رفع وعرض لافتة المتجر', 'Capacité de télécharger et afficher une bannière de magasin'),
('Color Customization', 'تخصيص الألوان', 'Personnalisation des couleurs', 'Ability to customize store colors and design', 'القدرة على تخصيص ألوان وتصميم المتجر', 'Capacité de personnaliser les couleurs et le design du magasin'),
('External Buttons', 'الأزرار الخارجية', 'Boutons externes', 'Ability to add external buttons (WhatsApp, Telegram, etc.)', 'القدرة على إضافة أزرار خارجية (واتساب، تليجرام، إلخ)', 'Capacité d''ajouter des boutons externes (WhatsApp, Telegram, etc.)'),
('Store Name', 'اسم المتجر', 'Nom du magasin', 'Ability to set a custom store name', 'القدرة على تعيين اسم متجر مخصص', 'Capacité de définir un nom de magasin personnalisé'),
('Location Input', 'إدخال الموقع', 'Saisie de localisation', 'Single large input for store location (3 lines)', 'حقل إدخال كبير واحد لموقع المتجر (3 أسطر)', 'Champ de saisie unique pour la localisation du magasin (3 lignes)')
ON CONFLICT (name_en) DO NOTHING;

