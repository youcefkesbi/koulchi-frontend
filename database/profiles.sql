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
  user_role_text TEXT;
  user_role_value user_role;
BEGIN
  -- Fetch the role from app_metadata in auth.users
  SELECT raw_app_meta_data->>'role'
  INTO user_role_text
  FROM auth.users
  WHERE id = new.id;

  -- Default to "user" if role is null or empty
  IF user_role_text IS NULL OR user_role_text = '' THEN
    user_role_text := 'user';
  END IF;

  -- Convert text to enum, with fallback to 'user' if invalid
  BEGIN
    user_role_value := user_role_text::user_role;
  EXCEPTION
    WHEN invalid_text_representation THEN
      user_role_value := 'user';
  END;

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

-- Function to manually set user role (for testing/admin purposes)
CREATE OR REPLACE FUNCTION public.set_user_role(user_email TEXT, new_role user_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update auth.users metadata
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(new_role::text)
  )
  WHERE id = user_id;
  
  -- Update or insert profile
  INSERT INTO profiles (id, role)
  VALUES (user_id, new_role)
  ON CONFLICT (id) 
  DO UPDATE SET role = new_role;
  
  RETURN TRUE;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.set_user_role TO authenticated;
