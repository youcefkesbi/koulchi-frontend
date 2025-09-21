-- Complete Profiles table structure for Supabase
-- This table stores user profile information

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    city TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clean minimal policies

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to select their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile"
ON profiles
FOR DELETE
USING (auth.uid() = id);

-- Admins full access (using JWT metadata)
create policy "Admins full access"
on profiles
for all
using (auth.jwt()->>'role' = 'admin');

-- RLS Policies for profiles table

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Admins full access" ON profiles;

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to select their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile"
ON profiles
FOR DELETE
USING (auth.uid() = id);

-- Admins and employees can view all profiles
CREATE POLICY "Admins and employees can view all profiles"
ON profiles
FOR SELECT
USING (auth.jwt()->>'role' IN ('admin', 'employee'));

-- Admins can manage all profiles
CREATE POLICY "Admins can manage all profiles"
ON profiles
FOR ALL
USING (auth.jwt()->>'role' = 'admin');
