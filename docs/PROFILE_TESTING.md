# Profile Page Testing Guide

## Profile Page Features

The profile page allows authenticated users to create and edit their profile information with the following features:

### ✅ **Implemented Features:**

1. **🔐 Authentication Required**
   - Only logged-in users can access `/profile`
   - Automatic redirect to home if not authenticated

2. **📝 Editable Fields**
   - **Full Name**: User's full name (optional, nullable in database)
   - **City**: User's city (optional)
   - **Email**: Display only (cannot be edited)

3. **💾 Data Management**
   - **Auto-load**: Existing profile data is pre-filled
   - **Upsert**: Creates profile if doesn't exist, updates if it does
   - **Real-time**: Local user state updates immediately after save

4. **🎨 User Experience**
   - Clean, modern UI with Tailwind CSS
   - Loading states during save operations
   - Success/error message feedback
   - Form validation

## 🧪 **How to Test:**

### **Step 1: Login**
1. Go to `http://localhost:3000`
2. Click "Login" button
3. Create a new account or login with existing credentials

### **Step 2: Access Profile**
1. Once logged in, click on your avatar (top-right)
2. Select "Profile" from dropdown
3. OR navigate directly to `http://localhost:3000/profile`

### **Step 3: Test Profile Creation**
1. Fill in your **Full Name** (e.g., "John Doe")
2. Fill in your **City** (e.g., "Algiers")  
3. Click "Update Profile"
4. Should see "Profile updated successfully!" message

### **Step 4: Test Profile Editing**
1. Modify your **Full Name** or **City**
2. Click "Update Profile"
3. Refresh the page - data should persist
4. Changes should reflect in user dropdown (shows full name)

### **Step 5: Test Edge Cases**
1. **Empty fields**: Leave Full Name empty - should work (nullable)
2. **Long text**: Try very long names/cities
3. **Special characters**: Test names with accents, Arabic text

## 🔧 **Technical Implementation:**

### **Database Schema:**
```sql
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,              -- Nullable
  role TEXT NOT NULL DEFAULT 'user',
  city TEXT,                   -- Nullable  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Auth Store Method:**
```javascript
const updateProfile = async (profileData) => {
  // Upserts profile data
  // Updates local user state
  // Returns success/error status
}
```

### **Profile Component:**
- `src/views/Profile.vue` - Main profile page
- Reactive form with validation
- Auto-loads existing data on mount
- Handles success/error states

## ✅ **Expected Behavior:**

- ✅ Profile data persists between sessions
- ✅ User display name updates in header after profile save
- ✅ Form validation prevents invalid data
- ✅ Graceful error handling if database issues occur
- ✅ Loading states provide user feedback
- ✅ Clean, responsive UI on all devices

## 🐛 **Troubleshooting:**

If profile save fails:
1. Check browser console for errors
2. Verify profiles table exists in Supabase
3. Ensure RLS policies allow user to insert/update own profile
4. Check Supabase logs in dashboard

The profile functionality is now complete and ready for use! 🎉
