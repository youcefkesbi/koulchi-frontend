import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error: supabaseError } = await supabase
        .from('wishlist')
        .select(`
          id,
          product_id,
          created_at,
          products (
            id,
            name,
            name_ar,
            description,
            price,
            image_urls,
            stock_quantity,
            is_new,
            is_on_sale,
            category_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (supabaseError) throw supabaseError;
      
      wishlistItems.value = data || [];
      return data;
    } catch (err) {
      error.value = err.message || 'Failed to fetch wishlist';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addToWishlist = async (productId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if product is already in wishlist
      const existingItem = wishlistItems.value.find(item => item.product_id === productId);
      if (existingItem) {
        throw new Error('Product is already in your wishlist');
      }

      const { data, error: supabaseError } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.id,
          product_id: productId
        })
        .select()
        .single();
      
      if (supabaseError) throw supabaseError;
      
      // Fetch the product details to add to wishlist
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (productError) throw productError;
      
      // Add to local state
      wishlistItems.value.unshift({
        ...data,
        products: productData
      });
      
      return data;
    } catch (err) {
      error.value = err.message || 'Failed to add to wishlist';
      throw err;
    }
  };

  const removeFromWishlist = async (wishlistItemId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error: supabaseError } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistItemId)
        .eq('user_id', user.id);
      
      if (supabaseError) throw supabaseError;
      
      // Remove from local state
      wishlistItems.value = wishlistItems.value.filter(item => item.id !== wishlistItemId);
      
      return true;
    } catch (err) {
      error.value = err.message || 'Failed to remove from wishlist';
      throw err;
    }
  };

  const removeProductFromWishlist = async (productId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error: supabaseError } = await supabase
        .from('wishlist')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', user.id);
      
      if (supabaseError) throw supabaseError;
      
      // Remove from local state
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error: supabaseError } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id);
      
      if (supabaseError) throw supabaseError;
      
      // Clear local state
      wishlistItems.value = [];
      
      return true;
    } catch (err) {
      error.value = err.message || 'Failed to clear wishlist';
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
  };
});
