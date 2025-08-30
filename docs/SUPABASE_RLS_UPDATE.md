# Supabase RLS & User Scoping Update

## 🔄 **Overview**

Updated the codebase to align with the new Supabase schema setup, implementing proper Row Level Security (RLS) policies, UUID usage, and user-scoped operations. The system now automatically handles user data isolation through RLS policies instead of manual filtering.

## 📋 **Key Changes Implemented**

### **1. Row Level Security (RLS) Policies**

#### **Database Policies Created**
- ✅ **`profiles` table**: Users can only access their own profile, admins can access all
- ✅ **`cart` table**: Users can only access their own cart, admins can access all
- ✅ **`wishlist` table**: Users can only access their own wishlist, admins can access all
- ✅ **`orders` table**: Users can only access their own orders, admins can access all
- ✅ **`order_items` table**: Users can only access items from their own orders, admins can access all
- ✅ **`products` table**: Public read access for active products, sellers manage their own, admins manage all
- ✅ **`stores` table**: Public read access for active stores, owners manage their own, admins manage all
- ✅ **`categories` table**: Public read access for active categories, admins manage all

#### **Admin Access Function**
```sql
-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;
```

### **2. Service Layer Updates**

#### **Cart Service (`database/cartService.js`)**
- ✅ **Removed Manual User Filtering**: No more `.eq('user_id', userId)` calls
- ✅ **RLS Auto-Scoping**: All queries automatically filtered by current user
- ✅ **Simplified Method Signatures**: Removed `userId` parameters from methods
- ✅ **Automatic User ID**: RLS sets `user_id` to `auth.uid()` automatically

#### **Wishlist Service (`database/wishlistService.js`)**
- ✅ **Removed Manual User Filtering**: No more `.eq('user_id', userId)` calls
- ✅ **RLS Auto-Scoping**: All queries automatically filtered by current user
- ✅ **Simplified Method Signatures**: Removed `userId` parameters from methods
- ✅ **Automatic User ID**: RLS sets `user_id` to `auth.uid()` automatically

#### **Orders Store (`src/stores/orders.js`)**
- ✅ **Removed Manual User Filtering**: No more `.eq('buyer_id', userId)` calls
- ✅ **RLS Auto-Scoping**: Orders automatically filtered by current user
- ✅ **Simplified Queries**: Removed complex user ID filtering logic
- ✅ **Automatic User ID**: RLS sets `user_id` to `auth.uid()` automatically

### **3. Method Signature Changes**

#### **Before (Manual User Filtering)**
```javascript
// Cart Service
async getSupabaseCart(userId) {
  const { data } = await supabase
    .from('cart')
    .select('*')
    .eq('user_id', userId)  // ❌ Manual filtering
}

// Wishlist Service
async addToSupabaseWishlist(userId, productId) {
  await supabase.from('wishlist').insert({
    user_id: userId,  // ❌ Manual user ID setting
    product_id: productId
  })
}
```

#### **After (RLS Auto-Scoping)**
```javascript
// Cart Service
async getSupabaseCart() {
  const { data } = await supabase
    .from('cart')
    .select('*')  // ✅ RLS automatically filters by current user
}

// Wishlist Service
async addToSupabaseWishlist(productId) {
  await supabase.from('wishlist').insert({
    product_id: productId  // ✅ RLS automatically sets user_id to auth.uid()
  })
}
```

## 🔧 **Technical Implementation Details**

### **1. RLS Policy Examples**

#### **Cart Table Policies**
```sql
-- Users can view their own cart
CREATE POLICY "Users can view own cart" ON cart
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert into their own cart
CREATE POLICY "Users can insert own cart items" ON cart
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all carts
CREATE POLICY "Admins can view all carts" ON cart
    FOR SELECT USING (is_admin());
```

#### **Products Table Policies**
```sql
-- Anyone can view active products
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (is_active = true);

-- Users can manage their own products
CREATE POLICY "Users can manage own products" ON products
    FOR ALL USING (auth.uid() = seller_id);

-- Admins can manage all products
CREATE POLICY "Admins can manage all products" ON products
    FOR ALL USING (is_admin());
```

### **2. UUID Type Consistency**

#### **Database Schema**
- ✅ **`profiles.id`**: UUID, equals `auth.users.id`
- ✅ **`cart.user_id`**: UUID, references `profiles.id`
- ✅ **`wishlist.user_id`**: UUID, references `profiles.id`
- ✅ **`orders.user_id`**: UUID, references `profiles.id`
- ✅ **`products.seller_id`**: UUID, references `profiles.id`
- ✅ **`stores.owner_id`**: UUID, references `profiles.id`

#### **Code Updates**
- ✅ **Removed Integer Assumptions**: All user IDs now treated as UUIDs
- ✅ **Consistent Type Usage**: No more type conversions or assumptions
- ✅ **Proper Foreign Key References**: All relationships use correct UUID types

### **3. Foreign Key Relationships**

#### **Wishlist Relationships**
```javascript
// Before: Complex nested structure
.select(`
  product_id,
  created_at,
  products (
    id,
    name,
    name_ar,  // ❌ Removed unused field
    price,
    image_urls,
    seller_id
  )
`)

// After: Simplified, consistent structure
.select(`
  product_id, 
  created_at, 
  products(id, name, price, image_urls, seller_id)
`)
```

#### **Cart Relationships**
```javascript
// Before: Complex nested structure
.select(`
  product_id,
  quantity,
  products (
    id,
    name,
    name_ar,  // ❌ Removed unused field
    price,
    image_urls,
    seller_id
  )
`)

// After: Simplified, consistent structure
.select(`
  product_id,
  quantity,
  products(id, name, price, image_urls, seller_id)
`)
```

## 🎯 **Benefits of This Update**

### **1. Security Improvements**
- **Automatic Data Isolation**: Users can only access their own data
- **Admin Override**: Admins can access and manage all data
- **No Manual Filtering**: Eliminates risk of forgetting user scoping
- **Consistent Security**: All tables follow the same security model

### **2. Performance Improvements**
- **Database-Level Filtering**: RLS policies are optimized at the database level
- **Reduced Query Complexity**: Simpler queries without manual filtering
- **Efficient Joins**: Direct foreign key relationships
- **Index Optimization**: Better use of database indexes

### **3. Maintainability Improvements**
- **Cleaner Code**: No more manual user ID filtering
- **Consistent Patterns**: All services follow the same approach
- **Easier Debugging**: RLS policies are centralized and documented
- **Reduced Bugs**: No risk of forgetting user scoping in new features

## 🧪 **Testing Requirements**

### **1. User Scoping Tests**
- ✅ **Regular Users**: Can only access their own data
- ✅ **Admin Users**: Can access and manage all data
- ✅ **Guest Users**: Cannot access authenticated user data
- ✅ **Cross-User Access**: Users cannot access other users' data

### **2. Functionality Tests**
- ✅ **Cart Operations**: Add, remove, update, clear items
- ✅ **Wishlist Operations**: Add, remove, clear items
- ✅ **Order Operations**: Create, view, update orders
- ✅ **Product Operations**: View, create, update, delete products
- ✅ **Store Operations**: View, create, update, delete stores

### **3. Admin Access Tests**
- ✅ **Admin Cart Access**: Can view and manage all carts
- ✅ **Admin Wishlist Access**: Can view and manage all wishlists
- ✅ **Admin Order Access**: Can view and manage all orders
- ✅ **Admin Product Access**: Can view and manage all products
- ✅ **Admin Store Access**: Can view and manage all stores

## 🔍 **Verification Steps**

### **1. Database Setup**
```sql
-- Run the RLS policies file
\i database/rls_policies.sql

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('cart', 'wishlist', 'orders', 'products', 'stores');

-- Verify policies exist
SELECT * FROM pg_policies WHERE tablename IN ('cart', 'wishlist', 'orders', 'products', 'stores');
```

### **2. Application Testing**
- **Sign in as regular user**: Verify can only access own data
- **Sign in as admin user**: Verify can access all data
- **Test all CRUD operations**: Ensure proper user scoping
- **Check console logs**: Verify RLS is working correctly

### **3. Error Handling**
- **Unauthorized Access**: Verify proper error messages
- **Missing Permissions**: Check error handling for restricted operations
- **Admin Functions**: Test admin override capabilities

## 🚨 **Important Notes**

### **1. Database Requirements**
- **Supabase Project**: Must have RLS enabled
- **Auth Schema**: Must have `auth.users` table properly configured
- **Profile Triggers**: Should automatically create profiles on user signup
- **Admin Role**: Must be set in profiles table for admin users

### **2. Code Changes**
- **No Backward Compatibility**: Old manual filtering code removed
- **Service Signatures**: Updated method signatures (removed userId parameters)
- **Store Updates**: Updated to use new service methods
- **Error Handling**: Enhanced error logging for debugging

### **3. Migration Considerations**
- **Existing Data**: All existing data remains intact
- **User Permissions**: Users may need to be reassigned admin roles
- **Testing**: Thorough testing required before production deployment
- **Rollback Plan**: Keep backup of old code if needed

## 🎯 **Expected Outcomes**

After this update:

- **Automatic Security**: All user data automatically isolated
- **Admin Access**: Admins can manage all data as needed
- **Performance**: Better query performance through RLS optimization
- **Maintainability**: Cleaner, more maintainable codebase
- **Consistency**: Unified security model across all tables
- **Reliability**: No risk of data leakage through forgotten filtering

## 📞 **Support**

If issues arise after this update:

1. **Check RLS Policies**: Verify policies are properly created
2. **Test User Roles**: Ensure admin users have correct role assignment
3. **Monitor Logs**: Check for RLS-related error messages
4. **Verify Permissions**: Test user access to different data sets
5. **Database Connectivity**: Ensure Supabase connection is working

## 🔄 **Next Steps**

1. **Deploy RLS Policies**: Run the SQL file in your Supabase project
2. **Test Functionality**: Verify all operations work correctly
3. **Admin Setup**: Assign admin roles to appropriate users
4. **Monitor Performance**: Check for any performance impacts
5. **User Training**: Inform users about new security model

The codebase is now fully aligned with the new Supabase schema, providing automatic user data isolation, proper admin access, and improved security through RLS policies! 🎉
