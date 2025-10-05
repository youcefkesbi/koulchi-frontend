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
  can_create boolean,
  has_vendor boolean
) as $$
begin
  return query
  select
    s.id,
    s.status,
    (
      not exists (select 1 from public.user_roles ur where ur.user_id = auth_uid and lower(ur.role) = 'vendor')
      and not exists (select 1 from public.stores xs where xs.owner_id = auth_uid and xs.status in ('pending','approved'))
    ) as can_create,
    exists (select 1 from public.user_roles ur where ur.user_id = auth_uid and lower(ur.role) = 'vendor') as has_vendor
  from public.stores s
  where s.owner_id = auth_uid
  order by case when s.status in ('pending','approved') then 0 else 1 end, s.created_at desc
  limit 1;

  if not found then
    return query select null::uuid, null::store_status,
      (not exists (select 1 from public.user_roles ur where ur.user_id = auth_uid and lower(ur.role) = 'vendor'))::boolean,
      exists (select 1 from public.user_roles ur where ur.user_id = auth_uid and lower(ur.role) = 'vendor')::boolean;
  end if;
end;
$$ language plpgsql security definer;


-- Function to get total orders for a store
CREATE OR REPLACE FUNCTION public.get_store_total_orders(store_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(DISTINCT o.id)
        FROM public.orders o
        WHERE o.store_id = store_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get total products for a store
CREATE OR REPLACE FUNCTION public.get_store_total_products(store_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.products p
        WHERE p.store_id = store_uuid AND p.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get total sales amount for a store
CREATE OR REPLACE FUNCTION public.get_store_total_sales(store_uuid UUID)
RETURNS NUMERIC(10,2) AS $$
BEGIN
    RETURN (
        SELECT COALESCE(SUM(o.total_amount), 0)
        FROM public.orders o
        WHERE o.store_id = store_uuid 
        AND o.status IN ('confirmed', 'shipped', 'delivered')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get total visitors for a store (based on unique customers who placed orders)
CREATE OR REPLACE FUNCTION public.get_store_total_visitors(store_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(DISTINCT o.user_id)
        FROM public.orders o
        WHERE o.store_id = store_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get store statistics for the authenticated user's store
CREATE OR REPLACE FUNCTION public.get_my_store_statistics()
RETURNS TABLE(
    total_orders INTEGER,
    total_products INTEGER,
    total_sales NUMERIC(10,2),
    total_visitors INTEGER,
    store_id UUID,
    store_name TEXT
) AS $$
DECLARE
    user_store_id UUID;
    user_store_name TEXT;
BEGIN
    -- Get the user's store ID
    SELECT s.id, s.name INTO user_store_id, user_store_name
    FROM public.stores s
    WHERE s.owner_id = auth.uid() AND s.status = 'approved';
    
    -- If no store found, return zeros
    IF user_store_id IS NULL THEN
        RETURN QUERY SELECT 0, 0, 0::NUMERIC(10,2), 0, NULL::UUID, NULL::TEXT;
        RETURN;
    END IF;
    
    -- Return statistics for the user's store
    RETURN QUERY
    SELECT 
        (SELECT public.get_store_total_orders(user_store_id)) as total_orders,
        (SELECT public.get_store_total_products(user_store_id)) as total_products,
        (SELECT public.get_store_total_sales(user_store_id)) as total_sales,
        (SELECT public.get_store_total_visitors(user_store_id)) as total_visitors,
        user_store_id as store_id,
        user_store_name as store_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_store_total_orders TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_store_total_products TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_store_total_sales TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_store_total_visitors TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_store_statistics TO authenticated;




-- Function to get monthly sales for a specific store
CREATE OR REPLACE FUNCTION public.get_store_monthly_sales(
    store_uuid UUID,
    year_param INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE(
    labels TEXT[],
    datasets JSONB
) AS $$
DECLARE
    month_labels TEXT[] := ARRAY['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    sales_data NUMERIC[12] := ARRAY[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    month_sales RECORD;
BEGIN
    -- Get monthly sales data
    FOR month_sales IN
        SELECT 
            EXTRACT(MONTH FROM o.created_at)::INTEGER as month_num,
            COALESCE(SUM(o.total_amount), 0) as total_sales
        FROM public.orders o
        WHERE o.store_id = store_uuid
        AND EXTRACT(YEAR FROM o.created_at) = year_param
        AND o.status IN ('confirmed', 'shipped', 'delivered')
        GROUP BY EXTRACT(MONTH FROM o.created_at)
        ORDER BY month_num
    LOOP
        -- Ensure month_num is within bounds (1-12)
        IF month_sales.month_num >= 1 AND month_sales.month_num <= 12 THEN
            sales_data[month_sales.month_num] := month_sales.total_sales;
        END IF;
    END LOOP;
    
    -- Return the data
    RETURN QUERY SELECT 
        month_labels,
        jsonb_build_object('data', to_jsonb(sales_data));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get monthly sales for the authenticated user's store
CREATE OR REPLACE FUNCTION public.get_my_store_monthly_sales(
    year_param INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE(
    labels TEXT[],
    datasets JSONB
) AS $$
DECLARE
    user_store_id UUID;
BEGIN
    -- Get the user's store ID
    SELECT s.id INTO user_store_id
    FROM public.stores s
    WHERE s.owner_id = auth.uid() AND s.status = 'approved';
    
    -- If no store found, return empty data
    IF user_store_id IS NULL THEN
        RETURN QUERY SELECT 
            ARRAY[]::TEXT[],
            jsonb_build_object('data', jsonb_build_array());
        RETURN;
    END IF;
    
    -- Return monthly sales for the user's store
    RETURN QUERY SELECT * FROM public.get_store_monthly_sales(user_store_id, year_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get sales data for the last N months (rolling window)

GRANT EXECUTE ON FUNCTION public.get_store_monthly_sales TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_store_monthly_sales TO authenticated;

-- Function to get authenticated user's store products
-- Only works if user has vendor role and approved store
create or replace function public.get_my_store_products()
returns table(
  product_id uuid,
  product_name text,
  product_description text,
  price numeric(10,2),
  stock_quantity integer,
  sold_count integer,
  category_id uuid,
  category_name text,
  is_active boolean,
  is_new boolean,
  image_urls text[],
  store_id uuid,
  store_name text,
  created_at timestamptz,
  updated_at timestamptz
) as $$
declare
  user_store_id uuid;
  store_status store_status;
begin
  if auth.uid() is null then
    raise exception 'User not authenticated';
  end if;

  if not exists (
    select 1 from user_roles ur
    where ur.user_id = auth.uid() and lower(ur.role) = 'vendor'
  ) then
    raise exception 'Access denied. User must have vendor role';
  end if;

  select s.id, s.status
  into user_store_id, store_status
  from public.stores s
  where s.owner_id = auth.uid()
  order by case when s.status = 'approved' then 0 when s.status = 'pending' then 1 else 2 end,
           s.created_at desc
  limit 1;

  if user_store_id is null then
    raise exception 'No store found for user';
  end if;

  if store_status != 'approved' then
    raise exception 'Store must be approved to access products';
  end if;

  return query
  select 
    p.id as product_id,
    p.name as product_name,
    p.description as product_description,
    p.price,
    p.stock_quantity,
    p.sold_count,
    p.category_id,
    coalesce(c.name_en, 'No Category') as category_name,
    p.is_active,
    p.is_new,
    p.image_urls,
    p.store_id,
    s.name as store_name,
    p.created_at,
    p.updated_at
  from public.products p
  join public.stores s on p.store_id = s.id
  left join public.categories c on p.category_id = c.id
  where p.store_id = user_store_id
  order by p.created_at desc;
end;
$$ language plpgsql security definer;



-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_my_store_products TO authenticated;


