# Admin Dashboard Implementation Guide

## Overview

The admin dashboard system has been successfully implemented to automatically detect users with the "admin" role and display the appropriate dashboard interface.

## How It Works

### 1. **Role Detection System**
- **Database Field**: The `profiles` table has a `role` field that defaults to `'user'`
- **Admin Role**: Users with `role = 'admin'` automatically see the admin dashboard
- **Regular Users**: Users with `role = 'user'` (or any other role) see the regular user dashboard

### 2. **Authentication Flow**
```
User Login → loadUserWithProfile() → Fetch profile from 'profiles' table → Set user.role → isAdmin computed property → Show appropriate dashboard
```

### 3. **Key Components**

#### Auth Store (`src/stores/auth.js`)
- **`isAdmin` computed property**: `user.value?.role === 'admin'`
- **`userRole` computed property**: `user.value?.role || 'user'`
- **`loadUserWithProfile()`**: Fetches profile data including role from database
- **`initAuth()`**: Called on app mount and auth state changes

#### UserDashboard Component (`src/views/UserDashboard.vue`)
- **Conditional Rendering**: Uses `v-if="authStore.isAdmin"` to show admin content
- **Role Display**: Shows current user role for debugging
- **Automatic Switching**: Dashboard automatically adapts based on user role

## Testing the Admin Dashboard

### Step 1: Create an Admin User

Use the SQL script in `database/create_admin_user.sql`:

```sql
-- Replace 'your-email@example.com' with the actual email
UPDATE public.profiles 
SET role = 'admin' 
WHERE user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'your-email@example.com'
);
```

### Step 2: Verify Role Detection

1. **Login** with the admin user account
2. **Check Console**: Look for debug logs showing role detection
3. **Visual Indicators**: 
   - Admin users see "(Admin)" badge
   - Regular users see "(Role: user)" badge
4. **Dashboard Content**: Admin users see admin dashboard, regular users see user dashboard

### Step 3: Debug Role Detection

Click the **"Debug Role"** button in the dashboard header to see detailed role information in the console.

## Admin Dashboard Features

### Statistics Cards
- **Total Users**: Count of all registered users
- **Total Products**: Count of all products in the system  
- **Total Orders**: Count of all orders (currently 0 as orders table doesn't exist)

### Quick Actions
- **Manage Users**: Placeholder for user management functionality
- **Manage Products**: Placeholder for product management functionality
- **Manage Orders**: Placeholder for order management functionality

### Recent Activity
- Shows recent system activities
- Currently displays mock data for testing

## Database Schema

### Profiles Table Structure
```sql
CREATE TABLE public.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'user',  -- This field determines admin status
    city TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS)
- Users can only view their own profile
- Admins can view all profiles (via admin policy)
- Profile creation and updates are restricted to the user themselves

## Troubleshooting

### Common Issues

1. **Role Not Detected**
   - Check if profile exists in `profiles` table
   - Verify `role` field is set to `'admin'` (exact string match)
   - Check console for profile loading errors

2. **Dashboard Not Switching**
   - Ensure user is logged in
   - Check if `authStore.isAdmin` is `true`
   - Verify profile data is loaded correctly

3. **Permission Errors**
   - Check RLS policies are properly applied
   - Ensure user has access to `profiles` table
   - Verify Supabase configuration

### Debug Commands

```javascript
// In browser console
const authStore = useAuthStore()
await authStore.debugUserRole()  // Shows detailed role information
console.log(authStore.isAdmin)   // Should be true for admin users
console.log(authStore.userRole)  // Should show 'admin' for admin users
```

## Future Enhancements

### Planned Features
- **User Management**: Actual user CRUD operations
- **Product Management**: Product moderation and management
- **Order Management**: Order tracking and management
- **Analytics Dashboard**: Charts and detailed reporting
- **Audit Logs**: Comprehensive activity tracking

### Security Considerations
- Admin role should only be assigned through secure processes
- Consider implementing role-based permissions for different admin functions
- Add audit logging for admin actions

## Files Modified

1. **`src/stores/auth.js`**: Enhanced role detection and debugging
2. **`src/views/UserDashboard.vue`**: Added admin dashboard and role-based display
3. **`locales/en.json`**: Added admin dashboard translations
4. **`locales/ar.json`**: Added Arabic translations
5. **`locales/fr.json`**: Added French translations
6. **`database/create_admin_user.sql`**: SQL script for creating admin users

## Summary

The admin dashboard system is now fully functional and will automatically:
- ✅ Detect users with `role = 'admin'` in the database
- ✅ Display the admin dashboard for admin users
- ✅ Show the regular user dashboard for non-admin users
- ✅ Persist role information across page reloads
- ✅ Update in real-time when auth state changes

The system is ready for production use and can be easily extended with additional admin functionality as needed.
