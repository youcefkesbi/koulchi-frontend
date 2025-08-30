# Cart & Wishlist Unified Update

This document summarizes the comprehensive updates made to implement unified cart and wishlist functionality that works seamlessly for both signed-in and non-signed-in users.

## 🗄️ **Database Schema Updates**

### **Cart Table**
```sql
create table cart (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(user_id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  quantity int not null default 1,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Unique constraint: one product per user
create unique index cart_user_product_unique 
on cart(user_id, product_id);
```

### **Wishlist Table**
```sql
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure a user can only have a product in their wishlist once
    UNIQUE(user_id, product_id)
);
```

## 🔧 **New Service Architecture**

### **1. Cart Service (`database/cartService.ts`)**

#### **Key Features**
- ✅ **Unified Interface**: Works for both authenticated and guest users
- ✅ **Automatic Profile Creation**: Creates user profiles when needed
- ✅ **Unique Constraint Handling**: Uses `ON CONFLICT` for upsert operations
- ✅ **Local Storage Fallback**: Stores cart data locally for guest users
- ✅ **Seamless Sync**: Automatically syncs local cart to Supabase on login

#### **Core Methods**
```typescript
// Add item to cart (works for both user types)
async addItem(productId: string, quantity: number = 1): Promise<void>

// Remove item from cart
async removeItem(productId: string): Promise<void>

// Update item quantity
async updateQuantity(productId: string, quantity: number): Promise<void>

// Get all cart items with product details
async getItems(): Promise<CartItemWithProduct[]>

// Clear all cart items
async clearCart(): Promise<void>

// Sync local cart to Supabase (called after login)
async syncLocalToSupabase(userId: string): Promise<void>
```

#### **Database Operations**
```typescript
// Supabase upsert with conflict handling
await supabase
  .from('cart')
  .upsert(
    {
      user_id: userId,
      product_id: productId,
      quantity,
      created_at: new Date().toISOString()
    },
    {
      onConflict: 'user_id,product_id'
    }
  )
```

### **2. Wishlist Service (`database/wishlistService.ts`)**

#### **Key Features**
- ✅ **Unified Interface**: Works for both authenticated and guest users
- ✅ **Local Storage Integration**: Stores wishlist data locally for guest users
- ✅ **Automatic Sync**: Syncs local wishlist to Supabase on login
- ✅ **Toggle Functionality**: Easy add/remove with single function call

#### **Core Methods**
```typescript
// Add item to wishlist
async addItem(productId: string): Promise<void>

// Remove item from wishlist
async removeItem(productId: string): Promise<void>

// Get all wishlist items with product details
async getItems(): Promise<WishlistItemWithProduct[]>

// Clear all wishlist items
async clearWishlist(): Promise<void>

// Toggle wishlist item (add if not present, remove if present)
async toggleItem(productId: string): Promise<boolean>

// Sync local wishlist to Supabase (called after login)
async syncLocalToSupabase(userId: string): Promise<void>
```

## 🔄 **Store Updates**

### **1. Cart Store (`src/stores/cart.js`)**

#### **Changes Made**
- ✅ **Service Integration**: Now uses `cartService` for all operations
- ✅ **Simplified Logic**: Removed complex database queries and profile management
- ✅ **Automatic Refresh**: Refreshes cart after each operation
- ✅ **Error Handling**: Improved error handling with service fallbacks

#### **Updated Methods**
```javascript
// All methods now use the cart service
const fetchCart = async () => {
  const cartItems = await cartService.getItems()
  items.value = cartItems
}

const addToCart = async (product, quantity = 1) => {
  await cartService.addItem(product.id, quantity)
  await fetchCart() // Refresh cart
}
```

### **2. Wishlist Store (`src/stores/wishlist.js`)**

#### **Changes Made**
- ✅ **Service Integration**: Now uses `wishlistService` for all operations
- ✅ **Simplified Logic**: Removed direct database queries
- ✅ **Data Transformation**: Maps service data to expected format
- ✅ **Automatic Refresh**: Refreshes wishlist after each operation

#### **Updated Methods**
```javascript
// All methods now use the wishlist service
const fetchWishlist = async () => {
  const items = await wishlistService.getItems()
  wishlistItems.value = items.map(item => ({
    id: item.id,
    product_id: item.productId,
    created_at: item.created_at,
    products: { /* transformed data */ }
  }))
}
```

## 🔐 **Authentication Integration**

### **1. Auth Store Updates (`src/stores/auth.js`)**

#### **Automatic Sync on Login**
```javascript
// Listen for auth changes
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  async (event, session) => {
    if (session?.user) {
      await loadUserWithProfile(session.user)
      
      // Sync local cart and wishlist to Supabase after login
      if (event === 'SIGNED_IN') {
        try {
          const { cartService } = await import('../../database/cartService')
          const { wishlistService } = await import('../../database/wishlistService')
          
          await cartService.syncLocalToSupabase(session.user.id)
          await wishlistService.syncLocalToSupabase(session.user.id)
        } catch (err) {
          console.error('Error syncing local data to Supabase:', err)
        }
      }
    }
  }
)
```

### **2. Checkout Authentication**

#### **Checkout.vue Updates**
- ✅ **Login Modal Integration**: Shows login modal for non-authenticated users
- ✅ **Authentication Check**: Prevents checkout without authentication
- ✅ **Seamless Flow**: Redirects to login, then back to checkout

```javascript
const placeOrder = async () => {
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    showLoginModal.value = true
    return
  }
  // ... rest of checkout logic
}
```

#### **Cart.vue Updates**
- ✅ **Checkout Button**: Now checks authentication before proceeding
- ✅ **Login Modal**: Shows login modal for guest users
- ✅ **Smart Navigation**: Handles both authenticated and guest flows

```javascript
const handleCheckout = () => {
  if (!authStore.isAuthenticated) {
    showLoginModal.value = true
  } else {
    // User is authenticated, proceed to checkout
    window.location.href = '/checkout'
  }
}
```

## 📱 **User Experience Features**

### **1. Guest User Experience**
- ✅ **Local Storage**: Cart and wishlist data persists in browser
- ✅ **Product Details**: Fetches product information for local items
- ✅ **Seamless Transition**: Data automatically syncs on login
- ✅ **No Data Loss**: Guest users don't lose their selections

### **2. Authenticated User Experience**
- ✅ **Cloud Storage**: All data stored in Supabase
- ✅ **Cross-Device Sync**: Access cart/wishlist from any device
- ✅ **Profile Management**: Automatic profile creation and management
- ✅ **Data Persistence**: Data survives browser sessions

### **3. Authentication Flow**
- ✅ **Smart Checkout**: Login modal appears when needed
- ✅ **Automatic Sync**: Local data syncs to cloud on login
- ✅ **Seamless Continuation**: User can continue checkout after login
- ✅ **No Interruption**: Smooth user experience throughout

## 🔄 **Data Flow**

### **1. Guest User Flow**
```
1. User adds items to cart/wishlist
2. Data stored in localStorage
3. User attempts checkout
4. Login modal appears
5. User logs in
6. Local data syncs to Supabase
7. User continues checkout
```

### **2. Authenticated User Flow**
```
1. User adds items to cart/wishlist
2. Data stored directly in Supabase
3. User proceeds to checkout
4. Checkout completes normally
```

### **3. Login Sync Flow**
```
1. User logs in
2. Auth state change detected
3. Local cart data synced to Supabase
4. Local wishlist data synced to Supabase
5. Local storage cleared
6. User sees unified cart/wishlist
```

## 🧪 **Testing & Validation**

### **1. Test Scenarios**
- ✅ **Guest User**: Add items, login, verify sync
- ✅ **Authenticated User**: Normal cart/wishlist operations
- ✅ **Login Sync**: Verify local data transfers to cloud
- ✅ **Checkout Flow**: Authentication enforcement
- ✅ **Data Persistence**: Verify data survives sessions

### **2. Validation Points**
- ✅ **Unique Constraints**: No duplicate products per user
- ✅ **Data Consistency**: Local and cloud data match
- ✅ **Error Handling**: Graceful fallbacks for failures
- ✅ **Performance**: Efficient database operations
- ✅ **User Experience**: Smooth authentication flow

## 🚀 **Benefits of Updates**

### **1. User Experience**
- **Seamless Operation**: Works the same for all users
- **No Data Loss**: Guest users can save items locally
- **Smart Authentication**: Login prompts when needed
- **Cross-Device Sync**: Authenticated users access data anywhere

### **2. Technical Benefits**
- **Unified Architecture**: Single service layer for both user types
- **Efficient Operations**: Optimized database queries
- **Error Resilience**: Robust fallback mechanisms
- **Maintainability**: Cleaner, more organized code

### **3. Business Benefits**
- **Higher Conversion**: Guest users can start shopping immediately
- **User Retention**: Seamless transition from guest to authenticated
- **Data Insights**: Better tracking of user behavior
- **Scalability**: Efficient database operations

## ✅ **Summary**

The cart and wishlist functionality has been completely unified to provide:

- **Universal Access**: Works for both signed-in and non-signed-in users
- **Seamless Experience**: No interruption in user flow
- **Smart Authentication**: Login prompts only when needed
- **Data Persistence**: Local storage with cloud sync
- **Efficient Operations**: Optimized database queries and unique constraints
- **Robust Error Handling**: Graceful fallbacks and recovery mechanisms

All cart and wishlist operations now work seamlessly across the application while maintaining data integrity and providing an excellent user experience for both guest and authenticated users.
