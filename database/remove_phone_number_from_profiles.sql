-- Migration: Remove phone_number column from profiles table
-- This script removes the phone_number field since we'll use auth.users.phone instead

-- Remove phone_number column from profiles table
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS phone_number;

-- Verify the column was removed
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Show final table structure
SELECT 
    'profiles' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
