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
           class="absolute inset-0 bg-gradient-to-br from-red-500/80 to-red-600/90 backdrop-blur-sm flex items-center justify-center">
        <div class="bg-white text-red-600 px-6 py-3 rounded-2xl font-bold text-lg shadow-2xl border-2 border-red-200">
          <i class="fas fa-times-circle ml-2"></i>
          {{ $t('product.outOfStock') }}
        </div>
      </div>

      <!-- Wishlist Button (Floating) -->
      <button
        @click="toggleWishlist"
        class="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-white/95 backdrop-blur-md shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-2xl"
        :class="{ 'text-red-500 bg-red-50': isInWishlist, 'text-gray-600 hover:text-red-500': !isInWishlist }"
        :title="isInWishlist ? 'إزالة من قائمة الأمنيات' : 'إضافة لقائمة الأمنيات'"
      >
        <i class="fas fa-heart text-lg" :class="{ 'text-red-500': isInWishlist }"></i>
      </button>
    </div>

    <!-- Product Info Container -->
    <div class="p-6 space-y-5 bg-white">
      <!-- Title -->
      <h3 class="font-bold text-xl text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-300">
        {{ product.name }}
      </h3>

      <!-- Price -->
      <div class="flex items-center justify-between">
        <div class="flex flex-col space-y-1">
          <span class="text-3xl font-bold text-blue-600">
            {{ formatPrice(product.price) }} {{ $t('product.currency') }}
          </span>
          <span v-if="product.is_on_sale" class="text-sm text-gray-500 line-through">
            {{ formatPrice(product.original_price || product.price) }} {{ $t('product.currency') }}
          </span>
        </div>
        <div class="flex items-center px-3 py-2 rounded-full" 
             :class="(product.stock_quantity || 0) <= 0 ? 'bg-red-100' : 'bg-green-100'">
          <i class="fas fa-box text-xs ml-1" 
             :class="(product.stock_quantity || 0) <= 0 ? 'text-red-600' : 'text-green-600'"></i>
          <span class="text-xs font-semibold" 
                :class="(product.stock_quantity || 0) <= 0 ? 'text-red-600' : 'text-green-600'">
            {{ (product.stock_quantity || 0) <= 0 ? $t('product.outOfStock') : (product.stock_quantity || 0) }}
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex space-x-3 space-x-reverse">
        <!-- Owner View: Edit and Delete buttons -->
        <template v-if="viewState === 'owner'">
          <button
            @click="handleEditProduct"
            class="flex-1 text-sm py-4 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 space-x-reverse shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:scale-105"
          >
            <i class="fas fa-edit"></i>
            <span>Edit</span>
          </button>
          
          <button
            @click="handleDeleteProduct"
            :disabled="productLoading"
            class="flex-1 text-sm py-4 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 space-x-reverse shadow-lg hover:shadow-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i v-if="!productLoading" class="fas fa-trash"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            <span>Delete</span>
          </button>
        </template>
        
        <!-- Buyer View: Add to Cart, Add to Wishlist, and View buttons -->
        <template v-else-if="viewState === 'buyer'">
          <button
            @click="handleAddToCart"
            :disabled="(product.stock_quantity || 0) <= 0 || cartLoading"
            class="flex-1 text-sm py-4 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 space-x-reverse shadow-lg hover:shadow-xl"
            :class="(product.stock_quantity || 0) <= 0 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'"
          >
            <i v-if="!cartLoading" class="fas fa-shopping-cart"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            <span>{{ getCartButtonText() }}</span>
          </button>
          
          <button
            @click="handleToggleWishlist"
            :disabled="wishlistLoading"
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-sm py-4 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50"
            :class="{ 'text-red-500 bg-red-50': isInWishlist }"
          >
            <i v-if="!wishlistLoading" class="fas fa-heart" :class="{ 'text-red-500': isInWishlist }"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
          </button>
          
          <button
            @click="handleViewProduct"
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-sm py-4 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105"
            :title="$t('product.viewProduct')"
          >
            <i class="fas fa-eye"></i>
          </button>
        </template>
        
        <!-- Guest View: Add to Cart, Add to Wishlist, and View buttons -->
        <template v-else-if="viewState === 'guest'">
          <button
            @click="handleAddToCart"
            :disabled="(product.stock_quantity || 0) <= 0 || cartLoading"
            class="flex-1 text-sm py-4 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 space-x-reverse shadow-lg hover:shadow-xl"
            :class="(product.stock_quantity || 0) <= 0 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'"
          >
            <i v-if="!cartLoading" class="fas fa-shopping-cart"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            <span>{{ getCartButtonText() }}</span>
          </button>
          
          <button
            @click="handleToggleWishlist"
            :disabled="wishlistLoading"
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-sm py-4 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50"
            :class="{ 'text-red-500 bg-red-50': isInWishlist }"
          >
            <i v-if="!wishlistLoading" class="fas fa-heart" :class="{ 'text-red-500': isInWishlist }"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
          </button>
          
          <button
            @click="handleViewProduct"
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-sm py-4 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105"
            :title="$t('product.viewProduct')"
          >
            <i class="fas fa-eye"></i>
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

      <!-- Error Message -->
      <div v-if="error" class="text-red-600 text-sm text-center bg-red-50 p-4 rounded-2xl border-2 border-red-200 font-medium">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore'
import { useI18n } from 'vue-i18n'
import { useLocaleRouter } from '../composables/useLocaleRouter'
import { useCart } from '../composables/useCart'
import { useWishlist } from '../composables/useWishlist'
import { useProduct } from '../composables/useProduct'

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

const router = useRouter()
const authStore = useAuthStore()
const { locale } = useI18n()
const { navigateTo, navigateToPath, getLocalizedRoute } = useLocaleRouter()

// New composables
const { 
  addToCart, 
  loading: cartLoading, 
  feedback: cartFeedback 
} = useCart()

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

const productImage = computed(() => {
  // Handle both old single image and new image_urls array
  if (props.product.image_urls && props.product.image_urls.length > 0) {
    return props.product.image_urls[0] // Use first image as main image
  }
  return props.product.image || null // Fallback to old image field
})

const formatPrice = (price) => {
  if (!price) return '0'
  return price.toLocaleString('ar-DZ')
}

// isInWishlist is now provided by useWishlist composable

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
  if (!isAuthenticated.value) {
    return 'guest' // Not logged in
  } else if (isProductOwner.value) {
    return 'owner' // Logged in and owns the product
  } else {
    return 'buyer' // Logged in but doesn't own the product
  }
})

const getCartButtonText = () => {
  if (cartLoading.value) return 'جاري الإضافة...'
  if ((props.product.stock_quantity || 0) <= 0) return 'غير متوفر'
  return 'أضف للسلة'
}

// Handler functions using new composables
const handleAddToCart = async () => {
  await addToCart(props.product)
}

const handleToggleWishlist = async () => {
  await toggleWishlist(props.product)
}

const handleEditProduct = () => {
  editProduct(props.product.id)
}

const handleDeleteProduct = async () => {
  const confirmed = confirm('Are you sure you want to delete this product? This action cannot be undone.')
  if (confirmed) {
    const success = await deleteProduct(props.product.id)
    if (success) {
      emit('product-deleted', props.product.id)
    }
  }
}

const handleViewProduct = () => {
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
onMounted(() => {
  const handleAuthStateChange = (event) => {
    // Force reactivity update
    nextTick()
  }
  
  window.addEventListener('auth-state-changed', handleAuthStateChange)
  
  // Cleanup listener on unmount
  onUnmounted(() => {
    window.removeEventListener('auth-state-changed', handleAuthStateChange)
  })
  
  // Wishlist is now handled by the useWishlist composable
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