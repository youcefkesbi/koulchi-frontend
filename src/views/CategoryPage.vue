<template>
  <div class="my-fade-in">
    <!-- Category Banner Carousel -->
    <section class="mx-4 sm:mx-6 mb-8 sm:mb-12">
      <CategoryBanner
        v-if="categoryId !== 'all'"
        :category-id="categoryId"
        :show-main-banner="true"
        :main-banner-title="getCategoryName(categoryId)"
        :main-banner-subtitle="getCategoryDescription(categoryId)"
        @retry="loadAds"
        @scroll-to-content="scrollToProducts"
      />
    </section>

    <div class="max-w-7xl mx-auto px-4 py-6 sm:py-8">

    <!-- Featured Products Section (2 rows of ads products) -->
    <div v-if="categoryId !== 'all'" class="mb-12">
      <CategoryFeaturedProducts
        :category-id="categoryId"
        :title="$t('categoryPage.featuredProducts')"
        :max-products="8"
        @retry="loadAds"
      />
    </div>

    <!-- Filters and Sort -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
      <!-- Results Count -->
      <div class="text-neutral-700">
        {{ $t('categoryPage.resultsCount', { count: filteredProducts.length, total: products.length }) }}
      </div>

      <!-- Sort Options -->
      <div class="flex items-center space-x-4 space-x-reverse">
        <label class="text-sm font-medium text-neutral-700">{{ $t('categoryPage.sortBy') }}:</label>
        <select
          v-model="sortBy"
          class="px-4 py-2 border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 shadow-soft"
        >
          <option value="newest">{{ $t('categoryPage.sortNewest') }}</option>
          <option value="oldest">{{ $t('categoryPage.sortOldest') }}</option>
          <option value="price-low">{{ $t('categoryPage.sortPriceLow') }}</option>
          <option value="price-high">{{ $t('categoryPage.sortPriceHigh') }}</option>
          <option value="name">{{ $t('categoryPage.sortName') }}</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-16">
      <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-neutral-700">{{ $t('categoryPage.loading') }}</p>
    </div>

    <!-- Category Products Section -->
    <div v-if="filteredProducts.length > 0" class="mb-12">
      <h2 class="text-2xl sm:text-3xl font-bold text-dark mb-6 sm:mb-8">{{ $t('categoryPage.categoryProducts') }}</h2>
      
      <!-- Products Grid - 4 products per row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <ProductCard
          v-for="product in paginatedProducts"
          :key="product.id"
          :product="product"
        />
      </div>
      
      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="flex flex-col sm:flex-row justify-between items-center mt-8 space-y-4 sm:space-y-0">
        <!-- Page Info -->
        <div class="text-neutral-600 text-sm">
          {{ $t('categoryPage.showingResults', { 
            start: (currentPage - 1) * itemsPerPage + 1, 
            end: Math.min(currentPage * itemsPerPage, filteredProducts.length),
            total: filteredProducts.length 
          }) }}
        </div>
        
        <!-- Pagination Buttons -->
        <div class="flex items-center space-x-2 space-x-reverse">
          <!-- Previous Button -->
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="px-3 py-2 text-sm font-medium text-neutral-500 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 hover:text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
          
          <!-- Page Numbers -->
          <div class="flex items-center space-x-1 space-x-reverse">
            <button
              v-for="page in Math.min(5, totalPages)"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                currentPage === page
                  ? 'bg-primary text-white'
                  : 'text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50'
              ]"
            >
              {{ page }}
            </button>
            
            <!-- Ellipsis for more pages -->
            <span v-if="totalPages > 5" class="px-2 text-neutral-500">...</span>
            
            <!-- Last page if more than 5 pages -->
            <button
              v-if="totalPages > 5"
              @click="goToPage(totalPages)"
              :class="[
                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                currentPage === totalPages
                  ? 'bg-primary text-white'
                  : 'text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50'
              ]"
            >
              {{ totalPages }}
            </button>
          </div>
          
          <!-- Next Button -->
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 text-sm font-medium text-neutral-500 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 hover:text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <div class="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <i class="fas fa-box text-neutral-400 text-3xl"></i>
      </div>
      <h3 class="text-xl font-semibold text-neutral-700 mb-2">{{ $t('categoryPage.noProducts') }}</h3>
      <p class="text-neutral-500 mb-6">{{ $t('categoryPage.noProductsMessage') }}</p>
      <router-link to="/products" class="btn-primary">
        <i class="fas fa-arrow-left mr-2"></i>
        {{ $t('categoryPage.browseAllProducts') }}
      </router-link>
    </div>

    <!-- Back to Homepage -->
    <div class="text-center mt-12">
      <router-link to="/" class="inline-flex items-center px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900 font-medium rounded-2xl transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105">
        <i class="fas fa-arrow-left mr-2"></i>
        {{ $t('categoryPage.backToHomepage') }}
      </router-link>
    </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import i18n from '../i18n'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '../stores/useProductStore'
import { useProducts } from '../composables/useProducts'
import { useAdsStore } from '../stores/useAdsStore'
import { useLocaleRouter } from '../composables/useLocaleRouter'
import CategoryBanner from '../components/ads/CategoryBanner.vue'
import CategoryFeaturedProducts from '../components/ads/CategoryFeaturedProducts.vue'
import FeaturedProducts from '../components/FeaturedProducts.vue'
import ProductCard from '../components/ProductCard.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const adsStore = useAdsStore()
const { navigateToPath } = useLocaleRouter()
const { 
  bestSellingProducts, 
  loading: bestSellingLoading, 
  error: bestSellingError, 
  fetchBestSellingProductsByCategory,
  refreshBestSellingProducts 
} = useProducts()

const sortBy = ref('newest')
const loading = ref(false)

// Pagination variables
const currentPage = ref(1)
const itemsPerPage = 20
const categoryId = computed(() => route.params.categoryId)

// Load all ads data
const loadAds = async () => {
  try {
    await adsStore.fetchAds()
  } catch (err) {
    console.error('Error loading ads:', err)
  }
}

// Get products for this category
const products = computed(() => {
  if (categoryId.value === 'all') {
    return productStore.products
  }
  return productStore.products.filter(product => product.category_id === categoryId.value)
})

// Sort and filter products
const filteredProducts = computed(() => {
  let sorted = [...products.value]
  
  switch (sortBy.value) {
    case 'newest':
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      break
    case 'oldest':
      sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      break
    case 'price-low':
      sorted.sort((a, b) => a.price - b.price)
      break
    case 'price-high':
      sorted.sort((a, b) => b.price - a.price)
      break
    case 'name':
      // Sort by the appropriate localized name field
      const currentLocale = i18n.global.locale.value
      sorted.sort((a, b) => {
        const nameA = currentLocale === 'ar' && a.name_ar ? a.name_ar : 
                     currentLocale === 'fr' && a.name_fr ? a.name_fr : a.name_en
        const nameB = currentLocale === 'ar' && b.name_ar ? b.name_ar : 
                     currentLocale === 'fr' && b.name_fr ? b.name_fr : b.name_en
        return nameA.localeCompare(nameB)
      })
      break
  }
  
  return sorted
})

// Pagination computed properties
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage))
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredProducts.value.slice(start, end)
})

// Pagination methods
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    scrollToProducts()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    scrollToProducts()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    scrollToProducts()
  }
}

// Get category icon
const getCategoryIcon = (categoryId) => {
  const iconMap = {
    'cars': 'fas fa-car',
    'realestate': 'fas fa-home',
    'electronics': 'fas fa-laptop',
    'fashion': 'fas fa-tshirt',
    'home': 'fas fa-couch',
    'beauty': 'fas fa-spa',
    'kids': 'fas fa-baby',
    'food': 'fas fa-utensils'
  }
  return iconMap[categoryId] || 'fas fa-tag'
}

// Get category name
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

// Get category description
const getCategoryDescription = (categoryId) => {
  const descriptions = {
    'cars': 'Discover a wide selection of vehicles, from compact cars to luxury models',
    'realestate': 'Find your perfect home with our comprehensive real estate listings',
    'electronics': 'Latest gadgets and electronic devices for tech enthusiasts',
    'fashion': 'Trendy clothing and accessories for every style and occasion',
    'home': 'Everything you need to make your home beautiful and comfortable',
    'beauty': 'Premium beauty and personal care products for your daily routine',
    'kids': 'Quality products for children of all ages',
    'food': 'Fresh and delicious food products from trusted suppliers'
  }
  return descriptions[categoryId] || 'Explore our amazing products in this category'
}

// Scroll to products section
const scrollToProducts = () => {
  const productsSection = document.querySelector('.max-w-7xl')
  if (productsSection) {
    productsSection.scrollIntoView({ behavior: 'smooth' })
  }
}


// Validate category ID
const validateCategory = () => {
  const validCategories = productStore.categories.map(cat => cat.id)
  if (!validCategories.includes(categoryId.value)) {
    // Use router to go back to home instead of hardcoded 404
    navigateToPath('/')
  }
}

// Watch for route changes
watch(() => route.params.categoryId, async (newCategoryId) => {
  loading.value = true
  currentPage.value = 1 // Reset pagination
  try {
    validateCategory()
    // Refetch products for the new category
    if (newCategoryId && newCategoryId !== 'all') {
      await productStore.fetchProducts({ category_id: newCategoryId })
    }
  } catch (error) {
    console.error('Error loading new category:', error)
  } finally {
    loading.value = false
  }
})

// Watch for sort changes to reset pagination
watch(sortBy, () => {
  currentPage.value = 1
})

onMounted(async () => {
  loading.value = true
  try {
    // Fetch categories if not already loaded
    if (productStore.categories.length === 0) {
      await productStore.fetchCategories()
    }
    
    // Fetch products for this specific category
    await productStore.fetchProducts({ category_id: categoryId.value })
    
    // Load ads data
    await loadAds()
    
    validateCategory()
  } catch (error) {
    console.error('Error loading category page:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.categories-dropdown {
  position: relative;
}

/* Animation classes - using global my-fade-in class */
.my-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.my-slide-up {
  animation: slideUp 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Card styles for loading states */
.card {
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

/* Hover effects for category icon */
.category-icon {
  transition: all 0.3s ease;
}

.category-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Shadow utilities */
.shadow-soft {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.shadow-glow {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

/* RTL support */
[dir="rtl"] .space-x-reverse > :not([hidden]) ~ :not([hidden]) {
  --tw-space-x-reverse: 1;
}
</style>
