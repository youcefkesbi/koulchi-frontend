<template>
  <div class="container-lg space-y-8 section-padding">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
      <div>
        <h1 class="text-3xl font-bold text-dark">{{ $t('wishlist.title') }}</h1>
        <p class="text-gray-600 mt-2">
          {{ wishlistStore.totalItems }} {{ $t('wishlist.totalItems', { count: wishlistStore.totalItems }) }}
        </p>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        <button
          v-if="wishlistStore.totalItems > 0"
          @click="clearWishlist"
          class="btn-outline text-red-600 border-red-300 hover:bg-red-50"
          :disabled="wishlistStore.loading"
        >
          <i class="fas fa-trash ml-2"></i>
          {{ $t('wishlist.clearWishlist') }}
        </button>
        
        <router-link to="/products" class="btn-primary">
          <i class="fas fa-shopping-bag ml-2"></i>
          {{ $t('wishlist.continueShopping') }}
        </router-link>
      </div>
    </div>

    <!-- Wishlist Items -->
    <div v-if="wishlistStore.loading" class="text-center py-12">
      <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-gray-600">{{ $t('loading') }}</p>
    </div>

    <div v-else-if="wishlistStore.totalItems > 0" class="grid-responsive">
      <div
        v-for="item in wishlistStore.wishlistItems"
        :key="item.id"
        class="card group hover:shadow-lg transition-all duration-300"
      >
        <!-- Product Image -->
        <div class="relative overflow-hidden rounded-lg mb-4">
          <img 
            :src="getProductImage(item.products)" 
            :alt="item.products.name"
            class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            @error="handleImageError"
          />
          
          <!-- Badges -->
          <div class="absolute top-2 right-2 flex flex-col space-y-1">
            <span v-if="item.products.is_new" class="badge badge-new">
              جديد
            </span>
            <span v-if="item.products.is_on_sale" class="badge badge-sale">
              تخفيض
            </span>
          </div>
          
          <!-- Remove from Wishlist Button -->
          <button
            @click="removeFromWishlist(item.id)"
            class="absolute top-2 left-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            title="إزالة من قائمة الأمنيات"
          >
            <i class="fas fa-times text-sm"></i>
          </button>
        </div>

        <!-- Product Info -->
        <div class="space-y-3">
          <!-- Title -->
          <h3 class="font-semibold text-lg text-dark line-clamp-2">
            {{ item.products.name }}
          </h3>

          <!-- Stock Status -->
          <div class="flex items-center space-x-2 space-x-reverse">
            <div class="flex items-center">
              <i class="fas fa-box text-primary text-sm"></i>
              <span class="text-sm text-gray-600 mr-1">{{ item.products.stock_quantity || 0 }}</span>
            </div>
            <span class="text-sm text-gray-500">متوفر</span>
          </div>

          <!-- Price -->
          <div class="flex items-center space-x-2 space-x-reverse">
            <span class="text-xl font-bold text-primary">
              {{ formatPrice(item.products.price) }} دج
            </span>
          </div>

          <!-- Actions -->
          <div class="flex space-x-2 space-x-reverse">
            <button
              @click="addToCart(item.products)"
              class="flex-1 btn-primary text-sm py-2"
              :disabled="(item.products.stock_quantity || 0) <= 0"
            >
              <i class="fas fa-shopping-cart ml-2"></i>
              {{ (item.products.stock_quantity || 0) > 0 ? 'أضف للسلة' : 'غير متوفر' }}
            </button>
            <router-link
              :to="`/product/${item.products.id}`"
              class="btn-outline text-sm py-2 px-4"
            >
              <i class="fas fa-eye"></i>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty Wishlist -->
    <div v-else class="text-center py-12">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-heart text-gray-400 text-3xl"></i>
      </div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">{{ $t('wishlist.empty') }}</h3>
      <p class="text-gray-500 mb-6">
        {{ $t('wishlist.emptyMessage') }}
      </p>
      <router-link to="/products" class="btn-primary">
        <i class="fas fa-shopping-bag ml-2"></i>
        {{ $t('wishlist.browseProducts') }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWishlistStore } from '../stores/useWishlistStore'
import { useCartStore } from '../stores/useCartStore'

const { t } = useI18n()
const wishlistStore = useWishlistStore()
const cartStore = useCartStore()

const getProductImage = (product) => {
  if (product.image_urls && product.image_urls.length > 0) {
    return product.image_urls[0]
  }
  return product.image || null
}

const formatPrice = (price) => {
  return price.toLocaleString('ar-DZ')
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

const addToCart = async (product) => {
  if (product.stock_quantity > 0) {
    await cartStore.addToCart(product)
  }
}

const removeFromWishlist = async (wishlistItemId) => {
  try {
    await wishlistStore.removeFromWishlist(wishlistItemId)
    // Success - item is already removed from UI (optimistic update)
  } catch (error) {
    console.error('Failed to remove from wishlist:', error)
    // Show error message to user
    alert(t('wishlist.removeError') || 'Failed to remove item from wishlist')
  }
}

const clearWishlist = async () => {
  if (confirm(t('wishlist.clearConfirm'))) {
    try {
      await wishlistStore.clearWishlist()
    } catch (error) {
      console.error('Failed to clear wishlist:', error)
    }
  }
}

onMounted(async () => {
  try {
    await wishlistStore.fetchWishlist()
  } catch (error) {
    console.error('Failed to fetch wishlist:', error)
  }
})
</script>

<style scoped>
.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 1rem;
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
  border: 2px solid #d1d5db;
  color: #374151;
  background-color: transparent;
  font-weight: 500;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-outline:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-primary);
}

.badge {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  color: white;
}

.badge-new {
  background-color: #10b981;
}

.badge-sale {
  background-color: #ef4444;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
