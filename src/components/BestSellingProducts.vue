<template>
  <div class="best-selling-products">
    <!-- Header -->
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {{ $t('bestSelling.title', 'Best Selling Products') }}
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        {{ $t('bestSelling.subtitle', 'Discover our most popular products') }}
      </p>
    </div>

    <!-- Category Filter -->
    <div v-if="showCategoryFilter" class="mb-6">
      <div class="flex flex-wrap gap-2">
        <button
          @click="selectCategory(null)"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            selectedCategory === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          ]"
        >
          {{ $t('bestSelling.allCategories', 'All Categories') }}
        </button>
        <button
          v-for="category in categories"
          :key="category.id"
          @click="selectCategory(category.id)"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            selectedCategory === category.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          ]"
        >
          {{ category.name }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">
          {{ $t('bestSelling.loading', 'Loading best-selling products...') }}
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="max-w-md mx-auto">
        <div class="mb-4">
          <svg class="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ $t('bestSelling.errorTitle', 'Failed to load products') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {{ error }}
        </p>
        <button
          @click="retry"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {{ $t('bestSelling.retry', 'Try Again') }}
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!hasProducts" class="text-center py-12">
      <div class="max-w-md mx-auto">
        <div class="mb-4">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ $t('bestSelling.emptyTitle', 'No products found') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          {{ $t('bestSelling.emptyMessage', 'There are no best-selling products available at the moment.') }}
        </p>
      </div>
    </div>

    <!-- Products Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="product in displayedProducts"
        :key="product.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
      >
        <!-- Product Image -->
        <div class="aspect-w-16 aspect-h-12 bg-gray-200 dark:bg-gray-700">
          <img
            v-if="product.image_url"
            :src="product.image_url"
            :alt="product.name"
            class="w-full h-48 object-cover"
            loading="lazy"
          />
          <div
            v-else
            class="w-full h-48 flex items-center justify-center text-gray-400 dark:text-gray-500"
          >
            <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <!-- Product Info -->
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {{ product.name }}
          </h3>
          
          <p v-if="product.description" class="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {{ product.description }}
          </p>

          <!-- Price -->
          <div class="flex items-center justify-between mb-3">
            <span class="text-xl font-bold text-blue-600 dark:text-blue-400">
              ${{ formatPrice(product.price) }}
            </span>
            <span v-if="product.original_price && product.original_price > product.price" class="text-sm text-gray-500 line-through">
              ${{ formatPrice(product.original_price) }}
            </span>
          </div>

          <!-- Store Info -->
          <div v-if="product.store_name" class="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {{ $t('bestSelling.soldBy', 'Sold by') }} {{ product.store_name }}
          </div>

          <!-- Stats -->
          <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span v-if="product.total_sold">
              {{ $t('bestSelling.sold', 'Sold') }}: {{ product.total_sold }}
            </span>
            <span v-if="product.rating" class="flex items-center">
              <svg class="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {{ product.rating.toFixed(1) }}
            </span>
          </div>

          <!-- Action Button -->
          <button
            @click="viewProduct(product)"
            class="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {{ $t('bestSelling.viewProduct', 'View Product') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Load More Button (if needed) -->
    <div v-if="hasMoreProducts" class="text-center mt-8">
      <button
        @click="loadMore"
        :disabled="loading"
        class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
        {{ $t('bestSelling.loadMore', 'Load More') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProducts } from '../composables/useProducts'
import { useI18n } from 'vue-i18n'

// Props
const props = defineProps({
  categoryId: {
    type: String,
    default: null
  },
  showCategoryFilter: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  },
  limit: {
    type: Number,
    default: null
  }
})

// Composables
const router = useRouter()
const { t } = useI18n()
const {
  bestSellingProducts,
  bestSellingByCategory,
  loading,
  error,
  hasProducts,
  fetchBestSellingProducts,
  fetchBestSellingProductsByCategory,
  clearError
} = useProducts()

// Local state
const selectedCategory = ref(props.categoryId)
const displayedLimit = ref(props.limit)

// Computed
const displayedProducts = computed(() => {
  let products = []
  
  if (selectedCategory.value) {
    products = bestSellingByCategory.value
  } else {
    products = bestSellingProducts.value
  }
  
  if (displayedLimit.value && products.length > displayedLimit.value) {
    return products.slice(0, displayedLimit.value)
  }
  
  return products
})

const hasMoreProducts = computed(() => {
  if (!displayedLimit.value) return false
  
  let products = []
  if (selectedCategory.value) {
    products = bestSellingByCategory.value
  } else {
    products = bestSellingProducts.value
  }
  
  return products.length > displayedLimit.value
})

// Methods
const selectCategory = async (categoryId) => {
  selectedCategory.value = categoryId
  clearError()
  
  if (categoryId) {
    await fetchBestSellingProductsByCategory(categoryId)
  } else {
    await fetchBestSellingProducts()
  }
}

const retry = async () => {
  clearError()
  if (selectedCategory.value) {
    await fetchBestSellingProductsByCategory(selectedCategory.value)
  } else {
    await fetchBestSellingProducts()
  }
}

const loadMore = () => {
  if (displayedLimit.value) {
    displayedLimit.value += props.limit || 8
  }
}

const viewProduct = (product) => {
  const currentLocale = router.currentRoute.value.meta?.locale || 'en'
  router.push(`/${currentLocale}/product/${product.id}`)
}

const formatPrice = (price) => {
  if (typeof price !== 'number') return '0.00'
  return price.toFixed(2)
}

// Lifecycle
onMounted(async () => {
  if (props.categoryId) {
    selectedCategory.value = props.categoryId
    await fetchBestSellingProductsByCategory(props.categoryId)
  } else {
    await fetchBestSellingProducts()
  }
})

// Watchers
watch(() => props.categoryId, (newCategoryId) => {
  if (newCategoryId !== selectedCategory.value) {
    selectCategory(newCategoryId)
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.aspect-w-16 {
  position: relative;
  padding-bottom: 75%; /* 16:12 aspect ratio */
}

.aspect-w-16 > * {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
</style>
