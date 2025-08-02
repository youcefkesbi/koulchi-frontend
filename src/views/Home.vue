<template>
  <div class="space-y-12">
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-r from-primary to-secondary text-white rounded-2xl overflow-hidden">
      <div class="absolute inset-0 bg-black bg-opacity-30"></div>
      <div class="relative z-10 px-8 py-16 text-center">
        <h1 class="text-4xl md:text-6xl font-bold mb-4">
          {{ $t('hero.title') }}
        </h1>
        <p class="text-xl md:text-2xl mb-8 opacity-90">
          {{ $t('hero.subtitle') }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/products" class="btn-secondary text-lg px-8 py-4">
            <i class="fas fa-shopping-bag ml-2"></i>
            {{ $t('hero.shopNow') }}
          </router-link>
          <button class="btn-outline border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-4">
            <i class="fas fa-info-circle ml-2"></i>
            {{ $t('hero.learnMore') }}
          </button>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="card text-center">
        <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-truck text-white text-2xl"></i>
        </div>
        <h3 class="text-xl font-semibold mb-2">{{ $t('features.fastDelivery') }}</h3>
        <p class="text-gray-600">{{ $t('features.fastDeliveryDesc') }}</p>
      </div>
      
      <div class="card text-center">
        <div class="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-money-bill-wave text-white text-2xl"></i>
        </div>
        <h3 class="text-xl font-semibold mb-2">{{ $t('features.cod') }}</h3>
        <p class="text-gray-600">{{ $t('features.codDesc') }}</p>
      </div>
      
      <div class="card text-center">
        <div class="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-shield-alt text-white text-2xl"></i>
        </div>
        <h3 class="text-xl font-semibold mb-2">{{ $t('features.qualityGuarantee') }}</h3>
        <p class="text-gray-600">{{ $t('features.qualityGuaranteeDesc') }}</p>
      </div>
    </section>

    <!-- New Products Section -->
    <section>
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-bold text-dark">{{ $t('sections.newProducts') }}</h2>
        <router-link to="/products" class="text-primary hover:underline">
          {{ $t('sections.viewAll') }} <i class="fas fa-arrow-left mr-1"></i>
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
    <section>
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-bold text-dark">{{ $t('sections.saleProducts') }}</h2>
        <router-link to="/products" class="text-primary hover:underline">
          {{ $t('sections.viewAll') }} <i class="fas fa-arrow-left mr-1"></i>
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
    <section>
      <h2 class="text-3xl font-bold text-dark mb-8 text-center">{{ $t('sections.browseByCategory') }}</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div
          v-for="category in categories"
          :key="category.id"
          @click="selectCategory(category.id)"
          class="card text-center cursor-pointer hover:shadow-lg transition-all duration-300 group"
        >
          <div class="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <i :class="getCategoryIcon(category.id)" class="text-white text-2xl"></i>
          </div>
          <h3 class="font-semibold text-lg">{{ category.nameAr }}</h3>
          <p class="text-gray-600 text-sm">{{ category.name }}</p>
        </div>
      </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="bg-white rounded-2xl p-8">
      <h2 class="text-3xl font-bold text-dark mb-8 text-center">{{ $t('sections.whyChooseUs') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-4">
          <div class="flex items-start space-x-4 space-x-reverse">
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-semibold text-lg">{{ $t('benefits.securePayment') }}</h4>
              <p class="text-gray-600">{{ $t('benefits.securePaymentDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse">
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-semibold text-lg">{{ $t('benefits.fastDeliveryAlgeria') }}</h4>
              <p class="text-gray-600">{{ $t('benefits.fastDeliveryAlgeriaDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse">
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-semibold text-lg">{{ $t('benefits.originalProducts') }}</h4>
              <p class="text-gray-600">{{ $t('benefits.originalProductsDesc') }}</p>
            </div>
          </div>
        </div>
        
        <div class="space-y-4">
          <div class="flex items-start space-x-4 space-x-reverse">
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-semibold text-lg">{{ $t('benefits.competitivePrices') }}</h4>
              <p class="text-gray-600">{{ $t('benefits.competitivePricesDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse">
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-semibold text-lg">{{ $t('benefits.customerService') }}</h4>
              <p class="text-gray-600">{{ $t('benefits.customerServiceDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse">
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-semibold text-lg">{{ $t('benefits.easyOrdering') }}</h4>
              <p class="text-gray-600">{{ $t('benefits.easyOrderingDesc') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useProductsStore } from '../stores/products'
import ProductCard from '../components/ProductCard.vue'

export default {
  name: 'Home',
  components: {
    ProductCard
  },
  setup() {
    const productsStore = useProductsStore()

    const newProducts = computed(() => productsStore.newProducts.slice(0, 4))
    const saleProducts = computed(() => productsStore.saleProducts.slice(0, 4))
    const categories = computed(() => productsStore.categories.filter(cat => cat.id !== 'all'))

    const selectCategory = (categoryId) => {
      productsStore.setCategory(categoryId)
      this.$router.push('/products')
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