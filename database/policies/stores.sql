-- RLS Policies for stores table

-- Enable Row Level Security
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "users can insert their own store" ON stores;
DROP POLICY IF EXISTS "users can update their own store" ON stores;
DROP POLICY IF EXISTS "users can delete their own store" ON stores;
DROP POLICY IF EXISTS "everyone can view stores" ON stores;
DROP POLICY IF EXISTS "users can view own stores" ON stores;
DROP POLICY IF EXISTS "employees can view all stores" ON stores;
DROP POLICY IF EXISTS "employees can update store status" ON stores;

-- Users can insert their own store
CREATE POLICY "users can insert their own store"
ON stores
FOR insert
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Users can update their own store (only if pending or approved)
CREATE POLICY "users can update their own store"
ON stores
FOR update
TO authenticated
USING (owner_id = auth.uid() AND status IN ('pending', 'approved'))
WITH CHECK (owner_id = auth.uid());

-- Users can delete their own store (only if pending)
CREATE POLICY "users can delete their own store"
ON stores
FOR delete
TO authenticated
USING (owner_id = auth.uid() AND status = 'pending');

-- Everyone can view approved stores
CREATE POLICY "everyone can view approved stores"
ON stores
FOR select
TO public
USING (status = 'approved');

-- Users can view their own stores regardless of status
CREATE POLICY "users can view own stores"
ON stores
FOR select
TO authenticated
USING (owner_id = auth.uid());

-- Employees and admins can view all stores
CREATE POLICY "employees can view all stores"
ON stores
FOR select
TO authenticated
USING (auth.jwt()->>'role' IN ('admin', 'employee'));

-- Employees and admins can update store status
CREATE POLICY "employees can update store status"
ON stores
FOR update
TO authenticated
USING (auth.jwt()->>'role' IN ('admin', 'employee'));
