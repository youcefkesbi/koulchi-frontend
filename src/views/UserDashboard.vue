<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-dark mb-2">{{ $t('dashboard.userDashboard') }}</h1>
      <p class="text-gray-600">{{ $t('dashboard.welcomeMessage', { name: authStore.userDisplayName || authStore.userEmail }) }}</p>
    </div>

    <!-- Dashboard Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Buying Section -->
      <div class="space-y-6">
        <div class="card">
          <h2 class="text-xl font-bold text-dark mb-4">{{ $t('dashboard.buyingSection') }}</h2>
          <p class="text-gray-600 mb-6">{{ $t('dashboard.buyingDescription') }}</p>
          
          <!-- Active Orders -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-dark mb-3">{{ $t('dashboard.activeOrders') }}</h3>
            <div v-if="ordersStore.loading" class="text-center py-4">
              <i class="fas fa-spinner fa-spin text-primary text-xl"></i>
            </div>
            <div v-else-if="ordersStore.buyerOrders.length > 0" class="space-y-3">
              <div 
                v-for="order in ordersStore.buyerOrders.slice(0, 3)" 
                :key="order.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center space-x-3 space-x-reverse">
                  <img 
                    :src="order.product?.image_urls?.[0] || order.product?.image" 
                    :alt="order.product?.name"
                    class="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h4 class="font-semibold text-dark">{{ order.product?.name }}</h4>
                    <p class="text-sm text-gray-600">{{ $t('dashboard.quantity') }}: {{ order.quantity }}</p>
                  </div>
                </div>
                <span class="badge" :class="getStatusBadgeClass(order.status)">
                  {{ $t(`orderStatus.${order.status}`) }}
                </span>
              </div>
              <router-link :to="getLocalizedRoute('/dashboard/orders')" class="btn-outline w-full text-center">
                {{ $t('dashboard.viewAllOrders') }}
              </router-link>
            </div>
            <div v-else class="text-center py-6">
              <i class="fas fa-shopping-bag text-gray-400 text-3xl mb-3"></i>
              <p class="text-gray-600">{{ $t('dashboard.noOrders') }}</p>
              <p class="text-sm text-gray-500">{{ $t('dashboard.noOrdersMessage') }}</p>
            </div>
          </div>

          <!-- Wishlist -->
          <div>
            <h3 class="text-lg font-semibold text-dark mb-3">{{ $t('wishlist.title') }}</h3>
            <div v-if="wishlistStore.totalItems > 0" class="text-center py-4">
              <p class="text-gray-600 mb-3">{{ $t('wishlist.totalItems', { count: wishlistStore.totalItems }) }}</p>
              <router-link :to="getLocalizedRoute('/wishlist')" class="btn-outline">
                {{ $t('wishlist.browseProducts') }}
              </router-link>
            </div>
            <div v-else class="text-center py-6">
              <i class="fas fa-heart text-gray-400 text-3xl mb-3"></i>
              <p class="text-gray-600">{{ $t('wishlist.empty') }}</p>
              <p class="text-sm text-gray-500">{{ $t('wishlist.emptyMessage') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Selling Section -->
      <div class="space-y-6">
        <div class="card">
          <h2 class="text-xl font-bold text-dark mb-4">{{ $t('dashboard.sellingSection') }}</h2>
          <p class="text-gray-600 mb-6">{{ $t('dashboard.sellingDescription') }}</p>
          
          <!-- Pending Orders -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-dark mb-3">{{ $t('dashboard.pendingShipments') }}</h3>
            <div v-if="ordersStore.loading" class="text-center py-4">
              <i class="fas fa-spinner fa-spin text-primary text-xl"></i>
            </div>
            <div v-else-if="ordersStore.sellerOrders.length > 0" class="space-y-3">
              <div 
                v-for="order in ordersStore.sellerOrders.filter(o => o.status === 'pending').slice(0, 3)" 
                :key="order.id"
                class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
              >
                <div class="flex items-center space-x-3 space-x-reverse">
                  <img 
                    :src="order.product?.image_urls?.[0] || order.product?.image" 
                    :alt="order.product?.name"
                    class="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h4 class="font-semibold text-dark">{{ order.product?.name }}</h4>
                    <p class="text-sm text-gray-600">{{ $t('dashboard.quantity') }}: {{ order.quantity }}</p>
                  </div>
                </div>
                <button 
                  @click="updateOrderStatus(order.id, 'confirmed')"
                  class="btn-primary text-sm px-3 py-1"
                  :disabled="ordersStore.loading"
                >
                  {{ $t('dashboard.confirmOrder') }}
                </button>
              </div>
              <router-link :to="getLocalizedRoute('/dashboard/orders')" class="btn-outline w-full text-center">
                {{ $t('dashboard.viewAllOrders') }}
              </router-link>
            </div>
            <div v-else class="text-center py-6">
              <i class="fas fa-box text-gray-400 text-3xl mb-3"></i>
              <p class="text-gray-600">{{ $t('dashboard.noPendingOrders') }}</p>
              <p class="text-sm text-gray-500">{{ $t('dashboard.noPendingOrdersMessage') }}</p>
            </div>
          </div>

          <!-- Current Listings -->
          <div>
            <h3 class="text-lg font-semibold text-dark mb-3">{{ $t('dashboard.currentListings') }}</h3>
            <div v-if="productStore.userProducts.length > 0" class="text-center py-4">
              <p class="text-gray-600 mb-3">{{ $t('dashboard.totalProducts', { count: productStore.userProducts.length }) }}</p>
              <router-link :to="getLocalizedRoute('/dashboard/products')" class="btn-outline">
                {{ $t('dashboard.manageProducts') }}
              </router-link>
            </div>
            <div v-else class="text-center py-6">
              <i class="fas fa-tag text-gray-400 text-3xl mb-3"></i>
              <p class="text-gray-600">{{ $t('dashboard.noListings') }}</p>
              <p class="text-sm text-gray-500">{{ $t('dashboard.noListingsMessage') }}</p>
              <router-link :to="getLocalizedRoute('/myannouncements/new')" class="btn-primary mt-3">
                {{ $t('dashboard.postFirstAnnouncement') }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mt-8">
      <div class="card">
        <h2 class="text-xl font-bold text-dark mb-4">{{ $t('dashboard.quickActions') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <router-link :to="getLocalizedRoute('/myannouncements/new')" class="btn-primary text-center">
            <i class="fas fa-plus ml-2"></i>
            {{ $t('dashboard.postAnnouncement') }}
          </router-link>
          <router-link :to="getLocalizedRoute('/products')" class="btn-outline text-center">
            <i class="fas fa-shopping-bag ml-2"></i>
            {{ $t('dashboard.browseProducts') }}
          </router-link>
          <router-link :to="getLocalizedRoute('/profile')" class="btn-outline text-center">
            <i class="fas fa-user ml-2"></i>
            {{ $t('dashboard.editProfile') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProductStore } from '../stores/product'
import { useWishlistStore } from '../stores/wishlist'
import { useOrdersStore } from '../stores/orders'
import { getLocalizedPath } from '../lib/i18n-utils'

const route = useRoute()
const authStore = useAuthStore()
const productStore = useProductStore()
const wishlistStore = useWishlistStore()
const ordersStore = useOrdersStore()

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

// Update order status
const updateOrderStatus = async (orderId, newStatus) => {
  try {
    await ordersStore.updateOrderStatus(orderId, newStatus)
  } catch (error) {
    console.error('Error updating order status:', error)
  }
}

onMounted(async () => {
  // Load user data
  await Promise.all([
    productStore.fetchUserProducts(),
    wishlistStore.fetchWishlist(),
    ordersStore.fetchBuyerOrders(),
    ordersStore.fetchSellerOrders()
  ])
})
</script>

<style scoped>
.badge {
  @apply px-2 py-1 rounded-full text-xs font-semibold;
}

.badge-pending {
  @apply bg-yellow-100 text-yellow-800;
}

.badge-confirmed {
  @apply bg-blue-100 text-blue-800;
}

.badge-shipped {
  @apply bg-purple-100 text-purple-800;
}

.badge-delivered {
  @apply bg-green-100 text-green-800;
}

.badge-canceled {
  @apply bg-red-100 text-red-800;
}
</style> 