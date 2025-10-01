<template>
  <div class="space-y-8">
   </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useOrdersStore } from '../../stores/orders'
import { useProductStore } from '../../stores/product'
import { useStoreStore } from '../../stores/store'
import { getLocalizedPath } from '../../lib/i18n-utils'

const { t: $t } = useI18n()
const route = useRoute()
const authStore = useAuthStore()
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
