<template>
  <div class="space-y-8">
    <!-- Page Header -->
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('dashboard.sellingDashboard') }}</h2>
      <p class="text-lg text-gray-600">{{ $t('dashboard.sellingDescription') }}</p>
    </div>

    <!-- Dashboard Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Pending Orders -->
      <div class="card">
        <h3 class="text-xl font-bold text-gray-900 mb-4">{{ $t('dashboard.pendingShipments') }}</h3>
        <div v-if="ordersStore.loading" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-primary text-2xl"></i>
          <p class="text-gray-600 mt-2">{{ $t('common.loading') }}</p>
        </div>
        <div v-else-if="pendingOrders.length > 0" class="space-y-4">
          <div 
            v-for="order in pendingOrders.slice(0, 3)" 
            :key="order.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-semibold text-gray-800">{{ order.product_name }}</h4>
              <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                {{ order.status }}
              </span>
            </div>
            <div class="text-sm text-gray-600 mb-2">
              {{ $t('dashboard.quantity') }}: {{ order.quantity }} | {{ $t('common.price') }}: {{ order.total_price }} {{ $t('common.currency') }}
            </div>
            <div class="text-xs text-gray-500 mb-3">
              {{ $t('dashboard.orderedOn') }}: {{ formatDate(order.created_at) }}
            </div>
            <button 
              @click="confirmOrder(order.id)"
              class="btn-primary text-sm"
            >
              {{ $t('dashboard.confirmOrder') }}
            </button>
          </div>
          <div class="text-center pt-4">
            <router-link 
              :to="getLocalizedRoute('/dashboard/orders')" 
              class="text-primary hover:text-primary-dark font-medium"
            >
              {{ $t('dashboard.viewAllOrders') }}
            </router-link>
          </div>
        </div>
        <div v-else class="text-center py-8">
          <i class="fas fa-check-circle text-gray-400 text-4xl mb-4"></i>
          <h4 class="text-lg font-semibold text-gray-800 mb-2">{{ $t('dashboard.noPendingOrders') }}</h4>
          <p class="text-gray-600">{{ $t('dashboard.noPendingOrdersMessage') }}</p>
        </div>
      </div>

      <!-- Current Listings -->
      <div class="card">
        <h3 class="text-xl font-bold text-gray-900 mb-4">{{ $t('dashboard.currentListings') }}</h3>
        <div v-if="productStore.loading" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-primary text-2xl"></i>
          <p class="text-gray-600 mt-2">{{ $t('common.loading') }}</p>
        </div>
        <div v-else-if="userProducts.length > 0" class="space-y-4">
          <div 
            v-for="product in userProducts.slice(0, 3)" 
            :key="product.id"
            class="flex items-center space-x-3 space-x-reverse border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <img 
              :src="product.image_urls?.[0] || '/placeholder-product.jpg'" 
              :alt="product.name"
              class="w-16 h-16 object-cover rounded-lg"
            />
            <div class="flex-1">
              <h4 class="font-semibold text-gray-800">{{ product.name }}</h4>
              <p class="text-sm text-gray-600">{{ $t('common.price') }}: {{ product.price }} {{ $t('common.currency') }}</p>
              <p class="text-xs text-gray-500">{{ $t('dashboard.stock') }}: {{ product.stock_quantity }}</p>
            </div>
            <div class="flex items-center space-x-2 space-x-reverse">
              <span 
                :class="[
                  'px-2 py-1 text-xs rounded-full font-medium',
                  product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                ]"
              >
                {{ product.is_active ? $t('common.active') : $t('common.inactive') }}
              </span>
            </div>
          </div>
          <div class="text-center pt-4">
            <router-link 
              :to="getLocalizedRoute('/dashboard/products')" 
              class="text-primary hover:text-primary-dark font-medium"
            >
              {{ $t('dashboard.manageProducts') }}
            </router-link>
          </div>
        </div>
        <div v-else class="text-center py-8">
          <i class="fas fa-tag text-gray-400 text-4xl mb-4"></i>
          <h4 class="text-lg font-semibold text-gray-800 mb-2">{{ $t('dashboard.noListings') }}</h4>
          <p class="text-gray-600 mb-4">{{ $t('dashboard.noListingsMessage') }}</p>
          <router-link 
            :to="getLocalizedRoute('/myannouncements/new')" 
            class="btn-primary"
          >
            {{ $t('dashboard.postFirstAnnouncement') }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- Store Management -->
    <div v-if="userStores.length > 0" class="card">
      <h3 class="text-xl font-bold text-gray-900 mb-4">{{ $t('dashboard.myStores') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="store in userStores" 
          :key="store.id"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center space-x-3 space-x-reverse mb-3">
            <div class="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <img 
                v-if="store.logo_url" 
                :src="store.logo_url" 
                :alt="store.name"
                class="w-full h-full object-cover rounded-xl"
              />
              <i v-else class="fas fa-store text-white text-xl"></i>
            </div>
            <div>
              <h4 class="font-semibold text-gray-800">{{ store.name || $t('stores.defaultStoreName') }}</h4>
              <p class="text-sm text-gray-600">{{ store.pack_name }}</p>
            </div>
          </div>
          <div class="text-sm text-gray-500 mb-3">
            {{ $t('dashboard.products') }}: {{ getStoreProductCount(store.id) }}
          </div>
          <div class="flex items-center space-x-2 space-x-reverse">
            <router-link 
              :to="getLocalizedRoute(`/dashboard/store/${store.id}`)" 
              class="btn-primary text-sm flex-1 text-center"
            >
              {{ $t('common.manage') }}
            </router-link>
            <button 
              @click="editStore(store)"
              class="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card">
      <h3 class="text-xl font-bold text-gray-900 mb-6">{{ $t('dashboard.quickActions') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <router-link :to="getLocalizedRoute('/myannouncements/new')" class="btn-primary text-center py-4">
          <i class="fas fa-plus text-2xl mb-2 block"></i>
          {{ $t('dashboard.postAnnouncement') }}
        </router-link>
        <router-link :to="getLocalizedRoute('/dashboard/products')" class="btn-outline text-center py-4">
          <i class="fas fa-tag text-2xl mb-2 block"></i>
          {{ $t('dashboard.manageProducts') }}
        </router-link>
        <router-link :to="getLocalizedRoute('/dashboard/store/create')" class="btn-secondary text-center py-4">
          <i class="fas fa-store text-2xl mb-2 block"></i>
          {{ $t('dashboard.createStore') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useOrdersStore } from '../../stores/orders'
import { useProductStore } from '../../stores/product'
import { useStoreStore } from '../../stores/store'
import { getLocalizedPath } from '../../lib/i18n-utils'

const { t: $t } = useI18n()
const route = useRoute()
const ordersStore = useOrdersStore()
const productStore = useProductStore()
const storeStore = useStoreStore()

// Computed properties
const pendingOrders = computed(() => 
  ordersStore.sellerOrders.filter(o => o.status === 'pending')
)

const userProducts = computed(() => 
  productStore.products.filter(p => p.seller_id === storeStore.user?.id)
)

const userStores = computed(() => 
  storeStore.userStores || []
)

// Get localized route path
const getLocalizedRoute = (path) => {
  const currentLocale = route.meta.locale || 'en'
  return getLocalizedPath(path, currentLocale)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getStoreProductCount = (storeId) => {
  return productStore.products.filter(p => p.store_id === storeId).length
}

const confirmOrder = async (orderId) => {
  try {
    await ordersStore.updateOrderStatus(orderId, 'confirmed')
    // Refresh orders
    await ordersStore.fetchSellerOrders()
  } catch (error) {
    console.error('Error confirming order:', error)
  }
}

const editStore = (store) => {
  // Navigate to store edit page
  const editPath = getLocalizedRoute(`/dashboard/store/${store.id}/edit`)
  // This would be handled by the parent component or router
  console.log('Edit store:', store, editPath)
}

onMounted(async () => {
  // Load data when component mounts
  await Promise.all([
    ordersStore.fetchSellerOrders(),
    productStore.fetchProducts(),
    storeStore.fetchUserStores()
  ])
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-xl shadow-soft p-6;
}

.btn-primary {
  @apply px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors;
}

.btn-outline {
  @apply px-6 py-3 border border-primary text-primary font-medium rounded-lg hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors;
}

.btn-secondary {
  @apply px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors;
}
</style>
