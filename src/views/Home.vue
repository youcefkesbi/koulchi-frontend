<template>
  <div class="container-lg space-y-12 sm:space-y-16 lg:space-y-20 my-fade-in section-padding">
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white rounded-3xl overflow-hidden shadow-soft">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-gradient-to-br from-green-600/20 via-green-500/20 to-green-400/20"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      <div class="relative z-10 px-4 sm:px-6 py-8 sm:py-12 text-center">
        <!-- Decorative Elements -->
        <div class="absolute top-6 left-6 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
        <div class="absolute bottom-6 right-6 w-24 h-24 bg-green-400/20 rounded-full blur-xl"></div>
        
        <h1 class="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 my-slide-up bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
          {{ t('hero.title') }}
        </h1>
        <p class="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-green-50 my-slide-up" style="animation-delay: 0.1s">
          {{ t('hero.subtitle') }}
        </p>
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center my-slide-up" style="animation-delay: 0.2s">
          <button @click="scrollToMostSoldProducts" class="bg-white text-slate-800 font-semibold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-soft hover:shadow-glow transform hover:scale-105 transition-all duration-300 hover:bg-blue-50">
            <i class="fas fa-shopping-bag ml-1 sm:ml-2"></i>
            {{ t('hero.shopNow') }}
          </button>
          <button class="border-2 border-white/30 text-white font-semibold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/50 transform hover:scale-105 transition-all duration-300">
            <i class="fas fa-info-circle ml-1 sm:ml-2"></i>
            {{ t('hero.learnMore') }}
          </button>
        </div>
      </div>
    </section>

    <!-- Best-selling Products Section -->
    <section id="best-selling-products" class="my-slide-up">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-2 sm:space-y-0">
        <h2 class="text-2xl sm:text-3xl font-bold text-dark">{{ t('sections.bestSellingProducts') }}</h2>
        <div class="flex items-center space-x-4 space-x-reverse">
          <router-link to="/best-selling" class="text-primary hover:text-primary-dark text-sm sm:text-base font-semibold hover:underline transition-colors">
            {{ t('sections.viewAll') }} <i class="fas fa-arrow-left mr-1 sm:mr-2"></i>
          </router-link>
          <button
            @click="refreshBestSellingProducts"
            :disabled="loading"
            class="text-primary hover:text-primary-dark text-sm sm:text-base font-semibold hover:underline transition-colors disabled:opacity-50"
          >
            <i class="fas fa-sync-alt mr-1" :class="{ 'animate-spin': loading }"></i>
            {{ t('bestSelling.refresh') }}
          </button>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        <div v-for="i in 10" :key="i" class="card animate-pulse">
          <div class="w-full h-48 bg-gray-200 rounded-t-2xl mb-4"></div>
          <div class="h-4 bg-gray-200 rounded mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-500 text-lg mb-4">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          {{ error }}
        </div>
        <button @click="refreshBestSellingProducts" class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
          {{ t('common.retry') }}
        </button>
        
        <!-- Production fallback message -->
        <div v-if="isProd" class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p class="text-yellow-800 text-sm">
            {{ t('sections.productionDataIssue') }}
          </p>
        </div>
      </div>
      
      <!-- Products Grid - 2 rows × 5 products per row -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        <ProductCard
          v-for="product in bestSellingProducts"
          :key="product.id"
          :product="product"
        />
      </div>
      
      <!-- Empty State -->
      <div v-if="!loading && !error && bestSellingProducts.length === 0" class="text-center py-12">
        <div class="text-gray-500 text-lg mb-4">
          <i class="fas fa-box-open mr-2"></i>
          {{ t('sections.noBestSellingProducts') }}
        </div>
        <div class="mt-4">
          <p class="text-gray-600 mb-4">Try refreshing the page or check your connection.</p>
          <button @click="refreshBestSellingProducts" class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
            {{ t('common.retry') }}
          </button>
        </div>
      </div>

    </section>

    <!-- Test Section (always visible) -->
    <section class="my-slide-up bg-green-50 p-6 rounded-lg mb-8">
      <h3 class="text-lg font-semibold text-green-800 mb-4">✅ Page is Working!</h3>
      <p class="text-green-700">This section is always visible to confirm the page is loading correctly.</p>
    </section>

    <!-- Debug Section (temporary) -->
    <section class="my-slide-up bg-blue-50 p-6 rounded-lg mb-8">
      <h3 class="text-lg font-semibold text-blue-800 mb-4">Debug Information</h3>
      <div class="text-sm text-blue-700 space-y-2">
        <p>Loading: {{ loading }}</p>
        <p>Error: {{ error || 'None' }}</p>
        <p>Best Selling Products Count: {{ bestSellingProducts.length }}</p>
        <p>Categories Loaded: {{ categoriesLoaded }}</p>
        <p>Categories Count: {{ categories.length }}</p>
        <p>Product Store Categories: {{ productStore.categories.length }}</p>
      </div>
    </section>

    <!-- Browse by Category Section -->
    <section class="my-slide-up">
      <h2 class="text-2xl sm:text-3xl font-bold text-dark mb-6 sm:mb-8 text-center">{{ t('sections.browseByCategory') }}</h2>
      
      <!-- Loading State for Categories -->
      <div v-if="!categoriesLoaded" class="text-center py-12">
        <div class="inline-flex items-center space-x-2 space-x-reverse">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span class="text-gray-600">{{ t('common.loading') }}</span>
        </div>
      </div>
      
      <!-- Error State for Categories -->
      <div v-else-if="categories.length === 0" class="text-center py-12">
        <div class="text-gray-500 text-lg mb-4">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          {{ t('sections.noCategoriesAvailable') }}
        </div>
        <button @click="retryCategoryLoading" class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
          {{ t('common.retry') }}
        </button>
        
        <!-- Fallback: Show a message that categories are being loaded -->
        <div class="mt-8 p-6 bg-gray-50 rounded-lg">
          <p class="text-gray-600 mb-4">{{ t('sections.categoriesLoadingFallback') }}</p>
          <div class="flex justify-center space-x-4">
            <router-link to="/products" class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
              {{ t('sections.browseAllProducts') }}
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- Category Products -->
      <div v-else>
        <!-- Debug info for production troubleshooting -->
        <div v-if="process.env.NODE_ENV === 'development'" class="text-xs text-gray-400 mb-4">
          Categories loaded: {{ categories.length }}, Categories: {{ categories.map(c => c.id).join(', ') }}
        </div>
        
        <!-- Production debug info -->
        <div v-if="process.env.NODE_ENV === 'production'" class="text-xs text-gray-400 mb-4">
          <div>Categories loaded: {{ categories.length }}</div>
          <div>Categories loaded flag: {{ categoriesLoaded }}</div>
          <div>Product store categories: {{ productStore.categories.length }}</div>
          <div>Category products: {{ Object.keys(categoryProducts).length }}</div>
        </div>
        <div v-for="category in categories" :key="category.id" class="mb-12">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-2 sm:space-y-0">
          <h3 class="text-xl sm:text-2xl font-bold text-dark">{{ getCategoryName(category.id) }}</h3>
          <router-link :to="`/category/${category.id}`" class="text-primary hover:text-primary-dark text-sm sm:text-base font-semibold hover:underline transition-colors">
            {{ t('sections.viewAll') }} <i class="fas fa-arrow-left mr-1 sm:mr-2"></i>
          </router-link>
        </div>
        
        <!-- Loading State for Category -->
        <div v-if="categoryLoading[category.id]" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          <div v-for="i in 10" :key="i" class="card animate-pulse">
            <div class="w-full h-48 bg-gray-200 rounded-t-2xl mb-4"></div>
            <div class="h-4 bg-gray-200 rounded mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        
        <!-- Error State for Category -->
        <div v-else-if="categoryErrors[category.id]" class="text-center py-8">
          <div class="text-red-500 text-lg mb-4">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            {{ categoryErrors[category.id] }}
          </div>
          <button @click="loadCategoryProducts(category.id)" class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
            {{ t('common.retry') }}
          </button>
        </div>
        
        <!-- Category Products Grid - 2 rows × 5 products per row -->
        <div v-else-if="categoryProducts[category.id] && categoryProducts[category.id].length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          <ProductCard
            v-for="product in categoryProducts[category.id]"
            :key="product.id"
            :product="product"
          />
        </div>
        
        <!-- Empty State for Category -->
        <div v-else class="text-center py-8">
          <div class="text-gray-500 text-lg mb-4">
            <i class="fas fa-box-open mr-2"></i>
            {{ t('sections.noProductsInCategory', { category: getCategoryName(category.id) }) }}
          </div>
        </div>
        </div>
      </div>
      
      <!-- Fallback Content (always show) -->
      <div class="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <router-link to="/products" class="text-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
            <i class="fas fa-shopping-bag text-2xl text-primary mb-2"></i>
            <p class="text-sm font-medium">All Products</p>
          </router-link>
          <router-link to="/best-selling" class="text-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
            <i class="fas fa-star text-2xl text-yellow-500 mb-2"></i>
            <p class="text-sm font-medium">Best Sellers</p>
          </router-link>
          <router-link to="/stores" class="text-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
            <i class="fas fa-store text-2xl text-green-500 mb-2"></i>
            <p class="text-sm font-medium">Stores</p>
          </router-link>
          <router-link to="/dashboard" class="text-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
            <i class="fas fa-user text-2xl text-blue-500 mb-2"></i>
            <p class="text-sm font-medium">My Account</p>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="grid-cards my-slide-up">
      <div class="card text-center group hover:shadow-glow transform hover:scale-105 transition-all duration-300">
        <div class="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-dark transition-all duration-300">
          <i class="fas fa-truck text-white text-2xl"></i>
        </div>
        <h3 class="text-xl font-bold mb-3 text-dark">{{ t('features.fastDelivery') }}</h3>
        <p class="text-gray-600 leading-relaxed text-sm">{{ t('features.fastDeliveryDesc') }}</p>
      </div>
      
      <div class="card text-center group hover:shadow-glow transform hover:scale-105 transition-all duration-300">
        <div class="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary-dark transition-all duration-300">
          <i class="fas fa-money-bill-wave text-white text-2xl"></i>
        </div>
        <h3 class="text-xl font-bold mb-3 text-dark">{{ t('features.cod') }}</h3>
        <p class="text-gray-600 leading-relaxed text-sm">{{ t('features.codDesc') }}</p>
      </div>
      
      <div class="card text-center group hover:shadow-glow transform hover:scale-105 transition-all duration-300">
        <div class="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-dark transition-all duration-300">
          <i class="fas fa-shield-alt text-white text-2xl"></i>
        </div>
        <h3 class="text-xl font-bold mb-3 text-dark">{{ t('features.qualityGuarantee') }}</h3>
        <p class="text-gray-600 leading-relaxed text-sm">{{ t('features.qualityGuaranteeDesc') }}</p>
      </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="bg-white rounded-3xl p-8 sm:p-12 shadow-soft my-slide-up border border-gray-100">
      <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 sm:mb-12 text-center">{{ t('sections.whyChooseUs') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
        <div class="space-y-8">
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-lg transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-gray-900 mb-3">{{ t('benefits.securePayment') }}</h4>
              <p class="text-gray-700 leading-relaxed text-base">{{ t('benefits.securePaymentDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-lg transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-gray-900 mb-3">{{ t('benefits.fastDeliveryAlgeria') }}</h4>
              <p class="text-gray-700 leading-relaxed text-base">{{ t('benefits.fastDeliveryAlgeriaDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-lg transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-gray-900 mb-3">{{ t('benefits.originalProducts') }}</h4>
              <p class="text-gray-700 leading-relaxed text-base">{{ t('benefits.originalProductsDesc') }}</p>
            </div>
          </div>
        </div>
        
        <div class="space-y-8">
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-12 h-12 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-lg transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-gray-900 mb-3">{{ t('benefits.competitivePrices') }}</h4>
              <p class="text-gray-700 leading-relaxed text-base">{{ t('benefits.competitivePricesDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-12 h-12 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-lg transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-gray-900 mb-3">{{ t('benefits.customerService') }}</h4>
              <p class="text-gray-700 leading-relaxed text-base">{{ t('benefits.customerServiceDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-12 h-12 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-lg transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-gray-900 mb-3">{{ t('benefits.easyOrdering') }}</h4>
              <p class="text-gray-700 leading-relaxed text-base">{{ t('benefits.easyOrderingDesc') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProductStore } from '../stores/product'
import { useProducts } from '../composables/useProducts'
import ProductCard from '../components/ProductCard.vue'

const { t, locale } = useI18n()
const productStore = useProductStore()
const { 
  bestSellingProducts, 
  loading, 
  error, 
  fetchBestSellingProducts,
  refreshBestSellingProducts 
} = useProducts()

const isProd = process.env.NODE_ENV === 'production'
const isDev = process.env.NODE_ENV === 'development'

// State for category products
const categoryProducts = ref({})
const categoryLoading = ref({})
const categoryErrors = ref({})
const categoriesLoaded = ref(false)

const categories = computed(() => {
  if (!productStore.categories || !Array.isArray(productStore.categories)) {
    return []
  }
  return productStore.categories.filter(cat => cat.id !== 'all')
})

const getCategoryName = (categoryId) => {
  const category = categories.value.find(cat => cat.id === categoryId)
  if (category) {
    // Check if we have a localized name for the current language
    const currentLocale = locale.value
    
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

const loadBestSellingProducts = async () => {
  try {
    await fetchBestSellingProducts()
    if (isDev) {
      console.log('Best-selling products loaded:', bestSellingProducts.value.length)
    }
  } catch (err) {
    if (isDev) {
      console.error('Error loading best-selling products:', err)
    }
    
    // Add fallback products only in development
    if (isDev && bestSellingProducts.value.length === 0) {
      console.log('Adding fallback products for development testing')
      bestSellingProducts.value = [
        {
          id: 'fallback-1',
          name: 'Sample Product 1',
          price: 99.99,
          description: 'This is a sample product for testing',
          image_url: 'https://via.placeholder.com/300x200?text=Product+1',
          total_sold: 50,
          store_name: 'Test Store'
        },
        {
          id: 'fallback-2',
          name: 'Sample Product 2',
          price: 149.99,
          description: 'Another sample product for testing',
          image_url: 'https://via.placeholder.com/300x200?text=Product+2',
          total_sold: 30,
          store_name: 'Test Store'
        }
      ]
    }
  }
}

const loadCategoryProducts = async (categoryId) => {
  categoryLoading.value[categoryId] = true
  categoryErrors.value[categoryId] = null
  
  try {
    const products = await productStore.fetchBestSellingProductsByCategory(categoryId, 10)
    categoryProducts.value[categoryId] = products || []
    if (isDev) {
      console.log(`Category products loaded for ${categoryId}:`, products?.length || 0)
    }
  } catch (err) {
    if (isDev) {
      console.error(`Error loading products for category ${categoryId}:`, err)
    }
    categoryErrors.value[categoryId] = err.message || 'Failed to load category products'
    categoryProducts.value[categoryId] = []
  } finally {
    categoryLoading.value[categoryId] = false
  }
}

const retryCategoryLoading = async () => {
  categoriesLoaded.value = false
  try {
    await productStore.fetchCategories()
    categoriesLoaded.value = true
    
    // Reload category products
    if (categories.value && categories.value.length > 0) {
      const categoryPromises = categories.value.map(category => 
        loadCategoryProducts(category.id)
      )
      await Promise.allSettled(categoryPromises)
    }
  } catch (error) {
    console.error('Retry failed:', error)
    categoriesLoaded.value = true
  }
}

const scrollToMostSoldProducts = () => {
  const mostSoldSection = document.getElementById('most-sold-products')
  if (mostSoldSection) {
    mostSoldSection.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(async () => {
  // Always ensure the section renders by setting a minimum timeout
  const minTimeout = setTimeout(() => {
    console.log('Minimum timeout reached - ensuring section renders')
    categoriesLoaded.value = true
  }, 3000) // 3 second minimum timeout
  
  try {
    // Set a timeout to ensure the section renders even if there are issues
    const timeoutId = setTimeout(() => {
      console.warn('Homepage data loading timeout - rendering with available data')
      categoriesLoaded.value = true
    }, 10000) // 10 second timeout
    
    // Load categories if not already loaded
    if (productStore.categories.length === 0) {
      try {
        await productStore.fetchCategories()
        console.log('Categories loaded successfully:', productStore.categories.length)
      } catch (categoryError) {
        console.error('Failed to load categories:', categoryError)
        
        // In production, if categories fail to load, try to use fallback categories
        if (process.env.NODE_ENV === 'production') {
          console.log('Using fallback categories for production')
          productStore.categories = [
            { id: 'electronics', name_en: 'Electronics', name_ar: 'إلكترونيات', name_fr: 'Électronique', is_active: true },
            { id: 'fashion', name_en: 'Fashion', name_ar: 'أزياء', name_fr: 'Mode', is_active: true },
            { id: 'home', name_en: 'Home & Garden', name_ar: 'المنزل والحديقة', name_fr: 'Maison et Jardin', is_active: true },
            { id: 'sports', name_en: 'Sports', name_ar: 'رياضة', name_fr: 'Sport', is_active: true },
            { id: 'books', name_en: 'Books', name_ar: 'كتب', name_fr: 'Livres', is_active: true }
          ]
        }
      }
    }
    categoriesLoaded.value = true
    clearTimeout(timeoutId)
    clearTimeout(minTimeout)
    
    // Load best-selling products
    try {
      await loadBestSellingProducts()
    } catch (bestSellingError) {
      console.error('Failed to load best-selling products:', bestSellingError)
    }
    
    // Load category products for each category
    if (categories.value && categories.value.length > 0) {
      console.log('Loading products for categories:', categories.value.map(c => c.id))
      // Load category products in parallel for better performance
      const categoryPromises = categories.value.map(category => 
        loadCategoryProducts(category.id)
      )
      await Promise.allSettled(categoryPromises)
    } else {
      console.warn('No categories available to load products for')
    }
  } catch (error) {
    console.error('Error loading homepage data:', error)
    // Ensure categoriesLoaded is set even if there's an error
    categoriesLoaded.value = true
    clearTimeout(minTimeout)
  }
})
</script>

<style scoped>
/* Ensure sections are always visible */
section {
  min-height: 200px;
  margin-bottom: 2rem;
  display: block !important;
  visibility: visible !important;
}

/* Force visibility for debugging */
.my-slide-up {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* Debug section styles */
.bg-blue-50 {
  background-color: #eff6ff;
}

.bg-green-50 {
  background-color: #f0fdf4;
}

.text-blue-800 {
  color: #1e40af;
}

.text-green-800 {
  color: #166534;
}

.text-blue-700 {
  color: #1d4ed8;
}

.text-green-700 {
  color: #15803d;
}

/* Custom animations */
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

/* Grid cards layout */
.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

/* Card styles */
.card {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Shadow utilities */
.shadow-soft {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.shadow-glow {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

/* Section padding */
.section-padding {
  padding: 2rem 1rem;
}

@media (min-width: 640px) {
  .section-padding {
    padding: 3rem 1.5rem;
  }
}

@media (min-width: 1024px) {
  .section-padding {
    padding: 4rem 2rem;
  }
}

/* Container responsive */
.container-lg {
  max-width: 1200px;
  margin: 0 auto;
}

/* RTL support */
[dir="rtl"] .space-x-reverse > :not([hidden]) ~ :not([hidden]) {
  --tw-space-x-reverse: 1;
}
</style>
