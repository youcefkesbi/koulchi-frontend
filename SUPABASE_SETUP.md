# Supabase Setup Guide for Koulchi Frontend

## 🚨 Critical: Fix "Database error saving new user" 

This error occurs due to Supabase configuration issues. Follow these steps:

### 1. Disable Email Confirmation

In your Supabase Dashboard:
1. Go to **Authentication** → **Settings**
2. Scroll to **Email Confirmations**
3. **UNCHECK** "Enable email confirmations"
4. Click **Save**

### 2. Configure Auth Settings

In **Authentication** → **Settings**:
- **Site URL**: `http://localhost:3000` (for development)
- **Redirect URLs**: Add `http://localhost:3000/auth/callback`

### 3. Run Database Setup

Execute this SQL in your Supabase SQL Editor:

```sql
-- 1. Ensure profiles table exists with correct structure
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    city TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 4. Create proper RLS policies
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. Grant permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- 6. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_profiles_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_profiles_updated_at_column();
```

### 4. Environment Variables

Create a `.env` file in your project root (if it doesn't exist):

```bash
# Create .env file
touch .env
```

Add your Supabase credentials to the `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://dngrxmydwffmfkgtivyh.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

**To find your Supabase credentials:**
1. Go to your Supabase Dashboard
2. Click on **Settings** → **API**
3. Copy the **Project URL** and **anon/public key**
4. Replace `your_actual_anon_key_here` with your real anon key

**Important:** 
- Never commit your `.env` file to git (it's already in `.gitignore`)
- The URL above is already correct for your project
- Only replace the anon key with your actual key

### 5. Test Signup

After completing these steps:
1. Restart your dev server: `npm run dev`
2. Try creating a new account
3. Check browser console for detailed logs

### 6. Debugging

If you still get errors, check:
- Browser Network tab for exact error response
- Supabase Logs in Dashboard → Logs
- Console output for detailed error messages

### Common Issues:

**"User already registered"**: User exists, try logging in instead
**"Database error saving new user"**: Email confirmation still enabled
**"Invalid email"**: Check email format
**"Password too short"**: Must be 6+ characters

### Testing Tool

Open `supabase-debug.html` in browser to test basic auth functionality independently.
