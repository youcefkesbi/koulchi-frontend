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
                  order.status === 'confirmed' ? 'bg-primary-100 text-primary-800' :
                  order.status === 'shipped' ? 'bg-accent-100 text-accent-800' :
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useOrdersStore } from '../stores/orders'
import { useWishlistStore } from '../stores/wishlist'
import { getLocalizedPath } from '../lib/i18n-utils'

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
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04);
  padding: 1.5rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  font-weight: 500;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-primary);
}

.btn-outline {
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  background-color: transparent;
  font-weight: 500;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  background-color: var(--color-primary);
  color: white;
}

.btn-outline:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-primary);
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background-color: #f3f4f6;
  color: #374151;
  font-weight: 500;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-secondary:focus {
  outline: none;
  box-shadow: 0 0 0 2px #6b7280;
}
</style>
