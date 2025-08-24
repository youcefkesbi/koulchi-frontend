-- Categories table structure for Supabase with multilingual support -

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL, -- English name (default)
    name_ar TEXT, -- Arabic name
    name_fr TEXT, -- French name
    description text,
    icon_url TEXT,
    is_active boolean not null default true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories" ON public.categories
    FOR SELECT USING (is_active = true);

-- Grant necessary permissions
GRANT ALL ON public.categories TO authenticated;
GRANT SELECT ON public.categories TO anon;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS categories_is_active_idx ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS categories_name_en_idx ON public.categories(name_en);
CREATE INDEX IF NOT EXISTS categories_name_ar_idx ON public.categories(name_ar);
CREATE INDEX IF NOT EXISTS categories_name_fr_idx ON public.categories(name_fr);