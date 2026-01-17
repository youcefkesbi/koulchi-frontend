-- Step 1: Create the new user_roles table
-- ================================
-- User Roles Table
-- ================================

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin','employee','vendor','customer')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Status column moved to profiles table
-- ALTER TABLE public.user_roles ADD COLUMN status TEXT CHECK (status IN ('active', 'suspended', 'deleted')) DEFAULT 'active';
-- ================================
-- Indexes
-- ================================
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS user_roles_role_idx ON public.user_roles(role);

-- ================================
-- Policies
-- ================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Admin can manage all user_roles - DEBUG VERSION
DROP POLICY IF EXISTS "Admin can manage all user_roles" ON public.user_roles;
CREATE POLICY "Admin can manage all user_roles"
ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ================================
-- Grants
-- ================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- ================================
-- Triggers
-- ================================

CREATE TRIGGER set_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- Debug Functions
-- ================================

-- Create a comprehensive debug function
CREATE OR REPLACE FUNCTION public.debug_admin_permissions()
RETURNS TABLE (
    check_type TEXT,
    result TEXT,
    details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
    profile_exists BOOLEAN;
    user_roles_count INTEGER;
    admin_role_exists BOOLEAN;
    admin_status TEXT;
    has_role_result BOOLEAN;
    rls_policy_result BOOLEAN;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Check if user has a profile
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = current_user_id) INTO profile_exists;
    
    -- Count user roles
    SELECT COUNT(*) INTO user_roles_count FROM user_roles WHERE user_id = current_user_id;
    
    -- Check admin role existence and status
    SELECT 
        EXISTS(SELECT 1 FROM user_roles WHERE user_id = current_user_id AND role = 'admin'),
        COALESCE((SELECT p.status FROM profiles p WHERE p.id = current_user_id), 'NO_PROFILE')
    INTO admin_role_exists, admin_status;
    
    -- Test has_role function
    SELECT public.has_role(current_user_id, 'admin') INTO has_role_result;
    
    -- Test RLS policy logic
    SELECT EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN profiles p ON p.id = ur.user_id
        WHERE ur.user_id = current_user_id 
        AND ur.role = 'admin'
        AND p.status = 'active'
    ) INTO rls_policy_result;
    
    -- Return debug information
    RETURN QUERY SELECT 'Current User ID'::TEXT, COALESCE(current_user_id::TEXT, 'NULL')::TEXT, 'auth.uid() result'::TEXT;
    RETURN QUERY SELECT 'Profile Exists'::TEXT, profile_exists::TEXT, 'Does user have profile record?'::TEXT;
    RETURN QUERY SELECT 'User Roles Count'::TEXT, user_roles_count::TEXT, 'Number of roles in user_roles table'::TEXT;
    RETURN QUERY SELECT 'Admin Role Exists'::TEXT, admin_role_exists::TEXT, 'Does admin role exist?'::TEXT;
    RETURN QUERY SELECT 'Admin Status'::TEXT, admin_status::TEXT, 'Status of admin role'::TEXT;
    RETURN QUERY SELECT 'has_role() Result'::TEXT, has_role_result::TEXT, 'has_role(auth.uid(), admin) result'::TEXT;
    RETURN QUERY SELECT 'RLS Policy Test'::TEXT, rls_policy_result::TEXT, 'RLS policy logic test'::TEXT;
    
    -- Additional checks
    RETURN QUERY SELECT 'All User Roles'::TEXT, 
        COALESCE((SELECT array_agg(role)::TEXT FROM user_roles WHERE user_id = current_user_id), 'NONE')::TEXT,
        'All roles for current user'::TEXT;
    
    RETURN QUERY SELECT 'User Profile Status'::TEXT,
        COALESCE((SELECT p.status::TEXT FROM profiles p WHERE p.id = current_user_id), 'NO_PROFILE')::TEXT,
        'Status from profiles table for current user'::TEXT;
END;
$$;

-- Create a function to test pack update with detailed error reporting
CREATE OR REPLACE FUNCTION public.test_pack_update(
    test_pack_id UUID,
    test_name_en TEXT
)
RETURNS TABLE (
    step TEXT,
    success BOOLEAN,
    error_message TEXT,
    details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
    has_admin_role BOOLEAN;
    update_result RECORD;
BEGIN
    current_user_id := auth.uid();
    
    -- Step 1: Check authentication
    IF current_user_id IS NULL THEN
        RETURN QUERY SELECT 'Authentication'::TEXT, FALSE::BOOLEAN, 'No authenticated user'::TEXT, 'auth.uid() returned NULL'::TEXT;
        RETURN;
    ELSE
        RETURN QUERY SELECT 'Authentication'::TEXT, TRUE::BOOLEAN, 'User authenticated'::TEXT, current_user_id::TEXT;
    END IF;
    
    -- Step 2: Check admin role
    SELECT public.has_role(current_user_id, 'admin') INTO has_admin_role;
    IF NOT has_admin_role THEN
        RETURN QUERY SELECT 'Admin Role Check'::TEXT, FALSE::BOOLEAN, 'User does not have admin role'::TEXT, 'has_role() returned false'::TEXT;
        RETURN;
    ELSE
        RETURN QUERY SELECT 'Admin Role Check'::TEXT, TRUE::BOOLEAN, 'User has admin role'::TEXT, 'has_role() returned true'::TEXT;
    END IF;
    
    -- Step 3: Test pack update
    BEGIN
        UPDATE public.packs 
        SET name_en = test_name_en 
        WHERE id = test_pack_id;
        
        IF FOUND THEN
            RETURN QUERY SELECT 'Pack Update'::TEXT, TRUE::BOOLEAN, 'Update successful'::TEXT, 'Pack updated successfully'::TEXT;
        ELSE
            RETURN QUERY SELECT 'Pack Update'::TEXT, FALSE::BOOLEAN, 'No rows updated'::TEXT, 'Pack with ID not found'::TEXT;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'Pack Update'::TEXT, FALSE::BOOLEAN, SQLERRM::TEXT, 'Exception during update'::TEXT;
    END;
    
END;
$$;

-- Create a debug version of the has_role function with logging
CREATE OR REPLACE FUNCTION public.has_role_debug(check_user uuid, check_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    result BOOLEAN;
    role_count INTEGER;
BEGIN
    -- Log the function call
    RAISE NOTICE 'has_role_debug called with user_id: %, role: %', check_user, check_role;
    
    -- Check if user exists in user_roles
    SELECT COUNT(*) INTO role_count FROM user_roles WHERE user_id = check_user;
    RAISE NOTICE 'User has % roles in user_roles table', role_count;
    
    -- Check for specific role
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = check_user AND role = check_role
    ) INTO result;
    
    RAISE NOTICE 'has_role_debug result: %', result;
    RETURN result;
END;
$function$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.debug_admin_permissions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_pack_update(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role_debug(UUID, TEXT) TO authenticated;

-- Youcef 1/17/26

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'customer');

  return new;
end;
$$ language plpgsql security definer;

-- not run yet
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- user_roles now depends on auth.users table instead of profiles
alter table public.user_roles
add constraint user_roles_user_id_fkey
foreign key (user_id) references auth.users(id) on delete cascade;