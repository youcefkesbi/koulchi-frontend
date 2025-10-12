<template>
  <div class="container-lg space-y-12 sm:space-y-16 lg:space-y-20 my-fade-in section-padding">
    <!-- Banner Carousel Section -->
    <section class="my-slide-up">
      <AdCarousel
        :ads="bannerAds"
        :loading="bannerLoading"
        :error="bannerError"
        :show-main-banner="true"
        :main-banner-title="t('hero.title')"
        :main-banner-subtitle="t('hero.subtitle')"
        @retry="loadBannerAds"
        @scroll-to-content="scrollToFeaturedProducts"
      />
    </section>

    <!-- Featured Products Section -->
    <section id="featured-products" class="my-slide-up">
      <FeaturedProducts
        :products="featuredProducts"
        :loading="featuredLoading"
        :error="featuredError"
        :title="t('sections.featuredProducts')"
        :show-view-all="true"
        view-all-link="/products"
        :max-products="8"
        @refresh="refreshFeaturedProducts"
      />
    </section>


    <!-- Featured Stores Section -->
    <section class="my-slide-up">
      <FeaturedStores
        :stores="featuredStores"
        :loading="storesLoading"
        :error="storesError"
        :title="t('sections.featuredStores')"
        :show-view-all="true"
        view-all-link="/stores"
        :max-stores="6"
        @refresh="loadFeaturedStores"
      />
    </section>

    <!-- Browse by Category Section -->
    <section class="my-slide-up">
      <h2 class="text-2xl sm:text-3xl font-bold text-dark mb-6 sm:mb-8 text-center">{{ t('sections.browseByCategory') }}</h2>
      
      <!-- Loading State for Categories -->
      <div v-if="!categoriesLoaded" class="text-center py-12">
        <div class="inline-flex items-center space-x-2 space-x-reverse">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span class="text-neutral-600">{{ t('common.loading') }}</span>
        </div>
      </div>
      
      <!-- Error State for Categories -->
      <div v-else-if="categories.length === 0" class="text-center py-12">
        <div class="text-neutral-500 text-lg mb-4">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          {{ t('sections.noCategoriesAvailable') }}
        </div>
        <button @click="retryCategoryLoading" class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
          {{ t('common.retry') }}
        </button>
        
        <!-- Fallback: Show a message that categories are being loaded -->
        <div class="mt-8 p-6 bg-neutral-50 rounded-lg">
          <p class="text-neutral-600 mb-4">{{ t('sections.categoriesLoadingFallback') }}</p>
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
        <div v-if="isDev" class="text-xs text-neutral-400 mb-4">
          Categories loaded: {{ categories.length }}, Categories: {{ categories.map(c => c.id).join(', ') }}
        </div>
        
        <!-- Production debug info -->
        <div v-if="isProd" class="text-xs text-neutral-400 mb-4">
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
        
        <!-- Category Products using AdGrid -->
        <AdGrid
          :ads="categoryProducts[category.id] || []"
          :loading="categoryLoading[category.id]"
          :error="categoryErrors[category.id]"
          :columns="4"
          :max-items="8"
          @retry="loadCategoryProducts(category.id)"
        />
        </div>
      </div>
      
    </section>

    <!-- Features Section -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-6 my-slide-up">
      <div class="card text-center group hover:shadow-glow transform hover:scale-105 transition-all duration-300 bg-white border-2 border-neutral-100 hover:border-primary/20">
        <div class="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 shadow-md">
          <i class="fas fa-truck text-white text-2xl"></i>
        </div>
        <h3 class="text-xl font-bold mb-3 text-neutral-900">{{ t('features.fastDelivery') }}</h3>
        <p class="text-neutral-700 leading-relaxed text-sm">{{ t('features.fastDeliveryDesc') }}</p>
      </div>
      
      <div class="card text-center group hover:shadow-glow transform hover:scale-105 transition-all duration-300 bg-white border-2 border-neutral-100 hover:border-accent/20">
        <div class="w-16 h-16 bg-gradient-to-br from-accent to-accent-dark rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 shadow-md">
          <i class="fas fa-money-bill-wave text-white text-2xl"></i>
        </div>
        <h3 class="text-xl font-bold mb-3 text-neutral-900">{{ t('features.cod') }}</h3>
        <p class="text-neutral-700 leading-relaxed text-sm">{{ t('features.codDesc') }}</p>
      </div>
      
      <div class="card text-center group hover:shadow-glow transform hover:scale-105 transition-all duration-300 bg-white border-2 border-neutral-100 hover:border-accent/20">
        <div class="w-16 h-16 bg-gradient-to-br from-accent to-accent-dark rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 shadow-md">
          <i class="fas fa-shield-alt text-white text-2xl"></i>
        </div>
        <h3 class="text-xl font-bold mb-3 text-neutral-900">{{ t('features.qualityGuarantee') }}</h3>
        <p class="text-neutral-700 leading-relaxed text-sm">{{ t('features.qualityGuaranteeDesc') }}</p>
      </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="bg-white rounded-3xl p-8 sm:p-12 shadow-soft my-slide-up border border-neutral-100">
      <h2 class="text-3xl sm:text-4xl font-bold text-neutral-900 mb-8 sm:mb-12 text-center">{{ t('sections.whyChooseUs') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
        <div class="space-y-8">
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 shadow-md">
              <i class="fas fa-shield-alt text-white text-lg"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-neutral-900 mb-3">{{ t('benefits.securePayment') }}</h4>
              <p class="text-neutral-800 leading-relaxed text-base">{{ t('benefits.securePaymentDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 shadow-md">
              <i class="fas fa-truck text-white text-lg"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-neutral-900 mb-3">{{ t('benefits.fastDeliveryAlgeria') }}</h4>
              <p class="text-neutral-800 leading-relaxed text-base">{{ t('benefits.fastDeliveryAlgeriaDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 shadow-md">
              <i class="fas fa-certificate text-white text-lg"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-neutral-900 mb-3">{{ t('benefits.originalProducts') }}</h4>
              <p class="text-neutral-800 leading-relaxed text-base">{{ t('benefits.originalProductsDesc') }}</p>
            </div>
          </div>
        </div>
        
        <div class="space-y-8">
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-12 h-12 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-lg transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-neutral-900 mb-3">{{ t('benefits.competitivePrices') }}</h4>
              <p class="text-neutral-800 leading-relaxed text-base">{{ t('benefits.competitivePricesDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-12 h-12 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-lg transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-neutral-900 mb-3">{{ t('benefits.customerService') }}</h4>
              <p class="text-neutral-800 leading-relaxed text-base">{{ t('benefits.customerServiceDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-12 h-12 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-lg transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-neutral-900 mb-3">{{ t('benefits.easyOrdering') }}</h4>
              <p class="text-neutral-800 leading-relaxed text-base">{{ t('benefits.easyOrderingDesc') }}</p>
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
import { useProductStore } from '../stores/useProductStore'
import { useAds } from '../composables/useAds'
import AdCarousel from '../components/AdCarousel.vue'
import AdGrid from '../components/AdGrid.vue'
import FeaturedProducts from '../components/FeaturedProducts.vue'
import FeaturedStores from '../components/FeaturedStores.vue'
import ProductCard from '../components/ProductCard.vue'

const { t, locale } = useI18n()
const productStore = useProductStore()
const { 
  fetchHomepageBannerAds,
  fetchHomepageFeaturedProducts,
  fetchHomepageFeaturedStores,
  fetchBrowseByCategoryProducts,
  transformAdsForDisplay
} = useAds()

const isProd = import.meta.env.PROD
const isDev = import.meta.env.DEV

// State for banner ads
const bannerAds = ref([])
const bannerLoading = ref(false)
const bannerError = ref(null)

// State for featured products
const featuredProducts = ref([])
const featuredLoading = ref(false)
const featuredError = ref(null)

// State for featured stores
const featuredStores = ref([])
const storesLoading = ref(false)
const storesError = ref(null)

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

// Load banner ads
const loadBannerAds = async () => {
  bannerLoading.value = true
  bannerError.value = null
  
  try {
    const ads = await fetchHomepageBannerAds()
    bannerAds.value = transformAdsForDisplay(ads)
  } catch (err) {
    console.error('Error loading banner ads:', err)
    bannerError.value = err.message || 'Failed to load banner ads'
    bannerAds.value = []
  } finally {
    bannerLoading.value = false
  }
}

// Load featured products from ads
const loadFeaturedProducts = async () => {
  featuredLoading.value = true
  featuredError.value = null
  
  try {
    const ads = await fetchHomepageFeaturedProducts()
    const transformedAds = transformAdsForDisplay(ads)
    featuredProducts.value = transformedAds.map(ad => ad.data)
  } catch (err) {
    console.error('Error loading featured products:', err)
    featuredError.value = err.message || 'Failed to load featured products'
    featuredProducts.value = []
  } finally {
    featuredLoading.value = false
  }
}

// Load featured stores from ads
const loadFeaturedStores = async () => {
  storesLoading.value = true
  storesError.value = null
  
  try {
    const ads = await fetchHomepageFeaturedStores()
    featuredStores.value = transformAdsForDisplay(ads)
  } catch (err) {
    console.error('Error loading featured stores:', err)
    storesError.value = err.message || 'Failed to load featured stores'
    featuredStores.value = []
  } finally {
    storesLoading.value = false
  }
}

const refreshFeaturedProducts = async () => {
  await loadFeaturedProducts()
}

const loadCategoryProducts = async (categoryId) => {
  categoryLoading.value[categoryId] = true
  categoryErrors.value[categoryId] = null
  
  try {
    // Fetch ads for this specific category
    const ads = await fetchBrowseByCategoryProducts(categoryId)
    const transformedAds = transformAdsForDisplay(ads)
    categoryProducts.value[categoryId] = transformedAds
  } catch (err) {
    console.error(`Error loading products for category ${categoryId}:`, err)
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

const scrollToFeaturedProducts = () => {
  const featuredSection = document.getElementById('featured-products')
  if (featuredSection) {
    featuredSection.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(async () => {
  const minTimeout = setTimeout(() => {
    categoriesLoaded.value = true
  }, 3000)
  
  try {
    const timeoutId = setTimeout(() => {
      categoriesLoaded.value = true
    }, 10000)
    
    // Load all ads data in parallel
    const adsPromises = [
      loadBannerAds(),
      loadFeaturedProducts(),
      loadFeaturedStores()
    ]
    
    // Load categories if not already loaded
    if (productStore.categories.length === 0) {
      try {
        await productStore.fetchCategories()
      } catch (categoryError) {
        console.error('Failed to load categories:', categoryError)
        
        // Use fallback categories in production
        if (import.meta.env.PROD) {
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
    
    // Wait for ads to load
    await Promise.allSettled(adsPromises)
    
    categoriesLoaded.value = true
    clearTimeout(timeoutId)
    clearTimeout(minTimeout)
    
    // Load category products for each category
    if (categories.value && categories.value.length > 0) {
      const categoryPromises = categories.value.map(category => 
        loadCategoryProducts(category.id)
      )
      await Promise.allSettled(categoryPromises)
    }
  } catch (error) {
    console.error('Error loading homepage data:', error)
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
