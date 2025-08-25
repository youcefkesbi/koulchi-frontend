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
      <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-spinner fa-spin text-blue-600 text-2xl"></i>
      </div>
      <p class="text-gray-600">{{ t('orderConfirmation.loading') }}</p>
    </div>

    <!-- Order Details -->
    <div v-else-if="orders.length > 0" class="space-y-8">
      <!-- Orders List -->
      <div v-for="order in orders" :key="order.id" class="card">
        <div class="flex justify-between items-start mb-6">
          <h2 class="text-xl font-bold text-dark">{{ t('orderConfirmation.orderDetails') }} #{{ order.id.slice(0, 8) }}</h2>
          <span class="badge" :class="getStatusBadgeClass(order.status)">
            {{ t(`orderStatus.${order.status}`) }}
          </span>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Order Summary -->
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="text-gray-600">{{ t('orderConfirmation.orderNumber') }}:</span>
              <span class="font-semibold">#{{ order.id.slice(0, 8) }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">{{ t('orderConfirmation.orderDate') }}:</span>
              <span class="font-semibold">{{ formatDate(order.created_at) }}</span>
            </div>
            
            <div class="flex justify-between">
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
            
            <div class="flex justify-between">
              <span class="text-gray-600">{{ t('orderConfirmation.total') }}:</span>
              <span class="text-xl font-bold text-primary">{{ formatPrice(order.total_price) }} دج</span>
            </div>
          </div>

          <!-- Product Information -->
          <div class="space-y-4">
            <h3 class="font-semibold text-dark">{{ t('orderConfirmation.productInfo') }}</h3>
            <div v-if="order.product" class="flex items-center space-x-4 space-x-reverse">
              <img 
                :src="order.product.image_urls?.[0] || order.product.image" 
                :alt="order.product.name"
                class="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h4 class="font-semibold text-dark">{{ order.product.name }}</h4>
                <p class="text-gray-600 text-sm">{{ t('orderConfirmation.quantity') }}: {{ order.quantity }}</p>
                <p class="text-gray-600 text-sm">{{ t('orderConfirmation.price') }}: {{ formatPrice(order.product.price) }} دج</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Seller Information -->
        <div v-if="order.seller" class="mt-6 pt-6 border-t">
          <h3 class="font-semibold text-dark mb-3">{{ t('orderConfirmation.sellerInfo') }}</h3>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="font-semibold">{{ order.seller.full_name || order.seller.username }}</p>
            <p v-if="order.seller.phone" class="text-gray-600">{{ order.seller.phone }}</p>
            <p v-if="order.seller.email" class="text-gray-600">{{ order.seller.email }}</p>
          </div>
        </div>
      </div>

      <!-- Delivery Information -->
      <div class="card">
        <h2 class="text-xl font-bold text-dark mb-6">{{ t('orderConfirmation.deliveryInfo') }}</h2>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="font-semibold">{{ deliveryAddress.street }}</p>
          <p class="text-gray-600">{{ deliveryAddress.commune }}</p>
          <p class="text-gray-600">{{ getWilayaName(deliveryAddress.wilaya) }}</p>
          <p v-if="deliveryAddress.postalCode" class="text-gray-600">
            {{ t('orderConfirmation.postalCode') }}: {{ deliveryAddress.postalCode }}
          </p>
          <p v-if="deliveryAddress.floor" class="text-gray-600">
            {{ deliveryAddress.floor }}
          </p>
          <p v-if="deliveryAddress.notes" class="text-gray-600 mt-2">
            <strong>{{ t('orderConfirmation.notes') }}:</strong> {{ deliveryAddress.notes }}
          </p>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="card bg-blue-50 border border-blue-200">
        <h2 class="text-xl font-bold text-blue-800 mb-4">{{ t('orderConfirmation.nextSteps') }}</h2>
        <ul class="text-blue-700 space-y-2">
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
      <router-link :to="getLocalizedRoute('/cart')" class="btn-primary">
        <i class="fas fa-arrow-left ml-2"></i>
        {{ t('orderConfirmation.backToCart') }}
      </router-link>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-4 justify-center mt-8">
      <router-link :to="getLocalizedRoute('/products')" class="btn-outline">
        <i class="fas fa-shopping-bag ml-2"></i>
        {{ t('orderConfirmation.continueShopping') }}
      </router-link>
      <router-link :to="getLocalizedRoute('/dashboard')" class="btn-primary">
        <i class="fas fa-chart-line ml-2"></i>
        {{ t('orderConfirmation.viewOrders') }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useOrdersStore } from '../stores/orders'
import { useCartStore } from '../stores/cart'
import { getLocalizedPath } from '../lib/i18n-utils'

const { t } = useI18n()
const route = useRoute()
const ordersStore = useOrdersStore()
const cartStore = useCartStore()

const orders = ref([])
const loading = ref(true)
const error = ref(null)
const deliveryAddress = ref({})

// Get localized route path
const getLocalizedRoute = (path) => {
  const currentLocale = route.meta.locale || 'en'
  return getLocalizedPath(path, currentLocale)
}

// Format price
const formatPrice = (price) => {
  return price.toLocaleString('ar-DZ')
}

// Format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get wilaya name
const getWilayaName = (wilayaId) => {
  const wilayas = {
    '16': 'الجزائر - Alger',
    '31': 'وهران - Oran',
    '21': 'سكيكدة - Skikda',
    '25': 'قسنطينة - Constantine',
    '19': 'سطيف - Sétif',
    '27': 'مستغانم - Mostaganem',
    '24': 'قالمة - Guelma',
    '23': 'عنابة - Annaba',
    '26': 'المدية - Médéa',
    '20': 'سعيدة - Saïda'
  }
  return wilayas[wilayaId] || wilayaId
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

// Load orders
const loadOrders = async () => {
  try {
    loading.value = true
    error.value = null
    
    const orderIds = route.query.orders?.split(',') || []
    
    if (orderIds.length === 0) {
      error.value = 'No order IDs provided'
      return
    }

    // Load each order
    const orderPromises = orderIds.map(id => ordersStore.getOrderById(id))
    const loadedOrders = await Promise.all(orderPromises)
    
    orders.value = loadedOrders.filter(order => order !== null)
    
    // Get delivery address from cart store
    deliveryAddress.value = cartStore.deliveryAddress || {}
    
  } catch (err) {
    error.value = err.message
    console.error('Error loading orders:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.badge {
  @apply px-3 py-1 rounded-full text-xs font-semibold;
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