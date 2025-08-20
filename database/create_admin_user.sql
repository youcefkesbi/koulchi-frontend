-- SQL script to create an admin user for testing
-- Replace 'your-email@example.com' with the actual email of the user you want to make admin

-- Option 1: Update existing user to admin role
UPDATE public.profiles 
SET role = 'admin' 
WHERE user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'your-email@example.com'
);

-- Option 2: If you want to see all current users and their roles
SELECT 
    u.email,
    p.role,
    p.full_name,
    p.city,
    p.updated_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
ORDER BY p.updated_at DESC;

-- Option 3: Check if any users currently have admin role
SELECT 
    u.email,
    p.role,
    p.full_name
FROM auth.users u
JOIN public.profiles p ON u.id = p.user_id
WHERE p.role = 'admin';
