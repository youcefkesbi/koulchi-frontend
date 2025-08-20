-- Fix RLS policies for products table
-- This script adds the necessary Row Level Security policies

-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy for users to insert their own products
CREATE POLICY "Users can insert their own products" ON public.products
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Policy for users to view all active products
CREATE POLICY "Anyone can view active products" ON public.products
    FOR SELECT USING (is_active = true);

-- Policy for users to view their own products (including inactive ones)
CREATE POLICY "Users can view their own products" ON public.products
    FOR SELECT USING (auth.uid() = seller_id);

-- Policy for users to update their own products
CREATE POLICY "Users can update their own products" ON public.products
    FOR UPDATE USING (auth.uid() = seller_id);

-- Policy for users to delete their own products
CREATE POLICY "Users can delete their own products" ON public.products
    FOR DELETE USING (auth.uid() = seller_id);

-- Policy for admin/service role to do everything
CREATE POLICY "Service role can do everything" ON public.products
    FOR ALL USING (auth.role() = 'service_role');
