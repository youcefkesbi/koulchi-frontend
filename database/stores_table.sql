-- ================================
-- Stores Table
-- ================================

CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE ON UPDATE CASCADE, -- store owner
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    pack_id UUID REFERENCES public.packs(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    location TEXT,
    external_buttons JSONB DEFAULT '[]',
    customization_settings JSONB DEFAULT '{}',
    shipping_account_id TEXT,
    current_announcements INTEGER DEFAULT 0,
    current_images INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Drop the old strict constraint
ALTER TABLE public.stores
DROP CONSTRAINT IF EXISTS stores_owner_id_unique;

-- Create a partial unique index
-- This enforces that a user can only have one store if it's not rejected
CREATE UNIQUE INDEX stores_one_non_rejected_per_owner
ON public.stores (owner_id)
WHERE status IN ('pending', 'approved');


-- ================================
-- Enum
-- ================================
-- 1. Create the enum type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'store_status') THEN
        CREATE TYPE store_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END$$;

-- 2. Drop the existing default
ALTER TABLE public.stores
ALTER COLUMN status DROP DEFAULT;

-- 3. Alter column type using explicit cast
ALTER TABLE public.stores
ALTER COLUMN status TYPE store_status
USING status::store_status;

-- 4. Add the default back
ALTER TABLE public.stores
ALTER COLUMN status SET DEFAULT 'pending';


-- ================================
-- Indexes
-- ================================
CREATE INDEX IF NOT EXISTS stores_pack_id_idx ON public.stores(pack_id);
CREATE INDEX IF NOT EXISTS stores_status_idx ON public.stores(status);
CREATE INDEX IF NOT EXISTS stores_reviewed_by_idx ON public.stores(reviewed_by);
CREATE INDEX IF NOT EXISTS stores_owner_id_idx ON public.stores(owner_id);


-- ================================
-- Policies
-- ================================
-- Enable Row Level Security
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Admin can manage all stores
CREATE POLICY "Admin can manage all stores"
ON public.stores FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
);

-------- INSERT --------
CREATE POLICY "Customer can insert his own store"
ON public.stores FOR INSERT TO authenticated
WITH CHECK (
    owner_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'customer'
    )
);

-------- SELECT --------
-- Anyone can view all stores --
CREATE POLICY "Anyone can view all stores"
ON public.stores FOR SELECT

-------- UPDATE --------
-- Vendor can update their own stores --
CREATE POLICY "Vendor can update own stores"
ON public.stores FOR UPDATE TO authenticated
USING (
    owner_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'vendor'
    )
)
WITH CHECK (
    owner_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'vendor'
    )
);

-- Employees can update store Limited --
CREATE POLICY "Employees can update store status"
ON public.stores FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'employee'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'employee'
    )
);


-------- DELETE --------
-- Vendor can delete their own store --
CREATE POLICY "Vendor can delete their own store"
ON public.stores FOR DELETE TO authenticated
USING (
    owner_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'vendor'
    )
);


GRANT SELECT ON public.stores TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stores TO authenticated;

-- ================================
-- Triggers
-- ================================

CREATE TRIGGER update_stores_updated_at 
BEFORE UPDATE ON public.stores 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();


-- ================================
-- Functions
-- ================================
create or replace function create_store(
  p_owner_id uuid,
  p_name text,
  p_description text,
  p_logo_url text,
  p_banner_url text,
  p_pack_id uuid
) returns uuid
language plpgsql as $$
declare
  new_id uuid;
begin
  -- Check if user already has a non-rejected store (pending or approved)
  -- This matches the database constraint: stores_one_non_rejected_per_owner
  if exists (select 1 from public.stores where owner_id = p_owner_id and status in ('pending', 'approved')) then

    raise exception 'User already has a store';
  end if;

  -- Insert store
  insert into public.stores (owner_id, name, description, logo_url, banner_url, pack_id, status)
  values (p_owner_id, p_name, p_description, p_logo_url, p_banner_url, p_pack_id, 'pending')
  returning id into new_id;

  return new_id;
end;
$$;

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
    SELECT max_announcements, max_images
    INTO pack_info
    FROM public.packs
    WHERE id = p_pack_id AND is_active = true;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    SELECT 
        COALESCE(current_announcements, 0),
        COALESCE(current_images, 0)
    INTO current_announcements, current_images
    FROM public.stores
    WHERE id = p_store_id;

    IF (current_announcements + p_announcement_count) > pack_info.max_announcements THEN
        RETURN false;
    END IF;

    IF (current_images + p_image_count) > pack_info.max_images THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Create an RPC function to get the authenticated user's store status
create or replace function public.get_user_store_status(auth_uid uuid)
returns table(
    store_id uuid,
    status store_status,
    can_create boolean
) as $$
begin
    return query
    select
        s.id,
        s.status,
        case 
            when s.id is null then true  -- no store exists
            when s.status = 'rejected' then true -- store rejected
            else false
        end as can_create
    from public.stores s
    where s.owner_id = auth_uid;
end;
$$ language plpgsql security definer;
