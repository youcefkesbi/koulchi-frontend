<template>
  <div class="space-y-8">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
              <h1 class="text-3xl font-bold text-dark">{{ t('checkout.title') }}</h1>
        <router-link :to="getLocalizedRoute('/cart')" class="btn-outline">
          <i class="fas fa-arrow-left ml-2"></i>
          {{ t('checkout.backToCart') }}
        </router-link>
    </div>

    <div v-if="cartStore.hasItems" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Checkout Form -->
      <div class="space-y-6">
        <!-- Customer Information -->
        <div class="card">
          <h2 class="text-xl font-bold text-dark mb-4">{{ t('checkout.customerInfo') }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('checkout.firstName') }} *</label>
              <input
                v-model="customerInfo.firstName"
                type="text"
                class="input-field"
                :placeholder="t('checkout.firstName')"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('checkout.lastName') }} *</label>
              <input
                v-model="customerInfo.lastName"
                type="text"
                class="input-field"
                :placeholder="t('checkout.lastName')"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('checkout.phone') }} *</label>
              <input
                v-model="customerInfo.phone"
                type="tel"
                class="input-field"
                placeholder="+213 123 456 789"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('checkout.email') }}</label>
              <input
                v-model="customerInfo.email"
                type="email"
                class="input-field"
                placeholder="example@email.com"
              />
            </div>
          </div>
        </div>

        <!-- Delivery Address -->
        <div class="card">
                  <h2 class="text-xl font-bold text-dark mb-4">{{ t('checkout.deliveryAddress') }}</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('checkout.wilaya') }} *</label>
            <select v-model="deliveryAddress.wilaya" class="input-field" required>
              <option value="">{{ t('checkout.selectWilaya') }}</option>
              <option v-for="wilaya in algerianWilayas" :key="wilaya.id" :value="wilaya.id">
                {{ wilaya.nameAr }} - {{ wilaya.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('checkout.commune') }} *</label>
            <input
              v-model="deliveryAddress.commune"
              type="text"
              class="input-field"
              :placeholder="t('checkout.commune')"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('checkout.street') }} *</label>
            <input
              v-model="deliveryAddress.street"
              type="text"
              class="input-field"
              :placeholder="t('checkout.streetPlaceholder')"
              required
            />
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('checkout.postalCode') }}</label>
              <input
                v-model="deliveryAddress.postalCode"
                type="text"
                class="input-field"
                :placeholder="t('checkout.postalCode')"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('checkout.floor') }}</label>
              <input
                v-model="deliveryAddress.floor"
                type="text"
                class="input-field"
                :placeholder="t('checkout.floor')"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('checkout.notes') }}</label>
            <textarea
              v-model="deliveryAddress.notes"
              class="input-field"
              rows="3"
              :placeholder="t('checkout.notesPlaceholder')"
            ></textarea>
          </div>
        </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="space-y-6">
        <div class="card">
          <h2 class="text-xl font-bold text-dark mb-6">{{ t('checkout.orderSummary') }}</h2>
          
          <!-- Order Items -->
          <div class="space-y-4 mb-6">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="flex items-center space-x-4 space-x-reverse"
            >
              <img
                :src="item.image"
                :alt="item.name"
                class="w-16 h-16 rounded-lg object-cover"
              />
              <div class="flex-1">
                <h4 class="font-semibold text-dark">{{ item.name }}</h4>
                <p class="text-gray-600 text-sm">{{ t('checkout.quantity') }}: {{ item.quantity }}</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-dark">{{ formatPrice(item.price * item.quantity) }} دج</p>
                <p class="text-gray-500 text-sm">{{ formatPrice(item.price) }} {{ t('checkout.perPiece') }}</p>
              </div>
            </div>
          </div>

          <!-- Price Breakdown -->
          <div class="space-y-3 border-t pt-4">
            <div class="flex justify-between">
              <span class="text-gray-600">{{ t('checkout.subtotal') }}:</span>
              <span>{{ formatPrice(cartStore.subtotal) }} دج</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">{{ t('checkout.deliveryFee') }}:</span>
              <span>{{ formatPrice(cartStore.deliveryFee) }} دج</span>
            </div>
            <div class="border-t pt-3">
              <div class="flex justify-between text-lg font-bold">
                <span>{{ t('checkout.total') }}:</span>
                <span class="text-primary">{{ formatPrice(cartStore.total) }} دج</span>
              </div>
            </div>
          </div>

          <!-- COD Notice -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 mt-6">
            <div class="flex items-start space-x-3 space-x-reverse">
              <i class="fas fa-info-circle text-yellow-600 text-xl mt-1"></i>
              <div>
                <h4 class="font-semibold text-yellow-800 mb-1">{{ t('checkout.importantInfo') }}</h4>
                <ul class="text-yellow-700 text-sm space-y-1">
                  <li>• {{ t('checkout.confirmationCall') }}</li>
                  <li>• {{ t('checkout.deliveryTime') }}</li>
                  <li>• {{ t('checkout.payOnDelivery', { amount: formatPrice(cartStore.total), currency: 'دج' }) }}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Place Order Button -->
          <button
            @click="placeOrder"
            :disabled="!isFormValid || ordersStore.loading"
            class="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i v-if="ordersStore.loading" class="fas fa-spinner fa-spin ml-2"></i>
            <i v-else class="fas fa-check ml-2"></i>
            {{ ordersStore.loading ? t('checkout.processing') : t('checkout.confirmOrder') }}
          </button>

          <!-- Error Message -->
          <div v-if="ordersStore.error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-700 text-sm">{{ ordersStore.error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty Cart Redirect -->
    <div v-else class="text-center py-12">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-shopping-cart text-gray-400 text-3xl"></i>
      </div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">{{ t('checkout.emptyCart') }}</h3>
      <p class="text-gray-500 mb-6">
        {{ t('checkout.cannotCheckout') }}
      </p>
      <router-link :to="getLocalizedRoute('/products')" class="btn-primary">
        <i class="fas fa-shopping-bag ml-2"></i>
        {{ t('checkout.startShopping') }}
      </router-link>
    </div>
  </div>

  <!-- Login Modal for non-authenticated users -->
  <LoginModal :isOpen="showLoginModal" @close="showLoginModal = false" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getLocalizedPath } from '../lib/i18n-utils'
import { useCartStore } from '../stores/useCartStore'
import { useOrdersStore } from '../stores/useOrdersStore'
import { useAuthStore } from '../stores/useAuthStore'
import LoginModal from '../components/LoginModal.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const ordersStore = useOrdersStore()
const authStore = useAuthStore()

const showLoginModal = ref(false)

const customerInfo = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'Algeria'
})

const deliveryAddress = ref({
  wilaya: '',
  commune: '',
  street: '',
  postalCode: '',
  additionalInfo: ''
})

const paymentMethod = ref('cod')
const termsAccepted = ref(false)
const loading = ref(false)
const error = ref('')

// Algerian wilayas data
const algerianWilayas = ref([
  { id: '16', name: 'Alger', nameAr: 'الجزائر' },
  { id: '31', name: 'Oran', nameAr: 'وهران' },
  { id: '21', name: 'Constantine', nameAr: 'قسنطينة' },
  { id: '48', name: 'Annaba', nameAr: 'عنابة' },
  { id: '19', name: 'Setif', nameAr: 'سطيف' },
  { id: '46', name: 'Batna', nameAr: 'باتنة' },
  { id: '25', name: 'Blida', nameAr: 'البليدة' },
  { id: '15', name: 'Tizi Ouzou', nameAr: 'تيزي وزو' },
  { id: '35', name: 'Boumerdes', nameAr: 'بومرداس' },
  { id: '27', name: 'Mostaganem', nameAr: 'مستغانم' }
])

// Form validation
const isFormValid = computed(() => {
  return customerInfo.value.firstName && 
         customerInfo.value.lastName && 
         customerInfo.value.phone && 
         deliveryAddress.value.wilaya && 
         deliveryAddress.value.commune && 
         deliveryAddress.value.street &&
         termsAccepted.value
})

// Format price helper
const formatPrice = (price) => {
  return price.toLocaleString('ar-DZ')
}

// Get localized route path
const getLocalizedRoute = (path) => {
  const currentLocale = route.meta.locale || 'en'
  return getLocalizedPath(path, currentLocale)
}

const placeOrder = async () => {
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    showLoginModal.value = true
    return
  }

  if (!termsAccepted.value) {
    error.value = t('checkout.termsRequired')
    return
  }

  if (!customerInfo.value.firstName || !customerInfo.value.lastName || !customerInfo.value.email || !customerInfo.value.phone || !deliveryAddress.value.wilaya || !deliveryAddress.value.commune || !deliveryAddress.value.street) {
    error.value = t('checkout.fillAllFields')
    return
  }

  loading.value = true
  error.value = ''

  try {
    const orderIds = []
    
    // Create a single order with all items
    const orderData = {
      total_amount: cartStore.total,
      shipping_address: `${deliveryAddress.value.street}, ${deliveryAddress.value.commune}, ${deliveryAddress.value.wilaya}, Algeria`,
      notes: `Order placed on ${new Date().toLocaleDateString()}`,
      items: cartStore.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        variant: null
      }))
    }
    
    const order = await ordersStore.createOrder(orderData)
    if (order) {
      orderIds.push(order.id)
    }
    
    if (orderIds.length > 0) {
      // Clear the cart
      cartStore.clearCart()
      
      // Navigate to order confirmation
      router.push({
        path: getLocalizedRoute('/order-confirmation'),
        query: { orderIds: orderIds.join(',') }
      })
    } else {
      error.value = t('checkout.orderError')
    }
  } catch (err) {
    console.error('Error placing order:', err)
    error.value = t('checkout.orderError')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Pre-fill email if available from cart
  if (cartStore.customerInfo?.email) {
    customerInfo.value.email = cartStore.customerInfo.email
  }
})
</script> 