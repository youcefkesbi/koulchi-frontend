# Cart & Wishlist Debugging Guide

## 🐛 **Current Issue**

The 'Add to Cart' and 'Add to Wishlist' buttons are not working for signed-in users.

## 🔍 **Debugging Steps**

### **1. Check Browser Console**

Open the browser console (F12) and look for these log messages when clicking "Add to Cart" or "Add to Wishlist":

#### **Expected Log Flow for Cart:**
```
=== Cart Store addToCart START ===
Cart store addToCart called with: { product: {...}, quantity: 1 }
Cart service available: true
Calling cartService.addItem...
=== CartService.addItem START ===
CartService.addItem called with: { productId: "...", quantity: 1 }
CartService.isAuthenticated - Checking authentication...
CartService.isAuthenticated - User data: { id: "...", email: "..." }
CartService.isAuthenticated - Result: true
User is authenticated, proceeding to Supabase...
CartService.getCurrentUserId - Getting user ID...
CartService.getCurrentUserId - User ID: "..."
Adding to Supabase cart...
CartService.addToSupabaseCart called with: { userId: "...", productId: "...", quantity: 1 }
Checking if user profile exists...
Profile exists: { user_id: "..." }
Adding/updating cart item in Supabase...
Cart item added/updated successfully: {...}
Successfully added to Supabase cart
=== CartService.addItem SUCCESS ===
cartService.addItem completed successfully
Refreshing cart items...
Fetching cart...
Fetched X cart items
Cart items refreshed successfully
=== Cart Store addToCart SUCCESS ===
```

#### **Expected Log Flow for Wishlist:**
```
=== Wishlist Store addToWishlist START ===
Wishlist store addToWishlist called with: { productId: "..." }
Wishlist service available: true
Calling wishlistService.addItem...
=== WishlistService.addItem START ===
WishlistService.addItem called with: { productId: "..." }
WishlistService.isAuthenticated - Checking authentication...
WishlistService.isAuthenticated - User data: { id: "...", email: "..." }
WishlistService.isAuthenticated - Result: true
User is authenticated, proceeding to Supabase...
WishlistService.getCurrentUserId - Getting user ID...
WishlistService.getCurrentUserId - User ID: "..."
Adding to Supabase wishlist...
WishlistService.addToSupabaseWishlist called with: { userId: "...", productId: "..." }
Checking if user profile exists...
Profile exists: { user_id: "..." }
Adding wishlist item to Supabase...
Wishlist item added successfully: {...}
Successfully added to Supabase wishlist
=== WishlistService.addItem SUCCESS ===
wishlistService.addItem completed successfully
Refreshing wishlist items...
Fetched X wishlist items
Wishlist items refreshed successfully
=== Wishlist Store addToWishlist SUCCESS ===
```

### **2. Check for Errors**

Look for any error messages in the console:

#### **Common Error Patterns:**
- **Authentication Errors**: `CartService.isAuthenticated - Auth error: ...`
- **Profile Creation Errors**: `Failed to create user profile: ...`
- **Supabase Insert Errors**: `Supabase cart insert error: ...`
- **Service Import Errors**: `Cart service available: false`

### **3. Verify Authentication State**

In the browser console, run:
```javascript
// Check if user is authenticated
await supabase.auth.getUser()

// Check current session
await supabase.auth.getSession()

// Check if auth state is being tracked
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, 'Session:', session)
})
```

### **4. Check Database Connection**

Verify that Supabase is accessible:
```javascript
// Test basic Supabase connection
const { data, error } = await supabase.from('profiles').select('count').limit(1)
console.log('Supabase connection test:', { data, error })
```

## 🔧 **Potential Issues & Solutions**

### **1. Authentication Detection Failure**

**Symptoms:**
- `User authenticated: false` for signed-in users
- `User ID not found` errors

**Causes:**
- Supabase client not properly initialized
- Auth state not being tracked
- Session expired

**Solutions:**
- Check Supabase client configuration
- Verify environment variables
- Refresh authentication state

### **2. Profile Creation Failure**

**Symptoms:**
- `Failed to create user profile: ...` errors
- Cart/wishlist operations fail after profile creation

**Causes:**
- RLS policies blocking profile creation
- Database permissions issues
- Invalid user_id format

**Solutions:**
- Check RLS policies on profiles table
- Verify database permissions
- Check user_id format and references

### **3. Supabase Insert Failure**

**Symptoms:**
- `Supabase cart insert error: ...` errors
- `Supabase wishlist insert error: ...` errors

**Causes:**
- RLS policies blocking insert/update
- Unique constraint violations
- Invalid data format
- Database connection issues

**Solutions:**
- Check RLS policies on cart/wishlist tables
- Verify unique constraints
- Check data format and types
- Test database connection

### **4. Service Import Issues**

**Symptoms:**
- `Cart service available: false`
- `Wishlist service available: false`
- Import errors in console

**Causes:**
- Incorrect import paths
- File extension issues
- Build configuration problems

**Solutions:**
- Verify import paths in stores
- Check file extensions (.js vs .ts)
- Ensure proper build configuration

## 🧪 **Testing Steps**

### **1. Test as Guest User**
1. **Sign out** of the application
2. **Add items** to cart/wishlist
3. **Verify** items are stored in localStorage
4. **Check** console logs for localStorage operations

### **2. Test as Authenticated User**
1. **Sign in** to the application
2. **Add items** to cart/wishlist
3. **Verify** items are stored in Supabase
4. **Check** console logs for Supabase operations
5. **Refresh page** and verify items persist

### **3. Test Authentication Flow**
1. **Add items** as guest user
2. **Sign in** to the application
3. **Verify** local items sync to Supabase
4. **Check** localStorage is cleared after sync

## 📋 **Database Verification**

### **1. Check Tables Exist**
```sql
-- Verify cart table
SELECT * FROM information_schema.tables 
WHERE table_name = 'cart' AND table_schema = 'public';

-- Verify wishlist table
SELECT * FROM information_schema.tables 
WHERE table_name = 'wishlist' AND table_schema = 'public';
```

### **2. Check RLS Policies**
```sql
-- Check cart table policies
SELECT * FROM pg_policies WHERE tablename = 'cart';

-- Check wishlist table policies
SELECT * FROM pg_policies WHERE tablename = 'wishlist';
```

### **3. Check Functions**
```sql
-- Check if cart function exists
SELECT * FROM pg_proc WHERE proname = 'add_to_cart';

-- Check if wishlist function exists
SELECT * FROM pg_proc WHERE proname = 'add_to_wishlist';
```

## 🚀 **Next Steps**

### **1. Run the Debugging Steps**
1. **Open browser console**
2. **Click Add to Cart/Wishlist**
3. **Follow the log flow**
4. **Identify where the process fails**

### **2. Check Database**
1. **Verify tables exist**
2. **Check RLS policies**
3. **Test SQL functions**
4. **Verify permissions**

### **3. Fix Identified Issues**
1. **Update RLS policies** if needed
2. **Fix SQL functions** if missing
3. **Correct import paths** if wrong
4. **Update authentication** if failing

## ✅ **Expected Outcome**

After debugging and fixing:

- **Signed-in users** can successfully add items to cart/wishlist
- **Guest users** can add items to localStorage
- **Authentication flow** works seamlessly
- **Data persistence** works correctly
- **UI updates** reflect changes immediately

## 📞 **Support**

If issues persist after following this guide:

1. **Share console logs** showing the error
2. **Provide database schema** details
3. **Describe authentication flow** issues
4. **Include any error messages** from Supabase
