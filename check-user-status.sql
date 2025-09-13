-- Check user status and email confirmation
-- Run this in your Supabase SQL Editor

-- Check auth.users table for the user
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at,
    raw_user_meta_data,
    raw_app_meta_data
FROM auth.users 
WHERE email = 'yacinkh60@gmail.com';

-- Check profiles table for the user
SELECT 
    id,
    full_name,
    role,
    city,
    created_at,
    updated_at
FROM public.profiles 
WHERE id = (
    SELECT id FROM auth.users WHERE email = 'yacinkh60@gmail.com'
);

-- Check if there are any verification records
SELECT 
    id,
    user_id,
    verification_type,
    status,
    created_at
FROM public.verifications 
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'yacinkh60@gmail.com'
);
