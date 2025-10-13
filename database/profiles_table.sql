-- ================================
-- Profiles table structure for Supabase
-- ================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    city TEXT,
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
    SELECT 
        au.id as user_id,
        au.email::TEXT,
        COALESCE(p.full_name, 'No Name')::TEXT as full_name,
        COALESCE(
            STRING_AGG(DISTINCT ur.role, E'\n'), 
            'customer'
        )::TEXT as roles,
        COALESCE(
            STRING_AGG(DISTINCT 
                CASE 
                    WHEN s.name IS NOT NULL AND s.name != '' THEN s.name
                    ELSE 'Basic Pack Store'
                END, E'\n'), 
            '-'
        )::TEXT as store_names,
        CASE 
            WHEN au.banned_until IS NOT NULL AND au.banned_until > NOW() THEN 'suspended'::TEXT
            WHEN au.deleted_at IS NOT NULL THEN 'inactive'::TEXT
            ELSE 'active'::TEXT
        END as account_status
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    LEFT JOIN public.user_roles ur ON p.id = ur.user_id
    LEFT JOIN public.stores s ON p.id = s.owner_id
    WHERE au.deleted_at IS NULL
    GROUP BY au.id, au.email, p.full_name, au.banned_until, au.deleted_at
    ORDER BY au.email;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_all_users_for_admin() TO authenticated;