# Profile System - Phone Number Removed

This document describes the updated profile system after removing the `phone_number` column from the profiles table and using `auth.users.phone` as the single source of truth for user phone numbers.

## Changes Made

### **1. Database Changes**
- ❌ **Removed**: `phone_number` column from `profiles` table
- ✅ **Uses**: `auth.users.phone` as single source of truth
- ✅ **Migration**: Script provided to remove the column

### **2. Frontend Updates**
- **Profile.vue**: Phone field now sources from `auth.users.phone`
- **useProfile.js**: Removed phone_number handling
- **auth.js**: Simplified profile loading without phone_number
- **Layout**: Maintained 2-column grid for personal info

### **3. Translation Updates**
- **Removed**: `profile.phoneNumber*` keys
- **Added**: `profile.phone*` keys for basic phone field
- **Updated**: All locale files (en, fr, ar)

## Database Schema

### **Profiles Table Structure (Updated)**
```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,           -- Optional user full name
    role TEXT NOT NULL DEFAULT 'user',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Auth Users Table (Source for Phone)**
```sql
-- auth.users table contains the phone field
-- This is managed by Supabase Auth system
-- Users can update their phone through account settings
```

## Migration Required

### **Remove phone_number Column**
Run this script to remove the phone_number column:
```sql
\i database/remove_phone_number_from_profiles.sql
```

### **Verify Migration**
The script will:
1. Remove the `phone_number` column
2. Show the updated table structure
3. Confirm the column was removed

## Frontend Implementation

### **Profile.vue Component Structure**
```vue
<template>
  <form @submit.prevent="handleUpdateProfile">
    <!-- Personal Information Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Full Name (Optional) -->
      <div>
        <label>{{ $t('profile.fullName') }}</label>
        <input v-model="profileForm.fullName" type="text" />
        <p class="text-xs text-gray-500">{{ $t('profile.fullNameNote') }}</p>
      </div>

      <!-- Phone Number (from auth.users) -->
      <div>
        <label>{{ $t('profile.phone') }}</label>
        <input v-model="profileForm.phone" type="tel" />
        <p class="text-xs text-gray-500">{{ $t('profile.phoneNote') }}</p>
      </div>
    </div>

    <!-- Contact Information Section -->
    <div>
      <!-- Email (Read-only from auth.users) -->
      <div>
        <label>{{ $t('profile.email') }}</label>
        <input v-model="profileForm.email" type="email" disabled />
        <p class="text-xs text-gray-500">{{ $t('profile.emailNote') }}</p>
      </div>
    </div>

    <button type="submit" :disabled="loading">
      {{ $t('profile.updateProfile') }}
    </button>
  </form>
</template>
```

### **Profile Form Data Structure**
```javascript
const profileForm = reactive({
  fullName: '',      // From profiles.full_name
  phone: '',         // From auth.users.phone (read-only)
  email: ''          // From auth.users.email (read-only)
})
```

## Data Flow

### **1. Profile Loading**
```javascript
// Load user profile data
const loadProfile = async () => {
  try {
    if (authStore.user) {
      // Get profile from database (only full_name)
      const profile = await getProfile()
      
      if (profile) {
        profileForm.fullName = profile.full_name || ''
      }
      
      // Phone and email from auth store (auth.users)
      profileForm.phone = authStore.user.phone || ''
      profileForm.email = authStore.user.email || ''
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  }
}
```

### **2. Profile Updates**
```javascript
// Update profile (only full_name)
const handleUpdateProfile = async () => {
  try {
    const result = await updateProfile({
      full_name: profileForm.fullName
    })

    if (result) {
      successMessage.value = 'Profile updated successfully!'
    }
  } catch (error) {
    errorMessage.value = error.message
  }
}
```

### **3. Phone Number Management**
```javascript
// Phone number is NOT updated through profile updates
// It's managed by Supabase Auth system
// Users must update phone through account settings

// Display only - no editing capability
profileForm.phone = authStore.user.phone || ''
```

## Supabase Integration

### **Profile Operations**
```javascript
// Load profile (only full_name, role)
const profile = await getProfile() // Selects: id, full_name, role, updated_at

// Update profile (only full_name)
await updateProfile({
  full_name: profileForm.fullName
})

// Create profile during signup (no phone_number)
await createProfile({
  id: userId,
  full_name: userData.full_name,
  role: 'user'
})
```

### **Phone Number Source**
```javascript
// Phone comes from auth store (auth.users.phone)
// This is managed by Supabase Auth, not profiles table
const phone = authStore.user.phone

// No direct database operations on phone field
// Users must use Supabase Auth methods to update phone
```

## Translation Keys

### **English (en.json)**
```json
{
  "profile.fullName": "Full Name",
  "profile.fullNamePlaceholder": "Enter your full name",
  "profile.fullNameNote": "Full name is optional",
  "profile.phone": "Phone",
  "profile.phonePlaceholder": "Enter your phone number",
  "profile.phoneNote": "Phone number is managed by your account settings",
  "profile.contactInfo": "Contact Information",
  "profile.email": "Email",
  "profile.emailPlaceholder": "Enter your email address",
  "profile.emailNote": "Email cannot be changed"
}
```

### **French (fr.json)**
```json
{
  "profile.fullNameNote": "Le nom complet est optionnel",
  "profile.phone": "Téléphone",
  "profile.phonePlaceholder": "Entrez votre numéro de téléphone",
  "profile.phoneNote": "Le numéro de téléphone est géré par vos paramètres de compte",
  "profile.contactInfo": "Informations de Contact"
}
```

### **Arabic (ar.json)**
```json
{
  "profile.fullNameNote": "الاسم الكامل اختياري",
  "profile.phone": "الهاتف",
  "profile.phonePlaceholder": "أدخل رقم هاتفك",
  "profile.phoneNote": "رقم الهاتف يُدار من إعدادات حسابك",
  "profile.contactInfo": "معلومات الاتصال"
}
```

## Database Operations

### **1. Profile Creation (Signup)**
```javascript
// Create profile without phone_number
const { data, error } = await supabase
  .from('profiles')
  .insert({
    id: userId,
    full_name: userData.full_name || 'User',
    role: 'user'
  })
  .select('id, full_name, role, updated_at')
  .single()
```

### **2. Profile Updates**
```javascript
// Update only full_name field
const { data, error } = await supabase
  .from('profiles')
  .update({
    full_name: 'New Name',
    updated_at: new Date().toISOString()
  })
  .eq('id', authStore.user.id)
  .select('id, full_name, role, updated_at')
  .single()
```

### **3. Profile Loading**
```javascript
// Load profile without phone_number
const { data, error } = await supabase
  .from('profiles')
  .select('id, full_name, role, updated_at')
  .eq('id', authStore.user.id)
  .single()
```

## Phone Number Management

### **Important Notes**
- **Phone numbers are NOT stored in profiles table**
- **Phone numbers come from auth.users.phone**
- **Phone updates must go through Supabase Auth system**
- **Profile updates only affect full_name field**

### **How to Update Phone Number**
```javascript
// This is NOT done through profile updates
// Users must use Supabase Auth methods:

// Option 1: Update user metadata
await supabase.auth.updateUser({
  phone: '+213123456789'
})

// Option 2: Use account settings page
// Redirect users to account settings for phone updates
```

### **Display Only**
```javascript
// Phone field is display-only in profile form
// It shows current value from auth.users.phone
// Users cannot edit it directly in profile form
profileForm.phone = authStore.user.phone || ''
```

## RLS Policy Compliance

### **Security Features**
- ✅ **User Isolation**: Users can only access their own profile
- ✅ **Field Validation**: Only full_name field can be updated
- ✅ **ID Filtering**: All operations include `id = auth.uid()`
- ✅ **No Upsert**: Prevents RLS policy conflicts
- ✅ **Phone Security**: Phone managed by Supabase Auth system

### **Policy Examples**
```sql
-- Users can only view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
```

## Testing

### **Database Testing**
Run the test script to verify functionality:
```sql
\i database/test_updated_profiles.sql
```

### **Manual Testing Checklist**
1. ✅ **Profile Loading**: Verify full_name loads correctly
2. ✅ **Phone Display**: Verify phone shows from auth.users
3. ✅ **Email Display**: Verify email shows correctly
4. ✅ **Full Name Update**: Test adding/editing full name
5. ✅ **Phone Read-only**: Verify phone cannot be edited
6. ✅ **Form Validation**: Verify optional fields work
7. ✅ **Loading States**: Verify loading indicators work
8. ✅ **Error Handling**: Verify error messages display

### **Expected Behavior**
- **Full Name**: Optional, editable, saves to profiles table
- **Phone Number**: Read-only, displays from auth.users.phone
- **Email**: Read-only, displays from auth.users.email
- **Updates**: Only full_name field updates
- **Phone Changes**: Must go through account settings
- **Security**: RLS policies prevent unauthorized access

## Migration Guide

### **From Previous Version**
1. **Database**: Run phone_number removal script
2. **Frontend**: Update Profile.vue component
3. **Composables**: Update useProfile composable
4. **Store**: Update auth store methods
5. **Translations**: Update translation keys

### **Database Changes**
```sql
-- Remove phone_number column
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS phone_number;

-- Verify removal
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles';
```

### **Frontend Changes**
- Remove phone_number field from profileForm
- Update loadProfile to load phone from auth.users
- Update handleUpdateProfile to only update full_name
- Change phone field to read-only display
- Update translation keys

## Benefits of This Approach

### **1. Single Source of Truth**
- ✅ Phone number managed in one place (auth.users)
- ✅ No data duplication between tables
- ✅ Consistent phone number across the app

### **2. Better Security**
- ✅ Phone updates go through Supabase Auth
- ✅ No custom phone validation needed
- ✅ Leverages built-in auth security

### **3. Simplified Architecture**
- ✅ Profiles table only stores profile-specific data
- ✅ Clear separation of concerns
- ✅ Easier to maintain and debug

### **4. Standard Compliance**
- ✅ Follows Supabase Auth best practices
- ✅ Phone numbers handled by auth system
- ✅ Consistent with other auth fields

## Future Considerations

### **Phone Number Updates**
If you need to allow phone number updates through the profile form:

1. **Use Supabase Auth methods**:
   ```javascript
   await supabase.auth.updateUser({
     phone: newPhoneNumber
   })
   ```

2. **Update auth store**:
   ```javascript
   // Refresh user data after phone update
   await authStore.refreshUser()
   ```

3. **Handle errors properly**:
   ```javascript
   try {
     await supabase.auth.updateUser({ phone: newPhone })
     // Success
   } catch (error) {
     // Handle phone update errors
   }
   ```

### **Alternative Approaches**
- **Custom phone field**: Add phone back to profiles if needed
- **Phone verification**: Implement phone verification flow
- **Multiple phones**: Support multiple phone numbers per user

## Summary

The updated profile system now:

✅ **Uses auth.users.phone**: Single source of truth for phone numbers  
✅ **Simplified profiles table**: Only stores profile-specific data  
✅ **Maintains security**: RLS policies and auth compliance  
✅ **Cleaner architecture**: Clear separation of concerns  
✅ **Better UX**: Phone managed through standard auth flow  
✅ **Easier maintenance**: Less complex data management  

This approach leverages Supabase's built-in auth system for phone number management while keeping the profiles table focused on user profile information.
