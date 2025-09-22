-- Packs table structure for Supabase
-- This table stores store pack information (Basic Pack, Pro Pack, etc.)

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

-- Enable Row Level Security
ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access

CREATE POLICY "Admins can manage packs"
ON public.packs
FOR ALL
USING (auth.jwt()->>'role' = 'admin')
WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Anyone can view active packs
CREATE POLICY "Anyone can view active packs" ON public.packs
    FOR SELECT USING (is_active = true);

-- Grant necessary permissions
REVOKE ALL ON public.packs FROM anon;
REVOKE ALL ON public.packs FROM authenticated;
GRANT SELECT ON public.packs TO anon;
GRANT SELECT ON public.packs TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS packs_is_active_idx ON public.packs(is_active);
CREATE INDEX IF NOT EXISTS packs_name_idx ON public.packs(name);

-- Insert default packs
INSERT INTO public.packs (name, description, price, max_announcements, max_images) VALUES
('Basic Pack', 'Free pack with basic features', 0.00, 150, 300),
('Pro Pack', 'Premium pack with advanced features', 1000.00, 3000, 6000)
ON CONFLICT (name) DO NOTHING;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_packs_updated_at 
    BEFORE UPDATE ON public.packs 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

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

-- Seed data for packs table
-- Insert default packs

INSERT INTO public.packs (name, description, price, max_announcements, max_images) VALUES
('Basic Pack', 'Free pack with basic features', 0.00, 150, 300),
('Pro Pack', 'Premium pack with advanced features', 1000.00, 3000, 6000)
ON CONFLICT (name) DO NOTHING;
