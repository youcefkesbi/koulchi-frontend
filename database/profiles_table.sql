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
