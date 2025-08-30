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
          name_ar: item.nameAr,
          price: item.price,
          image_urls: item.image ? [item.image] : [],
          seller_id: item.seller_id
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
      // Use the wishlist service to add item
      await wishlistService.addItem(productId);
      
      // Refresh wishlist items
      await fetchWishlist();
      
      return true;
    } catch (err) {
      error.value = err.message || 'Failed to add to wishlist';
      throw err;
    }
  };

  const removeFromWishlist = async (wishlistItemId) => {
    try {
      // Find the product ID from the wishlist item
      const item = wishlistItems.value.find(item => item.id === wishlistItemId);
      if (!item) throw new Error('Wishlist item not found');
      
      // Use the wishlist service to remove item
      await wishlistService.removeItem(item.product_id);
      
      // Refresh wishlist items
      await fetchWishlist();
      
      return true;
    } catch (err) {
      error.value = err.message || 'Failed to remove from wishlist';
      throw err;
    }
  };

  const removeProductFromWishlist = async (productId) => {
    try {
      // Use the wishlist service to remove item
      await wishlistService.removeItem(productId);
      
      // Refresh wishlist items
      await fetchWishlist();
      
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
  const syncLocalToSupabase = async (userId) => {
    try {
      await wishlistService.syncLocalToSupabase(userId);
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
