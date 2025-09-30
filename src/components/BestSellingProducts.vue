<script setup>
import { onMounted, computed } from 'vue';
import { useProducts } from '@/composables/useProducts.js';
import ProductCard from './ProductCard.vue';

const props = defineProps({
  categoryId: { type: String, default: null },
  title: { type: String, default: "Best Selling Products" }
});

const { 
  bestSellingProducts, 
  bestSellingByCategory, 
  loading, 
  error, 
  fetchBestSellingProducts,
  fetchBestSellingProductsByCategory 
} = useProducts();

// Transform the best-selling products data to match ProductCard expectations
const transformProduct = (product) => {
  return {
    id: product.product_id,
    name: product.product_name,
    category_id: product.category_id,
    total_sold: product.total_quantity,
    // Add default values for required fields
    price: 0, // Best-selling products don't have price info
    stock_quantity: 0,
    image_urls: [],
    is_new: false,
    is_on_sale: false,
    original_price: null
  };
};

// Use the appropriate products based on whether we have a categoryId
const products = computed(() => {
  const sourceProducts = props.categoryId ? bestSellingByCategory.value : bestSellingProducts.value;
  return sourceProducts.map(transformProduct);
});

onMounted(async () => {
  if (props.categoryId) {
    await fetchBestSellingProductsByCategory(props.categoryId);
  } else {
    await fetchBestSellingProducts();
  }
});
</script>

<template>
  <div class="my-8">
    <h2 class="text-xl font-bold mb-4">{{ title }}</h2>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else-if="!products.length" class="text-gray-500">
      No products yet.
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
      <div
        v-for="product in products"
        :key="product.id"
        class="relative"
      >
        <ProductCard :product="product" />
        <!-- Best-selling indicator -->
        <div class="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          <i class="fas fa-star mr-1"></i>
          Best Seller
        </div>
        <!-- Sales count -->
        <div class="absolute bottom-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          {{ product.total_sold }} sold
        </div>
      </div>
    </div>
  </div>
</template>
