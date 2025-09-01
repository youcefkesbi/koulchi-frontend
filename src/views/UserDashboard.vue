<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Dashboard Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="w-full px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">{{ t('dashboard.userDashboard') }}</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ t('dashboard.welcomeMessage', { name: authStore.userDisplayName || authStore.userEmail }) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="bg-white border-b border-gray-200">
      <div class="w-full px-4 sm:px-6 lg:px-8">
        <nav class="flex space-x-8" aria-label="Dashboard Tabs">
          <button
            @click="activeTab = 'buying'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
              activeTab === 'buying'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <i class="fas fa-shopping-bag mr-2"></i>
            {{ t('dashboard.buyingDashboard') }}
          </button>
          <button
            @click="activeTab = 'selling'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
              activeTab === 'selling'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <i class="fas fa-store mr-2"></i>
            {{ t('dashboard.sellingDashboard') }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div class="w-full px-4 sm:px-6 lg:px-8 py-8">
      <!-- Buying Dashboard -->
      <div v-if="activeTab === 'buying'" class="space-y-8">
        <!-- Page Header -->
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ t('dashboard.buyingDashboard') }}</h2>
          <p class="text-lg text-gray-600">{{ t('dashboard.buyingDescription') }}</p>
        </div>

        <!-- Dashboard Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Active Orders -->
          <div class="card">
            <h3 class="text-xl font-bold text-gray-900 mb-4">{{ t('dashboard.activeOrders') }}</h3>
            <div v-if="ordersStore.loading" class="text-center py-8">
              <i class="fas fa-spinner fa-spin text-primary text-2xl"></i>
              <p class="text-gray-600 mt-2">{{ t('common.loading') }}</p>
            </div>
            <div v-else-if="ordersStore.buyerOrders.length > 0" class="space-y-4">
              <div 
                v-for="order in ordersStore.buyerOrders.slice(0, 3)" 
                :key="order.id"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
              >
                <div class="flex items-center space-x-4">
                  <img 
                    :src="order.product?.image_urls?.[0] || order.product?.image" 
                    :alt="order.product?.name"
                    class="w-16 h-16 rounded-lg object-cover shadow-md"
                  />
                  <div>
                    <h4 class="font-semibold text-gray-900 text-lg">{{ order.product?.name }}</h4>
                    <p class="text-sm text-gray-600">{{ t('dashboard.quantity') }}: {{ order.quantity }}</p>
                    <p class="text-sm text-gray-500">{{ t('common.price') }}: {{ order.total_price }} {{ t('common.currency') }}</p>
                  </div>
                </div>
                <span class="badge" :class="getStatusBadgeClass(order.status)">
                  {{ t(`orderStatus.${order.status}`) }}
                </span>
              </div>
              <router-link :to="getLocalizedRoute('/dashboard/orders')" class="btn-outline w-full text-center">
                {{ t('dashboard.viewAllOrders') }}
              </router-link>
            </div>
            <div v-else class="text-center py-12">
              <i class="fas fa-shopping-bag text-gray-400 text-5xl mb-4"></i>
              <p class="text-gray-600 text-lg mb-2">{{ t('dashboard.noOrders') }}</p>
              <p class="text-gray-500">{{ t('dashboard.noOrdersMessage') }}</p>
              <router-link :to="getLocalizedRoute('/products')" class="btn-primary mt-4">
                {{ t('dashboard.startShopping') }}
              </router-link>
            </div>
          </div>

          <!-- Wishlist -->
          <div class="card">
            <h3 class="text-xl font-bold text-gray-900 mb-4">{{ t('wishlist.title') }}</h3>
            <div v-if="wishlistStore.totalItems > 0" class="text-center py-8">
              <i class="fas fa-heart text-red-400 text-5xl mb-4"></i>
              <p class="text-gray-600 text-lg mb-4">{{ t('wishlist.totalItems', { count: wishlistStore.totalItems }) }}</p>
              <router-link :to="getLocalizedRoute('/wishlist')" class="btn-outline">
                {{ t('wishlist.browseProducts') }}
              </router-link>
            </div>
            <div v-else class="text-center py-12">
              <i class="fas fa-heart text-gray-400 text-5xl mb-4"></i>
              <p class="text-gray-600 text-lg mb-2">{{ t('wishlist.empty') }}</p>
              <p class="text-gray-500">{{ t('wishlist.emptyMessage') }}</p>
              <router-link :to="getLocalizedRoute('/products')" class="btn-primary mt-4">
                {{ t('dashboard.browseProducts') }}
              </router-link>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <h3 class="text-xl font-bold text-gray-900 mb-6">{{ t('dashboard.quickActions') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <router-link :to="getLocalizedRoute('/products')" class="btn-outline text-center py-4">
              <i class="fas fa-shopping-bag text-2xl mb-2 block"></i>
              {{ t('dashboard.browseProducts') }}
            </router-link>
            <router-link :to="getLocalizedRoute('/profile')" class="btn-primary text-center py-4">
              <i class="fas fa-user text-2xl mb-2 block"></i>
              {{ t('dashboard.editProfile') }}
            </router-link>
            <router-link :to="getLocalizedRoute('/wishlist')" class="btn-secondary text-center py-4">
              <i class="fas fa-heart text-2xl mb-2 block"></i>
              {{ t('wishlist.title') }}
            </router-link>
          </div>
        </div>
      </div>

      <!-- Selling Dashboard -->
      <div v-else-if="activeTab === 'selling'" class="space-y-8">
        <!-- Page Header -->
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ t('dashboard.sellingDashboard') }}</h2>
          <p class="text-lg text-gray-600">{{ t('dashboard.sellingDescription') }}</p>
        </div>

        <!-- Dashboard Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Pending Orders -->
          <div class="card">
            <h3 class="text-xl font-bold text-gray-900 mb-4">{{ t('dashboard.pendingShipments') }}</h3>
            <div v-if="ordersStore.loading" class="text-center py-8">
              <i class="fas fa-spinner fa-spin text-primary text-2xl"></i>
              <p class="text-gray-600 mt-2">{{ t('common.loading') }}</p>
            </div>
            <div v-else-if="ordersStore.sellerOrders.filter(o => o.status === 'pending').length > 0" class="space-y-4">
              <div 
                v-for="order in ordersStore.sellerOrders.filter(o => o.status === 'pending').slice(0, 3)" 
                :key="order.id"
                class="flex items-center justify-between p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors duration-200"
              >
                <div class="flex items-center space-x-4">
                  <img 
                    :src="order.product?.image_urls?.[0] || order.product?.image" 
                    :alt="order.product?.name"
                    class="w-16 h-16 rounded-lg object-cover shadow-md"
                  />
                  <div>
                    <h4 class="font-semibold text-gray-900 text-lg">{{ order.product?.name }}</h4>
                    <p class="text-sm text-gray-600">{{ t('dashboard.quantity') }}: {{ order.quantity }}</p>
                    <p class="text-sm text-gray-500">{{ t('common.price') }}: {{ order.total_price }} {{ t('common.currency') }}</p>
                  </div>
                </div>
                <button 
                  @click="updateOrderStatus(order.id, 'confirmed')"
                  class="btn-primary text-sm px-4 py-2"
                  :disabled="ordersStore.loading"
                >
                  {{ t('dashboard.confirmOrder') }}
                </button>
              </div>
              <router-link :to="getLocalizedRoute('/dashboard/orders')" class="btn-outline w-full text-center">
                {{ t('dashboard.viewAllOrders') }}
              </router-link>
            </div>
            <div v-else class="text-center py-12">
              <i class="fas fa-box text-gray-400 text-5xl mb-4"></i>
              <p class="text-gray-600 text-lg mb-2">{{ t('dashboard.noPendingOrders') }}</p>
              <p class="text-gray-500">{{ t('dashboard.noPendingOrdersMessage') }}</p>
            </div>
          </div>

          <!-- Current Listings -->
          <div class="card">
            <h3 class="text-xl font-bold text-gray-900 mb-4">{{ t('dashboard.currentListings') }}</h3>
            <div v-if="userProducts.length > 0" class="text-center py-8">
              <i class="fas fa-tag text-blue-400 text-5xl mb-4"></i>
              <p class="text-gray-600 text-lg mb-4">{{ t('dashboard.totalProducts', { count: userProducts.length }) }}</p>
              <router-link :to="getLocalizedRoute('/dashboard/products')" class="btn-outline">
                {{ t('dashboard.manageProducts') }}
              </router-link>
            </div>
            <div v-else class="text-center py-12">
              <i class="fas fa-tag text-gray-400 text-5xl mb-4"></i>
              <p class="text-gray-600 text-lg mb-2">{{ t('dashboard.noListings') }}</p>
              <p class="text-gray-500">{{ t('dashboard.noListingsMessage') }}</p>
              <router-link :to="getLocalizedRoute('/myannouncements/new')" class="btn-primary mt-4">
                {{ t('dashboard.postFirstAnnouncement') }}
              </router-link>
            </div>
          </div>
        </div>

        <!-- Maystro Integration -->
        <MaystroIntegration />

        <!-- Quick Actions -->
        <div class="card">
          <h3 class="text-xl font-bold text-gray-900 mb-6">{{ t('dashboard.quickActions') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <router-link :to="getLocalizedRoute('/myannouncements/new')" class="btn-primary text-center py-4">
              <i class="fas fa-plus text-2xl mb-2 block"></i>
              {{ t('dashboard.postAnnouncement') }}
            </router-link>
            <router-link :to="getLocalizedRoute('/dashboard/products')" class="btn-outline text-center py-4">
              <i class="fas fa-tag text-2xl mb-2 block"></i>
              {{ t('dashboard.manageProducts') }}
            </router-link>
            <router-link :to="getLocalizedRoute('/dashboard/store/create')" class="btn-secondary text-center py-4">
              <i class="fas fa-store text-2xl mb-2 block"></i>
              {{ t('dashboard.createStore') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useProductStore } from '../stores/product'
import { useWishlistStore } from '../stores/wishlist'
import { useOrdersStore } from '../stores/orders'
import { getLocalizedPath } from '../lib/i18n-utils'
import MaystroIntegration from '../components/MaystroIntegration.vue'

const route = useRoute()
const { t } = useI18n()
const authStore = useAuthStore()
const productStore = useProductStore()
const wishlistStore = useWishlistStore()
const ordersStore = useOrdersStore()

// Default to buying dashboard as requested
const activeTab = ref('buying')

// Get localized route path
const getLocalizedRoute = (path) => {
  const currentLocale = route.meta.locale || 'en'
  return getLocalizedPath(path, currentLocale)
}

// Get status badge class
const getStatusBadgeClass = (status) => {
  const statusClasses = {
    'pending': 'badge-pending',
    'confirmed': 'badge-confirmed',
    'shipped': 'badge-shipped',
    'delivered': 'badge-delivered',
    'canceled': 'badge-canceled'
  }
  return statusClasses[status] || 'badge-pending'
}

// Get user's products
const userProducts = computed(() => {
  return productStore.products.filter(product => product.seller_id === authStore.user?.id)
})

// Update order status
const updateOrderStatus = async (orderId, newStatus) => {
  try {
    await ordersStore.updateOrderStatus(orderId, newStatus)
  } catch (error) {
    console.error('Error updating order status:', error)
  }
}

onMounted(async () => {
  // Initialize orders store with current user
  await ordersStore.initUser()
  
  // Fetch products and orders if not already loaded
  if (productStore.products.length === 0) {
    await productStore.fetchProducts()
  }
  
  if (ordersStore.orders.length === 0) {
    await ordersStore.fetchOrders()
  }
})
</script>

<style scoped>
/* Component-specific styles */
</style> 