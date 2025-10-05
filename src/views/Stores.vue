<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-primary to-secondary text-white py-16">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">
          {{ $t('stores.discoverStores') }}
        </h1>
        <p class="text-xl text-white/90 max-w-2xl mx-auto">
          {{ $t('stores.heroDescription') }}
        </p>
      </div>
    </div>

    <!-- Stores Grid -->
    <div class="container mx-auto px-4 py-12">
      <!-- Loading State -->
      <div v-if="storeStore.loading" class="text-center py-16">
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

      <!-- Stores Grid -->
      <div v-else-if="storeStore.stores.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="store in storeStore.stores" 
          :key="store.id"
          class="bg-white rounded-2xl shadow-soft hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
          @click="navigateToStore(store.id)"
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
            <p v-else class="text-gray-500 mb-4 italic">
              {{ $t('stores.noDescription') }}
            </p>
            
            <!-- Store Meta -->
            <div class="flex items-center justify-between text-sm text-gray-500">
              <span class="flex items-center">
                <i class="fas fa-calendar mr-2"></i>
                {{ formatDate(store.created_at) }}
              </span>
              <span class="flex items-center text-primary font-medium">
                {{ $t('stores.visitStore') }}
                <i class="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <div class="text-gray-400 text-6xl mb-4">
          <i class="fas fa-store"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ $t('stores.noStoresTitle') }}</h3>
        <p class="text-gray-600">{{ $t('stores.noStoresMessage') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreStore } from '../stores/useStoresStore'

const router = useRouter()
const storeStore = useStoreStore()

const navigateToStore = (storeId) => {
  router.push(`/stores/${storeId}`)
}

const retryFetch = async () => {
  storeStore.clearError()
  await storeStore.fetchAllStores()
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(async () => {
  await storeStore.fetchAllStores()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
