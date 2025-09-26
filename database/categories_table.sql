CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL, -- English name (default)
    name_ar TEXT,          -- Arabic name
    name_fr TEXT,          -- French name
    description TEXT,
    icon_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);


ALTER TABLE public.packs
ADD COLUMN name_en TEXT NOT NULL DEFAULT '',  
ADD COLUMN name_ar TEXT DEFAULT NULL,        
ADD COLUMN name_fr TEXT DEFAULT NULL,        
ADD COLUMN description_en TEXT DEFAULT NULL,
ADD COLUMN description_ar TEXT DEFAULT NULL, 
ADD COLUMN description_fr TEXT DEFAULT NULL; 

-- ================================
-- Indexes
-- ================================
CREATE INDEX IF NOT EXISTS categories_is_active_idx ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS categories_name_en_idx ON public.categories(name_en);
CREATE INDEX IF NOT EXISTS categories_name_ar_idx ON public.categories(name_ar);
CREATE INDEX IF NOT EXISTS categories_name_fr_idx ON public.categories(name_fr);

-- ================================
-- Policies
-- ================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Admin can manage all categories
CREATE POLICY "Admin can manage all categories"
ON public.categories FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
);

-------- SELECT --------
-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories"
ON public.categories FOR SELECT
USING (is_active = true);

-- Grant necessary permissions
GRANT ALL ON public.categories TO authenticated;
GRANT SELECT ON public.categories TO anon;


-- ================================
-- Triggers
-- ================================
CREATE TRIGGER set_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
