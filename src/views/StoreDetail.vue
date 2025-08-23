<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Store Header -->
    <div v-if="storeStore.currentStore" class="relative">
      <!-- Store Banner -->
      <div class="h-64 md:h-80 relative overflow-hidden">
        <img 
          v-if="storeStore.currentStore.banner_url" 
          :src="storeStore.currentStore.banner_url" 
          :alt="storeStore.currentStore.name"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          <i class="fas fa-store text-6xl text-gray-400"></i>
        </div>
        
        <!-- Store Logo Overlay -->
        <div class="absolute bottom-6 left-6">
          <div class="w-24 h-24 bg-white rounded-2xl shadow-soft p-3">
            <img 
              v-if="storeStore.currentStore.logo_url" 
              :src="storeStore.currentStore.logo_url" 
              :alt="storeStore.currentStore.name"
              class="w-full h-full object-cover rounded-xl"
            />
            <div v-else class="w-full h-full bg-primary rounded-xl flex items-center justify-center">
              <i class="fas fa-store text-white text-3xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Store Info Overlay -->
      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-6">
        <div class="container mx-auto">
          <h1 class="text-3xl md:text-4xl font-bold mb-2">
            {{ storeStore.currentStore.name }}
          </h1>
          <p v-if="storeStore.currentStore.description" class="text-lg text-white/90 max-w-2xl">
            {{ storeStore.currentStore.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Store Content -->
    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="storeStore.loading || productsLoading" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p class="mt-4 text-gray-600">{{ $t('stores.loading') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="storeStore.error" class="text-center py-16">
        <div class="text-red-500 text-6xl mb-4">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ $t('stores.errorTitle') }}</h3>
        <p class="text-gray-600 mb-6">{{ storeStore.error }}</p>
        <button 
          @click="retryFetch" 
          class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          {{ $t('stores.retry') }}
        </button>
      </div>

      <!-- Store Products -->
      <div v-else>
        <!-- Products Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">
              {{ $t('stores.storeProducts') }}
            </h2>
            <p class="text-gray-600">
              {{ $t('stores.productsCount', { count: storeProducts.length }) }}
            </p>
          </div>
          
          <!-- Back to Stores -->
          <router-link 
            to="/stores" 
            class="mt-4 md:mt-0 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center"
          >
            <i class="fas fa-arrow-left mr-2"></i>
            {{ $t('stores.backToStores') }}
          </router-link>
        </div>

        <!-- Products Grid -->
        <div v-if="storeProducts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ProductCard 
            v-for="product in storeProducts" 
            :key="product.id" 
            :product="product"
            class="h-full"
          />
        </div>

        <!-- No Products State -->
        <div v-else class="text-center py-16">
          <div class="text-gray-400 text-6xl mb-4">
            <i class="fas fa-box-open"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ $t('stores.noProductsTitle') }}</h3>
          <p class="text-gray-600">{{ $t('stores.noProductsMessage') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStoreStore } from '../stores/store'
import { useProductStore } from '../stores/product'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/ProductCard.vue'

const route = useRoute()
const storeStore = useStoreStore()
const productStore = useProductStore()

const productsLoading = ref(false)
const storeProducts = ref([])

const fetchStoreProducts = async () => {
  try {
    productsLoading.value = true
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, name_ar)')
      .eq('store_id', route.params.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    storeProducts.value = data || []
  } catch (err) {
    console.error('Error fetching store products:', err)
  } finally {
    productsLoading.value = false
  }
}

const retryFetch = async () => {
  storeStore.clearError()
  await Promise.all([
    storeStore.fetchStoreById(route.params.id),
    fetchStoreProducts()
  ])
}

onMounted(async () => {
  await Promise.all([
    storeStore.fetchStoreById(route.params.id),
    fetchStoreProducts()
  ])
})

onUnmounted(() => {
  storeStore.clearCurrentStore()
})
</script>
