import { ref } from 'vue';

export function useBestSellers() {
  const products = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchBestSellers({ categoryId = null } = {}) {
    loading.value = true; error.value = null;
    try {
      const url = categoryId
        ? `${import.meta.env.VITE_BACKEND_URL}/api/products/best-sellers/category/${categoryId}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/products/best-sellers`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      products.value = await res.json();
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  return { products, loading, error, fetchBestSellers };
}