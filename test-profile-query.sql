-- Test profile query directly
-- Run this in Supabase SQL Editor to test if the profile query works

-- Test the exact query that the app is trying to run
SELECT 
    id, 
    full_name, 
    role, 
    city
FROM public.profiles 
WHERE id = 'a25a905e-1d74-4a52-ae8d-c20e7ce4b4c6';

-- Also test with a simpler query
SELECT * FROM public.profiles WHERE id = 'a25a905e-1d74-4a52-ae8d-c20e7ce4b4c6';

-- Check if there are any RLS issues
SELECT current_user, session_user;

-- Check RLS policies on profiles table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
