<template>
  <div class="product-card group hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
    <!-- Product Image Container -->
    <div class="relative overflow-hidden bg-gray-50 dark:bg-gray-700">
      <img 
        v-if="productImage" 
        :src="productImage" 
        :alt="product.name"
        class="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition-transform duration-500"
        @error="handleImageError"
      />
      
      <!-- No Image Placeholder -->
      <div v-else class="w-full h-48 sm:h-56 flex items-center justify-center">
        <div class="text-center text-gray-400 dark:text-gray-500">
          <i class="fas fa-image text-5xl mb-3 opacity-50"></i>
          <p class="text-sm font-medium">{{ $t('product.noImage') }}</p>
        </div>
      </div>
      
      <!-- Badges Container -->
      <div class="absolute top-3 right-3 flex flex-col space-y-2">
        <span v-if="product.is_new" class="badge-new">
          {{ $t('product.new') }}
        </span>
        <span v-if="product.is_on_sale" class="badge-sale">
          {{ $t('product.sale') }}
        </span>
      </div>
      
      <!-- COD Badge -->
      <div class="absolute top-3 left-3">
        <span class="badge-cod">
          <i class="fas fa-money-bill-wave ml-2"></i>
          {{ $t('product.cod') }}
        </span>
      </div>

      <!-- Wishlist Button (Floating) -->
      <button
        @click="toggleWishlist"
        class="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
        :class="{ 'text-red-500': isInWishlist, 'text-gray-600 dark:text-gray-300': !isInWishlist }"
        :title="isInWishlist ? 'إزالة من قائمة الأمنيات' : 'إضافة لقائمة الأمنيات'"
      >
        <i class="fas fa-heart text-lg" :class="{ 'text-red-500': isInWishlist }"></i>
      </button>
    </div>

    <!-- Product Info Container -->
    <div class="p-4 sm:p-6 space-y-3 sm:space-y-4">
      <!-- Title -->
      <h3 class="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
        {{ product.name }}
      </h3>

      <!-- Stock Status -->
      <div class="flex items-center space-x-2 space-x-reverse">
        <div class="flex items-center bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
          <i class="fas fa-box text-primary text-sm ml-2"></i>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ product.stock_quantity || 0 }}</span>
        </div>
        <span class="text-sm text-gray-600 dark:text-gray-400 font-medium">متوفر</span>
      </div>

      <!-- Price -->
      <div class="flex items-center justify-between">
        <span class="text-xl sm:text-2xl font-bold text-primary">
          {{ formatPrice(product.price) }} {{ $t('product.currency') }}
        </span>
        <span v-if="product.is_on_sale" class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-through">
          {{ formatPrice(product.original_price || product.price) }} {{ $t('product.currency') }}
        </span>
      </div>

      <!-- Actions -->
      <div class="flex space-x-2 sm:space-x-3 space-x-reverse pt-2">
        <button
          @click="addToCart"
          :disabled="(product.stock_quantity || 0) <= 0 || cartLoading"
          class="flex-1 btn-primary text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i v-if="!cartLoading" class="fas fa-shopping-cart ml-1 sm:ml-2"></i>
          <i v-else class="fas fa-spinner fa-spin ml-1 sm:ml-2"></i>
          <span class="hidden sm:inline">{{ getCartButtonText() }}</span>
          <span class="sm:hidden">Add</span>
        </button>
        
        <router-link
          :to="`/${$i18n.locale.value}/product/${product.id}`"
          class="btn-outline text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center"
          :title="$t('product.viewProduct')"
        >
          <i class="fas fa-eye text-gray-600 group-hover:text-primary transition-colors"></i>
        </router-link>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useCartStore } from '../stores/cart'
import { useWishlistStore } from '../stores/wishlist'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const cartStore = useCartStore()
const wishlistStore = useWishlistStore()

// Local state for better UX
const cartLoading = ref(false)
const wishlistLoading = ref(false)
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

const isInWishlist = computed(() => {
  return wishlistStore.isInWishlist(props.product.id)
})

const getCartButtonText = () => {
  if (cartLoading.value) return 'جاري الإضافة...'
  if ((props.product.stock_quantity || 0) <= 0) return 'غير متوفر'
  return 'أضف للسلة'
}

const addToCart = async () => {
  if ((props.product.stock_quantity || 0) <= 0) return
  
  try {
    cartLoading.value = true
    error.value = ''
    
    await cartStore.addToCart(props.product)
    
    // Show success feedback
    console.log('Product added to cart successfully')
  } catch (err) {
    console.error('Failed to add to cart:', err)
    error.value = err.message || 'فشل في إضافة المنتج للسلة'
  } finally {
    cartLoading.value = false
  }
}

const toggleWishlist = async () => {
  try {
    wishlistLoading.value = true
    error.value = ''
    
    if (isInWishlist.value) {
      await wishlistStore.removeProductFromWishlist(props.product.id)
      console.log('Product removed from wishlist successfully')
    } else {
      await wishlistStore.addToWishlist(props.product.id)
      console.log('Product added to wishlist successfully')
    }
  } catch (err) {
    console.error('Failed to toggle wishlist:', err)
    error.value = err.message || 'فشل في تحديث قائمة الأمنيات'
  } finally {
    wishlistLoading.value = false
  }
}

const handleImageError = (event) => {
  // Hide the image if it fails to load
  event.target.style.display = 'none'
}

onMounted(async () => {
  // Fetch wishlist if user is authenticated
  if (wishlistStore.wishlistItems.length === 0) {
    try {
      await wishlistStore.fetchWishlist()
    } catch (error) {
      // User might not be authenticated, which is fine
      console.log('User not authenticated or wishlist fetch failed:', error)
    }
  }
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

/* Enhanced badge styles */
.badge-new {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  background-color: #10b981;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.badge-sale {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  background-color: #ef4444;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.badge-cod {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  background-color: #3b82f6;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Product card hover effects */
.product-card:hover {
  transform: translateY(-4px);
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