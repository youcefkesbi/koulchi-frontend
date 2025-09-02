# Profiles System Implementation

This document describes the implementation of a safe, non-recursive profile system for the Koulchi e-commerce platform.

## Overview

The profiles system allows users to manage their profile information (full_name, city) without causing recursion errors. It uses:

- **Row Level Security (RLS)** for data isolation
- **Automatic profile creation** via database triggers
- **Safe profile updates** through a dedicated composable
- **No recursive queries** to prevent infinite loops

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Vue.js Frontend │    │  useProfile     │    │  Supabase      │
│                 │    │  Composable      │    │   Database     │
│ Profile.vue     │◄──►│                 │◄──►│                 │
│                 │    │  - getProfile   │    │  - profiles    │
│                 │    │  - updateProfile│    │    table       │
│                 │    │  - createProfile│    │  - RLS policies│
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Database Structure

### profiles Table

```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    city TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Features

- **Primary Key**: `id` references `auth.users(id)` for user authentication
- **Cascade Delete**: When a user is deleted, their profile is automatically removed
- **Automatic Timestamps**: `updated_at` field is automatically managed
- **Role System**: Built-in role management for future features

## Security Implementation

### Row Level Security (RLS)

```sql
-- Users can only view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
```

### Benefits

- **Data Isolation**: Users can only access their own profile data
- **Security**: No SQL injection or unauthorized access possible
- **Performance**: Database-level filtering for efficient queries

## Automatic Profile Creation

### Database Trigger

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, city)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'user',
    COALESCE(NEW.raw_user_meta_data->>'city', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### How It Works

1. **User Signs Up**: New user is created in `auth.users`
2. **Trigger Fires**: `handle_new_user()` function executes automatically
3. **Profile Created**: New profile row is inserted with default values
4. **Seamless Experience**: User immediately has a profile without manual creation

## Frontend Implementation

### useProfile Composable

The `useProfile` composable provides safe profile operations:

```javascript
import { useProfile } from '../composables/useProfile'

const { getProfile, updateProfile, loading, error, success } = useProfile()

// Get current user's profile
const profile = await getProfile()

// Update profile safely
const result = await updateProfile({
  full_name: 'New Name',
  city: 'New City'
})
```

### Key Methods

- **`getProfile()`**: Safely fetch current user's profile
- **`createProfile()`**: Create profile if none exists
- **`updateProfile(updates)`**: Update specific profile fields
- **`refreshProfile()`**: Refresh profile data from database

### Safety Features

- **Field Validation**: Only allows updates to `full_name` and `city`
- **No Recursion**: Simple, direct database queries
- **Error Handling**: Comprehensive error handling and user feedback
- **State Management**: Reactive state management with Vue 3

## Profile.vue Component

The Profile component uses the composable for safe profile management:

```vue
<template>
  <form @submit.prevent="handleUpdateProfile">
    <input v-model="profileForm.fullName" type="text" />
    <input v-model="profileForm.city" type="text" />
    <button type="submit" :disabled="loading">
      {{ loading ? 'Updating...' : 'Update Profile' }}
    </button>
  </form>
</template>

<script setup>
import { useProfile } from '../composables/useProfile'

const { updateProfile, loading, error, success } = useProfile()

const handleUpdateProfile = async () => {
  await updateProfile({
    full_name: profileForm.fullName,
    city: profileForm.city
  })
}
</script>
```

## Installation & Setup

### 1. Database Setup

Run the complete setup script:

```bash
# In your Supabase SQL editor
\i database/setup_profiles_system.sql
```

### 2. Frontend Integration

The composable is automatically available:

```javascript
// Import and use
import { useProfile } from '@/composables/useProfile'
```

### 3. Verify Installation

Run the test script:

```bash
# In your Supabase SQL editor
\i database/test_profiles_system.sql
```

## Usage Examples

### Basic Profile Fetch

```javascript
const { getProfile } = useProfile()

// Fetch current user's profile
const profile = await getProfile()
console.log(profile.full_name, profile.city)
```

### Profile Update

```javascript
const { updateProfile } = useProfile()

// Update profile fields
const result = await updateProfile({
  full_name: 'John Doe',
  city: 'New York'
})

if (result) {
  console.log('Profile updated successfully')
}
```

### Error Handling

```javascript
const { updateProfile, error } = useProfile()

try {
  await updateProfile({ full_name: 'New Name' })
} catch (err) {
  console.error('Update failed:', error.value)
}
```

## Migration from Old System

### What Changed

1. **Removed Recursive Queries**: No more complex profile joins
2. **Simplified Auth Store**: Profile updates moved to composable
3. **Added RLS Policies**: Database-level security
4. **Automatic Profile Creation**: No manual profile setup needed

### Migration Steps

1. **Update Database**: Run the setup script
2. **Update Frontend**: Replace old profile methods with composable
3. **Test Thoroughly**: Verify all profile operations work correctly
4. **Remove Old Code**: Clean up deprecated profile methods

## Testing

### Manual Testing

1. **Profile Creation**: Sign up new user, verify profile is created
2. **Profile Update**: Update profile fields, verify changes persist
3. **Security**: Verify users cannot access other profiles
4. **Error Handling**: Test with invalid data, verify error messages

### Automated Testing

```javascript
// Example test for the composable
describe('useProfile', () => {
  it('should fetch user profile', async () => {
    const { getProfile } = useProfile()
    const profile = await getProfile()
    expect(profile).toBeDefined()
  })

  it('should update profile safely', async () => {
    const { updateProfile } = useProfile()
    const result = await updateProfile({ full_name: 'Test' })
    expect(result).toBeDefined()
  })
})
```

## Troubleshooting

### Common Issues

1. **Profile Not Found**: Check if RLS policies are enabled
2. **Update Fails**: Verify user authentication and RLS policies
3. **Recursion Errors**: Ensure no complex joins in profile queries
4. **Permission Denied**: Check database permissions and RLS policies

### Debug Mode

Enable debug logging:

```javascript
// In development
console.log('Profile operation:', operation)
console.log('User ID:', authStore.user?.id)
console.log('RLS result:', result)
```

## Performance Considerations

### Optimizations

- **Indexed Queries**: Primary key lookups are fast
- **Minimal Data**: Only fetch required fields
- **No Joins**: Simple queries prevent performance issues
- **RLS Efficiency**: Database-level filtering is optimal

### Monitoring

- **Query Performance**: Monitor profile query execution times
- **RLS Overhead**: Minimal impact from RLS policies
- **Index Usage**: Ensure indexes are being used effectively

## Future Enhancements

### Planned Features

1. **Profile Validation**: Enhanced field validation
2. **Profile Images**: Avatar and banner image support
3. **Extended Fields**: Additional profile information
4. **Profile Templates**: Different profile types for different user roles

### Scalability

- **Horizontal Scaling**: RLS policies work with read replicas
- **Caching**: Profile data can be cached for performance
- **Batch Operations**: Future support for bulk profile updates

## Support

For technical support or questions about the profiles system:

1. **Documentation**: Check this file and related SQL scripts
2. **Code Issues**: Review the composable and component implementations
3. **Database Issues**: Verify RLS policies and trigger functions
4. **Performance Issues**: Check query execution plans and indexes

## License

This profiles system is part of the Koulchi e-commerce platform and follows the same licensing terms.
