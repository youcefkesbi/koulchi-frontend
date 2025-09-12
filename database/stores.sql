-- Stores table with pack and verification support
-- This table stores store information with pack-based features

CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT, -- Only for Pro Pack stores
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    pack_id UUID REFERENCES public.packs(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    location TEXT, -- Single large input for location (3 lines)
    external_buttons JSONB DEFAULT '[]', -- Array of external button configs
    customization_settings JSONB DEFAULT '{}', -- Store customization (colors, layout, fonts)
    shipping_account_id TEXT, -- Maestro Delivery account ID
    current_announcements INTEGER DEFAULT 0, -- Current count of announcements
    current_images INTEGER DEFAULT 0, -- Current count of images
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_stores_updated_at ON stores;
CREATE TRIGGER update_stores_updated_at 
    BEFORE UPDATE ON stores 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS stores_pack_id_idx ON public.stores(pack_id);
CREATE INDEX IF NOT EXISTS stores_status_idx ON public.stores(status);
CREATE INDEX IF NOT EXISTS stores_reviewed_by_idx ON public.stores(reviewed_by);
CREATE INDEX IF NOT EXISTS stores_owner_id_idx ON public.stores(owner_id);
