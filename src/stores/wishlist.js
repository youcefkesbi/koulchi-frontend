import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { wishlistService } from '../../database/wishlistService.js';

export const useWishlistStore = defineStore('wishlist', () => {
  // State
  const wishlistItems = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Actions
  const fetchWishlist = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      // Use the wishlist service to fetch items
      const items = await wishlistService.getItems();
      
      // Transform the data to match the expected format
      wishlistItems.value = items.map(item => ({
        id: item.id,
        product_id: item.productId,
        created_at: item.created_at,
        products: {
          id: item.id,
          name: item.name,
          price: item.price,
          image_urls: item.image ? [item.image] : [],
          seller_id: item.seller_id,
          stock_quantity: 0, // Default value since not in wishlist data
          is_new: false, // Default value since not in wishlist data
          is_on_sale: false // Default value since not in wishlist data
        }
      }));
      
      return wishlistItems.value;
    } catch (err) {
      error.value = err.message || 'Failed to fetch wishlist';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addToWishlist = async (productId) => {
    try {
      console.log('=== Wishlist Store addToWishlist START ===')
      console.log('Wishlist store addToWishlist called with:', { productId })
      console.log('Wishlist service available:', !!wishlistService)
      
      // Use the wishlist service to add item
      console.log('Calling wishlistService.addItem...')
      await wishlistService.addItem(productId);
      console.log('wishlistService.addItem completed successfully')
      
      // Refresh wishlist items
      console.log('Refreshing wishlist items...')
      await fetchWishlist();
      console.log('Wishlist items refreshed successfully')
      
      console.log('=== Wishlist Store addToWishlist SUCCESS ===')
      return true;
    } catch (err) {
      console.error('=== Wishlist Store addToWishlist ERROR ===')
      error.value = err.message || 'Failed to add to wishlist';
      console.error('Error adding to wishlist:', err)
      throw err;
    }
  };

  const removeFromWishlist = async (wishlistItemId) => {
    try {
      // Find the wishlist item to remove
      const itemIndex = wishlistItems.value.findIndex(item => item.id === wishlistItemId);
      if (itemIndex === -1) throw new Error('Wishlist item not found');
      
      const item = wishlistItems.value[itemIndex];
      
      // Use the wishlist service to remove item from database
      await wishlistService.removeItem(item.product_id);
      
      // Update local state immediately (optimistic update)
      wishlistItems.value.splice(itemIndex, 1);
      
      return true;
    } catch (err) {
      error.value = err.message || 'Failed to remove from wishlist';
      throw err;
    }
  };

  const removeProductFromWishlist = async (productId) => {
    try {
      // Find and remove all items with this product ID
      const itemsToRemove = wishlistItems.value.filter(item => item.product_id === productId);
      
      if (itemsToRemove.length === 0) {
        throw new Error('Product not found in wishlist');
      }
      
      // Remove from database
      await wishlistService.removeItem(productId);
      
      // Update local state immediately
      wishlistItems.value = wishlistItems.value.filter(item => item.product_id !== productId);
      
      return true;
    } catch (err) {
      error.value = err.message || 'Failed to remove from wishlist';
      throw err;
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.value.some(item => item.product_id === productId);
  };

  const clearWishlist = async () => {
    try {
      // Use the wishlist service to clear wishlist
      await wishlistService.clearWishlist();
      
      // Clear local state
      wishlistItems.value = [];
      
      return true;
    } catch (err) {
      error.value = err.message || 'Failed to clear wishlist';
      throw err;
    }
  };

  // Sync local wishlist to Supabase after login
  const syncLocalToSupabase = async () => {
    try {
      await wishlistService.syncLocalToSupabase();
      // Refresh wishlist items after sync
      await fetchWishlist();
    } catch (err) {
      error.value = err.message || 'Failed to sync local wishlist to Supabase';
      throw err;
    }
  };

  // Computed
  const totalItems = computed(() => wishlistItems.value.length);

  const wishlistProducts = computed(() => 
    wishlistItems.value.map(item => item.products).filter(Boolean)
  );

  return {
    // State
    wishlistItems,
    loading,
    error,
    
    // Computed
    totalItems,
    wishlistProducts,
    
    // Actions
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    removeProductFromWishlist,
    isInWishlist,
    clearWishlist,
    syncLocalToSupabase,
  };
});
