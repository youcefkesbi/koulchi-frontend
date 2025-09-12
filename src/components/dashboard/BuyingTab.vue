<template>
  <div class="space-y-8">
    <!-- Page Header -->
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('dashboard.buyingDashboard') }}</h2>
      <p class="text-lg text-gray-600">{{ $t('dashboard.buyingDescription') }}</p>
    </div>

    <!-- Dashboard Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Active Orders -->
      <div class="card">
        <h3 class="text-xl font-bold text-gray-900 mb-4">{{ $t('dashboard.activeOrders') }}</h3>
        <div v-if="ordersStore.loading" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-primary text-2xl"></i>
          <p class="text-gray-600 mt-2">{{ $t('common.loading') }}</p>
        </div>
        <div v-else-if="ordersStore.buyerOrders.length > 0" class="space-y-4">
          <div 
            v-for="order in ordersStore.buyerOrders.slice(0, 3)" 
            :key="order.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-semibold text-gray-800">{{ order.product_name }}</h4>
              <span 
                :class="[
                  'px-2 py-1 text-xs rounded-full font-medium',
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                ]"
              >
                {{ order.status }}
              </span>
            </div>
            <div class="text-sm text-gray-600 mb-2">
              {{ $t('dashboard.quantity') }}: {{ order.quantity }} | {{ $t('common.price') }}: {{ order.total_price }} {{ $t('common.currency') }}
            </div>
            <div class="text-xs text-gray-500">
              {{ $t('dashboard.orderedOn') }}: {{ formatDate(order.created_at) }}
            </div>
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
          <i class="fas fa-shopping-bag text-gray-400 text-4xl mb-4"></i>
          <h4 class="text-lg font-semibold text-gray-800 mb-2">{{ $t('dashboard.noOrders') }}</h4>
          <p class="text-gray-600 mb-4">{{ $t('dashboard.noOrdersMessage') }}</p>
          <router-link 
            :to="getLocalizedRoute('/products')" 
            class="btn-primary"
          >
            {{ $t('dashboard.startShopping') }}
          </router-link>
        </div>
      </div>

      <!-- Wishlist -->
      <div class="card">
        <h3 class="text-xl font-bold text-gray-900 mb-4">{{ $t('dashboard.wishlist') }}</h3>
        <div v-if="wishlistStore.loading" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-primary text-2xl"></i>
          <p class="text-gray-600 mt-2">{{ $t('common.loading') }}</p>
        </div>
        <div v-else-if="wishlistStore.wishlistItems.length > 0" class="space-y-4">
          <div 
            v-for="item in wishlistStore.wishlistItems.slice(0, 3)" 
            :key="item.id"
            class="flex items-center space-x-3 space-x-reverse border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <img 
              :src="item.image_urls?.[0] || '/placeholder-product.jpg'" 
              :alt="item.name"
              class="w-16 h-16 object-cover rounded-lg"
            />
            <div class="flex-1">
              <h4 class="font-semibold text-gray-800">{{ item.name }}</h4>
              <p class="text-sm text-gray-600">{{ $t('common.price') }}: {{ item.price }} {{ $t('common.currency') }}</p>
            </div>
            <button 
              @click="removeFromWishlist(item.id)"
              class="text-red-500 hover:text-red-700 p-2"
            >
              <i class="fas fa-heart-broken"></i>
            </button>
          </div>
          <div class="text-center pt-4">
            <router-link 
              :to="getLocalizedRoute('/wishlist')" 
              class="text-primary hover:text-primary-dark font-medium"
            >
              {{ $t('dashboard.viewAllWishlist') }}
            </router-link>
          </div>
        </div>
        <div v-else class="text-center py-8">
          <i class="fas fa-heart text-gray-400 text-4xl mb-4"></i>
          <h4 class="text-lg font-semibold text-gray-800 mb-2">{{ $t('dashboard.noWishlist') }}</h4>
          <p class="text-gray-600 mb-4">{{ $t('dashboard.noWishlistMessage') }}</p>
          <router-link 
            :to="getLocalizedRoute('/products')" 
            class="btn-primary"
          >
            {{ $t('dashboard.browseProducts') }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card">
      <h3 class="text-xl font-bold text-gray-900 mb-6">{{ $t('dashboard.quickActions') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <router-link :to="getLocalizedRoute('/products')" class="btn-primary text-center py-4">
          <i class="fas fa-search text-2xl mb-2 block"></i>
          {{ $t('dashboard.browseProducts') }}
        </router-link>
        <router-link :to="getLocalizedRoute('/wishlist')" class="btn-outline text-center py-4">
          <i class="fas fa-heart text-2xl mb-2 block"></i>
          {{ $t('dashboard.viewWishlist') }}
        </router-link>
        <router-link :to="getLocalizedRoute('/profile')" class="btn-secondary text-center py-4">
          <i class="fas fa-user text-2xl mb-2 block"></i>
          {{ $t('dashboard.editProfile') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useOrdersStore } from '../../stores/orders'
import { useWishlistStore } from '../../stores/wishlist'
import { getLocalizedPath } from '../../lib/i18n-utils'

const { t: $t } = useI18n()
const route = useRoute()
const ordersStore = useOrdersStore()
const wishlistStore = useWishlistStore()

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

const removeFromWishlist = async (itemId) => {
  try {
    await wishlistStore.removeFromWishlist(itemId)
  } catch (error) {
    console.error('Error removing from wishlist:', error)
  }
}

onMounted(async () => {
  // Load data when component mounts
  await Promise.all([
    ordersStore.fetchBuyerOrders(),
    wishlistStore.fetchWishlist()
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
