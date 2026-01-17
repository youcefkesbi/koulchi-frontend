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
ALTER TYPE store_status ADD VALUE IF NOT EXISTS 'suspended'; 
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


-- ================================
-- Permissions (GRANT statements)
-- ================================
-- Grant permissions to service_role for backend operations
-- This allows backend to access stores while RLS policies still apply
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stores TO postgres, anon, authenticated, service_role;

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
  p_banner_url text,
  p_commerce_register_url text,
  p_description text,
  p_id_document_url text,
  p_logo_url text,
  p_name text,
  p_owner_id uuid,
  p_pack_id uuid,
  p_payment_receipt_url text
) returns uuid
language plpgsql security definer as $$
declare
  new_id uuid;
  pack_type_val text;
  is_pro_pack boolean := false;
  current_user_id uuid;
  user_roles text[];
  pack_max_announcements integer;
  pack_max_images integer;
  pack_name_en_val text;
  pack_name_ar_val text;
  pack_name_fr_val text;
begin
  -- Debug: Check current user and roles
  current_user_id := auth.uid();
  RAISE NOTICE 'create_store called with p_owner_id: %, current_user_id: %', p_owner_id, current_user_id;
  
  -- Check if p_owner_id matches current user
  IF p_owner_id != current_user_id THEN
    RAISE EXCEPTION 'Owner ID does not match authenticated user';
  END IF;
  
  -- Check if user has customer or vendor role (optimized)
  IF NOT (public.has_role(current_user_id, 'customer') OR public.has_role(current_user_id, 'vendor')) THEN
    RAISE EXCEPTION 'User does not have permission to create stores. Required roles: customer or vendor';
  END IF;
  
  -- Check if user already has a non-rejected store (pending or approved)
  -- This matches the database constraint: stores_one_non_rejected_per_owner
  if exists (select 1 from public.stores where owner_id = p_owner_id and status in ('pending', 'approved')) then
    raise exception 'User already has a store';
  end if;

  -- Get pack type and details (Phase 1: Pre-Upgrade Validation)
  SELECT p.type, p.max_announcements, p.max_images, p.name_en, p.name_ar, p.name_fr 
  INTO pack_type_val, pack_max_announcements, pack_max_images, pack_name_en_val, pack_name_ar_val, pack_name_fr_val
  FROM public.packs p
  WHERE p.id = p_pack_id AND p.is_active = true;

  -- Validate pack exists and is active
  IF pack_type_val IS NULL THEN
    RAISE EXCEPTION 'Invalid or inactive pack selected';
  END IF;

  -- Determine if it's a pro pack (convert type to boolean)
  IF pack_type_val = 'pro' THEN
    is_pro_pack := TRUE;
  ELSE
    is_pro_pack := FALSE;
  END IF;

  -- Phase 1: Check for products without store (optional validation - products can exist without store)
  -- This is informational, not blocking

  -- Insert store
  insert into public.stores (owner_id, name, description, logo_url, banner_url, pack_id, status)
  values (p_owner_id, p_name, p_description, p_logo_url, p_banner_url, p_pack_id, 'pending')
  returning id into new_id;

  -- Note: Phases 3-6 (Product Migration, Store Statistics, Role Update, Subscription)
  -- are now handled during store approval, not creation.
  -- This ensures:
  -- 1. No redundancy if store is rejected
  -- 2. Better data integrity
  -- 3. All activation happens atomically on approval
  -- 4. Vendor role only granted after approval (security)

  -- Clear old verification records for this user to prevent mixing rejection reasons
  -- This ensures only the current store's verification data is used
  DELETE FROM public.verifications WHERE user_id = p_owner_id;

  -- Insert verification documents based on pack type
  -- For Basic Pack: ID document + logo + banner
  -- For Pro Pack: ID document + commerce register + payment receipt + logo + banner
  
  -- Always insert ID document if provided
  IF p_id_document_url IS NOT NULL THEN
    INSERT INTO public.verifications (user_id, verification_type, document_url, status)
    VALUES (p_owner_id, 'id_card', p_id_document_url, 'pending');
  END IF;

  -- Always insert logo if provided
  IF p_logo_url IS NOT NULL THEN
    INSERT INTO public.verifications (user_id, verification_type, document_url, status)
    VALUES (p_owner_id, 'logo', p_logo_url, 'pending');
  END IF;

  -- Always insert banner if provided
  IF p_banner_url IS NOT NULL THEN
    INSERT INTO public.verifications (user_id, verification_type, document_url, status)
    VALUES (p_owner_id, 'banner', p_banner_url, 'pending');
  END IF;

  -- For Pro Pack: insert additional documents
  IF is_pro_pack THEN
    -- Insert commerce register if provided
    IF p_commerce_register_url IS NOT NULL THEN
      INSERT INTO public.verifications (user_id, verification_type, document_url, status)
      VALUES (p_owner_id, 'commerce_register', p_commerce_register_url, 'pending');
    END IF;

    -- Insert payment receipt if provided
    IF p_payment_receipt_url IS NOT NULL THEN
      INSERT INTO public.verifications (user_id, verification_type, document_url, status)
      VALUES (p_owner_id, 'payment_receipt', p_payment_receipt_url, 'pending');
    END IF;
  END IF;

  -- Phase 7: User Notification
  -- Create user notification for store creation
  INSERT INTO public.notifications (
    user_id,
    type,
    template_key,
    metadata,
    link,
    target_role,
    is_read,
    created_at
  ) VALUES (
    p_owner_id,
    'store_created',
    'notifications.storeCreated',
    jsonb_build_object(
      'message', format('Your store "%s" has been created successfully. Status: pending.', COALESCE(p_name, 'New Store')),
      'store_id', new_id,
      'store_name', COALESCE(p_name, 'New Store'),
      'store_status', 'pending',
      'pack_name_en', COALESCE(pack_name_en_val, 'Basic Plan'),
      'pack_name_ar', COALESCE(pack_name_ar_val, pack_name_en_val, 'Basic Plan'),
      'pack_name_fr', COALESCE(pack_name_fr_val, pack_name_en_val, 'Basic Plan')
    ),
    '/subscription',
    'vendor',
    FALSE,
    NOW()
  );

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
GRANT EXECUTE ON FUNCTION create_store TO authenticated;

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
        WHERE p.store_id = store_uuid AND p.status = 'approved'
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
  product_price numeric(10,2),
  stock_quantity integer,
  sold_count integer,
  category_id uuid,
  category_name text,
  category_name_en text,
  category_name_ar text,
  category_name_fr text,
  is_new boolean,
  image_urls text[],
  product_image text,
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
    p.price as product_price,
    p.stock_quantity,
    p.sold_count,
    p.category_id,
    coalesce(c.name_en, 'No Category') as category_name,
    coalesce(c.name_en, 'No Category') as category_name_en,
    coalesce(c.name_ar, 'No Category') as category_name_ar,
    coalesce(c.name_fr, 'No Category') as category_name_fr,
    p.is_new,
    p.image_urls,
    coalesce(p.image_urls[1], p.thumbnail_url) as product_image,
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

-- Function to get authenticated user's store products with filtering
CREATE OR REPLACE FUNCTION public.get_my_store_products_filtered(p_price_min numeric DEFAULT NULL::numeric, p_price_max numeric DEFAULT NULL::numeric, p_category_id uuid DEFAULT NULL::uuid, p_stock_filter text DEFAULT NULL::text, p_sort_by text DEFAULT 'created_at'::text, p_sort_order text DEFAULT 'desc'::text)
 RETURNS TABLE(product_id uuid, product_name text, product_description text, product_price numeric, product_image text, category_id uuid, category_name text, category_name_en text, category_name_ar text, category_name_fr text, stock_quantity integer, sold_count integer, is_new boolean, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    user_store_id UUID;
    sort_clause TEXT;
BEGIN
    -- Get the current user's store ID
    SELECT s.id INTO user_store_id
    FROM public.stores s
    WHERE s.owner_id = auth.uid() 
      AND s.status = 'approved'
      AND EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'vendor'
      )
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    -- If no store found, return empty result
    IF user_store_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Build sort clause
    CASE p_sort_by
        WHEN 'name' THEN sort_clause := 'p.name ' || p_sort_order;
        WHEN 'price' THEN sort_clause := 'p.price ' || p_sort_order;
        WHEN 'stock_quantity' THEN sort_clause := 'p.stock_quantity ' || p_sort_order;
        WHEN 'sold_count' THEN sort_clause := 'p.sold_count ' || p_sort_order;
        WHEN 'created_at' THEN sort_clause := 'p.created_at ' || p_sort_order;
        ELSE sort_clause := 'p.created_at ' || p_sort_order;
    END CASE;
    
    -- Return filtered products
    RETURN QUERY
    SELECT 
        p.id as product_id,
        p.name as product_name,
        p.description as product_description,
        p.price as product_price,
        COALESCE(p.thumbnail_url, p.image_urls[1], '') as product_image,
        p.category_id,
        COALESCE(c.name_en, 'No Category') as category_name,
        COALESCE(c.name_en, 'No Category') as category_name_en,
        COALESCE(c.name_ar, 'No Category') as category_name_ar,
        COALESCE(c.name_fr, 'No Category') as category_name_fr,
        p.stock_quantity,
        p.sold_count,
        p.is_new,
        p.created_at,
        p.updated_at
    FROM public.products p
    LEFT JOIN public.categories c ON p.category_id = c.id
    WHERE p.store_id = user_store_id
      AND (p_price_min IS NULL OR p.price >= p_price_min)
      AND (p_price_max IS NULL OR p.price <= p_price_max)
      AND (p_category_id IS NULL OR p.category_id = p_category_id)
      AND (
        p_stock_filter IS NULL OR
        (p_stock_filter = 'in_stock' AND p.stock_quantity > 10) OR
        (p_stock_filter = 'low_stock' AND p.stock_quantity BETWEEN 1 AND 10) OR
        (p_stock_filter = 'out_of_stock' AND p.stock_quantity = 0) OR
        (p_stock_filter = 'all')
      )
    ORDER BY 
        CASE WHEN p_sort_by = 'name' AND p_sort_order = 'asc' THEN p.name END ASC,
        CASE WHEN p_sort_by = 'name' AND p_sort_order = 'desc' THEN p.name END DESC,
        CASE WHEN p_sort_by = 'price' AND p_sort_order = 'asc' THEN p.price END ASC,
        CASE WHEN p_sort_by = 'price' AND p_sort_order = 'desc' THEN p.price END DESC,
        CASE WHEN p_sort_by = 'stock_quantity' AND p_sort_order = 'asc' THEN p.stock_quantity END ASC,
        CASE WHEN p_sort_by = 'stock_quantity' AND p_sort_order = 'desc' THEN p.stock_quantity END DESC,
        CASE WHEN p_sort_by = 'sold_count' AND p_sort_order = 'asc' THEN p.sold_count END ASC,
        CASE WHEN p_sort_by = 'sold_count' AND p_sort_order = 'desc' THEN p.sold_count END DESC,
        CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'asc' THEN p.created_at END ASC,
        CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'desc' THEN p.created_at END DESC;
END;
$function$

-- ================================
-- Get All Stores for Admin Management
-- ================================
CREATE OR REPLACE FUNCTION public.get_all_stores_for_admin()
RETURNS TABLE (
    store_id UUID,
    store_name TEXT,
    store_description TEXT,
    owner_name TEXT,
    pack_name TEXT,
    status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as store_id,
        s.name::TEXT as store_name,
        COALESCE(s.description, 'No description')::TEXT as store_description,
        COALESCE(p.full_name, 'Unknown Owner')::TEXT as owner_name,
        COALESCE(pack.name_en, 'No Pack')::TEXT as pack_name,
        s.status::TEXT as status
    FROM public.stores s
    LEFT JOIN public.profiles p ON s.owner_id = p.id
    LEFT JOIN public.packs pack ON s.pack_id = pack.id
    ORDER BY s.created_at DESC;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_all_stores_for_admin() TO authenticated;

-- ================================
-- Get Detailed Store Information for Admin
-- ================================
CREATE OR REPLACE FUNCTION public.get_store_details_for_admin(store_uuid UUID)
RETURNS TABLE (
    store_id UUID,
    store_name TEXT,
    store_description TEXT,
    store_location TEXT,
    logo_url TEXT,
    banner_url TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    owner_id UUID,
    owner_name TEXT,
    owner_city TEXT,
    pack_id UUID,
    pack_name_en TEXT,
    pack_name_ar TEXT,
    pack_name_fr TEXT,
    pack_price DECIMAL(10,2),
    max_announcements INTEGER,
    max_images INTEGER,
    current_announcements INTEGER,
    current_images INTEGER,
    external_buttons JSONB,
    customization_settings JSONB,
    features JSONB,
    total_products INTEGER,
    total_orders INTEGER,
    total_sales NUMERIC(10,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as store_id,
        s.name::TEXT as store_name,
        COALESCE(s.description, 'No description')::TEXT as store_description,
        COALESCE(s.location, 'No location')::TEXT as store_location,
        COALESCE(s.logo_url, '')::TEXT as logo_url,
        COALESCE(s.banner_url, '')::TEXT as banner_url,
        s.status::TEXT as status,
        s.created_at,
        s.updated_at,
        s.owner_id,
        COALESCE(p.full_name, 'Unknown Owner')::TEXT as owner_name,
        COALESCE(
            p.shipping_address->>'commune_name',
            p.shipping_address->>'wilaya_name',
            'Unknown Address'
        )::TEXT as owner_city,
        s.pack_id,
        COALESCE(pack.name_en, 'No Pack')::TEXT as pack_name_en,
        COALESCE(pack.name_ar, 'لا توجد باقة')::TEXT as pack_name_ar,
        COALESCE(pack.name_fr, 'Aucun Pack')::TEXT as pack_name_fr,
        COALESCE(pack.price, 0) as pack_price,
        COALESCE(pack.max_announcements, 0) as max_announcements,
        COALESCE(pack.max_images, 0) as max_images,
        s.current_announcements,
        s.current_images,
        COALESCE(s.external_buttons, '[]'::jsonb) as external_buttons,
        COALESCE(s.customization_settings, '{}'::jsonb) as customization_settings,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', f.id,
                        'name_en', f.name_en,
                        'name_ar', f.name_ar,
                        'name_fr', f.name_fr,
                        'description_en', f.description_en,
                        'description_ar', f.description_ar,
                        'description_fr', f.description_fr,
                        'enabled', pf.is_enabled
                    )
                )
                FROM public.pack_features pf
                JOIN public.features f ON pf.feature_id = f.id
                WHERE pf.pack_id = s.pack_id AND pf.is_enabled = true
            ),
            '[]'::jsonb
        ) as features,
        COALESCE(public.get_store_total_products(s.id), 0) as total_products,
        COALESCE(public.get_store_total_orders(s.id), 0) as total_orders,
        COALESCE(public.get_store_total_sales(s.id), 0) as total_sales
    FROM public.stores s
    LEFT JOIN public.profiles p ON s.owner_id = p.id
    LEFT JOIN public.packs pack ON s.pack_id = pack.id
    WHERE s.id = store_uuid;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_store_details_for_admin(UUID) TO authenticated;

-- ================================
-- Get User Store Pack Information
-- ================================
CREATE OR REPLACE FUNCTION public.get_user_store_pack()
RETURNS TABLE(
    has_vendor_role BOOLEAN,
    store_id UUID,
    pack_name_en TEXT,
    pack_name_ar TEXT,
    pack_name_fr TEXT,
    pack_id UUID,
    is_pro BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    user_store_id UUID;
    user_pack_id UUID;
    pack_name_en_val TEXT;
    pack_name_ar_val TEXT;
    pack_name_fr_val TEXT;
    pack_type_val TEXT;
    is_vendor BOOLEAN := FALSE;
    is_pro_pack BOOLEAN := FALSE;
BEGIN
    -- Check if user has vendor role
    SELECT EXISTS(
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'vendor'
    ) INTO is_vendor;
    
    -- If user doesn't have vendor role, return false
    IF NOT is_vendor THEN
        RETURN QUERY SELECT 
            FALSE as has_vendor_role,
            NULL::UUID as store_id,
            NULL::TEXT as pack_name_en,
            NULL::TEXT as pack_name_ar,
            NULL::TEXT as pack_name_fr,
            NULL::UUID as pack_id,
            FALSE as is_pro;
        RETURN;
    END IF;
    
    -- Get user's store ID
    SELECT s.id INTO user_store_id
    FROM public.stores s
    WHERE s.owner_id = auth.uid() 
      AND s.status = 'approved'
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    -- If no approved store found, return false
    IF user_store_id IS NULL THEN
        RETURN QUERY SELECT 
            TRUE as has_vendor_role,
            NULL::UUID as store_id,
            NULL::TEXT as pack_name_en,
            NULL::TEXT as pack_name_ar,
            NULL::TEXT as pack_name_fr,
            NULL::UUID as pack_id,
            FALSE as is_pro;
        RETURN;
    END IF;
    
    -- Get pack information for the store
    SELECT 
        s.pack_id,
        p.name_en,
        p.name_ar,
        p.name_fr,
        p.type
    INTO 
        user_pack_id,
        pack_name_en_val,
        pack_name_ar_val,
        pack_name_fr_val,
        pack_type_val
    FROM public.stores s
    LEFT JOIN public.packs p ON s.pack_id = p.id
    WHERE s.id = user_store_id;
    
    -- Determine if it's a pro pack using type column
    IF pack_type_val = 'pro' THEN
        is_pro_pack := TRUE;
    ELSE
        is_pro_pack := FALSE;
    END IF;
    
    -- Return the result
    RETURN QUERY SELECT 
        TRUE as has_vendor_role,
        user_store_id as store_id,
        COALESCE(pack_name_en_val, 'No Pack') as pack_name_en,
        COALESCE(pack_name_ar_val, 'لا توجد باقة') as pack_name_ar,
        COALESCE(pack_name_fr_val, 'Aucun Pack') as pack_name_fr,
        user_pack_id as pack_id,
        is_pro_pack as is_pro;
END;
$function$

-- RPC function to get stores by pack type for employee dashboard
CREATE OR REPLACE FUNCTION public.get_stores_by_pack_type(pack_type text)
RETURNS TABLE (
    id uuid, 
    name text, 
    description text, 
    location text, 
    logo_url text, 
    banner_url text, 
    status text, 
    created_at timestamp with time zone, 
    updated_at timestamp with time zone, 
    owner_id uuid, 
    pack_id uuid, 
    external_buttons jsonb, 
    owner_name text, 
    owner_city text, 
    pack_name_en text, 
    pack_name_ar text, 
    pack_name_fr text,
    id_document_url text,
    id_document_id uuid,
    commerce_register_url text,
    commerce_register_id uuid,
    payment_receipt_url text,
    payment_receipt_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Validate pack_type parameter
    IF pack_type NOT IN ('basic', 'pro') THEN
        RAISE EXCEPTION 'Invalid pack_type. Must be ''basic'' or ''pro''';
    END IF;
    
    -- Return stores based on pack type
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.description,
        s.location,
        s.logo_url,
        s.banner_url,
        s.status::TEXT,
        s.created_at,
        s.updated_at,
        s.owner_id,
        s.pack_id,
        s.external_buttons,
        COALESCE(prof.full_name, 'N/A')::TEXT as owner_name,
        COALESCE(
            prof.shipping_address->>'commune_name',
            prof.shipping_address->>'wilaya_name',
            'N/A'
        )::TEXT as owner_city,
        COALESCE(p.name_en, 'N/A')::TEXT as pack_name_en,
        COALESCE(p.name_ar, 'N/A')::TEXT as pack_name_ar,
        COALESCE(p.name_fr, 'N/A')::TEXT as pack_name_fr,
        id_card_ver.document_url::TEXT as id_document_url,
        id_card_ver.id as id_document_id,
        commerce_ver.document_url::TEXT as commerce_register_url,
        commerce_ver.id as commerce_register_id,
        payment_ver.document_url::TEXT as payment_receipt_url,
        payment_ver.id as payment_receipt_id
    FROM public.stores s
    LEFT JOIN public.profiles prof ON s.owner_id = prof.id
    LEFT JOIN public.packs p ON s.pack_id = p.id
    LEFT JOIN public.verifications id_card_ver ON s.owner_id = id_card_ver.user_id AND id_card_ver.verification_type = 'id_card'
    LEFT JOIN public.verifications commerce_ver ON s.owner_id = commerce_ver.user_id AND commerce_ver.verification_type = 'commerce_register'
    LEFT JOIN public.verifications payment_ver ON s.owner_id = payment_ver.user_id AND payment_ver.verification_type = 'payment_receipt'
    WHERE (
        CASE 
            WHEN pack_type = 'basic' THEN 
                p.type = 'basic'
            WHEN pack_type = 'pro' THEN 
                p.type = 'pro'
            ELSE
                TRUE
        END
    )
    ORDER BY s.created_at DESC;
END;
$function$;

-- ================================
-- UPGRADE STORE TO PRO PACK
-- ================================
-- RPC function to upgrade a Basic Pack store to Pro Pack
-- Follows the same pattern as create_store but for upgrades
create or replace function upgrade_store_to_pro(
  p_store_id uuid,
  p_banner_url text,
  p_commerce_register_url text,
  p_description text,
  p_logo_url text,
  p_name text,
  p_owner_id uuid,
  p_pack_id uuid,
  p_payment_receipt_url text
) returns uuid
language plpgsql security definer as $$
declare
  current_user_id uuid;
  user_roles text[];
  store_record record;
  pack_type_val text;
  is_pro_pack boolean := false;
  old_subscription_id uuid;
  plan_type_val text;
begin
  -- Debug: Check current user and roles
  current_user_id := auth.uid();
  RAISE NOTICE 'upgrade_store_to_pro called with p_owner_id: %, current_user_id: %, p_store_id: %', p_owner_id, current_user_id, p_store_id;
  
  -- Check if p_owner_id matches current user
  IF p_owner_id != current_user_id THEN
    RAISE EXCEPTION 'Owner ID does not match authenticated user';
  END IF;
  
  -- Get user roles for debugging
  SELECT ARRAY_AGG(role) INTO user_roles
  FROM public.user_roles 
  WHERE user_id = current_user_id;
  
  RAISE NOTICE 'User roles: %', user_roles;
  
  -- Check if user has vendor role
  IF NOT public.has_role(current_user_id, 'vendor') THEN
    RAISE EXCEPTION 'User does not have permission to upgrade stores. Required role: vendor';
  END IF;

  -- Phase 1: Pre-Upgrade Validation
  -- Verify store exists, belongs to user, is approved, and is Basic pack
  SELECT s.id, s.pack_id, s.status, s.owner_id, p.type as pack_type
  INTO store_record
  FROM public.stores s
  LEFT JOIN public.packs p ON p.id = s.pack_id
  WHERE s.id = p_store_id AND s.owner_id = p_owner_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Store not found or does not belong to user';
  END IF;

  IF store_record.status != 'approved' THEN
    RAISE EXCEPTION 'Store must be approved before upgrading';
  END IF;

  -- Verify current pack is Basic (not Pro)
  IF store_record.pack_type = 'pro' THEN
    RAISE EXCEPTION 'Store is already on Pro pack';
  END IF;

  -- Get Pro Pack details
  SELECT p.type INTO pack_type_val
  FROM public.packs p
  WHERE p.id = p_pack_id AND p.is_active = true;

  IF pack_type_val IS NULL THEN
    RAISE EXCEPTION 'Invalid or inactive Pro pack selected';
  END IF;

  -- Verify it's actually a Pro pack
  IF pack_type_val = 'pro' THEN
    is_pro_pack := true;
  ELSE
    RAISE EXCEPTION 'Selected pack is not a Pro pack';
  END IF;

  -- Phase 2: Document and Information Collection
  -- (Documents are uploaded client-side, URLs are passed here)
  -- Validation: All required documents must be provided
  IF p_commerce_register_url IS NULL THEN
    RAISE EXCEPTION 'Commercial register document is required for Pro pack';
  END IF;

  IF p_payment_receipt_url IS NULL THEN
    RAISE EXCEPTION 'Payment receipt is required for Pro pack';
  END IF;

  IF p_name IS NULL OR TRIM(p_name) = '' THEN
    RAISE EXCEPTION 'Store name is required for Pro pack';
  END IF;

  IF p_logo_url IS NULL THEN
    RAISE EXCEPTION 'Store logo is required for Pro pack';
  END IF;

  IF p_banner_url IS NULL THEN
    RAISE EXCEPTION 'Store banner is required for Pro pack';
  END IF;

  -- Phase 3: Store Pack and Information Update
  UPDATE public.stores 
  SET pack_id = p_pack_id,
      name = p_name,
      description = p_description,
      logo_url = p_logo_url,
      banner_url = p_banner_url,
      updated_at = NOW()
  WHERE id = p_store_id;

  -- Insert new verification documents (NOT id_card - already exists)
  -- Insert commerce register
  IF p_commerce_register_url IS NOT NULL THEN
    INSERT INTO public.verifications (user_id, verification_type, document_url, status)
    VALUES (p_owner_id, 'commerce_register', p_commerce_register_url, 'pending')
    ON CONFLICT (user_id, verification_type) 
    DO UPDATE SET document_url = p_commerce_register_url, status = 'pending', updated_at = NOW();
  END IF;

  -- Insert payment receipt
  IF p_payment_receipt_url IS NOT NULL THEN
    INSERT INTO public.verifications (user_id, verification_type, document_url, status)
    VALUES (p_owner_id, 'payment_receipt', p_payment_receipt_url, 'pending')
    ON CONFLICT (user_id, verification_type) 
    DO UPDATE SET document_url = p_payment_receipt_url, status = 'pending', updated_at = NOW();
  END IF;

  -- Insert logo (if not already exists)
  IF p_logo_url IS NOT NULL THEN
    INSERT INTO public.verifications (user_id, verification_type, document_url, status)
    VALUES (p_owner_id, 'logo', p_logo_url, 'pending')
    ON CONFLICT (user_id, verification_type) 
    DO UPDATE SET document_url = p_logo_url, status = 'pending', updated_at = NOW();
  END IF;

  -- Insert banner (if not already exists)
  IF p_banner_url IS NOT NULL THEN
    INSERT INTO public.verifications (user_id, verification_type, document_url, status)
    VALUES (p_owner_id, 'banner', p_banner_url, 'pending')
    ON CONFLICT (user_id, verification_type) 
    DO UPDATE SET document_url = p_banner_url, status = 'pending', updated_at = NOW();
  END IF;

  -- Phase 4: Subscription History Update
  -- Mark old Basic subscription as ended
  UPDATE public.vendor_subscriptions 
  SET end_date = NOW(), 
      status = 'expired',
      updated_at = NOW()
  WHERE vendor_id = p_owner_id 
    AND status = 'active'
    AND plan_type = 'basic';

  -- Create new Pro subscription
  INSERT INTO public.vendor_subscriptions (vendor_id, plan_type, start_date, end_date, status)
  VALUES (p_owner_id, 'pro', NOW(), NULL, 'active');

  -- Phase 6: Notifications
  -- Create user notification for upgrade
  INSERT INTO public.notifications (
    user_id,
    type,
    template_key,
    metadata,
    link,
    target_role,
    is_read,
    created_at
  ) VALUES (
    p_owner_id,
    'pack_upgraded',
    'notifications.packUpgraded',
    jsonb_build_object(
      'message', format('Your store "%s" has been upgraded to Pro pack', COALESCE(p_name, 'Store')),
      'store_id', p_store_id,
      'store_name', COALESCE(p_name, 'Store'),
      'from_pack', 'basic',
      'to_pack', 'pro',
      'upgrade_date', NOW()
    ),
    '/subscription',
    'vendor',
    FALSE,
    NOW()
  );

  return p_store_id;
end;
$$;

-- DOWNGRADE STORE TO BASIC PACK
-- ================================
-- RPC function to downgrade a Pro Pack store to Basic Pack
-- Follows the same pattern as upgrade_store_to_pro but for downgrades
create or replace function downgrade_store_to_basic(
  p_store_id uuid,
  p_owner_id uuid,
  p_pack_id uuid
) returns uuid
language plpgsql security definer as $$
declare
  current_user_id uuid;
  user_roles text[];
  store_record record;
  pack_type_val text;
  is_basic_pack boolean := false;
  old_subscription_id uuid;
  plan_type_val text;
  basic_max_announcements integer;
  basic_max_images integer;
  grandfathered_products_count integer;
begin
  -- Debug: Check current user and roles
  current_user_id := auth.uid();
  RAISE NOTICE 'downgrade_store_to_basic called with p_owner_id: %, current_user_id: %, p_store_id: %', p_owner_id, current_user_id, p_store_id;
  
  -- Check if p_owner_id matches current user
  IF p_owner_id != current_user_id THEN
    RAISE EXCEPTION 'Owner ID does not match authenticated user';
  END IF;
  
  -- Get user roles for debugging
  SELECT ARRAY_AGG(role) INTO user_roles
  FROM public.user_roles 
  WHERE user_id = current_user_id;
  
  RAISE NOTICE 'User roles: %', user_roles;
  
  -- Check if user has vendor role
  IF NOT public.has_role(current_user_id, 'vendor') THEN
    RAISE EXCEPTION 'User does not have permission to downgrade stores. Required role: vendor';
  END IF;

  -- Phase 1: Pre-Downgrade Validation
  -- Verify store exists, belongs to user, is approved, and is Pro pack
  SELECT s.id, s.pack_id, s.status, s.owner_id, s.current_announcements, s.current_images, p.type as pack_type
  INTO store_record
  FROM public.stores s
  LEFT JOIN public.packs p ON p.id = s.pack_id
  WHERE s.id = p_store_id AND s.owner_id = p_owner_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Store not found or does not belong to user';
  END IF;

  IF store_record.status != 'approved' THEN
    RAISE EXCEPTION 'Store must be approved before downgrading';
  END IF;

  -- Verify current pack is Pro (not Basic)
  IF store_record.pack_type != 'pro' THEN
    RAISE EXCEPTION 'Store is not on Pro pack. Cannot downgrade.';
  END IF;

  -- Get Basic Pack details
  SELECT p.type, p.max_announcements, p.max_images INTO pack_type_val, basic_max_announcements, basic_max_images
  FROM public.packs p
  WHERE p.id = p_pack_id AND p.is_active = true;

  IF pack_type_val IS NULL THEN
    RAISE EXCEPTION 'Invalid or inactive Basic pack selected';
  END IF;

  -- Verify it's actually a Basic pack
  IF pack_type_val = 'basic' THEN
    is_basic_pack := true;
  ELSE
    RAISE EXCEPTION 'Selected pack is not a Basic pack';
  END IF;

  -- Phase 3: Limit Validation (Warning - logged but not blocking)
  -- Count products that will be grandfathered
  SELECT COUNT(*) INTO grandfathered_products_count
  FROM public.products
  WHERE store_id = p_store_id AND seller_id = p_owner_id AND status = 'approved';

  -- Log warning if exceeds limits (but allow downgrade - grandfathered)
  IF store_record.current_announcements > basic_max_announcements THEN
    RAISE NOTICE 'Warning: Store has % products, Basic plan allows %. Products will remain active (grandfathered).', 
      store_record.current_announcements, basic_max_announcements;
  END IF;

  -- Phase 5: Immediate Downgrade Execution
  -- Update store pack to Basic
  UPDATE public.stores 
  SET pack_id = p_pack_id,
      updated_at = NOW()
  WHERE id = p_store_id;

  -- Phase 7: Subscription History Update
  -- Mark old Pro subscription as ended
  UPDATE public.vendor_subscriptions 
  SET end_date = NOW(), 
      status = 'expired',
      updated_at = NOW()
  WHERE vendor_id = p_owner_id 
    AND status = 'active'
    AND plan_type = 'pro';

  -- Create new Basic subscription
  INSERT INTO public.vendor_subscriptions (vendor_id, plan_type, start_date, end_date, status)
  VALUES (p_owner_id, 'basic', NOW(), NULL, 'active');

  -- Phase 8: Notifications
  -- Create user notification for downgrade
  INSERT INTO public.notifications (
    user_id,
    type,
    template_key,
    metadata,
    link,
    target_role,
    is_read,
    created_at
  ) VALUES (
    p_owner_id,
    'pack_downgraded',
    'notifications.packDowngraded',
    jsonb_build_object(
      'message', format('Your store has been downgraded to Basic pack. %s products remain active (grandfathered).', grandfathered_products_count),
      'store_id', p_store_id,
      'from_pack', 'pro',
      'to_pack', 'basic',
      'downgrade_date', NOW(),
      'grandfathered_products_count', grandfathered_products_count
    ),
    '/subscription',
    'vendor',
    FALSE,
    NOW()
  );

  return p_store_id;
end;
$$;


-- Youcef 1/17/2026 Search

create index if not exists stores_name_idx on public.stores (name);
