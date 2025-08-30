<template>
  <div class="card group hover:shadow-lg transition-all duration-300">
    <!-- Product Image -->
    <div v-if="productImage" class="relative overflow-hidden rounded-lg mb-4">
      <img 
        :src="productImage" 
        :alt="product.name"
        class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        @error="handleImageError"
      />
      
      <!-- Badges -->
      <div class="absolute top-2 right-2 flex flex-col space-y-1">
        <span v-if="product.isNew" class="badge badge-new">
          {{ $t('product.new') }}
        </span>
        <span v-if="product.isOnSale" class="badge badge-sale">
          {{ $t('product.sale') }}
        </span>
      </div>
      
      <!-- COD Badge -->
      <div class="absolute top-2 left-2">
        <span class="badge badge-cod">
          <i class="fas fa-money-bill-wave ml-1"></i>
          {{ $t('product.cod') }}
        </span>
      </div>
    </div>
    
    <!-- No Image Placeholder -->
    <div v-else class="relative overflow-hidden rounded-lg mb-4 bg-gray-100 flex items-center justify-center h-48">
      <div class="text-center text-gray-400">
        <i class="fas fa-image text-4xl mb-2"></i>
        <p class="text-sm">{{ $t('product.noImage') }}</p>
      </div>
      
      <!-- Badges -->
      <div class="absolute top-2 right-2 flex flex-col space-y-1">
        <span v-if="product.isNew" class="badge badge-new">
          {{ $t('product.new') }}
        </span>
        <span v-if="product.isOnSale" class="badge badge-sale">
          {{ $t('product.sale') }}
        </span>
      </div>
      
      <!-- COD Badge -->
      <div class="absolute top-2 left-2">
        <span class="badge badge-cod">
          <i class="fas fa-money-bill-wave ml-1"></i>
          {{ $t('product.cod') }}
        </span>
      </div>
    </div>

    <!-- Product Info -->
    <div class="space-y-3">
      <!-- Title -->
      <h3 class="font-semibold text-lg text-dark line-clamp-2">
        {{ product.name }}
      </h3>

      <!-- Stock Status -->
      <div class="flex items-center space-x-2 space-x-reverse">
        <div class="flex items-center">
          <i class="fas fa-box text-primary text-sm"></i>
          <span class="text-sm text-gray-600 mr-1">{{ product.stock_quantity }}</span>
        </div>
        <span class="text-sm text-gray-500">متوفر</span>
      </div>

      <!-- Price -->
      <div class="flex items-center space-x-2 space-x-reverse">
        <span class="text-xl font-bold text-primary">
          {{ formatPrice(product.price) }} {{ $t('product.currency') }}
        </span>
      </div>

      <!-- Actions -->
      <div class="flex space-x-2 space-x-reverse">
        <button
          @click="addToCart"
          class="flex-1 btn-primary text-sm py-2"
          :disabled="product.stock_quantity <= 0"
        >
          <i class="fas fa-shopping-cart ml-2"></i>
          {{ product.stock_quantity > 0 ? $t('product.addToCart') : $t('product.outOfStock') }}
        </button>
        <button
          @click="toggleWishlist"
          class="btn-outline text-sm py-2 px-4"
          :class="{ 'text-red-500 border-red-300': isInWishlist }"
          :title="isInWishlist ? 'إزالة من قائمة الأمنيات' : 'إضافة لقائمة الأمنيات'"
        >
          <i class="fas fa-heart" :class="{ 'text-red-500': isInWishlist }"></i>
        </button>
        <router-link
          :to="`/${$i18n.locale.value}/product/${product.id}`"
          class="btn-outline text-sm py-2 px-4 hover:bg-primary hover:text-white transition-all duration-300"
          :title="$t('product.viewProduct')"
          @click="handleViewProduct"
        >
          <i class="fas fa-eye text-gray-600 group-hover:text-primary transition-colors"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useCartStore } from '../stores/cart'
import { useWishlistStore } from '../stores/wishlist'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

// Debug logging
console.log('ProductCard received product:', props.product)

const cartStore = useCartStore()
const wishlistStore = useWishlistStore()

const productImage = computed(() => {
  // Handle both old single image and new image_urls array
  if (props.product.image_urls && props.product.image_urls.length > 0) {
    return props.product.image_urls[0] // Use first image as main image
  }
  return props.product.image || null // Fallback to old image field
})

const formatPrice = (price) => {
  return price.toLocaleString('ar-DZ')
}

const isInWishlist = computed(() => {
  return wishlistStore.isInWishlist(props.product.id)
})

const addToCart = async () => {
  if (props.product.stock_quantity > 0) {
    await cartStore.addToCart(props.product)
  }
}

const toggleWishlist = async () => {
  try {
    if (isInWishlist.value) {
      await wishlistStore.removeProductFromWishlist(props.product.id)
    } else {
      await wishlistStore.addToWishlist(props.product.id)
    }
  } catch (error) {
    console.error('Failed to toggle wishlist:', error)
  }
}

const handleViewProduct = () => {
  console.log('View product clicked:', props.product.id)
  console.log('Route will be:', `/${i18n.global.locale.value}/product/${props.product.id}`)
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
</style> 