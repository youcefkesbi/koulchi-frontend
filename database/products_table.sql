-- Products table structure for Supabase
-- This table stores product information with image_urls array

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_urls TEXT[] DEFAULT '{}',
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_new BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security --
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
-- Anyone can view active products
CREATE POLICY "Anyone can view active products" ON public.products
    FOR SELECT USING (is_active = true);

-- Users can insert their own products
CREATE POLICY "Users can insert own products" ON public.products
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Users can update their own products
CREATE POLICY "Users can update own products" ON public.products
    FOR UPDATE USING (auth.uid() = seller_id);

-- Users can delete their own products
CREATE POLICY "Users can delete own products" ON public.products
    FOR DELETE USING (auth.uid() = seller_id);

-- Grant necessary permissions
GRANT ALL ON public.products TO authenticated;
GRANT SELECT ON public.products TO anon;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS products_category_id_idx ON public.products(category_id);
CREATE INDEX IF NOT EXISTS products_seller_id_idx ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS products_is_active_idx ON public.products(is_active);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON public.products(created_at);