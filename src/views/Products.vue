<template>
  <div class="container-lg space-y-8 section-padding">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
      <div>
        <h1 class="text-3xl font-bold text-dark">
          {{ hasSearchQuery ? 'نتائج البحث' : 'المنتجات' }}
        </h1>
        <p class="text-gray-600 mt-2">
          <span v-if="hasSearchQuery">
            {{ filteredProducts.length }} منتج، {{ filteredStores.length }} متجر
          </span>
          <span v-else>
            {{ filteredProducts.length }} منتج متوفر
            <span v-if="productStore.selectedCategory !== 'all'">
              في فئة {{ getCurrentCategoryName }}
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
            placeholder="ابحث في المنتجات..."
            class="input-field pr-10"
          />
          <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
        
        <button
          @click="clearFilters"
          class="btn-outline"
        >
          <i class="fas fa-times ml-2"></i>
          مسح الفلاتر
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

    <!-- Search Results: Products -->
    <div v-if="hasSearchQuery && (filteredProducts.length > 0 || filteredStores.length > 0)" class="space-y-8">
      <!-- Products Section -->
      <div v-if="filteredProducts.length > 0">
        <h2 class="text-2xl font-bold text-dark mb-4">المنتجات ({{ filteredProducts.length }})</h2>
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
    <div v-else class="text-center py-12">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-search text-gray-400 text-3xl"></i>
      </div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">
        {{ hasSearchQuery ? 'لم يتم العثور على نتائج' : 'لم يتم العثور على منتجات' }}
      </h3>
      <p class="text-gray-500 mb-6">
        {{ hasSearchQuery ? 'جرب البحث بكلمات مختلفة' : 'جرب تغيير الفلاتر أو البحث بكلمات مختلفة' }}
      </p>
      <button
        @click="clearFilters"
        class="btn-primary"
      >
        <i class="fas fa-refresh ml-2"></i>
        {{ hasSearchQuery ? 'عرض جميع المنتجات' : 'عرض جميع المنتجات' }}
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
import { ref, computed, onMounted, watch } from 'vue'
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

const filteredProducts = computed(() => productStore.filteredProducts)
const hasSearchQuery = computed(() => {
  return searchQuery.value && searchQuery.value.trim().length > 0
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

const handleSearch = async () => {
  const query = searchQuery.value.trim()
  productStore.setSearchQuery(query)
  
  // If there's a search query and products aren't loaded, fetch them
  if (query && productStore.products.length === 0) {
    await productStore.initializeStore()
  }
  
  // Search stores if there's a query
  if (query) {
    await searchStores(query)
  } else {
    // Clear stores when search is empty
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
  filteredStores.value = []
}

// Initialize search query from URL params
const initializeFromRoute = async () => {
  const routeSearchQuery = route.query.search
  if (routeSearchQuery) {
    searchQuery.value = routeSearchQuery
    productStore.setSearchQuery(routeSearchQuery)
    // Search stores when initializing from route
    await searchStores(routeSearchQuery)
  } else {
    // Clear search if no query param
    searchQuery.value = ''
    productStore.setSearchQuery('')
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
    // Search stores when route query changes
    if (newQuery) {
      await searchStores(newQuery)
    } else {
      filteredStores.value = []
    }
  }
})

// Watch for search query changes in the input field (real-time filtering)
watch(() => searchQuery.value, async (newQuery) => {
  const trimmedQuery = newQuery.trim()
  productStore.setSearchQuery(trimmedQuery)
  
  // Search stores if there's a query
  if (trimmedQuery) {
    await searchStores(trimmedQuery)
  } else {
    filteredStores.value = []
  }
})

// Fetch products and categories on component mount
onMounted(async () => {
  // Always initialize store to load products
  if (productStore.products.length === 0) {
    await productStore.initializeStore()
  }
  await initializeFromRoute()
})
</script> 