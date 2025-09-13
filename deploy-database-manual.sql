-- Manual Database Deployment Script
-- Copy and paste this into your Supabase SQL Editor

-- 1. Create user_role enum type
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'employee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'user',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add city column if it doesn't exist (in case the app expects it)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'city') THEN
        ALTER TABLE public.profiles ADD COLUMN city TEXT;
    END IF;
END $$;

-- 3. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Admins full access" ON profiles;
DROP POLICY IF EXISTS "Admins and employees can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

-- 5. Create RLS policies
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
ON profiles
FOR DELETE
USING (auth.uid() = id);

CREATE POLICY "Admins and employees can view all profiles"
ON profiles
FOR SELECT
USING (auth.jwt()->>'role' IN ('admin', 'employee'));

CREATE POLICY "Admins can manage all profiles"
ON profiles
FOR ALL
USING (auth.jwt()->>'role' = 'admin');

-- 6. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Add updated_at trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert a new profile for the user
  INSERT INTO public.profiles (id, full_name, role, city)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      ''
    ),
    'user'::user_role,
    COALESCE(NEW.raw_user_meta_data->>'city', '')
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 9. Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;

-- 11. Test the setup
SELECT 'Database schema deployed successfully!' as status;
