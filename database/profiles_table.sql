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

-- Automatically create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            ''
        )
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================
-- Permissions
-- ================================
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO postgres, anon, authenticated, service_role;

