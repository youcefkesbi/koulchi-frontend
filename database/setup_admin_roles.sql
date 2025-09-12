-- Setup admin roles for testing
-- Run this script to set up admin and employee roles

-- Set admin role for specific email
SELECT public.set_user_role('ykesbi@gmail.com', 'admin');

-- You can also set other users as admin or employee
-- SELECT public.set_user_role('admin@example.com', 'admin');
-- SELECT public.set_user_role('employee@example.com', 'employee');

-- Check current user roles
SELECT 
  u.email,
  u.raw_app_meta_data->>'role' as auth_role,
  p.role as profile_role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email IN ('ykesbi@gmail.com', 'admin@example.com', 'employee@example.com');
