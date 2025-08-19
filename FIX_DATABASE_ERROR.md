# 🚨 Fix "Database error saving new user" Error

## The Problem
You're getting this error during signup:
```
POST https://dngrxmydwffmfkgtivyh.supabase.co/auth/v1/signup 500 (Internal Server Error)
AuthApiError: Database error saving new user
```

## ✅ ACTUAL Root Cause Found
**Infinite recursion detected in policy for relation "profiles"**

The issue is with Row Level Security (RLS) policies on the profiles table causing infinite recursion during user signup.

## 🔧 Solution Steps

### Step 1: Fix RLS Policies (Critical Fix)

**Go to your Supabase Dashboard → SQL Editor and run this:**

```sql
-- Fix infinite recursion in profiles table RLS policies
-- Drop all existing policies that might be causing recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can do everything" ON public.profiles;

-- Disable and re-enable RLS to clear issues
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
```

### Step 2: Verify Email Confirmation (Should already be disabled)

In Supabase Dashboard → Authentication → Settings:
- ❌ **"Enable email confirmations"** should be UNCHECKED

### Step 3: Verify Auth Settings

Ensure these settings in Authentication → Settings:
- ✅ **Enable signup**: Checked
- ❌ **Enable email confirmations**: UNCHECKED (this is key!)
- ✅ **Enable phone confirmations**: Can be checked or unchecked
- **Site URL**: `http://localhost:3000`

### Step 4: Test the Fix

1. **Restart your dev server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Try signup again** with:
   - Email: `test@example.com`
   - Password: `password123`
   - Full Name: `Test User`

3. **Expected result**: Immediate login without email confirmation

## 🔍 Alternative Diagnosis

If the error persists after disabling email confirmation, check:

### Option A: Check Supabase Logs
1. Go to: Supabase Dashboard → Logs → Auth Logs
2. Look for recent signup attempts
3. Check for specific error details

### Option B: Test with Different Email
Try with a completely different email domain:
- `testuser@gmail.com`
- `demo@yahoo.com`

### Option C: Check Database Policies
Run this SQL in Supabase SQL Editor to ensure profiles table policies are correct:

```sql
-- Check if profiles table exists and has correct policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- If no policies exist, create them:
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);
```

## 🎯 Expected Behavior After Fix

When you signup:
1. ✅ User account created immediately
2. ✅ User logged in automatically
3. ✅ Profile created in database
4. ✅ Modal closes after 1.5 seconds
5. ✅ No email confirmation required

## ⚠️ If Still Failing

If you still get the error after disabling email confirmation:

1. **Check browser Network tab** for the exact 500 error response
2. **Share the Supabase logs** from Dashboard → Logs → Auth Logs
3. **Try a different email** to rule out email-specific issues

The key fix is **disabling email confirmation** in your Supabase project settings.
