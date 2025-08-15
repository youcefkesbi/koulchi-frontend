<template>
  <div class="space-y-20 animate-fade-in px-4">


    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-primary to-secondary text-white rounded-3xl overflow-hidden shadow-soft">
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="relative z-10 px-6 py-16 text-center">
        <h1 class="text-4xl md:text-6xl font-bold mb-6 animate-slide-up">
          {{ $t('hero.title') }}
        </h1>
        <p class="text-lg md:text-xl mb-8 opacity-95 animate-slide-up" style="animation-delay: 0.1s">
          {{ $t('hero.subtitle') }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style="animation-delay: 0.2s">
          <router-link to="/products" class="btn-secondary text-base px-8 py-4 rounded-2xl shadow-soft hover:shadow-glow transform hover:scale-105 transition-all duration-300">
            <i class="fas fa-shopping-bag ml-2"></i>
            {{ $t('hero.shopNow') }}
          </router-link>
          <button class="btn-outline border-2 border-white text-white hover:bg-white hover:text-primary text-base px-8 py-4 rounded-2xl transform hover:scale-105 transition-all duration-300">
            <i class="fas fa-info-circle ml-2"></i>
            {{ $t('hero.learnMore') }}
          </button>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
      <div class="card text-center group hover:shadow-glow transform hover:scale-105 transition-all duration-300">
        <div class="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-dark transition-all duration-300">
          <i class="fas fa-truck text-white text-2xl"></i>
        </div>
        <h3 class="text-xl font-bold mb-3 text-dark">{{ $t('features.fastDelivery') }}</h3>
        <p class="text-gray-600 leading-relaxed text-sm">{{ $t('features.fastDeliveryDesc') }}</p>
      </div>
      
      <div class="card text-center group hover:shadow-glow transform hover:scale-105 transition-all duration-300">
        <div class="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary-dark transition-all duration-300">
          <i class="fas fa-money-bill-wave text-white text-2xl"></i>
        </div>
        <h3 class="text-xl font-bold mb-3 text-dark">{{ $t('features.cod') }}</h3>
        <p class="text-gray-600 leading-relaxed text-sm">{{ $t('features.codDesc') }}</p>
      </div>
      
      <div class="card text-center group hover:shadow-glow transform hover:scale-105 transition-all duration-300">
        <div class="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-dark transition-all duration-300">
          <i class="fas fa-shield-alt text-white text-2xl"></i>
        </div>
        <h3 class="text-xl font-bold mb-3 text-dark">{{ $t('features.qualityGuarantee') }}</h3>
        <p class="text-gray-600 leading-relaxed text-sm">{{ $t('features.qualityGuaranteeDesc') }}</p>
      </div>
    </section>

    <!-- New Products Section -->
    <section class="animate-slide-up">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-bold text-dark">{{ $t('sections.newProducts') }}</h2>
        <router-link to="/products" class="text-primary hover:text-primary-dark text-base font-semibold hover:underline transition-colors">
          {{ $t('sections.viewAll') }} <i class="fas fa-arrow-left mr-2"></i>
        </router-link>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ProductCard
          v-for="product in newProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </section>

    <!-- Sale Products Section -->
    <section class="animate-slide-up">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-bold text-dark">{{ $t('sections.saleProducts') }}</h2>
        <router-link to="/products" class="text-secondary hover:text-secondary-dark text-base font-semibold hover:underline transition-colors">
          {{ $t('sections.viewAll') }} <i class="fas fa-arrow-left mr-2"></i>
        </router-link>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ProductCard
          v-for="product in saleProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </section>

    <!-- Categories Section -->
    <section class="animate-slide-up">
      <h2 class="text-3xl font-bold text-dark mb-8 text-center">{{ $t('sections.browseByCategory') }}</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div
          v-for="category in categories"
          :key="category.id"
          @click="selectCategory(category.id)"
          class="card text-center cursor-pointer hover:shadow-glow transform hover:scale-105 transition-all duration-300 group"
        >
          <div class="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary transition-all duration-300 shadow-soft group-hover:shadow-glow">
            <i :class="getCategoryIcon(category.id)" class="text-white text-2xl"></i>
          </div>
          <h3 class="font-bold text-lg text-dark mb-2">{{ category.name_ar }}</h3>
          <p class="text-gray-600 text-sm">{{ category.name }}</p>
        </div>
      </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="bg-gradient-to-br from-light-gray to-white rounded-3xl p-12 shadow-soft animate-slide-up">
      <h2 class="text-4xl font-bold text-dark mb-12 text-center">{{ $t('sections.whyChooseUs') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div class="space-y-6">
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-glow transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-dark mb-2">{{ $t('benefits.securePayment') }}</h4>
              <p class="text-gray-600 leading-relaxed">{{ $t('benefits.securePaymentDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-glow transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-dark mb-2">{{ $t('benefits.fastDeliveryAlgeria') }}</h4>
              <p class="text-gray-600 leading-relaxed">{{ $t('benefits.fastDeliveryAlgeriaDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-glow transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-dark mb-2">{{ $t('benefits.originalProducts') }}</h4>
              <p class="text-gray-600 leading-relaxed">{{ $t('benefits.originalProductsDesc') }}</p>
            </div>
          </div>
        </div>
        
        <div class="space-y-6">
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-10 h-10 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-glow-orange transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-dark mb-2">{{ $t('benefits.competitivePrices') }}</h4>
              <p class="text-gray-600 leading-relaxed">{{ $t('benefits.competitivePricesDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-10 h-10 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-glow-orange transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-dark mb-2">{{ $t('benefits.customerService') }}</h4>
              <p class="text-gray-600 leading-relaxed">{{ $t('benefits.customerServiceDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-10 h-10 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-glow-orange transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-dark mb-2">{{ $t('benefits.easyOrdering') }}</h4>
              <p class="text-gray-600 leading-relaxed">{{ $t('benefits.easyOrderingDesc') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '../stores/products'
import ProductCard from '../components/ProductCard.vue'
export default {
  name: 'Home',
  components: {
    ProductCard
  },
  setup() {
    const router = useRouter()
    const productsStore = useProductsStore()

    const newProducts = computed(() => productsStore.newProducts.slice(0, 4))
    const saleProducts = computed(() => productsStore.saleProducts.slice(0, 4))
    const categories = computed(() => productsStore.categories.filter(cat => cat.id !== 'all'))

    const selectCategory = (categoryId) => {
      productsStore.setCategory(categoryId)
      router.push('/products')
    }

    const getCategoryIcon = (categoryId) => {
      const icons = {
        electronics: 'fas fa-mobile-alt',
        fashion: 'fas fa-tshirt',
        home: 'fas fa-home',
        food: 'fas fa-utensils'
      }
      return icons[categoryId] || 'fas fa-box'
    }

    // Fetch products and categories on component mount
    onMounted(async () => {
      try {
        await Promise.all([
          productsStore.fetchProducts(),
          productsStore.fetchCategories()
        ])
      } catch (error) {
        console.error('Error loading data:', error)
      }
    })

    return {
      newProducts,
      saleProducts,
      categories,
      selectCategory,
      getCategoryIcon
    }
  }
}
</script> 