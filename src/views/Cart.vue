<template>
  <div class="container-lg space-y-4 sm:space-y-6 lg:space-y-8 section-padding px-4 sm:px-6 lg:px-8">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
      <h1 class="text-2xl sm:text-3xl font-bold text-dark">{{ $t('cartPage.title') }}</h1>
      <router-link to="/" class="btn-outline text-xs sm:text-sm px-3 sm:px-4 py-2">
        <i class="fas fa-arrow-left ml-2"></i>
        <span class="hidden sm:inline">{{ $t('cartPage.continueShopping') }}</span>
        <span class="sm:hidden">Continue</span>
      </router-link>
    </div>

    <!-- Cart Content -->
    <div v-if="cartStore.hasItems" class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      <!-- Cart Items -->
      <div class="lg:col-span-2 space-y-3 sm:space-y-4">
        <div
          v-for="item in cartStore.items"
          :key="item.id"
          class="card flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 space-y-0 space-x-0 sm:space-x-4 sm:space-x-reverse"
        >
          <!-- Product Image -->
          <img 
            v-if="item.image"
            :src="item.image" 
            :alt="item.name"
            class="w-full h-48 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
            @error="handleImageError"
          />
          <div v-else class="w-full h-48 sm:w-20 sm:h-20 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="fas fa-image text-neutral-400 text-2xl sm:text-base"></i>
          </div>
          
          <!-- Product Info and Controls -->
          <div class="flex-1 w-full sm:w-auto">
            <div class="flex items-start justify-between gap-2 mb-2">
              <h3 class="font-semibold text-base sm:text-lg flex-1">{{ item.name }}</h3>
              <!-- Remove Button (Mobile) -->
              <button
                @click="removeItem(item.product_id)"
                :disabled="cartStore.loading"
                class="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed sm:hidden"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
              <div class="flex items-center space-x-2 sm:space-x-4 space-x-reverse">
                <span class="text-base sm:text-lg font-bold text-primary">
                  {{ formatPrice(item.price) }} {{ $t('common.currencyShort') }}
                </span>
                <span class="text-xs sm:text-sm text-neutral-600">
                  {{ $t('cartPage.perPiece') }}
                </span>
              </div>
              
              <!-- Quantity Controls -->
              <div class="flex items-center space-x-2 space-x-reverse">
                <button
                  @click="updateQuantity(item.product_id, item.quantity - 1)"
                  :disabled="cartStore.loading"
                  class="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i class="fas fa-minus text-xs sm:text-sm"></i>
                </button>
                <span class="w-10 sm:w-12 text-center font-semibold text-sm sm:text-base">{{ item.quantity }}</span>
                <button
                  @click="updateQuantity(item.product_id, item.quantity + 1)"
                  :disabled="cartStore.loading"
                  class="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i class="fas fa-plus text-xs sm:text-sm"></i>
                </button>
              </div>
              
              <!-- Total Price -->
              <div class="text-left sm:text-right">
                <div class="text-base sm:text-lg font-bold text-primary">
                  {{ formatPrice(item.price * item.quantity) }} {{ $t('common.currencyShort') }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Remove Button (Desktop) -->
          <button
            @click="removeItem(item.product_id)"
            :disabled="cartStore.loading"
            class="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hidden sm:block"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="lg:col-span-1">
        <div class="card sticky top-4">
          <h2 class="text-lg sm:text-xl font-bold text-dark mb-4 sm:mb-6">{{ $t('cartPage.orderSummary') }}</h2>
          
          <!-- Summary Details -->
          <div class="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <div class="flex justify-between text-sm sm:text-base">
              <span class="text-neutral-600">{{ $t('cartPage.productCount') }}:</span>
              <span class="font-semibold">{{ cartStore.totalItems }}</span>
            </div>
            
            <div class="flex justify-between text-sm sm:text-base">
              <span class="text-neutral-600">{{ $t('cartPage.subtotal') }}:</span>
              <span class="font-semibold">{{ formatPrice(cartStore.subtotal) }} {{ $t('common.currencyShort') }}</span>
            </div>
            
            <div class="border-t pt-3 sm:pt-4">
              <div class="flex justify-between text-base sm:text-lg font-bold">
                <span>{{ $t('cartPage.total') }}:</span>
                <span class="text-primary">{{ formatPrice(cartStore.total) }} {{ $t('common.currencyShort') }}</span>
              </div>
            </div>
          </div>

          <!-- COD Info -->
          <div class="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div class="flex items-start space-x-2 sm:space-x-3 space-x-reverse">
              <i class="fas fa-money-bill-wave text-green-600 text-lg sm:text-xl mt-1 flex-shrink-0"></i>
              <div>
                <h4 class="font-semibold text-green-800 mb-1 text-sm sm:text-base">{{ $t('product.cod') }}</h4>
                <p class="text-green-700 text-xs sm:text-sm">
                  {{ $t('cartPage.payOnDelivery', { amount: formatPrice(cartStore.total), currency: $t('common.currencyShort') }) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Free Shipping Info -->
          <div v-if="cartStore.subtotal >= 5000" class="bg-primary-50 border border-primary-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div class="flex items-center space-x-2 space-x-reverse">
              <i class="fas fa-truck text-primary-600 text-sm sm:text-base"></i>
              <span class="text-primary-800 font-semibold text-xs sm:text-sm">{{ $t('features.fastDelivery') }}!</span>
            </div>
          </div>

          <!-- Checkout Button -->
          <button
            @click="handleCheckout"
            class="btn-primary w-full text-center text-sm sm:text-base lg:text-lg py-3 sm:py-3.5 lg:py-4"
          >
            <i class="fas fa-credit-card ml-2"></i>
            {{ $t('cartPage.checkout') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty Cart -->
    <div v-else class="text-center py-12">
      <div class="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-shopping-cart text-neutral-400 text-3xl"></i>
      </div>
      <h3 class="text-xl font-semibold text-neutral-700 mb-2">{{ $t('cartPage.emptyCart') }}</h3>
      <p class="text-neutral-500 mb-6">
        {{ $t('cartPage.emptyCartMessage') }}
      </p>
      <router-link to="/" class="btn-primary">
        <i class="fas fa-shopping-bag ml-2"></i>
        {{ $t('cartPage.startShopping') }}
      </router-link>
    </div>

    <!-- Recommended Products -->
    <section v-if="cartStore.hasItems" class="mt-8 sm:mt-10 lg:mt-12">
      <h2 class="text-xl sm:text-2xl font-bold text-dark mb-4 sm:mb-6">{{ $t('sections.newProducts') }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <ProductCard
          v-for="product in recommendedProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </section>
  </div>

</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getLocalizedPath } from '../lib/i18n-utils'
import { useLocaleRouter } from '../composables/useLocaleRouter'
import { useCartStore } from '../stores/useCartStore'
import { useProductStore } from '../stores/useProductStore'
import { useAuthStore } from '../stores/useAuthStore'
import ProductCard from '../components/ProductCard.vue'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const productStore = useProductStore()
const authStore = useAuthStore()
const { navigateToPath } = useLocaleRouter()

// Get localized route path
const getLocalizedRoute = (path) => {
  const currentLocale = route.meta.locale || 'en'
  return getLocalizedPath(path, currentLocale)
}

const recommendedProducts = computed(() => {
  // Get products that are not in cart
  const cartProductIds = cartStore.items.map(item => item.product_id)
  return productStore.products
    .filter(product => !cartProductIds.includes(product.id))
    .slice(0, 4)
})

const formatPrice = (price) => {
  return price.toLocaleString('ar-DZ')
}

const updateQuantity = async (productId, quantity) => {
  try {
    await cartStore.updateQuantity(productId, quantity)
  } catch (err) {
    console.error('Error updating quantity:', err)
    // Error is already handled in the store, but we can add user feedback here if needed
  }
}

const removeItem = async (productId) => {
  try {
    await cartStore.removeFromCart(productId)
  } catch (err) {
    console.error('Error removing item:', err)
    // Error is already handled in the store, but we can add user feedback here if needed
  }
}

const handleCheckout = () => {
  if (!authStore.isAuthenticated) {
    navigateToPath('/login')
  } else {
    // User is authenticated, proceed to checkout using router
    router.push(getLocalizedRoute('/checkout'))
  }
}

const handleImageError = (event) => {
  // Hide the image if it fails to load
  event.target.style.display = 'none'
}

// Fetch cart and products on component mount
onMounted(async () => {
  await Promise.all([
    cartStore.fetchCartItems(),
    productStore.fetchProducts()
  ])
})
</script> 