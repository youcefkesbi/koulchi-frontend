<template>
  <div class="space-y-8">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-dark">{{ $t('cartPage.title') }}</h1>
      <router-link to="/products" class="btn-outline">
        <i class="fas fa-arrow-left ml-2"></i>
        {{ $t('cartPage.continueShopping') }}
      </router-link>
    </div>

    <!-- Cart Content -->
    <div v-if="cartStore.hasItems" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Cart Items -->
      <div class="lg:col-span-2 space-y-4">
        <div
          v-for="item in cartStore.items"
          :key="item.id"
          class="card flex items-center space-x-4 space-x-reverse"
        >
          <!-- Product Image -->
          <img 
            v-if="item.image"
            :src="item.image" 
            :alt="item.name"
            class="w-20 h-20 object-cover rounded-lg"
            @error="handleImageError"
          />
          <div v-else class="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-image text-gray-400"></i>
          </div>
          
          <!-- Product Info -->
          <div class="flex-1">
            <h3 class="font-semibold text-lg">{{ item.nameAr }}</h3>
            <p class="text-gray-600 text-sm">{{ item.name }}</p>
            <div class="flex items-center space-x-4 space-x-reverse mt-2">
              <span class="text-lg font-bold text-primary">
                {{ formatPrice(item.price) }} {{ $t('product.currency') }}
              </span>
              <span class="text-sm text-gray-500">
                {{ $t('cartPage.perPiece') }}
              </span>
            </div>
          </div>
          
          <!-- Quantity Controls -->
          <div class="flex items-center space-x-2 space-x-reverse">
            <button
              @click="updateQuantity(item.id, item.quantity - 1)"
              class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <i class="fas fa-minus text-sm"></i>
            </button>
            <span class="w-12 text-center font-semibold">{{ item.quantity }}</span>
            <button
              @click="updateQuantity(item.id, item.quantity + 1)"
              class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <i class="fas fa-plus text-sm"></i>
            </button>
          </div>
          
          <!-- Total Price -->
          <div class="text-right">
            <div class="text-lg font-bold text-primary">
              {{ formatPrice(item.price * item.quantity) }} {{ $t('product.currency') }}
            </div>
          </div>
          
          <!-- Remove Button -->
          <button
            @click="removeItem(item.id)"
            class="text-red-500 hover:text-red-700 transition-colors"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="lg:col-span-1">
        <div class="card sticky top-4">
          <h2 class="text-xl font-bold text-dark mb-6">{{ $t('cartPage.orderSummary') }}</h2>
          
          <!-- Summary Details -->
          <div class="space-y-4 mb-6">
            <div class="flex justify-between">
              <span class="text-gray-600">{{ $t('cartPage.productCount') }}:</span>
              <span class="font-semibold">{{ cartStore.totalItems }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">{{ $t('cartPage.subtotal') }}:</span>
              <span class="font-semibold">{{ formatPrice(cartStore.subtotal) }} {{ $t('product.currency') }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">{{ $t('cartPage.deliveryFee') }}:</span>
              <span class="font-semibold">{{ formatPrice(cartStore.deliveryFee) }} {{ $t('product.currency') }}</span>
            </div>
            
            <div class="border-t pt-4">
              <div class="flex justify-between text-lg font-bold">
                <span>{{ $t('cartPage.total') }}:</span>
                <span class="text-primary">{{ formatPrice(cartStore.total) }} {{ $t('product.currency') }}</span>
              </div>
            </div>
          </div>

          <!-- COD Info -->
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div class="flex items-start space-x-3 space-x-reverse">
              <i class="fas fa-money-bill-wave text-green-600 text-xl mt-1"></i>
              <div>
                <h4 class="font-semibold text-green-800 mb-1">{{ $t('product.cod') }}</h4>
                <p class="text-green-700 text-sm">
                  {{ $t('cartPage.payOnDelivery', { amount: formatPrice(cartStore.total), currency: $t('product.currency') }) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Free Shipping Info -->
          <div v-if="cartStore.subtotal >= 5000" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div class="flex items-center space-x-2 space-x-reverse">
              <i class="fas fa-truck text-blue-600"></i>
              <span class="text-blue-800 font-semibold">{{ $t('features.fastDelivery') }}!</span>
            </div>
          </div>

          <!-- Checkout Button -->
          <router-link
            to="/checkout"
            class="btn-primary w-full text-center text-lg py-4"
          >
            <i class="fas fa-credit-card ml-2"></i>
            {{ $t('cartPage.checkout') }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- Empty Cart -->
    <div v-else class="text-center py-12">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-shopping-cart text-gray-400 text-3xl"></i>
      </div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">{{ $t('cartPage.emptyCart') }}</h3>
      <p class="text-gray-500 mb-6">
        {{ $t('cartPage.emptyCartMessage') }}
      </p>
      <router-link to="/products" class="btn-primary">
        <i class="fas fa-shopping-bag ml-2"></i>
        {{ $t('cartPage.startShopping') }}
      </router-link>
    </div>

    <!-- Recommended Products -->
    <section v-if="cartStore.hasItems" class="mt-12">
      <h2 class="text-2xl font-bold text-dark mb-6">{{ $t('sections.newProducts') }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProductCard
          v-for="product in recommendedProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </section>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useCartStore } from '../stores/cart'
import { useProductStore } from '../stores/product'
import ProductCard from '../components/ProductCard.vue'

export default {
  name: 'Cart',
  components: {
    ProductCard
  },
  setup() {
    const cartStore = useCartStore()
    const productStore = useProductStore()

    const recommendedProducts = computed(() => {
      // Get products that are not in cart
      const cartProductIds = cartStore.items.map(item => item.id)
      return productStore.products
        .filter(product => !cartProductIds.includes(product.id))
        .slice(0, 4)
    })

    const formatPrice = (price) => {
      return price.toLocaleString('ar-DZ')
    }

    const updateQuantity = async (productId, quantity) => {
      await cartStore.updateQuantity(productId, quantity)
    }

    const removeItem = async (productId) => {
      await cartStore.removeFromCart(productId)
    }

    const handleImageError = (event) => {
      // Hide the image if it fails to load
      event.target.style.display = 'none'
    }

    // Fetch cart and products on component mount
    onMounted(async () => {
      await Promise.all([
        cartStore.fetchCart(),
        productStore.fetchProducts()
      ])
    })

    return {
      cartStore,
      recommendedProducts,
      formatPrice,
      updateQuantity,
      removeItem,
      handleImageError
    }
  }
}
</script> 