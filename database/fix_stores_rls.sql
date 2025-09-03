-- Fix Row Level Security for stores table
-- This script enables RLS and ensures proper policies are in place

-- 1. Enable Row Level Security on stores table
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "users can insert their own store" ON public.stores;
DROP POLICY IF EXISTS "users can update their own store" ON public.stores;
DROP POLICY IF EXISTS "users can delete their own store" ON public.stores;
DROP POLICY IF EXISTS "everyone can view stores" ON public.stores;

-- 3. Create clean, working RLS policies

-- Policy for INSERT: Users can only insert stores with their own owner_id
CREATE POLICY "users can insert their own store"
ON public.stores
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Policy for UPDATE: Users can only update their own stores
CREATE POLICY "users can update their own store"
ON public.stores
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Policy for DELETE: Users can only delete their own stores
CREATE POLICY "users can delete their own store"
ON public.stores
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Policy for SELECT: Everyone can view all stores (public read access)
CREATE POLICY "everyone can view stores"
ON public.stores
FOR SELECT
TO public
USING (true);

-- 4. Verify the policies are working
-- This query should show the enabled RLS and policies
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'stores' AND schemaname = 'public') as policy_count
FROM pg_tables 
WHERE tablename = 'stores' AND schemaname = 'public';

-- 5. Show all policies for the stores table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'stores' AND schemaname = 'public'
ORDER BY policyname;