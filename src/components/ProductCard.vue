<template>
  <div class="card group hover:shadow-lg transition-all duration-300">
    <!-- Product Image -->
    <div class="relative overflow-hidden rounded-lg mb-4">
      <img 
        :src="product.image" 
        :alt="product.name"
        class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
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

    <!-- Product Info -->
    <div class="space-y-3">
      <!-- Title -->
      <h3 class="font-semibold text-lg text-dark line-clamp-2">
        {{ product.nameAr }}
      </h3>
      <p class="text-sm text-gray-600 line-clamp-1">
        {{ product.name }}
      </p>

      <!-- Rating -->
      <div class="flex items-center space-x-2 space-x-reverse">
        <div class="flex items-center">
          <i class="fas fa-star text-yellow-400 text-sm"></i>
          <span class="text-sm text-gray-600 mr-1">{{ product.rating }}</span>
        </div>
        <span class="text-sm text-gray-500">({{ product.reviews }})</span>
      </div>

      <!-- Price -->
      <div class="flex items-center space-x-2 space-x-reverse">
        <span class="text-xl font-bold text-primary">
          {{ formatPrice(product.price) }} دج
        </span>
        <span v-if="product.originalPrice > product.price" class="text-sm text-gray-500 line-through">
          {{ formatPrice(product.originalPrice) }} دج
        </span>
      </div>

      <!-- Actions -->
      <div class="flex space-x-2 space-x-reverse">
        <button
          @click="addToCart"
          class="flex-1 btn-primary text-sm py-2"
          :disabled="!product.inStock"
        >
          <i class="fas fa-shopping-cart ml-2"></i>
          {{ product.inStock ? $t('product.addToCart') : $t('product.outOfStock') }}
        </button>
        <router-link
          :to="`/product/${product.id}`"
          class="btn-outline text-sm py-2 px-4"
        >
          <i class="fas fa-eye"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { useCartStore } from '../stores/cart'

export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const cartStore = useCartStore()

    const formatPrice = (price) => {
      return price.toLocaleString('ar-DZ')
    }

    const addToCart = async () => {
      if (props.product.inStock) {
        await cartStore.addToCart(props.product)
      }
    }

    return {
      formatPrice,
      addToCart
    }
  }
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 