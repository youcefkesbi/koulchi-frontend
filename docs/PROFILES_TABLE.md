# Profiles Table Implementation

## Overview

This application now uses a dedicated `profiles` table in Supabase instead of storing user information in `user_metadata`. This approach provides better data structure, querying capabilities, and security.

## Database Schema

### Profiles Table Structure

```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    city TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Features

- **Referential Integrity**: `id` references `auth.users(id)` with CASCADE delete
- **Row Level Security (RLS)**: Enabled for secure access control
- **Automatic Timestamps**: `created_at` and `updated_at` are automatically managed
- **Indexes**: Performance optimization for common queries

## Security Policies

The table uses Row Level Security (RLS) with the following policies:

- Users can only view their own profile
- Users can only update their own profile  
- Users can only insert their own profile
- All operations require authentication

## Authentication Flow

### 1. User Signup

1. User account is created in `auth.users`
2. Profile record is automatically created in `profiles` table
3. Basic profile data (email, id) is populated
4. Additional profile fields can be filled later

### 2. User Login

1. User authenticates with email/password
2. Profile data is fetched from `profiles` table
3. User object is enriched with profile information
4. If no profile exists, one is created automatically

### 3. OAuth Login (Google/Facebook)

1. User authenticates via OAuth provider
2. OAuth metadata is extracted (name, avatar)
3. Profile is created/updated with OAuth data
4. User object is enriched with profile information

## API Functions

### Auth Store Functions

- `createProfileIfNotExists(oauthData)`: Creates profile if it doesn't exist
- `updateProfile(profileData)`: Updates profile in the profiles table
- `getCurrentUser()`: Fetches user with profile data
- All functions now work with the profiles table instead of user_metadata

### Profile Creation

Profiles are automatically created in these scenarios:

- After successful email/password signup
- After successful OAuth login
- When accessing profile data for the first time

## Data Migration

If you're migrating from `user_metadata`:

1. Run the SQL script in `database/profiles_table.sql`
2. Update your application code to use the new auth store functions
3. The system will automatically create profiles for existing users

## Benefits

### 1. Better Data Structure
- Structured fields instead of JSON metadata
- Type safety and validation
- Easier querying and filtering

### 2. Enhanced Security
- Row Level Security (RLS) policies
- Better access control
- Audit trail with timestamps

### 3. Improved Performance
- Indexed fields for faster queries
- Structured data for better caching
- Efficient joins with other tables

### 4. Scalability
- Easy to add new profile fields
- Better database optimization
- Support for complex queries

## Usage Examples

### Creating a Profile

```javascript
// Profile is automatically created after signup
await authStore.signUp(email, password, { full_name: 'John Doe' })
```

### Updating a Profile

```javascript
await authStore.updateProfile({
  full_name: 'John Smith',
  phone: '+1234567890',
  city: 'New York'
})
```

### Accessing Profile Data

```javascript
// Profile data is automatically loaded
const userName = authStore.userDisplayName
const userAvatar = authStore.userPhotoURL
```

## Error Handling

- Profile creation failures don't block authentication
- Graceful fallback to basic user data
- Comprehensive error logging for debugging
- User-friendly error messages

## Future Enhancements

- Profile validation rules
- Profile completion tracking
- Profile data export/import
- Advanced profile search and filtering
