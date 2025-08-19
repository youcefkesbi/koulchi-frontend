-- Fix infinite recursion in profiles table RLS policies
-- This is causing the "Database error saving new user" issue

-- 1. Drop all existing policies that might be causing recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can do everything" ON public.profiles;

-- 2. Disable RLS temporarily to clear any issues
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create simple, non-recursive policies
-- Policy for SELECT (viewing profiles)
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy for INSERT (creating profiles)
CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE (updating profiles)
CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy for DELETE (deleting profiles)
CREATE POLICY "profiles_delete_policy" ON public.profiles
    FOR DELETE 
    USING (auth.uid() = user_id);

-- 5. Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- 6. Test the fix by checking policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';
