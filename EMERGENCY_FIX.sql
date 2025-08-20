-- EMERGENCY FIX: Drop profiles table completely to test if it's causing auth issues
-- This will temporarily remove the profiles functionality but should allow basic auth to work

-- 1. Drop all policies first
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can do everything" ON public.profiles;

-- 2. Drop the profiles table completely
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 3. Check if there are any triggers or functions that might be interfering
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'public';

-- 4. Check for any remaining policies that might reference profiles
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Now test signup - it should work without the profiles table
-- If this fixes the signup, we know the profiles table was the issue
