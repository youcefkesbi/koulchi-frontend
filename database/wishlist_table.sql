-- Wishlist table structure for Supabase
-- This table stores user wishlist items -

CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure a user can only have a product in their wishlist once
    UNIQUE(user_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
-- Users can only view their own wishlist items
CREATE POLICY "Users can view own wishlist" ON public.wishlist
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own wishlist items
CREATE POLICY "Users can insert own wishlist items" ON public.wishlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own wishlist items
CREATE POLICY "Users can delete own wishlist items" ON public.wishlist
    FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.wishlist TO authenticated;
GRANT SELECT ON public.wishlist TO anon;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS wishlist_user_id_idx ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS wishlist_product_id_idx ON public.wishlist(product_id);
CREATE INDEX IF NOT EXISTS wishlist_created_at_idx ON public.wishlist(created_at);
