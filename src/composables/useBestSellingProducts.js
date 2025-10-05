import { ref } from 'vue';
import { supabase } from '../lib/supabase';

export function useBestSellers() {
  const products = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchBestSellers({ categoryId = null } = {}) {
    loading.value = true; 
    error.value = null;
    
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      products.value = data || [];
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching best sellers:', err);
    } finally {
      loading.value = false;
    }
  }

  return { products, loading, error, fetchBestSellers };
}