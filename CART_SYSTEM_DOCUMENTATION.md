# Cart System Documentation

## Overview

The cart system has been refactored to use Pinia for state management and Supabase as the backend. It supports both authenticated users (with database persistence) and guest users (with localStorage fallback).

## Architecture

### Components

1. **useCartStore.js** - Pinia store that manages all cart logic
2. **useCart.js** - Composable that provides a simple interface to the cart store
3. **ProductCard.vue** - Updated to use the new cart system
4. **CartExample.vue** - Example component demonstrating cart functionality

### Key Features

- ✅ **Dual Mode Support**: Works for both authenticated and guest users
- ✅ **Automatic Sync**: Local cart syncs to database when user logs in
- ✅ **Supabase RPC Integration**: Uses database functions for authenticated users
- ✅ **localStorage Fallback**: Guest users' cart is stored locally
- ✅ **Real-time Updates**: Cart state updates automatically
- ✅ **Error Handling**: Comprehensive error handling and user feedback
- ✅ **Type Safety**: Clear async/await syntax with proper error handling

## Usage

### Basic Usage in Components

```vue
<template>
  <div>
    <button @click="addToCart(product)" :disabled="loading">
      Add to Cart
    </button>
    <span v-if="isInCart(product.id)">
      In Cart ({{ getCartQuantity(product.id) }})
    </span>
  </div>
</template>

<script setup>
import { useCart } from '@/composables/useCart'

const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  isInCart,
  getCartQuantity,
  loading,
  error,
  feedback,
  totalItems,
  cartItems,
  hasItems,
  subtotal,
  total,
  isGuest
} = useCart()

// Add a product to cart
const handleAddToCart = async (product) => {
  await addToCart(product, 1) // product object and quantity
}
</script>
```

### Store Methods

#### useCartStore Methods

```javascript
import { useCartStore } from '@/stores/useCartStore'

const cartStore = useCartStore()

// Fetch cart data (automatically determines Supabase vs localStorage)
await cartStore.fetchCart()

// Add item to cart
await cartStore.addToCart(productId, quantity)

// Remove item from cart
await cartStore.removeFromCart(productId)

// Update item quantity
await cartStore.updateQuantity(productId, quantity)

// Clear entire cart
await cartStore.clearCart()

// Sync local cart to Supabase (called automatically on login)
await cartStore.syncLocalCart()

// Get cart statistics
const stats = cartStore.getCartStats()
```

#### useCart Composable Methods

```javascript
import { useCart } from '@/composables/useCart'

const {
  // State
  loading,
  error,
  feedback,
  
  // Computed
  totalItems,
  cartItems,
  hasItems,
  subtotal,
  deliveryFee,
  total,
  isGuest,
  cartId,
  
  // Methods
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  isInCart,
  getCartQuantity,
  fetchCart,
  syncLocalCart,
  clearError
} = useCart()
```

## Database Schema

### Cart Table
```sql
CREATE TABLE cart (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'active',
  total_price numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Cart Items Table
```sql
CREATE TABLE cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid references cart(id) on delete cascade,
  product_id uuid references products(id),
  quantity int default 1,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  unique(cart_id, product_id)
);
```

### RPC Functions

The system uses these Supabase RPC functions:

1. **add_to_cart(p_product_id, p_quantity)** - Adds or updates cart item
2. **decrease_or_remove_row(p_product_id, p_quantity)** - Decreases or removes cart item
3. **clear_user_cart()** - Clears all items from user's cart

## Authentication Flow

### Guest User Flow
1. User adds items to cart → Stored in localStorage
2. User logs in → `syncLocalCart()` is called automatically
3. Local cart items are added to Supabase using RPC functions
4. Local cart is cleared
5. Cart data is fetched from Supabase

### Authenticated User Flow
1. User adds items to cart → Stored in Supabase using RPC functions
2. Cart data is fetched from Supabase
3. Real-time updates are handled automatically

## Error Handling

The system includes comprehensive error handling:

- **Session Validation**: Checks for valid, non-expired sessions
- **RLS Compliance**: Ensures all operations respect Row Level Security
- **User Feedback**: Provides clear error messages to users
- **Graceful Degradation**: Falls back to local storage when needed

## State Management

### Pinia Store State
```javascript
{
  items: [],           // Array of cart items
  cartId: null,        // Supabase cart ID (for authenticated users)
  isGuest: true,       // Whether user is a guest
  loading: false,      // Loading state
  error: null,         // Error message
  lastUpdated: null    // Last update timestamp
}
```

### Cart Item Structure
```javascript
{
  id: 'uuid',                    // Item ID
  product_id: 'uuid',           // Product ID
  quantity: 1,                  // Quantity
  name: 'Product Name',         // Product name
  price: 1000,                  // Product price
  image: 'image_url',           // Product image
  seller_id: 'uuid',            // Seller ID
  updated_at: 'timestamp'       // Last update time
}
```

## Integration with Existing Components

### ProductCard.vue
The ProductCard component has been updated to use the new cart system:

```vue
<script setup>
import { useCart } from '../composables/useCart'

const { 
  addToCart, 
  loading: cartLoading, 
  feedback: cartFeedback 
} = useCart()

const handleAddToCart = async () => {
  await addToCart(props.product)
}
</script>
```

## Testing

### Manual Testing Checklist

1. **Guest User Testing**
   - [ ] Add items to cart (stored in localStorage)
   - [ ] Remove items from cart
   - [ ] Update quantities
   - [ ] Clear cart
   - [ ] Refresh page (cart persists)

2. **Authenticated User Testing**
   - [ ] Add items to cart (stored in Supabase)
   - [ ] Remove items from cart
   - [ ] Update quantities
   - [ ] Clear cart
   - [ ] Refresh page (cart persists)

3. **Login/Logout Testing**
   - [ ] Add items as guest
   - [ ] Log in (cart syncs to Supabase)
   - [ ] Log out (cart switches to local)
   - [ ] Log back in (cart loads from Supabase)

4. **Error Handling Testing**
   - [ ] Test with invalid product IDs
   - [ ] Test with expired sessions
   - [ ] Test network errors

## Performance Considerations

- **Lazy Loading**: Cart data is only fetched when needed
- **Efficient Updates**: Only changed items are updated
- **Caching**: Cart data is cached in Pinia store
- **Real-time**: Uses Supabase real-time subscriptions for updates

## Security

- **RLS Policies**: All database operations respect Row Level Security
- **Session Validation**: Every operation validates user session
- **Input Validation**: All inputs are validated before processing
- **Error Sanitization**: Error messages are sanitized before display

## Troubleshooting

### Common Issues

1. **Cart not syncing on login**
   - Check if `syncLocalCart()` is being called
   - Verify user authentication state
   - Check browser console for errors

2. **Items not persisting**
   - Check localStorage for guest users
   - Check Supabase for authenticated users
   - Verify RLS policies

3. **Permission errors**
   - Ensure user is properly authenticated
   - Check session validity
   - Verify RLS policies are correct

### Debug Mode

Enable debug logging by checking browser console for messages prefixed with:
- 🔐 Session validation
- 🛒 Cart operations
- ➕ Adding items
- ➖ Removing items
- 🔄 Syncing operations
- ✅ Success messages
- ❌ Error messages

## Future Enhancements

- [ ] Cart abandonment recovery
- [ ] Cart sharing between devices
- [ ] Cart analytics
- [ ] Bulk operations
- [ ] Cart templates
- [ ] Wishlist integration
