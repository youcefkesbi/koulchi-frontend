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

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_packs_updated_at ON packs;
CREATE TRIGGER update_packs_updated_at 
    BEFORE UPDATE ON packs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS packs_is_active_idx ON public.packs(is_active);
CREATE INDEX IF NOT EXISTS packs_name_idx ON public.packs(name);
