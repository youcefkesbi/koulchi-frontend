-- Migration: Add phone_number column to profiles table
-- This script adds the phone_number field to store user phone numbers

-- Add phone_number column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add comment to document the new column
COMMENT ON COLUMN public.profiles.phone_number IS 'User phone number (optional)';

-- Update existing profiles to have empty phone_number if not set
UPDATE public.profiles 
SET phone_number = '' 
WHERE phone_number IS NULL;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'phone_number';
