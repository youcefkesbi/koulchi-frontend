# Profiles ID Schema Update

## 🔄 **Overview**

Updated the project to use `profiles.id` instead of `profiles.user_id` throughout the codebase. This aligns with the database schema where `profiles.id` is the primary key that references `auth.users(id)`.

## 📋 **Changes Made**

### **1. Database Services**

#### **Cart Service (`database/cartService.js`)**
- ✅ **Profile Queries**: Updated `supabase.from('profiles').select('user_id')` → `supabase.from('profiles').select('id')`
- ✅ **Profile Filters**: Updated `.eq('user_id', userId)` → `.eq('id', userId)`
- ✅ **Profile Inserts**: Updated `{ user_id: userId }` → `{ id: userId }`
- ✅ **Error Logging**: Enhanced error handling and logging for profile operations
- ✅ **Profile Creation**: Improved profile creation logic with better error handling

#### **Wishlist Service (`database/wishlistService.js`)**
- ✅ **Profile Queries**: Updated `supabase.from('profiles').select('user_id')` → `supabase.from('profiles').select('id')`
- ✅ **Profile Filters**: Updated `.eq('user_id', userId)` → `.eq('id', userId)`
- ✅ **Profile Inserts**: Updated `{ user_id: userId }` → `{ id: userId }`
- ✅ **Error Logging**: Enhanced error handling and logging for profile operations
- ✅ **Profile Creation**: Improved profile creation logic with better error handling

### **2. Store Updates**

#### **Auth Store (`src/stores/auth.js`)**
- ✅ **Profile Queries**: Updated all `profiles` table queries to use `id` instead of `user_id`
- ✅ **Profile Inserts**: Updated profile creation to use `id` field
- ✅ **Profile Updates**: Updated profile updates to use `id` field
- ✅ **User Loading**: Maintained `loadUserWithProfile` functionality with correct field references

#### **Orders Store (`src/stores/orders.js`)**
- ✅ **Foreign Key References**: Updated all foreign key references from specific constraint names to generic table references
- ✅ **Buyer References**: Updated `buyer:profiles!orders_user_id_fkey(*)` → `buyer:profiles(*)`
- ✅ **Seller References**: Updated `seller:profiles!products_seller_id_fkey(*)` → `seller:profiles(*)`
- ✅ **Profile Queries**: Updated profile queries to use correct field references

### **3. Database Schema Alignment**

#### **Current Schema (Already Correct)**
- ✅ **`cart` table**: `user_id uuid references profiles(id) on delete cascade`
- ✅ **`wishlist` table**: `user_id UUID REFERENCES profiles(id) ON DELETE CASCADE`
- ✅ **`orders` table**: `user_id uuid not null references profiles(id) on delete cascade`
- ✅ **`products` table**: `seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE`
- ✅ **`stores` table**: `owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE`

## 🔍 **Key Implementation Details**

### **1. Authentication Flow**
```javascript
// Before: Used profiles.user_id
const { data: profile } = await supabase
  .from('profiles')
  .select('user_id')
  .eq('user_id', userId)

// After: Uses profiles.id (matches auth.users.id)
const { data: profile } = await supabase
  .from('profiles')
  .select('id')
  .eq('id', userId)
```

### **2. Profile Creation**
```javascript
// Before: Created profile with user_id field
await supabase.from('profiles').insert({
  user_id: userId,
  role: 'user'
})

// After: Creates profile with id field (matches auth.users.id)
await supabase.from('profiles').insert({
  id: userId,
  role: 'user'
})
```

### **3. Foreign Key References**
```javascript
// Before: Used specific constraint names
buyer:profiles!orders_user_id_fkey(*)
seller:profiles!products_seller_id_fkey(*)

// After: Use generic table references
buyer:profiles(*)
seller:profiles(*)
```

## ✅ **Benefits of This Update**

### **1. Schema Consistency**
- **Unified ID System**: All user references now use the same ID field (`profiles.id`)
- **Direct Mapping**: `profiles.id` directly maps to `auth.users.id` from Supabase Auth
- **Simplified Queries**: No need to join between different ID fields

### **2. Improved Maintainability**
- **Clearer Relationships**: Foreign key relationships are more intuitive
- **Reduced Confusion**: Single source of truth for user identification
- **Easier Debugging**: Consistent ID usage across all tables

### **3. Better Performance**
- **Optimized Joins**: Direct ID references without additional field lookups
- **Index Efficiency**: Primary key lookups are faster than secondary field queries
- **Reduced Complexity**: Simpler query structures

## 🧪 **Testing Requirements**

### **1. Authentication Flow**
- ✅ **User Signup**: Verify profile creation uses correct ID field
- ✅ **User Login**: Verify profile loading works with new schema
- ✅ **Profile Updates**: Verify profile modification works correctly

### **2. Cart & Wishlist Operations**
- ✅ **Add Items**: Verify items are added to correct user profiles
- ✅ **Remove Items**: Verify items are removed from correct user profiles
- ✅ **Data Persistence**: Verify data persists correctly after page refresh

### **3. Order Management**
- ✅ **Order Creation**: Verify orders are created with correct buyer references
- ✅ **Order Queries**: Verify order fetching works with new profile references
- ✅ **Seller Operations**: Verify seller-specific operations work correctly

## 🚨 **Important Notes**

### **1. Database Schema**
- **No Schema Changes**: The database schema remains unchanged
- **Code Updates Only**: Only the application code was updated to align with existing schema
- **Backward Compatibility**: Existing data remains intact

### **2. Foreign Key Constraints**
- **Cart & Wishlist**: Continue to use `cart.user_id` and `wishlist.user_id`
- **Profile References**: These now correctly reference `profiles.id`
- **Data Integrity**: All foreign key relationships are maintained

### **3. Error Handling**
- **Enhanced Logging**: Better error messages for debugging
- **Profile Creation**: Automatic profile creation with improved error handling
- **Query Failures**: Comprehensive logging for all database operations

## 🔧 **Verification Steps**

### **1. Check Console Logs**
```javascript
// Look for successful profile operations
Profile exists: { id: "uuid-here" }
Profile created successfully
```

### **2. Verify Database Queries**
```sql
-- Check that profiles.id matches auth.users.id
SELECT p.id, p.role, au.email 
FROM profiles p 
JOIN auth.users au ON p.id = au.id;
```

### **3. Test User Operations**
- Sign up a new user
- Add items to cart/wishlist
- Create orders
- Verify all operations work correctly

## 📞 **Support**

If issues arise after this update:

1. **Check Console Logs**: Look for detailed error messages
2. **Verify Database**: Ensure profiles table has correct structure
3. **Test Authentication**: Verify user login/signup works
4. **Check Foreign Keys**: Ensure all table relationships are correct

## 🎯 **Expected Outcome**

After this update:

- **All user operations** work correctly with the new schema
- **Cart and wishlist** functionality works for both authenticated and guest users
- **Order management** functions properly with correct user references
- **Profile operations** are more reliable and easier to debug
- **Database queries** are more efficient and maintainable
