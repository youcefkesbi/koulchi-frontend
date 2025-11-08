-- ================================
-- Profiles table structure for Supabase
-- ================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    shipping_address TEXT,
    phone_num TEXT,
    status TEXT CHECK (status IN ('active', 'suspended', 'deleted')) DEFAULT 'active',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- Indexes
-- ================================
CREATE INDEX IF NOT EXISTS profiles_full_name_idx ON public.profiles(full_name);

-- ================================
-- Policies
-- ================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Admin can manage all profiles
CREATE POLICY "Admin can manage all profiles"
ON public.profiles FOR ALL TO authenticated
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
-------- SELECT --------
-- Customer and vendor can view their own profile
CREATE POLICY "Customer and vendor can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (
    id = auth.uid() AND EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('customer','vendor')
    )
);

-- Employee can view all profiles
CREATE POLICY "Employee can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'employee'
    )
);

-------- UPDATE --------
-- Customer and vendor can update their profiles --
CREATE POLICY "Customer and vendor can update own profile"
ON public.profiles FOR UPDATE TO authenticated
WITH CHECK (
    id = auth.uid() AND EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('customer','vendor')
    )
)
USING (
    id = auth.uid() AND EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('customer','vendor')
    )
)
-- Employee can update all profiles limited --
CREATE POLICY "Employee can update all profiles"
ON public.profiles FOR UPDATE TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'employee'
    )
)
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'employee'
    )
);

-- ================================
-- Triggers
-- ================================
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ================================
-- Functions
-- ================================

CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_profiles_updated_at();

-- ================================
-- Permissions
-- ================================
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO postgres, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_all_users_for_admin()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    full_name TEXT,
    roles TEXT,
    store_names TEXT,
    account_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH user_stores AS (
        SELECT 
            s.owner_id,
            s.name,
            s.status,
            pack.price,
            ROW_NUMBER() OVER (
                PARTITION BY s.owner_id 
                ORDER BY 
                    CASE 
                        WHEN s.status = 'approved' THEN 1
                        WHEN s.status = 'suspended' THEN 2
                        WHEN s.status = 'pending' THEN 3
                        WHEN s.status = 'rejected' THEN 4
                        ELSE 5
                    END
            ) as rn
        FROM public.stores s
        LEFT JOIN public.packs pack ON s.pack_id = pack.id
    )
    SELECT 
        au.id as user_id,
        au.email::TEXT,
        COALESCE(p.full_name, 'No Name')::TEXT as full_name,
        COALESCE(
            STRING_AGG(DISTINCT ur.role, E'\n'), 
            'customer'
        )::TEXT as roles,
        COALESCE(
            CASE 
                WHEN us.name IS NOT NULL AND us.name != '' AND us.price > 0 THEN us.name
                WHEN us.name IS NOT NULL AND us.name != '' AND us.price = 0 THEN 'Basic Pack Store'
                WHEN us.owner_id IS NOT NULL AND us.price = 0 THEN 'Basic Pack Store'
                ELSE '-'
            END, 
            '-'
        )::TEXT as store_names,
        COALESCE(p.status, 'active')::TEXT as account_status
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    LEFT JOIN public.user_roles ur ON p.id = ur.user_id
    LEFT JOIN user_stores us ON p.id = us.owner_id AND us.rn = 1
    WHERE au.deleted_at IS NULL
    GROUP BY au.id, au.email, p.full_name, au.banned_until, au.deleted_at, us.name, us.price, us.owner_id
    ORDER BY au.email;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_all_users_for_admin() TO authenticated;

-- Add status column to existing profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'suspended', 'deleted')) DEFAULT 'active';

-- Update existing profiles to have active status if they don't have one