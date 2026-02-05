<template>
  <div class="container-lg space-y-8 section-padding">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
      <div>
        <h1 class="text-3xl font-bold text-dark">
          {{ hasSearchQuery ? $t('productsPage.searchResults') : $t('productsPage.products') }}
        </h1>
        <p class="text-gray-600 mt-2">
          <span v-if="hasSearchQuery">
            {{ $t('productsPage.searchCount', { products: filteredProducts.length, stores: filteredStores.length }) }}
          </span>
          <span v-else>
            {{ $t('productsPage.productsCount', { count: filteredProducts.length }) }}
            <span v-if="productStore.selectedCategory !== 'all'">
              {{ $t('productsPage.inCategory', { name: getCurrentCategoryName }) }}
            </span>
          </span>
        </p>
      </div>
      
      <!-- Search and Filter Controls -->
      <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        <div class="relative">
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            :placeholder="$t('productsPage.searchPlaceholder')"
            class="input-field pr-10"
          />
          <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
        
        <button
          @click="clearFilters"
          class="btn-outline"
        >
          <i class="fas fa-times ml-2"></i>
          {{ $t('productsPage.clearFilters') }}
        </button>
      </div>
    </div>

    <!-- Category Filter -->
    <div class="flex flex-wrap gap-2">
                      <button
          v-for="category in productStore.categories"
          :key="category.id"
          @click="selectCategory(category.id)"
          :class="[
            'px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2',
            productStore.selectedCategory === category.id
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          <img 
            v-if="category.icon_url" 
            :src="category.icon_url" 
            :alt="getCategoryName(category.id)"
            class="w-4 h-4 object-contain"
          />
          <i v-else class="fas fa-box text-sm"></i>
          {{ getCategoryName(category.id) }}
        </button>
    </div>

    <!-- Loading State -->
    <div v-if="hasSearchQuery && (loadingProducts || loadingStores)" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      <p class="text-gray-600">{{ $t('productsPage.searching') }}</p>
    </div>

    <!-- Search Error State -->
    <div v-else-if="hasSearchQuery && searchError" class="text-center py-12">
      <div class="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-exclamation-triangle text-red-500 text-3xl"></i>
      </div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">{{ $t('productsPage.searchError') }}</h3>
      <p class="text-gray-500 mb-6">{{ searchError }}</p>
      <button
        @click="handleSearch"
        class="btn-primary"
      >
        <i class="fas fa-refresh ml-2"></i>
        {{ $t('productsPage.retry') }}
      </button>
    </div>

    <!-- Search Results: Products and Stores -->
    <div v-else-if="hasSearchQuery && (filteredProducts.length > 0 || filteredStores.length > 0)" class="space-y-8">
      <!-- Products Section -->
      <div v-if="filteredProducts.length > 0">
        <h2 class="text-2xl font-bold text-dark mb-4">{{ $t('productsPage.products') }} ({{ filteredProducts.length }})</h2>
        <div class="grid-responsive">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>

      <!-- Stores Section -->
      <div v-if="filteredStores.length > 0">
        <h2 class="text-2xl font-bold text-dark mb-4">المتاجر ({{ filteredStores.length }})</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <router-link
            v-for="store in filteredStores"
            :key="store.id"
            :to="`/stores/${store.id}`"
            class="bg-white rounded-2xl shadow-soft hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group overflow-hidden"
          >
            <!-- Store Banner -->
            <div class="relative h-48 rounded-t-2xl overflow-hidden">
              <img 
                v-if="store.banner_url" 
                :src="store.banner_url" 
                :alt="store.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div v-else class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <i class="fas fa-store text-4xl text-gray-400"></i>
              </div>
              
              <!-- Store Logo Overlay -->
              <div class="absolute bottom-4 left-4">
                <div class="w-16 h-16 bg-white rounded-xl shadow-soft p-2">
                  <img 
                    v-if="store.logo_url" 
                    :src="store.logo_url" 
                    :alt="store.name"
                    class="w-full h-full object-cover rounded-lg"
                  />
                  <div v-else class="w-full h-full bg-primary rounded-lg flex items-center justify-center">
                    <i class="fas fa-store text-white text-xl"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- Store Info -->
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                {{ store.name }}
              </h3>
              <p v-if="store.description" class="text-gray-600 mb-4 line-clamp-2">
                {{ store.description }}
              </p>
              <p v-else class="text-gray-500 mb-4 italic text-sm">
                لا يوجد وصف
              </p>
              
              <!-- Store Meta -->
              <div class="flex items-center justify-between text-sm text-gray-500">
                <span class="flex items-center">
                  <i class="fas fa-calendar mr-2"></i>
                  {{ formatDate(store.created_at) }}
                </span>
                <span class="flex items-center text-primary font-medium">
                  زيارة المتجر
                  <i class="fas fa-arrow-right mr-2 group-hover:translate-x-1 transition-transform"></i>
                </span>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Products Grid (when no search) -->
    <div v-else-if="!hasSearchQuery && filteredProducts.length > 0" class="grid-responsive">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
      />
    </div>

    <!-- No Results Found -->
    <div v-else-if="hasSearchQuery && !loadingProducts && !loadingStores && filteredProducts.length === 0 && filteredStores.length === 0" class="text-center py-12">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-search text-gray-400 text-3xl"></i>
      </div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">لم يتم العثور على نتائج</h3>
      <p class="text-gray-500 mb-6">
        لم نجد أي منتجات أو متاجر تطابق "{{ searchQuery }}"
      </p>
      <button
        @click="clearFilters"
        class="btn-primary"
      >
        <i class="fas fa-refresh ml-2"></i>
        {{ $t('productsPage.viewAll') }}
      </button>
    </div>

    <!-- No Products Found (when not searching) -->
    <div v-else-if="!hasSearchQuery && filteredProducts.length === 0 && !productStore.loading" class="text-center py-12">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-box text-gray-400 text-3xl"></i>
      </div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">لم يتم العثور على منتجات</h3>
      <p class="text-gray-500 mb-6">
        جرب تغيير الفلاتر أو البحث بكلمات مختلفة
      </p>
      <button
        @click="clearFilters"
        class="btn-primary"
      >
        <i class="fas fa-refresh ml-2"></i>
        {{ $t('productsPage.viewAll') }}
      </button>
    </div>

    <!-- Load More Button (if needed) -->
    <div v-if="filteredProducts.length > 0" class="text-center">
      <button class="btn-outline">
        <i class="fas fa-plus ml-2"></i>
        عرض المزيد
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import i18n from '../i18n'
import { useProductStore } from '../stores/useProductStore'
import { useStoreStore } from '../stores/useStoresStore'
import ProductCard from '../components/ProductCard.vue'

const { t } = useI18n()
const route = useRoute()
const productStore = useProductStore()
const storeStore = useStoreStore()
const searchQuery = ref('')
const filteredStores = ref([])
const loadingStores = ref(false)
const searchResults = ref([]) // Products from Supabase search
const loadingProducts = ref(false)
const searchError = ref(null)

const hasSearchQuery = computed(() => {
  return searchQuery.value && searchQuery.value.trim().length > 0
})

// Use search results when there's a query, otherwise use filtered products
const filteredProducts = computed(() => {
  if (hasSearchQuery.value) {
    // When searching, use results from Supabase
    return searchResults.value
  } else {
    // When not searching, use local filtered products
    return productStore.filteredProducts
  }
})

const getCurrentCategoryName = computed(() => {
  const category = productStore.categories.find(cat => cat.id === productStore.selectedCategory)
  return category ? getCategoryName(category.id) : ''
})

const getCategoryName = (categoryId) => {
  const category = productStore.categories.find(cat => cat.id === categoryId)
  if (category) {
    // Check if we have a localized name for the current language
    const currentLocale = i18n.global.locale.value
    
    if (currentLocale === 'ar' && category.name_ar) {
      return category.name_ar
    }
    
    if (currentLocale === 'fr' && category.name_fr) {
      return category.name_fr
    }
    
    // Fall back to the English name field
    return category.name_en
  }
  return categoryId
}

const searchProducts = async (query) => {
  try {
    loadingProducts.value = true
    searchError.value = null
    
    if (!query || !query.trim()) {
      // Empty query - clear search results
      searchResults.value = []
      return
    }
    
    // Query Supabase directly for products
    const results = await productStore.searchProducts(query.trim(), productStore.selectedCategory)
    searchResults.value = results || []
  } catch (err) {
    console.error('Error searching products:', err)
    searchError.value = err?.message || 'Failed to search products'
    searchResults.value = []
  } finally {
    loadingProducts.value = false
  }
}

const handleSearch = async () => {
  const query = searchQuery.value.trim()
  productStore.setSearchQuery(query)
  
  // Search products and stores from Supabase
  if (query) {
    await Promise.all([
      searchProducts(query),
      searchStores(query)
    ])
  } else {
    // Clear search results when query is empty
    searchResults.value = []
    filteredStores.value = []
  }
}

const searchStores = async (query) => {
  try {
    loadingStores.value = true
    const results = await storeStore.searchStores(query)
    filteredStores.value = results || []
  } catch (err) {
    console.error('Error searching stores:', err)
    filteredStores.value = []
  } finally {
    loadingStores.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const selectCategory = (categoryId) => {
  productStore.setCategory(categoryId)
}

const clearFilters = () => {
  productStore.clearFilters()
  searchQuery.value = ''
  searchResults.value = []
  filteredStores.value = []
  searchError.value = null
}

// Initialize search query from URL params
const initializeFromRoute = async () => {
  const routeSearchQuery = route.query.search
  if (routeSearchQuery) {
    searchQuery.value = routeSearchQuery
    productStore.setSearchQuery(routeSearchQuery)
    // Search products and stores when initializing from route
    await Promise.all([
      searchProducts(routeSearchQuery),
      searchStores(routeSearchQuery)
    ])
  } else {
    // Clear search if no query param
    searchQuery.value = ''
    productStore.setSearchQuery('')
    searchResults.value = []
    filteredStores.value = []
  }
  
  // Handle category from route if needed
  const routeCategory = route.query.category
  if (routeCategory) {
    productStore.setCategory(routeCategory)
  }
}

// Watch for route changes
watch(() => route.query.search, async (newSearch) => {
  const newQuery = newSearch || ''
  if (newQuery !== searchQuery.value) {
    searchQuery.value = newQuery
    productStore.setSearchQuery(newQuery)
    // Search products and stores when route query changes
    if (newQuery) {
      await Promise.all([
        searchProducts(newQuery),
        searchStores(newQuery)
      ])
    } else {
      searchResults.value = []
      filteredStores.value = []
    }
  }
})

// Watch for search query changes in the input field (real-time search with debouncing)
let searchDebounceTimer = null
watch(() => searchQuery.value, async (newQuery) => {
  const trimmedQuery = newQuery.trim()
  productStore.setSearchQuery(trimmedQuery)
  
  // Clear previous debounce timer
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  
  // Debounce the search to avoid too many queries
  searchDebounceTimer = setTimeout(async () => {
    if (trimmedQuery) {
      await Promise.all([
        searchProducts(trimmedQuery),
        searchStores(trimmedQuery)
      ])
    } else {
      searchResults.value = []
      filteredStores.value = []
    }
  }, 300) // 300ms debounce
})

// Fetch products and categories on component mount
onMounted(async () => {
  // Always initialize store to load products (for non-search view)
  if (productStore.products.length === 0) {
    await productStore.initializeStore()
  }
  await initializeFromRoute()
})

// Cleanup debounce timer on unmount
onUnmounted(() => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
})
</script> 