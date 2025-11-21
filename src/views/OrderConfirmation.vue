<template>
  <div class="max-w-4xl mx-auto">
    <!-- Success Message -->
    <div class="text-center mb-8">
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-check text-green-600 text-3xl"></i>
      </div>
      <h1 class="text-3xl font-bold text-dark mb-2">{{ t('orderConfirmation.successTitle') }}</h1>
      <p class="text-gray-600 text-lg">
        {{ t('orderConfirmation.successMessage') }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-spinner fa-spin text-primary-600 text-2xl"></i>
      </div>
      <p class="text-gray-600">{{ t('orderConfirmation.loading') }}</p>
    </div>

    <!-- Order Details -->
    <div v-else-if="orders.length > 0" class="space-y-8">
      <!-- Orders List -->
      <div v-for="order in orders" :key="order?.id || Math.random()" class="card">
        <div v-if="order && order.id" class="flex justify-between items-start mb-6">
          <h2 class="text-xl font-bold text-dark">{{ t('orderConfirmation.orderDetails') }} #{{ order.id?.slice(0, 8) || 'N/A' }}</h2>
          <span v-if="order.status" class="badge" :class="getStatusBadgeClass(order.status)">
            {{ t(`orderStatus.${order.status}`) }}
          </span>
        </div>
        
        <div v-if="order" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Order Summary -->
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="text-gray-600">{{ t('orderConfirmation.orderNumber') }}:</span>
              <span class="font-semibold">#{{ order.id?.slice(0, 8) || 'N/A' }}</span>
            </div>
            
            <div v-if="order.created_at" class="flex justify-between">
              <span class="text-gray-600">{{ t('orderConfirmation.orderDate') }}:</span>
              <span class="font-semibold">{{ formatDate(order.created_at) }}</span>
            </div>
            
            <div v-if="order.status" class="flex justify-between">
              <span class="text-gray-600">{{ t('orderConfirmation.orderStatus') }}:</span>
              <span class="font-semibold">{{ t(`orderStatus.${order.status}`) }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">{{ t('orderConfirmation.paymentMethod') }}:</span>
              <span class="font-semibold text-green-600">
                <i class="fas fa-money-bill-wave ml-1"></i>
                {{ t('orderConfirmation.cod') }}
              </span>
            </div>
            
            <div v-if="order.total_amount" class="flex justify-between">
              <span class="text-gray-600">{{ t('orderConfirmation.total') }}:</span>
              <span class="text-xl font-bold text-primary">{{ formatPrice(order.total_amount) }} دج</span>
            </div>
          </div>

          <!-- Product Information -->
          <div class="space-y-4">
            <h3 class="font-semibold text-dark">{{ t('orderConfirmation.productInfo') }}</h3>
            <div v-if="order.order_items && order.order_items.length > 0" class="space-y-4">
              <div v-for="item in order.order_items" :key="item.id || item.product_id" class="flex items-center space-x-4 space-x-reverse">
                <img 
                  v-if="item.product"
                  :src="item.product.image_urls?.[0] || item.product.thumbnail_url || ''" 
                  :alt="item.product.name || 'Product'"
                  class="w-16 h-16 rounded-lg object-cover"
                />
                <div v-if="item.product">
                  <h4 class="font-semibold text-dark">{{ item.product.name }}</h4>
                  <p class="text-gray-600 text-sm">{{ t('orderConfirmation.quantity') }}: {{ item.quantity || 1 }}</p>
                  <p class="text-gray-600 text-sm">{{ t('orderConfirmation.price') }}: {{ formatPrice(item.price || item.product.price || 0) }} دج</p>
                </div>
              </div>
            </div>
            <div v-else class="text-gray-500 text-sm">{{ t('orderConfirmation.noItems') || 'No items found' }}</div>
          </div>
        </div>

        <!-- Seller Information -->
        <div v-if="order?.order_items?.[0]?.product?.seller" class="mt-6 pt-6 border-t">
          <h3 class="font-semibold text-dark mb-3">{{ t('orderConfirmation.sellerInfo') }}</h3>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="font-semibold">{{ order.order_items[0].product.seller.full_name || order.order_items[0].product.seller.username || 'N/A' }}</p>
            <p v-if="order.order_items[0].product.seller.phone_num" class="text-gray-600">{{ order.order_items[0].product.seller.phone_num }}</p>
            <p v-if="order.order_items[0].product.seller.email" class="text-gray-600">{{ order.order_items[0].product.seller.email }}</p>
          </div>
        </div>
      </div>

      <!-- Delivery Information -->
      <div class="card">
        <h2 class="text-xl font-bold text-dark mb-6">{{ t('orderConfirmation.deliveryInfo') }}</h2>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <!-- Show delivery address from first order's shipping_address -->
          <div v-if="orders.length > 0 && orders[0].shipping_address" class="space-y-2">
            <p class="font-semibold text-dark">{{ orders[0].shipping_address }}</p>
          </div>
          <!-- Fallback: Show from deliveryAddress if available -->
          <div v-else-if="deliveryAddress.street || deliveryAddress.wilaya_name" class="space-y-2">
            <p v-if="deliveryAddress.street" class="font-semibold">{{ deliveryAddress.street }}</p>
            <p v-if="deliveryAddress.commune_name" class="text-gray-600">{{ deliveryAddress.commune_name }}</p>
            <p v-if="deliveryAddress.wilaya_name" class="text-gray-600">{{ deliveryAddress.wilaya_name }}</p>
            <p v-if="deliveryAddress.postal_code" class="text-gray-600">
              {{ t('orderConfirmation.postalCode') }}: {{ deliveryAddress.postal_code }}
            </p>
            <p v-if="deliveryAddress.floor" class="text-gray-600">
              {{ deliveryAddress.floor }}
            </p>
          </div>
          <div v-else class="text-gray-500 text-sm">
            {{ t('orderConfirmation.addressNotAvailable') || 'Delivery address not available' }}
          </div>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="card bg-primary-50 border border-primary-200">
        <h2 class="text-xl font-bold text-primary-800 mb-4">{{ t('orderConfirmation.nextSteps') }}</h2>
        <ul class="text-primary-700 space-y-2">
          <li>• {{ t('orderConfirmation.step1') }}</li>
          <li>• {{ t('orderConfirmation.step2') }}</li>
          <li>• {{ t('orderConfirmation.step3') }}</li>
          <li>• {{ t('orderConfirmation.step4') }}</li>
        </ul>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
      </div>
      <h3 class="text-xl font-semibold text-red-700 mb-2">{{ t('orderConfirmation.errorTitle') }}</h3>
      <p class="text-red-600 mb-6">{{ error }}</p>
      <router-link :to="getLocalizedPath('/cart')" class="btn-primary">
        <i class="fas fa-arrow-left ml-2"></i>
        {{ t('orderConfirmation.backToCart') }}
      </router-link>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-4 justify-center mt-8">
      <router-link :to="getLocalizedPath('/products')" class="btn-outline">
        <i class="fas fa-shopping-bag ml-2"></i>
        {{ t('orderConfirmation.continueShopping') }}
      </router-link>
      <router-link :to="getLocalizedRoute('/mypurchases')" class="btn-primary">
        <i class="fas fa-chart-line ml-2"></i>
        {{ t('orderConfirmation.viewOrders') }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocaleRouter } from '../composables/useLocaleRouter'
import { useOrdersStore } from '../stores/useOrdersStore'
import { useCartStore } from '../stores/useCartStore'

const { t } = useI18n()
const route = useRoute()
const ordersStore = useOrdersStore()
const cartStore = useCartStore()
const { getLocalizedPath } = useLocaleRouter()

// Loading and error states
const loading = computed(() => ordersStore.loading)
const error = computed(() => ordersStore.error)

// Get localized route path
const getLocalizedRoute = (path) => {
  const currentLocale = route.meta.locale || 'en'
  return getLocalizedPath(path, currentLocale)
}

// Get order IDs from query parameters
const orderIds = computed(() => {
  const ids = route.query.orderIds
  return ids ? ids.split(',').map(id => id.trim()) : []
})

// Local orders state
const localOrders = ref([])

// Get orders data - computed from local state
const orders = computed(() => localOrders.value)

// Format date helper
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

// Get status badge class
const getStatusBadgeClass = (status) => {
  const statusClasses = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'confirmed': 'bg-primary-100 text-primary-800',
    'shipped': 'bg-accent-100 text-accent-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  }
  return statusClasses[status] || 'bg-gray-100 text-gray-800'
}

// Format price helper
const formatPrice = (price) => {
  return price.toLocaleString('ar-DZ')
}

// Get delivery address from cart store (fallback, usually empty after order)
const deliveryAddress = computed(() => cartStore.deliveryAddress || {})

// Get delivery address from orders (primary source)
const orderDeliveryAddress = computed(() => {
  if (orders.value.length > 0 && orders.value[0].shipping_address) {
    return orders.value[0].shipping_address
  }
  return null
})

onMounted(async () => {
  console.log('📄 [OrderConfirmation] Component mounted')
  console.log('📄 [OrderConfirmation] Route query:', route.query)
  console.log('📄 [OrderConfirmation] Order IDs from query:', orderIds.value)
  
  // Fetch orders if not already loaded
  if (orderIds.value.length > 0) {
    console.log('📄 [OrderConfirmation] Fetching orders by IDs...')
    
    // Fetch each order by ID
    const fetchedOrders = []
    for (const orderId of orderIds.value) {
      try {
        const order = await ordersStore.getOrderById(orderId)
        if (order) {
          fetchedOrders.push(order)
          console.log('✅ [OrderConfirmation] Fetched order:', orderId, {
            id: order.id,
            status: order.status,
            total_amount: order.total_amount,
            items_count: order.order_items?.length || 0
          })
        }
      } catch (err) {
        console.error('❌ [OrderConfirmation] Error fetching order:', orderId, err)
      }
    }
    
    // Update local orders state
    localOrders.value = fetchedOrders
    console.log('📄 [OrderConfirmation] Orders fetched and set:', fetchedOrders.length)
  }
  
  // Log final state
  console.log('📄 [OrderConfirmation] Final state:', {
    orderIds: orderIds.value,
    ordersCount: orders.value.length,
    orders: orders.value.map(o => ({ 
      id: o?.id, 
      status: o?.status, 
      total_amount: o?.total_amount,
      items_count: o?.order_items?.length || 0
    }))
  })
})
</script>

<style scoped>
.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-pending {
  background-color: #fef3c7;
  color: #92400e;
}

.badge-confirmed {
  background-color: #dbeafe;
  color: #1e40af;
}

.badge-shipped {
  background-color: #e9d5ff;
  color: #6b21a8;
}

.badge-delivered {
  background-color: #d1fae5;
  color: #065f46;
}

.badge-cancelled {
  background-color: #fee2e2;
  color: #991b1b;
}
</style> 