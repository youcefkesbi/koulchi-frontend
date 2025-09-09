-- Updated Stores table structure for Supabase with pack and verification support
-- This replaces the existing stores table

-- First, drop existing policies and constraints
DROP POLICY IF EXISTS "users can insert their own store" ON stores;
DROP POLICY IF EXISTS "users can update their own store" ON stores;
DROP POLICY IF EXISTS "users can delete their own store" ON stores;
DROP POLICY IF EXISTS "everyone can view stores" ON stores;

-- Add new columns to existing stores table
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS pack_id UUID REFERENCES public.packs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS location TEXT, -- Single large input for location (3 lines)
ADD COLUMN IF NOT EXISTS external_buttons JSONB DEFAULT '[]', -- Array of external button configs
ADD COLUMN IF NOT EXISTS customization_settings JSONB DEFAULT '{}', -- Store customization (colors, layout, fonts)
ADD COLUMN IF NOT EXISTS shipping_account_id TEXT, -- Maestro Delivery account ID
ADD COLUMN IF NOT EXISTS current_announcements INTEGER DEFAULT 0, -- Current count of announcements
ADD COLUMN IF NOT EXISTS current_images INTEGER DEFAULT 0; -- Current count of images

-- Create new policies
-- Users can insert their own store
CREATE POLICY "users can insert their own store"
ON stores
FOR insert
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Users can update their own store (only if pending or approved)
CREATE POLICY "users can update their own store"
ON stores
FOR update
TO authenticated
USING (owner_id = auth.uid() AND status IN ('pending', 'approved'))
WITH CHECK (owner_id = auth.uid());

-- Users can delete their own store (only if pending)
CREATE POLICY "users can delete their own store"
ON stores
FOR delete
TO authenticated
USING (owner_id = auth.uid() AND status = 'pending');

-- Everyone can view approved stores
CREATE POLICY "everyone can view approved stores"
ON stores
FOR select
TO public
USING (status = 'approved');

-- Users can view their own stores regardless of status
CREATE POLICY "users can view own stores"
ON stores
FOR select
TO authenticated
USING (owner_id = auth.uid());

-- Employees and admins can view all stores
CREATE POLICY "employees can view all stores"
ON stores
FOR select
TO authenticated
USING (auth.jwt()->>'role' IN ('admin', 'employee'));

-- Employees and admins can update store status
CREATE POLICY "employees can update store status"
ON stores
FOR update
TO authenticated
USING (auth.jwt()->>'role' IN ('admin', 'employee'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS stores_pack_id_idx ON public.stores(pack_id);
CREATE INDEX IF NOT EXISTS stores_status_idx ON public.stores(status);
CREATE INDEX IF NOT EXISTS stores_reviewed_by_idx ON public.stores(reviewed_by);
CREATE INDEX IF NOT EXISTS stores_owner_id_idx ON public.stores(owner_id);

-- Create a function to check pack limits
CREATE OR REPLACE FUNCTION check_pack_limits(
    p_store_id UUID,
    p_pack_id UUID,
    p_announcement_count INTEGER DEFAULT 0,
    p_image_count INTEGER DEFAULT 0
)
RETURNS BOOLEAN AS $$
DECLARE
    pack_info RECORD;
    current_announcements INTEGER;
    current_images INTEGER;
BEGIN
    -- Get pack information
    SELECT max_announcements, max_images
    INTO pack_info
    FROM public.packs
    WHERE id = p_pack_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Get current counts for the store
    SELECT 
        COALESCE(current_announcements, 0),
        COALESCE(current_images, 0)
    INTO current_announcements, current_images
    FROM public.stores
    WHERE id = p_store_id;
    
    -- Check limits
    IF (current_announcements + p_announcement_count) > pack_info.max_announcements THEN
        RETURN false;
    END IF;
    
    IF (current_images + p_image_count) > pack_info.max_images THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update store counts
CREATE OR REPLACE FUNCTION update_store_counts(
    p_store_id UUID,
    p_announcement_delta INTEGER DEFAULT 0,
    p_image_delta INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.stores
    SET 
        current_announcements = GREATEST(0, current_announcements + p_announcement_delta),
        current_images = GREATEST(0, current_images + p_image_delta),
        updated_at = now()
    WHERE id = p_store_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_pack_limits TO authenticated;
GRANT EXECUTE ON FUNCTION update_store_counts TO authenticated;
