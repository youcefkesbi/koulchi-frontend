-- RLS Policies for packs table

-- Enable Row Level Security
ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active packs" ON packs;
DROP POLICY IF EXISTS "Admins can manage packs" ON packs;

-- Anyone can view active packs
CREATE POLICY "Anyone can view active packs" ON public.packs
    FOR SELECT USING (is_active = true);

-- Only admins can manage packs
CREATE POLICY "Admins can manage packs" ON public.packs
    FOR ALL USING (auth.jwt()->>'role' = 'admin');
