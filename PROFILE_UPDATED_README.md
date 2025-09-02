# Updated Profile System - Full Name + Phone Number

This document describes the updated profile system that now includes both Full Name and Phone Number fields, with proper Supabase client integration.

## New Features

### **1. Full Name Field**
- ✅ **Optional**: Users can leave it empty
- ✅ **Editable**: Users can add or update their full name
- ✅ **Sourced from**: `profiles.full_name` table
- ✅ **Validation**: No required validation

### **2. Phone Number Field**
- ✅ **Optional**: Users can leave it empty
- ✅ **Editable**: Users can add or update their phone number
- ✅ **Sourced from**: `profiles.phone_number` table
- ✅ **Validation**: No required validation

### **3. Email Field**
- ✅ **Read-only**: Cannot be changed by users
- ✅ **Sourced from**: `auth.users.email` table
- ✅ **Display**: Shows current email from authentication

## Database Schema

### **Profiles Table Structure**
```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,           -- Optional user full name
    phone_number TEXT,         -- Optional user phone number
    role TEXT NOT NULL DEFAULT 'user',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Migration Required**
Run this script to add the phone_number column:
```sql
\i database/add_phone_number_to_profiles.sql
```

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

      <!-- Phone Number (Optional) -->
      <div>
        <label>{{ $t('profile.phoneNumber') }}</label>
        <input v-model="profileForm.phoneNumber" type="tel" />
        <p class="text-xs text-gray-500">{{ $t('profile.phoneNumberNote') }}</p>
      </div>
    </div>

    <!-- Contact Information Section -->
    <div>
      <!-- Email (Read-only) -->
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
  phoneNumber: '',   // From profiles.phone_number
  email: ''          // From auth.users.email (read-only)
})
```

## Supabase Client Integration

### **1. Profile Loading**
```javascript
// Load user profile data
const loadProfile = async () => {
  try {
    if (authStore.user) {
      // Get profile from database
      const profile = await getProfile()
      
      if (profile) {
        profileForm.fullName = profile.full_name || ''
        profileForm.phoneNumber = profile.phone_number || ''
      }
      
      // Email from auth store (auth.users)
      profileForm.email = authStore.user.email || ''
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  }
}
```

### **2. Profile Updates**
```javascript
// Update profile
const handleUpdateProfile = async () => {
  try {
    const result = await updateProfile({
      full_name: profileForm.fullName,
      phone_number: profileForm.phoneNumber
    })

    if (result) {
      successMessage.value = 'Profile updated successfully!'
    }
  } catch (error) {
    errorMessage.value = error.message
  }
}
```

### **3. useProfile Composable**
```javascript
// Update profile safely with RLS compliance
const updateProfile = async (updates) => {
  try {
    // Validate updates - allow full_name and phone_number
    const allowedUpdates = {}
    if (updates.full_name !== undefined) {
      allowedUpdates.full_name = updates.full_name
    }
    if (updates.phone_number !== undefined) {
      allowedUpdates.phone_number = updates.phone_number
    }

    // Add timestamp
    allowedUpdates.updated_at = new Date().toISOString()

    // Update with RLS compliance
    const { data, error } = await supabase
      .from('profiles')
      .update(allowedUpdates)
      .eq('id', authStore.user.id)
      .select('id, full_name, phone_number, role, updated_at')
      .single()

    if (error) throw error
    return data
  } catch (err) {
    throw err
  }
}
```

## Translation Keys

### **English (en.json)**
```json
{
  "profile.fullName": "Full Name",
  "profile.fullNamePlaceholder": "Enter your full name",
  "profile.fullNameNote": "Full name is optional",
  "profile.phoneNumber": "Phone Number",
  "profile.phoneNumberPlaceholder": "Enter your phone number",
  "profile.phoneNumberNote": "Phone number is optional",
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
  "profile.phoneNumber": "Numéro de Téléphone",
  "profile.phoneNumberPlaceholder": "Entrez votre numéro de téléphone",
  "profile.phoneNumberNote": "Le numéro de téléphone est optionnel",
  "profile.contactInfo": "Informations de Contact"
}
```

### **Arabic (ar.json)**
```json
{
  "profile.fullNameNote": "الاسم الكامل اختياري",
  "profile.phoneNumber": "رقم الهاتف",
  "profile.phoneNumberPlaceholder": "أدخل رقم هاتفك",
  "profile.phoneNumberNote": "رقم الهاتف اختياري",
  "profile.contactInfo": "معلومات الاتصال"
}
```

## Database Operations

### **1. Profile Creation (Signup)**
```javascript
// Create profile with phone_number
const { data, error } = await supabase
  .from('profiles')
  .insert({
    id: userId,
    full_name: userData.full_name || 'User',
    phone_number: userData.phone_number || '',
    role: 'user'
  })
  .select('id, full_name, phone_number, role, updated_at')
  .single()
```

### **2. Profile Updates**
```javascript
// Update specific fields
const { data, error } = await supabase
  .from('profiles')
  .update({
    full_name: 'New Name',
    phone_number: '+213123456789',
    updated_at: new Date().toISOString()
  })
  .eq('id', authStore.user.id)
  .select('id, full_name, phone_number, role, updated_at')
  .single()
```

### **3. Profile Loading**
```javascript
// Load profile with phone_number
const { data, error } = await supabase
  .from('profiles')
  .select('id, full_name, phone_number, role, updated_at')
  .eq('id', authStore.user.id)
  .single()
```

## RLS Policy Compliance

### **Security Features**
- ✅ **User Isolation**: Users can only access their own profile
- ✅ **Field Validation**: Only allowed fields can be updated
- ✅ **ID Filtering**: All operations include `id = auth.uid()`
- ✅ **No Upsert**: Prevents RLS policy conflicts

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
1. ✅ **Profile Loading**: Verify all fields load correctly
2. ✅ **Full Name Update**: Test adding/editing full name
3. ✅ **Phone Number Update**: Test adding/editing phone number
4. ✅ **Email Display**: Verify email shows correctly (read-only)
5. ✅ **Form Validation**: Verify optional fields work
6. ✅ **Loading States**: Verify loading indicators work
7. ✅ **Error Handling**: Verify error messages display
8. ✅ **Success Feedback**: Verify success messages show

### **Expected Behavior**
- **Full Name**: Optional, editable, saves to profiles table
- **Phone Number**: Optional, editable, saves to profiles table
- **Email**: Read-only, displays from auth.users table
- **Updates**: Both fields update simultaneously
- **Validation**: No required field validation
- **Security**: RLS policies prevent unauthorized access

## Migration Guide

### **From Previous Version**
1. **Database**: Run phone_number migration script
2. **Frontend**: Update Profile.vue component
3. **Composables**: Update useProfile composable
4. **Store**: Update auth store methods
5. **Translations**: Add new translation keys

### **Database Changes**
```sql
-- Add phone_number column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Update existing profiles
UPDATE public.profiles 
SET phone_number = '' 
WHERE phone_number IS NULL;
```

### **Frontend Changes**
- Add phone_number field to profileForm
- Update loadProfile to load phone_number
- Update handleUpdateProfile to include phone_number
- Add phone number input field to template
- Add contact information section

## Performance Considerations

### **Optimizations**
- **Selective Updates**: Only update changed fields
- **Minimal Queries**: Single query for profile updates
- **RLS Efficiency**: Database-level filtering
- **Indexed Lookups**: Primary key queries are fast

### **Monitoring**
- **Query Performance**: Monitor profile operation times
- **RLS Overhead**: Minimal impact from policies
- **Data Size**: Small payloads for profile data

## Error Handling

### **Common Scenarios**
1. **Profile Not Found**: Graceful fallback to auth store
2. **Update Failures**: Clear error messages
3. **Network Issues**: Retry mechanisms
4. **Validation Errors**: Field-specific error display

### **Error Recovery**
```javascript
try {
  const result = await updateProfile(updates)
  // Handle success
} catch (error) {
  // Display error message
  errorMessage.value = error.message
  // Reset loading state
  clearStates()
}
```

## Future Enhancements

### **Potential Additions**
- Profile picture upload
- Additional contact methods
- Social media links
- Notification preferences
- Privacy settings

### **Database Extensions**
- Add more profile fields
- Profile history tracking
- Profile verification
- Multi-language support

## Summary

The updated profile system now provides:

✅ **Full Name Management**: Optional, editable field  
✅ **Phone Number Management**: Optional, editable field  
✅ **Email Display**: Read-only from auth.users  
✅ **Proper Integration**: Supabase client with RLS compliance  
✅ **Internationalization**: Multi-language support  
✅ **Security**: Row-level security maintained  
✅ **Performance**: Efficient database operations  
✅ **User Experience**: Clean, intuitive interface  

This system maintains all security requirements while providing users with flexible profile management capabilities.
