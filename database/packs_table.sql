-- ================================
-- Packs table structure
-- ================================
CREATE TABLE IF NOT EXISTS public.packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- e.g., 'Basic Pack', 'Pro Pack'
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0, -- Price in DZD
    max_announcements INTEGER NOT NULL DEFAULT 0, -- Max product announcements
    max_images INTEGER NOT NULL DEFAULT 0, -- Max storage images
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
-- ================================
-- Constraint
-- ================================

ALTER TABLE public.packs
ADD CONSTRAINT packs_name_en_unique UNIQUE (name_en);


ALTER TABLE public.packs
ADD COLUMN name_en TEXT NOT NULL DEFAULT '',  
ADD COLUMN name_ar TEXT DEFAULT NULL,        
ADD COLUMN name_fr TEXT DEFAULT NULL,        
ADD COLUMN description_en TEXT DEFAULT NULL,
ADD COLUMN description_ar TEXT DEFAULT NULL, 
ADD COLUMN description_fr TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]';
DROP COLUMN name,
DROP COLUMN description;



-- ================================
-- Seed data
-- ================================
INSERT INTO public.packs (
    id,
    name_en, name_fr, name_ar,
    description_en, description_fr, description_ar,
    price,
    max_announcements,
    max_images,
    features
)
VALUES
(
    gen_random_uuid(),
    'Basic Plan', 'Forfait Basique', 'الخطة الأساسية',
    'Track sales via a dynamic dashboard, Create promotions, Store location display, Gather all products in one place, Limited social media links (one of your choice)',
    'Suivi des ventes via un tableau de bord dynamique, Création de promotions, Affichage de la localisation du magasin, Rassembler tous les produits en un seul endroit, Liens limités vers les réseaux sociaux (un au choix)',
    'تتبع المبيعات عبر لوحة تحكم ديناميكية، إنشاء العروض الترويجية، عرض موقع المتجر، جمع جميع المنتجات في مكان واحد، روابط محدودة لشبكة اجتماعية واحدة من اختيارك',
    0,  -- price shared across languages
    5,  -- random max_announcements
    20, -- random max_images
    '{
        "en": ["Track sales via a dynamic dashboard", "Create promotions", "Store location display", "Gather all products in one place", "Limited social media links (one of your choice)"],
        "fr": ["Suivi des ventes via un tableau de bord dynamique", "Création de promotions", "Affichage de la localisation du magasin", "Rassembler tous les produits en un seul endroit", "Liens limités vers les réseaux sociaux (un au choix)"],
        "ar": ["تتبع المبيعات عبر لوحة تحكم ديناميكية", "إنشاء العروض الترويجية", "عرض موقع المتجر", "جمع جميع المنتجات في مكان واحد", "روابط محدودة لشبكة اجتماعية واحدة من اختيارك"]
    }'::jsonb
),
(
    gen_random_uuid(),
    'Pro Plan', 'Forfait Pro', 'الخطة الاحترافية',
    'Custom logo, Custom banner, Custom store name (branding), Control store interface colors to match branding, Unlimited social media links, Advanced dashboard',
    'Logo personnalisé, Bannière personnalisée, Nom de magasin personnalisé (branding), Contrôler l’interface du magasin en adaptant les couleurs au branding, Liens illimités vers les réseaux sociaux, Tableau de bord avancé',
    'شعار مخصص، لافتة مخصصة، اسم متجر مخصص (العلامة التجارية)، التحكم في واجهة المتجر وتغيير الألوان بما يتناسب مع العلامة التجارية، روابط غير محدودة لوسائل التواصل الاجتماعي، لوحة تحكم متقدمة',
    2000,
    50,
    200,
    '{
        "en": ["Custom logo", "Custom banner", "Custom store name (branding)", "Control store interface colors to match branding", "Unlimited social media links", "Advanced dashboard"],
        "fr": ["Logo personnalisé", "Bannière personnalisée", "Nom de magasin personnalisé (branding)", "Contrôler l’interface du magasin en adaptant les couleurs au branding", "Liens illimités vers les réseaux sociaux", "Tableau de bord avancé"],
        "ar": ["شعار مخصص", "لافتة مخصصة", "اسم متجر مخصص (العلامة التجارية)", "التحكم في واجهة المتجر وتغيير الألوان بما يتناسب مع العلامة التجارية", "روابط غير محدودة لوسائل التواصل الاجتماعي", "لوحة تحكم متقدمة"]
    }'::jsonb
)
ON CONFLICT (name_en) DO NOTHING;

-- ================================
-- Indexes
-- ================================
CREATE INDEX IF NOT EXISTS packs_is_active_idx ON public.packs(is_active);
CREATE INDEX IF NOT EXISTS packs_name_idx ON public.packs(name);

-- ================================
-- Policies
-- ================================
ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;

-- Admins can manage packs
CREATE POLICY "Admins can manage packs"
ON public.packs
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
);
-------- SELECT --------
-- Anyone can view active packs (SELECT)
CREATE POLICY "Anyone can view active packs"
ON public.packs
FOR SELECT
USING (is_active = true);

-- ================================
-- Permissions
-- ================================
REVOKE ALL ON public.packs FROM anon;
REVOKE ALL ON public.packs FROM authenticated;
GRANT SELECT ON public.packs TO anon;
GRANT SELECT ON public.packs TO authenticated;

-- ================================
-- Triggers
-- ================================
CREATE TRIGGER set_packs_updated_at
BEFORE UPDATE ON public.packs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- Seed data
-- ================================
INSERT INTO public.packs (name, description, price, max_announcements, max_images) VALUES
('Basic Pack', 'Free pack with basic features', 0.00, 150, 300),
('Pro Pack', 'Premium pack with advanced features', 1000.00, 3000, 6000)
ON CONFLICT (name) DO NOTHING;
