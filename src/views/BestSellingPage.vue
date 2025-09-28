<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ $t('bestSelling.pageTitle', 'Best Selling Products') }}
            </h1>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {{ $t('bestSelling.pageSubtitle', 'Discover the most popular products on our platform') }}
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Refresh Button -->
            <button
              @click="refreshProducts"
              :disabled="loading"
              class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <svg class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ $t('bestSelling.refresh', 'Refresh') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Best Selling Products Component -->
      <BestSellingProducts
        :show-category-filter="true"
        :categories="categories"
        :limit="12"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProducts } from '../composables/useProducts'
import BestSellingProducts from '../components/BestSellingProducts.vue'

// Composables
const { refreshBestSellingProducts, loading } = useProducts()

// Local state
const categories = ref([
  { id: 'electronics', name: 'Electronics' },
  { id: 'clothing', name: 'Clothing' },
  { id: 'home', name: 'Home & Garden' },
  { id: 'sports', name: 'Sports' },
  { id: 'books', name: 'Books' }
])

// Methods
const refreshProducts = async () => {
  await refreshBestSellingProducts()
}

// Lifecycle
onMounted(() => {
  // Component will handle its own data fetching
})
</script>
