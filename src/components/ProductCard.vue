<template>
  <div class="product-card group hover:shadow-2xl transition-all duration-500 bg-white rounded-3xl border-0 overflow-hidden shadow-lg hover:-translate-y-2 hover:scale-[1.02] relative"
       :class="{ 'opacity-60': (product.stock_quantity || 0) <= 0 }">
    <!-- Product Image Container -->
    <div class="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <img 
        v-if="productImage" 
        :src="productImage" 
        :alt="product.name"
        class="w-full h-64 sm:h-72 object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        @error="handleImageError"
      />
      
      <!-- No Image Placeholder -->
      <div v-else class="w-full h-64 sm:h-72 flex items-center justify-center">
        <div class="text-center text-gray-400">
          <i class="fas fa-image text-6xl mb-4 opacity-40"></i>
          <p class="text-sm font-medium text-gray-500">{{ $t('product.noImage') }}</p>
        </div>
      </div>
      
      <!-- Badges Container -->
      <div class="absolute top-4 right-4 flex flex-col space-y-2">
        <span v-if="product.is_new" class="badge-new">
          {{ $t('product.new') }}
        </span>
        <span v-if="product.is_on_sale" class="badge-sale">
          {{ $t('product.sale') }}
        </span>
      </div>
      
      <!-- COD Badge -->
      <div class="absolute top-4 left-4">
        <span class="badge-cod">
          <i class="fas fa-money-bill-wave ml-2"></i>
          {{ $t('product.cod') }}
        </span>
      </div>

      <!-- Out of Stock Overlay -->
      <div v-if="(product.stock_quantity || 0) <= 0" 
           class="absolute inset-0 bg-gradient-to-br from-red-500/80 to-red-600/90 backdrop-blur-sm flex items-center justify-center pointer-events-none z-10">
        <div class="bg-white text-red-600 px-6 py-3 rounded-2xl font-bold text-lg shadow-2xl border-2 border-red-200 pointer-events-auto">
          <i class="fas fa-times-circle ml-2"></i>
          {{ $t('product.outOfStock') }}
        </div>
      </div>

      <!-- Wishlist Button (Floating) -->
      <button
        @click.stop="handleToggleWishlist"
        :disabled="wishlistLoading"
        class="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-white/95 backdrop-blur-md shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-2xl z-20 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="{ 'text-red-500 bg-red-50': isProductInWishlist, 'text-gray-600 hover:text-red-500': !isProductInWishlist }"
        :title="isProductInWishlist ? 'إزالة من قائمة الأمنيات' : 'إضافة لقائمة الأمنيات'"
      >
        <i v-if="!wishlistLoading" class="fas fa-heart text-lg" :class="{ 'text-red-500': isProductInWishlist }"></i>
        <i v-else class="fas fa-spinner fa-spin text-lg"></i>
      </button>
    </div>

    <!-- Product Info Container -->
    <div class="p-4 sm:p-6 space-y-4 sm:space-y-5 bg-white">
      <!-- Title -->
      <h3 class="font-bold text-base sm:text-lg lg:text-xl text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-300">
        {{ product.name }}
      </h3>

      <!-- Price -->
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="flex flex-col space-y-1">
          <span class="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">
            {{ formatPrice(product.price) }} {{ $t('product.currency') }}
          </span>
          <span v-if="product.is_on_sale" class="text-xs sm:text-sm text-gray-500 line-through">
            {{ formatPrice(product.original_price || product.price) }} {{ $t('product.currency') }}
          </span>
        </div>
        <div class="flex items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm" 
             :class="(product.stock_quantity || 0) <= 0 ? 'bg-red-100' : 'bg-green-100'">
          <i class="fas fa-box ml-1" 
             :class="(product.stock_quantity || 0) <= 0 ? 'text-red-600' : 'text-green-600'"></i>
          <span class="font-semibold" 
                :class="(product.stock_quantity || 0) <= 0 ? 'text-red-600' : 'text-green-600'">
            {{ (product.stock_quantity || 0) <= 0 ? $t('product.outOfStock') : (product.stock_quantity || 0) }}
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 space-y-0">
        <!-- Owner View: Edit and Delete buttons -->
        <template v-if="viewState === 'owner'">
          <button
            @click.stop="handleEditProduct"
            :disabled="productLoading"
            class="flex-1 text-xs sm:text-sm py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 space-x-reverse shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fas fa-edit text-sm sm:text-base"></i>
            <span class="hidden sm:inline">Edit</span>
            <span class="sm:hidden">Edit</span>
          </button>
          
          <button
            @click.stop="handleDeleteProduct"
            :disabled="productLoading"
            class="flex-1 text-xs sm:text-sm py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 space-x-reverse shadow-lg hover:shadow-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i v-if="!productLoading" class="fas fa-trash text-sm sm:text-base"></i>
            <i v-else class="fas fa-spinner fa-spin text-sm sm:text-base"></i>
            <span class="hidden sm:inline">Delete</span>
            <span class="sm:hidden">Del</span>
          </button>
        </template>
        
        <!-- Buyer View: Add to Cart, Add to Wishlist, and View buttons -->
        <template v-else-if="viewState === 'buyer'">
          <button
            @click.stop="handleAddToCart"
            :disabled="(product.stock_quantity || 0) <= 0 || cartLoading"
            class="flex-1 text-xs sm:text-sm py-2.5 sm:py-3 px-3 sm:px-6 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 space-x-reverse shadow-lg hover:shadow-xl"
            :class="(product.stock_quantity || 0) <= 0 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'"
          >
            <i v-if="!cartLoading" class="fas fa-shopping-cart text-sm sm:text-base"></i>
            <i v-else class="fas fa-spinner fa-spin text-sm sm:text-base"></i>
            <span class="hidden sm:inline">{{ getCartButtonText() }}</span>
            <span class="sm:hidden">Cart</span>
          </button>
          
          <button
            @click.stop="handleToggleWishlist"
            :disabled="wishlistLoading"
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-xs sm:text-sm py-2.5 sm:py-3 px-3 sm:px-6 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="{ 'text-red-500 bg-red-50': isProductInWishlist }"
          >
            <i v-if="!wishlistLoading" class="fas fa-heart text-sm sm:text-base" :class="{ 'text-red-500': isProductInWishlist }"></i>
            <i v-else class="fas fa-spinner fa-spin text-sm sm:text-base"></i>
          </button>
          
          <button
            @click.stop="handleViewProduct"
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-xs sm:text-sm py-2.5 sm:py-3 px-3 sm:px-6 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105"
            :title="$t('product.viewProduct')"
          >
            <i class="fas fa-eye text-sm sm:text-base"></i>
          </button>
        </template>
        
        <!-- Guest View: Add to Cart, Add to Wishlist, and View buttons -->
        <template v-else-if="viewState === 'guest'">
          <button
            @click.stop="handleAddToCart"
            :disabled="(product.stock_quantity || 0) <= 0 || cartLoading"
            class="flex-1 text-xs sm:text-sm py-2.5 sm:py-3 px-3 sm:px-6 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 space-x-reverse shadow-lg hover:shadow-xl"
            :class="(product.stock_quantity || 0) <= 0 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'"
          >
            <i v-if="!cartLoading" class="fas fa-shopping-cart text-sm sm:text-base"></i>
            <i v-else class="fas fa-spinner fa-spin text-sm sm:text-base"></i>
            <span class="hidden sm:inline">{{ getCartButtonText() }}</span>
            <span class="sm:hidden">Cart</span>
          </button>
          
          <button
            @click.stop="handleToggleWishlist"
            :disabled="wishlistLoading"
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-xs sm:text-sm py-2.5 sm:py-3 px-3 sm:px-6 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="{ 'text-red-500 bg-red-50': isProductInWishlist }"
          >
            <i v-if="!wishlistLoading" class="fas fa-heart text-sm sm:text-base" :class="{ 'text-red-500': isProductInWishlist }"></i>
            <i v-else class="fas fa-spinner fa-spin text-sm sm:text-base"></i>
          </button>
          
          <button
            @click.stop="handleViewProduct"
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-xs sm:text-sm py-2.5 sm:py-3 px-3 sm:px-6 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105"
            :title="$t('product.viewProduct')"
          >
            <i class="fas fa-eye text-sm sm:text-base"></i>
          </button>
        </template>
      </div>

      <!-- Feedback Messages -->
      <div v-if="cartFeedback" class="mt-3 p-3 rounded-lg text-sm font-medium"
           :class="{
             'bg-green-100 text-green-800': cartFeedback.type === 'success',
             'bg-red-100 text-red-800': cartFeedback.type === 'error',
             'bg-blue-100 text-blue-800': cartFeedback.type === 'info'
           }">
        {{ cartFeedback.message }}
      </div>
      
      <div v-if="wishlistFeedback" class="mt-3 p-3 rounded-lg text-sm font-medium"
           :class="{
             'bg-green-100 text-green-800': wishlistFeedback.type === 'success',
             'bg-red-100 text-red-800': wishlistFeedback.type === 'error',
             'bg-blue-100 text-blue-800': wishlistFeedback.type === 'info'
           }">
        {{ wishlistFeedback.message }}
      </div>
      
      <div v-if="productFeedback" class="mt-3 p-3 rounded-lg text-sm font-medium"
           :class="{
             'bg-green-100 text-green-800': productFeedback.type === 'success',
             'bg-red-100 text-red-800': productFeedback.type === 'error',
             'bg-blue-100 text-blue-800': productFeedback.type === 'info'
           }">
        {{ productFeedback.message }}
      </div>

      <!-- Store Owner Info Link -->
      <div v-if="storeOwnerId" class="mt-4 pt-4 border-t border-gray-200">
        <router-link
          :to="`/${$i18n.locale.value}/profile/${storeOwnerId}`"
          class="flex items-center justify-center space-x-2 space-x-reverse text-sm text-gray-600 hover:text-primary transition-colors duration-300 group"
        >
          <i class="fas fa-store text-xs group-hover:scale-110 transition-transform"></i>
          <span class="font-medium">{{ $t('product.viewStoreOwner') }}</span>
        </router-link>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="text-red-600 text-sm text-center bg-red-50 p-4 rounded-2xl border-2 border-red-200 font-medium">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '../stores/useCartStore'
import { useWishlist } from '../composables/useWishlist'
import { useProduct } from '../composables/useProduct'
import { useAuthStore } from '../stores/useAuthStore'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  showOwnerControls: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['product-deleted'])

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const authStore = useAuthStore()

// Use composables
const { 
  toggleWishlist, 
  isInWishlist, 
  loading: wishlistLoading, 
  feedback: wishlistFeedback 
} = useWishlist()

const { 
  deleteProduct, 
  editProduct, 
  viewProduct, 
  loading: productLoading, 
  feedback: productFeedback 
} = useProduct()

// Local state
const error = ref('')
const cartLoading = ref(false)
const cartFeedback = ref(null)

const productImage = computed(() => {
  // Handle both old single image and new image_urls array
  if (props.product.image_urls && props.product.image_urls.length > 0) {
    return props.product.image_urls[0] // Use first image as main image
  }
  return props.product.image || null // Fallback to old image field
})

const storeOwnerId = computed(() => {
  // Case 1: Product has a store - get owner_id from store
  if (props.product.store_id && props.product.stores && props.product.stores.owner_id) {
    return props.product.stores.owner_id
  }
  // Case 2: Product doesn't have a store - use seller_id (customer product)
  if (props.product.seller_id) {
    return props.product.seller_id
  }
  return null
})

const formatPrice = (price) => {
  if (!price) return '0'
  return price.toLocaleString('ar-DZ')
}

// Check if product is in wishlist
const isProductInWishlist = computed(() => {
  return isInWishlist(props.product.id)
})

// Authentication and ownership computed properties
const isAuthenticated = computed(() => !!authStore.user)
const currentUser = computed(() => authStore.user)
const isProductOwner = computed(() => {
  return isAuthenticated.value && 
         currentUser.value && 
         props.product.seller_id === currentUser.value.id
})

// View state logic - determines which buttons to show
const viewState = computed(() => {
  // Ensure we have valid product data
  if (!props.product || !props.product.id) {
    return 'guest' // Default to guest if product data is missing
  }
  
  if (!isAuthenticated.value) {
    return 'guest' // Not logged in
  } else if (isProductOwner.value) {
    return 'owner' // Logged in and owns the product
  } else {
    return 'buyer' // Logged in but doesn't own the product
  }
})

const getCartButtonText = () => {
  if (cartLoading.value) return t('product.addingToCart')
  if ((props.product.stock_quantity || 0) <= 0) return t('product.outOfStock')
  return t('product.addToCart')
}

// Handler functions
const handleAddToCart = async (event) => {
  // Prevent event bubbling and ensure button is not disabled
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  // Check if already loading or out of stock
  if (cartLoading.value || (props.product.stock_quantity || 0) <= 0) {
    return
  }
  
  try {
    cartLoading.value = true
    cartFeedback.value = null
    await cartStore.addToCart(props.product.id, 1)
    cartFeedback.value = { type: 'success', message: t('product.addedToCart') }
    setTimeout(() => { cartFeedback.value = null }, 3000)
  } catch (err) {
    cartFeedback.value = { type: 'error', message: err.message || t('product.failedToAddToCart') }
    setTimeout(() => { cartFeedback.value = null }, 3000)
  } finally {
    // Ensure loading state is always reset
    cartLoading.value = false
  }
}

const handleToggleWishlist = async (event) => {
  // Prevent event bubbling
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  // Check if already loading
  if (wishlistLoading.value) {
    return
  }
  
  try {
    await toggleWishlist(props.product)
  } catch (err) {
    console.error('Failed to toggle wishlist:', err)
  }
}

const handleEditProduct = (event) => {
  // Prevent event bubbling
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  // Check if already loading
  if (productLoading.value) {
    return
  }
  
  // Ensure product ID exists
  if (!props.product?.id) {
    console.error('Product ID is missing')
    return
  }
  
  editProduct(props.product.id)
}

const handleDeleteProduct = async (event) => {
  // Prevent event bubbling
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  // Check if already loading
  if (productLoading.value) {
    return
  }
  
  // Ensure product ID exists
  if (!props.product?.id) {
    console.error('Product ID is missing')
    return
  }
  
  const confirmed = confirm('Are you sure you want to delete this product? This action cannot be undone.')
  if (confirmed) {
    try {
      const success = await deleteProduct(props.product.id)
      if (success) {
        emit('product-deleted', props.product.id)
      }
    } catch (err) {
      console.error('Failed to delete product:', err)
    }
  }
}

const handleViewProduct = (event) => {
  // Prevent event bubbling
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  // Ensure product ID exists
  if (!props.product?.id) {
    console.error('Product ID is missing')
    return
  }
  
  viewProduct(props.product.id)
}

const handleImageError = (event) => {
  // Hide the image if it fails to load
  event.target.style.display = 'none'
}

// Watch for auth state changes to trigger re-renders
watch(() => authStore.user, (newUser, oldUser) => {
  // Force reactivity update when auth state changes
  nextTick()
}, { deep: true })

// Watch for viewState changes
watch(viewState, (newState, oldState) => {
  // Force reactivity update when view state changes
  nextTick()
})

// Listen for global auth state changes
const handleAuthStateChange = (event) => {
  // Force reactivity update
  nextTick()
}

onMounted(() => {
  window.addEventListener('auth-state-changed', handleAuthStateChange)
})

onUnmounted(() => {
  window.removeEventListener('auth-state-changed', handleAuthStateChange)
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Modern badge styles */
.badge-new {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 8px 25px -5px rgba(16, 185, 129, 0.4), 0 4px 10px -2px rgba(16, 185, 129, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.badge-sale {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 8px 25px -5px rgba(239, 68, 68, 0.4), 0 4px 10px -2px rgba(239, 68, 68, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.badge-cod {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 8px 25px -5px rgba(59, 130, 246, 0.4), 0 4px 10px -2px rgba(59, 130, 246, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Modern product card hover effects */
.product-card:hover {
  transform: translateY(-8px) scale(1.02);
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

/* Loading animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style> 