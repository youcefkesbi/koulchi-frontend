<template>
  <div class="space-y-20 animate-fade-in px-4">
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white rounded-3xl overflow-hidden shadow-soft">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-gradient-to-br from-green-600/20 via-green-500/20 to-green-400/20"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      <div class="relative z-10 px-6 py-12 text-center">
        <!-- Decorative Elements -->
        <div class="absolute top-6 left-6 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
        <div class="absolute bottom-6 right-6 w-24 h-24 bg-green-400/20 rounded-full blur-xl"></div>
        
        <h1 class="text-4xl md:text-6xl font-bold mb-6 animate-slide-up bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
          {{ t('hero.title') }}
        </h1>
        <p class="text-lg md:text-xl mb-8 text-green-50 animate-slide-up" style="animation-delay: 0.1s">
          {{ t('hero.subtitle') }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style="animation-delay: 0.2s">
          <button @click="scrollToNewProducts" class="bg-white text-slate-800 font-semibold text-base px-8 py-4 rounded-2xl shadow-soft hover:shadow-glow transform hover:scale-105 transition-all duration-300 hover:bg-blue-50">
            <i class="fas fa-shopping-bag ml-2"></i>
            {{ t('hero.shopNow') }}
          </button>
          <button class="border-2 border-white/30 text-white font-semibold text-base px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/50 transform hover:scale-105 transition-all duration-300">
            <i class="fas fa-info-circle ml-2"></i>
            {{ t('hero.learnMore') }}
          </button>
        </div>
      </div>
    </section>

    <!-- New Products Section -->
    <section id="new-products" class="animate-slide-up">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-bold text-dark">{{ t('sections.newProducts') }}</h2>
        <router-link to="/products" class="text-primary hover:text-primary-dark text-base font-semibold hover:underline transition-colors">
          {{ t('sections.viewAll') }} <i class="fas fa-arrow-left mr-2"></i>
        </router-link>
      </div>
      
      <!-- Debug Info -->
      <div class="mb-4 p-4 bg-gray-100 rounded-lg">
        <p class="text-sm text-gray-600">
          Debug: Products loaded: {{ productStore.products.length }}, 
          New products: {{ newProducts.length }}, 
          Loading: {{ productStore.loading }}, 
          Error: {{ productStore.error }}
        </p>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ProductCard
          v-for="product in newProducts"
          :key="product.id"
          :product="product"
        />
      </div>
      
      <!-- No Products Message -->
      <div v-if="newProducts.length === 0 && !productStore.loading" class="text-center py-8">
        <p class="text-gray-500">No products found</p>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="animate-slide-up">
      <h2 class="text-3xl font-bold text-dark mb-8 text-center">{{ t('sections.browseByCategory') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <router-link
          v-for="category in categories"
          :key="category.id"
          :to="`/category/${category.id}`"
          class="card text-center cursor-pointer hover:shadow-glow transform hover:scale-105 transition-all duration-300 group"
        >
          <div class="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary transition-all duration-300 shadow-soft group-hover:shadow-glow overflow-hidden">
            <img 
              v-if="category.icon_url" 
              :src="category.icon_url" 
              :alt="getCategoryName(category.id)"
              class="w-12 h-12 object-contain"
            />
            <i v-else class="fas fa-box text-white text-2xl"></i>
          </div>
          <h3 class="font-bold text-lg text-dark mb-2">{{ getCategoryName(category.id) }}</h3>
        </router-link>
      </div>
    </section>

    <!-- Features Section -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
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
    <section class="bg-gradient-to-br from-light-gray to-white rounded-3xl p-12 shadow-soft animate-slide-up">
      <h2 class="text-4xl font-bold text-dark mb-12 text-center">{{ t('sections.whyChooseUs') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div class="space-y-6">
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-glow transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-dark mb-2">{{ t('benefits.securePayment') }}</h4>
              <p class="text-gray-600 leading-relaxed">{{ t('benefits.securePaymentDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-glow transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="text-xl font-bold mb-2 text-dark">{{ t('benefits.fastDeliveryAlgeria') }}</h4>
              <p class="text-gray-600 leading-relaxed">{{ t('benefits.fastDeliveryAlgeriaDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-glow transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="text-xl font-bold mb-2 text-dark">{{ t('benefits.originalProducts') }}</h4>
              <p class="text-gray-600 leading-relaxed">{{ t('benefits.originalProductsDesc') }}</p>
            </div>
          </div>
        </div>
        
        <div class="space-y-6">
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-10 h-10 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-glow transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="text-xl font-bold mb-2 text-dark">{{ t('benefits.competitivePrices') }}</h4>
              <p class="text-gray-600 leading-relaxed">{{ t('benefits.competitivePricesDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-10 h-10 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-glow transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="text-xl font-bold mb-2 text-dark">{{ t('benefits.customerService') }}</h4>
              <p class="text-gray-600 leading-relaxed">{{ t('benefits.customerServiceDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-10 h-10 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-glow transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="text-xl font-bold mb-2 text-dark">{{ t('benefits.easyOrdering') }}</h4>
              <p class="text-gray-600 leading-relaxed">{{ t('benefits.easyOrderingDesc') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProductStore } from '../stores/product'
import ProductCard from '../components/ProductCard.vue'
import { testDatabase, checkDatabaseTables } from '../utils/test-database'

const { t, locale } = useI18n()
const productStore = useProductStore()

const newProducts = computed(() => {
  console.log('newProducts computed - products count:', productStore.products.length)
  const result = productStore.products.slice(0, 8)
  console.log('newProducts result:', result.length, 'products')
  return result
})

const categories = computed(() => {
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

const scrollToNewProducts = () => {
  const newProductsSection = document.getElementById('new-products')
  if (newProductsSection) {
    newProductsSection.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(async () => {
  console.log('Home component mounted')
  
  // Test database connection first
  await testDatabase()
  await checkDatabaseTables()
  
  if (productStore.products.length === 0) {
    console.log('Fetching products...')
    await productStore.fetchProducts()
  } else {
    console.log('Products already loaded:', productStore.products.length)
  }
  
  if (productStore.categories.length === 0) {
    console.log('Fetching categories...')
    await productStore.fetchCategories()
  } else {
    console.log('Categories already loaded:', productStore.categories.length)
  }
  
  console.log('Final state - Products:', productStore.products.length, 'Categories:', productStore.categories.length)
})
</script>
