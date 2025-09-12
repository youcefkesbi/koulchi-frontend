-- Profiles table with user_role enum
-- This table stores user profile information

-- Create user_role enum type
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'employee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'user',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to sync role from auth.users into profiles.role
CREATE OR REPLACE FUNCTION public.sync_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_value user_role;
BEGIN
  -- Fetch the role from app_metadata in auth.users
  SELECT (raw_app_meta_data->>'role')::user_role
  INTO user_role_value
  FROM auth.users
  WHERE id = new.id;

  -- Default to "user" if role is null
  IF user_role_value IS NULL THEN
    user_role_value := 'user';
  END IF;

  -- Set the role column
  new.role := user_role_value;

  RETURN new;
END;
$$;

-- Create trigger for role sync
DROP TRIGGER IF EXISTS sync_profile_role_trigger ON profiles;
CREATE TRIGGER sync_profile_role_trigger
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_role();
