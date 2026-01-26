<template>
  <div class="space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-6 lg:px-8">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
      <h1 class="text-2xl sm:text-3xl font-bold text-dark">{{ t('checkout.title') }}</h1>
      <router-link :to="getLocalizedPath('/cart')" class="btn-outline text-sm sm:text-base w-full sm:w-auto text-center sm:text-left">
        <i class="fas fa-arrow-left ml-2"></i>
        {{ t('checkout.backToCart') }}
      </router-link>
    </div>

    <div v-if="cartStore.hasItems" class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
      <!-- Checkout Form -->
      <div class="space-y-6">
        <!-- Customer Information -->
        <div class="card checkout-form-card">
          <h2 class="text-lg sm:text-xl font-bold text-dark mb-3 sm:mb-4">{{ t('checkout.customerInfo') }}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('checkout.fullName') || 'Full Name' }} *</label>
              <input
                v-model="customerInfo.fullName"
                type="text"
                class="input-field checkout-input"
                :placeholder="t('checkout.fullName') || 'Full Name'"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('checkout.phone') }} *</label>
              <input
                v-model="customerInfo.phone"
                type="tel"
                class="input-field checkout-input"
                placeholder="+213 123 456 789"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('checkout.email') }}</label>
              <input
                v-model="customerInfo.email"
                type="email"
                class="input-field checkout-input"
                placeholder="example@email.com"
              />
            </div>
          </div>
        </div>

        <!-- Delivery Address -->
        <div class="card checkout-form-card">
          <h2 class="text-lg sm:text-xl font-bold text-dark mb-3 sm:mb-4">{{ t('checkout.deliveryAddress') }}</h2>
          <div class="space-y-3 sm:space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('checkout.wilaya') }} *</label>
            <select 
              v-model="deliveryAddress.wilaya_id" 
              @change="onWilayaChange"
              :disabled="loadingWilayas"
              class="input-field checkout-input" 
              required
            >
              <option value="">{{ t('checkout.selectWilaya') }}</option>
              <option
                v-for="wilaya in wilayas"
                :key="wilaya.id || wilaya.display_id"
                :value="wilaya.id || wilaya.display_id"
              >
                {{ getLocalizedName(wilaya) }}
              </option>
            </select>
            <p v-if="loadingWilayas" class="text-sm text-gray-500 mt-1">
              {{ t('common.loading') }}...
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('checkout.commune') }} *</label>
            <select
              v-model="deliveryAddress.commune_id"
              :disabled="!deliveryAddress.wilaya_id || loadingCommunes"
              class="input-field checkout-input"
              required
            >
              <option value="">{{ t('checkout.selectCommune') }}</option>
              <option
                v-for="commune in communes"
                :key="commune.id || commune.display_id"
                :value="commune.id || commune.display_id"
              >
                {{ getLocalizedName(commune) }}
              </option>
            </select>
            <p v-if="loadingCommunes" class="text-sm text-gray-500 mt-1">
              {{ t('common.loading') }}...
            </p>
            <p v-else-if="!deliveryAddress.wilaya_id" class="text-sm text-gray-500 mt-1">
              {{ t('checkout.selectWilayaFirst') }}
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('checkout.street') }} *</label>
              <input
                v-model="deliveryAddress.street"
                type="text"
                class="input-field checkout-input"
                :placeholder="t('checkout.streetPlaceholder')"
                required
              />
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('checkout.postalCode') }}</label>
              <input
                v-model="deliveryAddress.postal_code"
                type="text"
                class="input-field checkout-input"
                :placeholder="t('checkout.postalCode')"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('checkout.floor') }}</label>
              <input
                v-model="deliveryAddress.floor"
                type="text"
                class="input-field checkout-input"
                :placeholder="t('checkout.floor')"
              />
            </div>
          </div>
          
          <!-- Delivery Method Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('checkout.deliveryMethod') || 'Delivery Method' }} *</label>
            <div class="space-y-2">
              <label 
                v-for="option in deliveryOptions" 
                :key="option.type"
                class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                :class="deliveryMethod === option.type ? 'border-primary bg-primary/5' : 'border-gray-300'"
              >
                <input
                  type="radio"
                  :value="option.type"
                  v-model="deliveryMethod"
                  @change="onDeliveryMethodChange"
                  class="mr-3"
                />
                <div class="flex-1">
                  <div class="font-medium">{{ option.name }}</div>
                  <div class="text-sm text-gray-600">{{ formatPrice(option.price) }} دج</div>
                </div>
              </label>
            </div>
            <p v-if="loadingDeliveryOptions" class="text-sm text-gray-500 mt-1">
              {{ t('common.loading') }}...
            </p>
            <p v-else-if="!deliveryAddress.commune_id" class="text-sm text-gray-500 mt-1">
              {{ t('checkout.selectCommuneFirst') || 'Please select a commune first' }}
            </p>
          </div>

          <!-- Pickup Point / Stop-Desk Selection (for stopdesk and pickup delivery) -->
          <div v-if="(deliveryMethod === 'stopdesk' || deliveryMethod === 'pickup') && filteredPickupPoints.length > 0">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ deliveryMethod === 'stopdesk' ? (t('checkout.stopDesk') || 'Stop-Desk') : (t('checkout.pickupPoint') || 'Pickup Point') }} *
            </label>
            <select
              v-model="selectedPickupPoint"
              class="input-field checkout-input"
              required
            >
              <option value="">
                {{ deliveryMethod === 'stopdesk' 
                  ? (t('checkout.selectStopDesk') || 'Select stop-desk') 
                  : (t('checkout.selectPickupPoint') || 'Select pickup point') }}
              </option>
              <option
                v-for="point in filteredPickupPoints"
                :key="point.pickup_point !== null && point.pickup_point !== undefined ? point.pickup_point : `stopdesk-${point.commune}-${point.delivery_type}`"
                :value="point.pickup_point !== null && point.pickup_point !== undefined ? point.pickup_point : `stopdesk-${point.commune}`"
              >
                {{ getLocalizedName(point) }}
              </option>
            </select>
            <p v-if="loadingPickupPoints" class="text-sm text-gray-500 mt-1">
              {{ t('common.loading') }}...
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('checkout.notes') }}</label>
            <textarea
              v-model="deliveryAddress.additionalInfo"
              class="input-field checkout-input"
              rows="3"
              :placeholder="t('checkout.notesPlaceholder')"
            ></textarea>
          </div>
        </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="space-y-4 sm:space-y-6">
        <div class="card checkout-order-summary sticky top-4">
          <h2 class="text-lg sm:text-xl font-bold text-dark mb-4 sm:mb-6">{{ t('checkout.orderSummary') }}</h2>
          
          <!-- Order Items -->
          <div class="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="flex items-center gap-3 sm:gap-4 space-x-0 space-x-reverse"
            >
              <img
                :src="item.image"
                :alt="item.name"
                class="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-dark text-sm sm:text-base truncate">{{ item.name }}</h4>
                <p class="text-gray-600 text-xs sm:text-sm">{{ t('checkout.quantity') }}: {{ item.quantity }}</p>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="font-semibold text-dark text-sm sm:text-base">{{ formatPrice(item.price * item.quantity) }} دج</p>
                <p class="text-gray-500 text-xs sm:text-sm">{{ formatPrice(item.price) }} {{ t('checkout.perPiece') }}</p>
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
            class="btn-primary checkout-confirm-btn w-full text-base sm:text-lg py-3 sm:py-4 disabled:opacity-50"
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
      <router-link :to="getLocalizedPath('/products')" class="btn-primary">
        <i class="fas fa-shopping-bag ml-2"></i>
        {{ t('checkout.startShopping') }}
      </router-link>
    </div>
  </div>

  <!-- Login Modal for non-authenticated users -->
  <LoginModal :isOpen="showLoginModal" @close="showLoginModal = false" />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocaleRouter } from '../composables/useLocaleRouter'
import { useCartStore } from '../stores/useCartStore'
import { useOrdersStore } from '../stores/useOrdersStore'
import { useAuthStore } from '../stores/useAuthStore'
import { supabase } from '../lib/supabase'
import LoginModal from '../components/LoginModal.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const ordersStore = useOrdersStore()
const authStore = useAuthStore()
const { navigateToPath, getLocalizedPath } = useLocaleRouter()

const showLoginModal = ref(false)

const customerInfo = ref({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'Algeria'
})

const deliveryAddress = ref({
  wilaya_id: '',
  wilaya_name: '',
  commune_id: '',
  commune_name: '',
  street: '',
  postal_code: '',
  floor: '',
  additionalInfo: ''
})

const paymentMethod = ref('cod')
const termsAccepted = ref(false)
const loading = ref(false)
const error = ref('')

// Maystro data
const wilayas = ref([])
const communes = ref([])
const loadingWilayas = ref(false)
const loadingCommunes = ref(false)
const loadingProfile = ref(false)

// Delivery options and pricing
const deliveryOptions = ref([])
const deliveryMethod = ref('home') // 'home', 'stopdesk', 'pickup'
const selectedPickupPoint = ref(null)
const pickupPoints = ref([])
const loadingDeliveryOptions = ref(false)
const loadingPickupPoints = ref(false)

// Filtered pickup points based on delivery method
const filteredPickupPoints = computed(() => {
  if (!deliveryMethod.value || !pickupPoints.value.length) {
    return []
  }
  
  // For stopdesk (delivery_type: 2), show points where pickup_point is null
  if (deliveryMethod.value === 'stopdesk') {
    return pickupPoints.value.filter(p => p.delivery_type === 2 && (p.pickup_point === null || p.pickup_point === undefined))
  }
  
  // For pickup (delivery_type: 3), show points where pickup_point is not null
  if (deliveryMethod.value === 'pickup') {
    return pickupPoints.value.filter(p => p.delivery_type === 3 && p.pickup_point !== null && p.pickup_point !== undefined)
  }
  
  return []
})

// Get current locale
const currentLocale = computed(() => route.meta?.locale || 'en')

// Helper function to get localized name for wilaya/commune
const getLocalizedName = (item) => {
  if (!item) return ''
  const locale = currentLocale.value
  if (locale === 'ar') {
    return item.name_ar || item.name_lt || item.name || ''
  } else {
    // For English or French, use name_lt
    return item.name_lt || item.name || ''
  }
}

// Form validation
const isFormValid = computed(() => {
  // Basic required fields - check for non-empty strings
  const hasCustomerInfo = customerInfo.value.fullName?.trim() && 
         customerInfo.value.phone?.trim()
  
  // Delivery address is filled - check for non-empty values (handle both strings and numbers)
  const wilayaId = deliveryAddress.value.wilaya_id
  const communeId = deliveryAddress.value.commune_id
  const street = deliveryAddress.value.street?.trim()
  
  const hasDeliveryAddress = (wilayaId !== null && wilayaId !== undefined && wilayaId !== '' && wilayaId !== 0) &&
         (communeId !== null && communeId !== undefined && communeId !== '' && communeId !== 0) &&
         street
  
  // Delivery method is selected
  const hasDeliveryMethod = deliveryMethod.value && deliveryMethod.value !== ''
  
  // If basic requirements are not met, return false
  if (!hasCustomerInfo || !hasDeliveryAddress || !hasDeliveryMethod) {
    return false
  }
  
  // If stopdesk or pickup method is selected, check pickup point
  if (deliveryMethod.value === 'stopdesk' || deliveryMethod.value === 'pickup') {
    // Only require pickup point if pickup points are available and the field is shown
    if (filteredPickupPoints.value.length > 0) {
      // Check if pickup point is selected - must have a value
      const hasPickupPoint = selectedPickupPoint.value !== null && 
                            selectedPickupPoint.value !== '' && 
                            selectedPickupPoint.value !== undefined
      return hasPickupPoint
    }
    // If no pickup points available, allow order without pickup point
    return true
  }
  
  // For home delivery, all requirements are met
  return true
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

  // Terms check removed - not required for order creation

  if (!customerInfo.value.fullName || !customerInfo.value.phone || !deliveryAddress.value.wilaya_id || !deliveryAddress.value.commune_id || !deliveryAddress.value.street || !deliveryMethod.value) {
    error.value = t('checkout.fillAllFields')
    return
  }
  
  // Validate pickup point/stop-desk if stopdesk or pickup method is selected
  if ((deliveryMethod.value === 'stopdesk' || deliveryMethod.value === 'pickup') && !selectedPickupPoint.value) {
    const errorMsg = deliveryMethod.value === 'stopdesk' 
      ? (t('checkout.selectStopDesk') || 'Please select a stop-desk')
      : (t('checkout.selectPickupPoint') || 'Please select a pickup point')
    error.value = errorMsg
    return
  }

  loading.value = true
  error.value = ''

  console.log('🛒 [Checkout] Starting order placement process...')
  console.log('🛒 [Checkout] Cart items:', cartStore.items)
  console.log('🛒 [Checkout] Cart total:', cartStore.total)

  try {
    const orderIds = []
    
    // Create a single order with all items
    const orderData = {
      total_amount: cartStore.total,
      shipping_address: `${deliveryAddress.value.street}, ${deliveryAddress.value.commune_name || deliveryAddress.value.commune_id}, ${deliveryAddress.value.wilaya_name || deliveryAddress.value.wilaya_id}, Algeria`,
      notes: `Order placed on ${new Date().toLocaleDateString()}`,
      items: cartStore.items.map(item => ({
        id: item.product_id, // Use product_id, not cart_item.id
        quantity: item.quantity,
        price: item.price,
        variant: null
      }))
    }
    
    console.log('🛒 [Checkout] Order data prepared:', {
      total_amount: orderData.total_amount,
      shipping_address: orderData.shipping_address,
      items_count: orderData.items.length,
      items: orderData.items
    })
    
    console.log('🛒 [Checkout] Calling ordersStore.createOrder...')
    const order = await ordersStore.createOrder(orderData)
    
    if (order) {
      console.log('✅ [Checkout] Order created successfully!', {
        order_id: order.id,
        order_status: order.status,
        total_amount: order.total_amount,
        order_items_count: order.order_items?.length || 0
      })
      orderIds.push(order.id)
    } else {
      console.error('❌ [Checkout] Order creation returned null/undefined')
    }
    
    if (orderIds.length > 0) {
      console.log('✅ [Checkout] Order confirmed! Order IDs:', orderIds)
      
      // Save/update user's address after successful order creation
      // This is done gracefully - order is still created even if profile update fails
      if (authStore.isAuthenticated) {
        try {
          console.log('📝 [Checkout] Updating user profile with shipping address...')
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          
          if (!userError && user) {
            // Prepare shipping address data from checkout form
            const shippingAddressData = {
              wilaya_id: parseInt(deliveryAddress.value.wilaya_id),
              wilaya_name: deliveryAddress.value.wilaya_name || '',
              commune_id: parseInt(deliveryAddress.value.commune_id),
              commune_name: deliveryAddress.value.commune_name || '',
              street: deliveryAddress.value.street.trim(),
              postal_code: deliveryAddress.value.postal_code?.trim() || null,
              floor: deliveryAddress.value.floor?.trim() || null
            }
            
            // Update profile with shipping address
            const { error: profileUpdateError } = await supabase
              .from('profiles')
              .update({ shipping_address: shippingAddressData })
              .eq('id', user.id)
            
            if (profileUpdateError) {
              // Log error but don't fail the order - address update is optional
              console.warn('⚠️ [Checkout] Failed to update profile with shipping address:', profileUpdateError)
            } else {
              console.log('✅ [Checkout] Profile updated with shipping address successfully')
            }
          }
        } catch (profileError) {
          // Log error but don't fail the order - address update is optional
          console.warn('⚠️ [Checkout] Error updating profile with shipping address:', profileError)
        }
      }
      
      // Clear the cart
      console.log('🛒 [Checkout] Clearing cart...')
      try {
        await cartStore.clearCart()
        console.log('✅ [Checkout] Cart cleared successfully')
      } catch (clearError) {
        // Log error but don't block redirect - cart clearing is not critical
        console.warn('⚠️ [Checkout] Failed to clear cart (non-critical):', clearError)
        // Still clear local state for UI
        cartStore.items = []
      }
      
      // Navigate to order confirmation
      const confirmationPath = getLocalizedRoute('/order-confirmation')
      const confirmationQuery = { orderIds: orderIds.join(',') }
      
      console.log('🔄 [Checkout] Redirecting to order confirmation page...', {
        path: confirmationPath,
        query: confirmationQuery
      })
      
      router.push({
        path: confirmationPath,
        query: confirmationQuery
      })
      
      console.log('✅ [Checkout] Redirect initiated successfully')
    } else {
      console.error('❌ [Checkout] No order IDs available, cannot proceed to confirmation')
      error.value = t('checkout.orderError')
    }
  } catch (err) {
    console.error('❌ [Checkout] Error placing order:', err)
    console.error('❌ [Checkout] Error details:', {
      message: err.message,
      stack: err.stack,
      error: err
    })
    error.value = t('checkout.orderError')
  } finally {
    loading.value = false
    console.log('🛒 [Checkout] Order placement process completed')
  }
}

// Fetch user profile and pre-fill form
const fetchProfile = async () => {
  if (!authStore.isAuthenticated) {
    // Still fetch wilayas for non-authenticated users
    await fetchWilayas()
    return
  }

  try {
    loadingProfile.value = true
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      await fetchWilayas()
      return
    }

    // Fetch profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, phone_num, shipping_address')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      await fetchWilayas()
      return
    }

    // Pre-fill customer info from profile
    if (profile.full_name) {
      customerInfo.value.fullName = profile.full_name
    }
    if (profile.phone_num) {
      customerInfo.value.phone = profile.phone_num
    }
    if (user.email) {
      customerInfo.value.email = user.email
    }

    // Pre-fill address from shipping_address
    if (profile.shipping_address) {
      try {
        const address = typeof profile.shipping_address === 'string' 
          ? JSON.parse(profile.shipping_address)
          : profile.shipping_address
        
        if (address.wilaya_id) {
          deliveryAddress.value.wilaya_id = address.wilaya_id.toString()
          deliveryAddress.value.wilaya_name = address.wilaya_name || ''
        }
        if (address.commune_id) {
          deliveryAddress.value.commune_id = address.commune_id.toString()
          deliveryAddress.value.commune_name = address.commune_name || ''
        }
        if (address.street) {
          deliveryAddress.value.street = address.street
        }
        if (address.postal_code) {
          deliveryAddress.value.postal_code = address.postal_code
        }
        if (address.floor) {
          deliveryAddress.value.floor = address.floor
        }

        // Fetch wilayas first, then communes if wilaya_id exists
        await fetchWilayas()
        if (deliveryAddress.value.wilaya_id) {
          // Preserve commune selection when pre-filling from saved address
          await fetchCommunes(deliveryAddress.value.wilaya_id, true)
        }
      } catch (e) {
        console.error('Error parsing shipping address:', e)
        await fetchWilayas()
      }
    } else {
      await fetchWilayas()
    }
  } catch (error) {
    console.error('Error in fetchProfile:', error)
    await fetchWilayas()
  } finally {
    loadingProfile.value = false
  }
}

// Fetch wilayas from Maystro via backend
const fetchWilayas = async () => {
  try {
    loadingWilayas.value = true
    error.value = null
    
    // Get current locale for language parameter
    const locale = currentLocale.value
    // Map locale to Maystro language codes: 'ar', 'en', 'fr'
    const language = locale === 'ar' ? 'ar' : locale === 'fr' ? 'fr' : 'en'
    
    // Get store ID if user is authenticated and has a store
    let storeId = null
    if (authStore.isAuthenticated) {
      try {
        const { data: store } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', authStore.user?.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        
        if (store) {
          storeId = store.id
        }
      } catch (e) {
        console.log('Could not get store ID, will try without it')
      }
    }
    
    // Call backend endpoint
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    
    // If no token, we can't fetch (but this is OK for checkout - user can still see form)
    if (!token && authStore.isAuthenticated) {
      console.warn('No auth token available for fetching wilayas')
      wilayas.value = []
      return
    }
    
    const url = new URL(`${apiUrl}/api/maystro/wilayas`)
    url.searchParams.append('language', language)
    if (storeId) {
      url.searchParams.append('storeId', storeId)
    }
    
    const headers = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: headers
    })
    
    if (!response.ok) {
      // If unauthorized or store not connected, that's OK for checkout
      // Users can still fill the form manually
      if (response.status === 401 || response.status === 400) {
        console.log('Cannot fetch wilayas from backend (auth/store issue), continuing without them')
        wilayas.value = []
        return
      }
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch wilayas')
    }
    
    const result = await response.json()
    wilayas.value = result.data || []
  } catch (err) {
    console.error('Error fetching wilayas:', err)
    wilayas.value = []
  } finally {
    loadingWilayas.value = false
  }
}

// Fetch communes when wilaya is selected via backend
const onWilayaChange = async () => {
  if (!deliveryAddress.value.wilaya_id) {
    communes.value = []
    deliveryAddress.value.commune_id = ''
    deliveryAddress.value.commune_name = ''
    return
  }

  // Update wilaya name
  const selectedWilaya = wilayas.value.find(w => (w.id || w.display_id) === parseInt(deliveryAddress.value.wilaya_id))
  if (selectedWilaya) {
    deliveryAddress.value.wilaya_name = getLocalizedName(selectedWilaya)
  }

  await fetchCommunes(deliveryAddress.value.wilaya_id, false)
}

// Fetch communes for a specific wilaya via backend
const fetchCommunes = async (wilayaId, preserveCommune = false) => {
  try {
    loadingCommunes.value = true
    error.value = null
    
    // Find the selected wilaya to get the correct ID field
    const selectedWilaya = wilayas.value.find(w => (w.id || w.display_id) === parseInt(wilayaId))
    
    // Use the actual ID from the wilaya object (prefer id over display_id for API calls)
    const wilayaIdForApi = selectedWilaya?.id || selectedWilaya?.display_id || wilayaId

    // Get current locale for language parameter
    const locale = currentLocale.value
    // Map locale to Maystro language codes: 'ar', 'en', 'fr'
    const language = locale === 'ar' ? 'ar' : locale === 'fr' ? 'fr' : 'en'
    
    // Get store ID if user is authenticated and has a store
    let storeId = null
    if (authStore.isAuthenticated) {
      try {
        const { data: store } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', authStore.user?.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        
        if (store) {
          storeId = store.id
        }
      } catch (e) {
        console.log('Could not get store ID, will try without it')
      }
    }
    
    // Call backend endpoint
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    
    // If no token, we can't fetch (but this is OK for checkout - user can still see form)
    if (!token && authStore.isAuthenticated) {
      console.warn('No auth token available for fetching communes')
      communes.value = []
      return
    }
    
    const url = new URL(`${apiUrl}/api/maystro/communes`)
    url.searchParams.append('wilayaId', wilayaIdForApi.toString())
    url.searchParams.append('language', language)
    if (storeId) {
      url.searchParams.append('storeId', storeId)
    }
    
    const headers = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: headers
    })
    
    if (!response.ok) {
      // If unauthorized or store not connected, that's OK for checkout
      // Users can still fill the form manually
      if (response.status === 401 || response.status === 400) {
        console.log('Cannot fetch communes from backend (auth/store issue), continuing without them')
        communes.value = []
        return
      }
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch communes')
    }
    
    const result = await response.json()
    communes.value = result.data || []
    
    // Only reset commune selection if not preserving (i.e., user changed wilaya)
    if (!preserveCommune) {
      deliveryAddress.value.commune_id = ''
      deliveryAddress.value.commune_name = ''
    }
  } catch (err) {
    console.error('Error fetching communes:', err)
    communes.value = []
  } finally {
    loadingCommunes.value = false
  }
}

// Fetch delivery options from backend
const fetchDeliveryOptions = async () => {
  if (!deliveryAddress.value.commune_id) {
    deliveryOptions.value = []
    return
  }

  try {
    loadingDeliveryOptions.value = true
    
    let storeId = null
    if (authStore.isAuthenticated) {
      try {
        const { data: store } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', authStore.user?.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        
        if (store) {
          storeId = store.id
        }
      } catch (e) {
        console.log('Could not get store ID')
      }
    }
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    
    if (!token && authStore.isAuthenticated) {
      console.warn('No auth token available')
      return
    }
    
    const selectedCommune = communes.value.find(c => (c.id || c.display_id) === parseInt(deliveryAddress.value.commune_id))
    const communeIdForApi = selectedCommune?.id || selectedCommune?.display_id || deliveryAddress.value.commune_id
    
    const url = new URL(`${apiUrl}/api/maystro/delivery-options`)
    url.searchParams.append('communeId', communeIdForApi.toString())
    if (storeId) {
      url.searchParams.append('storeId', storeId)
    }
    
    const headers = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: headers
    })
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 400) {
        console.log('Cannot fetch delivery options')
        deliveryOptions.value = []
        return
      }
      throw new Error('Failed to fetch delivery options')
    }
    
    const result = await response.json()
    deliveryOptions.value = result.data || []
    
    // Set default delivery method to first available option
    if (deliveryOptions.value.length > 0 && !deliveryOptions.value.find(o => o.type === deliveryMethod.value)) {
      deliveryMethod.value = deliveryOptions.value[0].type
    }
    
    // Update delivery fee
    await updateDeliveryFee()
  } catch (err) {
    console.error('Error fetching delivery options:', err)
    deliveryOptions.value = []
  } finally {
    loadingDeliveryOptions.value = false
  }
}

// Fetch pickup points from backend
const fetchPickupPoints = async () => {
  if (!deliveryAddress.value.commune_id) {
    pickupPoints.value = []
    return
  }

  try {
    loadingPickupPoints.value = true
    
    let storeId = null
    if (authStore.isAuthenticated) {
      try {
        const { data: store } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', authStore.user?.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        
        if (store) {
          storeId = store.id
        }
      } catch (e) {
        console.log('Could not get store ID')
      }
    }
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    
    if (!token && authStore.isAuthenticated) {
      return
    }
    
    const selectedCommune = communes.value.find(c => (c.id || c.display_id) === parseInt(deliveryAddress.value.commune_id))
    const communeIdForApi = selectedCommune?.id || selectedCommune?.display_id || deliveryAddress.value.commune_id
    
    const url = new URL(`${apiUrl}/api/maystro/pickup-points`)
    url.searchParams.append('communeId', communeIdForApi.toString())
    if (storeId) {
      url.searchParams.append('storeId', storeId)
    }
    
    const headers = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: headers
    })
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 400) {
        pickupPoints.value = []
        return
      }
      throw new Error('Failed to fetch pickup points')
    }
    
    const result = await response.json()
    // Filter only active pickup points
    pickupPoints.value = (result.data || []).filter(p => p.active)
  } catch (err) {
    console.error('Error fetching pickup points:', err)
    pickupPoints.value = []
  } finally {
    loadingPickupPoints.value = false
  }
}

// Update delivery fee based on selected method
const updateDeliveryFee = async () => {
  if (!deliveryAddress.value.commune_id || !deliveryMethod.value) {
    cartStore.setDeliveryFee(0)
    return
  }

  try {
    // Find the selected option in deliveryOptions
    const selectedOption = deliveryOptions.value.find(o => o.type === deliveryMethod.value)
    if (selectedOption) {
      cartStore.setDeliveryFee(selectedOption.price || 0)
      return
    }
    
    // If not found in options, fetch price directly
    let storeId = null
    if (authStore.isAuthenticated) {
      try {
        const { data: store } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', authStore.user?.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        
        if (store) {
          storeId = store.id
        }
      } catch (e) {
        console.log('Could not get store ID')
      }
    }
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    
    if (!token && authStore.isAuthenticated) {
      return
    }
    
    const selectedCommune = communes.value.find(c => (c.id || c.display_id) === parseInt(deliveryAddress.value.commune_id))
    const communeIdForApi = selectedCommune?.id || selectedCommune?.display_id || deliveryAddress.value.commune_id
    
    // Map delivery method to delivery type
    const deliveryTypeMap = {
      'home': 1,
      'stopdesk': 2,
      'pickup': 3
    }
    const deliveryType = deliveryTypeMap[deliveryMethod.value] || 1
    
    const url = new URL(`${apiUrl}/api/maystro/delivery-prices`)
    url.searchParams.append('communeId', communeIdForApi.toString())
    url.searchParams.append('deliveryType', deliveryType.toString())
    if (storeId) {
      url.searchParams.append('storeId', storeId)
    }
    
    const headers = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: headers
    })
    
    if (!response.ok) {
      cartStore.setDeliveryFee(0)
      return
    }
    
    const result = await response.json()
    if (result.data && result.data.delivery_price) {
      cartStore.setDeliveryFee(result.data.delivery_price)
    } else {
      cartStore.setDeliveryFee(0)
    }
  } catch (err) {
    console.error('Error updating delivery fee:', err)
    cartStore.setDeliveryFee(0)
  }
}

// Handle delivery method change
const onDeliveryMethodChange = async () => {
  // Reset pickup point selection when method changes
  selectedPickupPoint.value = null
  
  // If switching to stopdesk or pickup, ensure pickup points are loaded
  if ((deliveryMethod.value === 'stopdesk' || deliveryMethod.value === 'pickup') && deliveryAddress.value.commune_id) {
    await fetchPickupPoints()
  }
  
  await updateDeliveryFee()
}

// Watch commune selection to update commune name and fetch delivery options
watch(() => deliveryAddress.value.commune_id, async (newCommuneId) => {
  if (newCommuneId) {
    const selectedCommune = communes.value.find(c => (c.id || c.display_id) === parseInt(newCommuneId))
    if (selectedCommune) {
      deliveryAddress.value.commune_name = getLocalizedName(selectedCommune)
    }
    
    // Fetch delivery options when commune is selected
    await fetchDeliveryOptions()
    // Fetch pickup points for pickup option
    await fetchPickupPoints()
  } else {
    // Reset delivery options when commune is cleared
    deliveryOptions.value = []
    pickupPoints.value = []
    cartStore.setDeliveryFee(0)
  }
})

// Watch delivery method to update delivery fee
watch(() => deliveryMethod.value, async (newMethod) => {
  if (newMethod && deliveryAddress.value.commune_id) {
    await updateDeliveryFee()
  }
})

onMounted(async () => {
  // Pre-fill email if available from cart (fallback)
  if (cartStore.customerInfo?.email) {
    customerInfo.value.email = cartStore.customerInfo.email
  }
  
  // Fetch profile and pre-fill form
  await fetchProfile()
})
</script>

<style scoped>
/* Remove zoom effects for checkout form cards */
.checkout-form-card {
  transform: scale(1) !important;
}

.checkout-form-card:hover {
  transform: scale(1) !important;
}

/* Remove zoom effects for checkout input fields */
.checkout-input {
  transform: scale(1) !important;
}

.checkout-input:focus {
  transform: scale(1) !important;
}

/* Remove zoom and hover effects for confirm button */
.checkout-confirm-btn {
  transform: scale(1) !important;
  transition: none !important;
  cursor: pointer !important;
}

.checkout-confirm-btn:hover {
  transform: scale(1) !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  cursor: pointer !important;
}

.checkout-confirm-btn:active {
  transform: scale(1) !important;
  cursor: pointer !important;
}

.checkout-confirm-btn:focus {
  transform: scale(1) !important;
  cursor: pointer !important;
}

.checkout-confirm-btn:disabled {
  cursor: pointer !important;
}

.checkout-confirm-btn:disabled:hover {
  cursor: pointer !important;
  transform: scale(1) !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
}

/* Remove hover effects from Order Summary card */
.checkout-order-summary {
  transform: scale(1) !important;
}

.checkout-order-summary:hover {
  transform: scale(1) !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
}
</style> 