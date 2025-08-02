<template>
  <div class="space-y-8">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-dark">سلة التسوق</h1>
      <router-link to="/products" class="btn-outline">
        <i class="fas fa-arrow-left ml-2"></i>
        متابعة التسوق
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
            :src="item.image" 
            :alt="item.name"
            class="w-20 h-20 object-cover rounded-lg"
          />
          
          <!-- Product Info -->
          <div class="flex-1">
            <h3 class="font-semibold text-lg">{{ item.nameAr }}</h3>
            <p class="text-gray-600 text-sm">{{ item.name }}</p>
            <div class="flex items-center space-x-4 space-x-reverse mt-2">
              <span class="text-lg font-bold text-primary">
                {{ formatPrice(item.price) }} دج
              </span>
              <span class="text-sm text-gray-500">
                لكل قطعة
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
              {{ formatPrice(item.price * item.quantity) }} دج
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
          <h2 class="text-xl font-bold text-dark mb-6">ملخص الطلب</h2>
          
          <!-- Summary Details -->
          <div class="space-y-4 mb-6">
            <div class="flex justify-between">
              <span class="text-gray-600">عدد المنتجات:</span>
              <span class="font-semibold">{{ cartStore.totalItems }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">المجموع الفرعي:</span>
              <span class="font-semibold">{{ formatPrice(cartStore.subtotal) }} دج</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">رسوم التوصيل:</span>
              <span class="font-semibold">{{ formatPrice(cartStore.deliveryFee) }} دج</span>
            </div>
            
            <div class="border-t pt-4">
              <div class="flex justify-between text-lg font-bold">
                <span>المجموع الكلي:</span>
                <span class="text-primary">{{ formatPrice(cartStore.total) }} دج</span>
              </div>
            </div>
          </div>

          <!-- COD Info -->
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div class="flex items-start space-x-3 space-x-reverse">
              <i class="fas fa-money-bill-wave text-green-600 text-xl mt-1"></i>
              <div>
                <h4 class="font-semibold text-green-800 mb-1">دفع عند الاستلام</h4>
                <p class="text-green-700 text-sm">
                  ادفع {{ formatPrice(cartStore.total) }} دج عند استلام طلبك
                </p>
              </div>
            </div>
          </div>

          <!-- Free Shipping Info -->
          <div v-if="cartStore.subtotal >= 5000" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div class="flex items-center space-x-2 space-x-reverse">
              <i class="fas fa-truck text-blue-600"></i>
              <span class="text-blue-800 font-semibold">توصيل مجاني!</span>
            </div>
          </div>

          <!-- Checkout Button -->
          <router-link
            to="/checkout"
            class="btn-primary w-full text-center text-lg py-4"
          >
            <i class="fas fa-credit-card ml-2"></i>
            إتمام الطلب
          </router-link>
        </div>
      </div>
    </div>

    <!-- Empty Cart -->
    <div v-else class="text-center py-12">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-shopping-cart text-gray-400 text-3xl"></i>
      </div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">سلة التسوق فارغة</h3>
      <p class="text-gray-500 mb-6">
        لم تقم بإضافة أي منتجات إلى سلة التسوق بعد
      </p>
      <router-link to="/products" class="btn-primary">
        <i class="fas fa-shopping-bag ml-2"></i>
        ابدأ التسوق
      </router-link>
    </div>

    <!-- Recommended Products -->
    <section v-if="cartStore.hasItems" class="mt-12">
      <h2 class="text-2xl font-bold text-dark mb-6">منتجات مقترحة</h2>
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
import { computed } from 'vue'
import { useCartStore } from '../stores/cart'
import { useProductsStore } from '../stores/products'
import ProductCard from '../components/ProductCard.vue'

export default {
  name: 'Cart',
  components: {
    ProductCard
  },
  setup() {
    const cartStore = useCartStore()
    const productsStore = useProductsStore()

    const recommendedProducts = computed(() => {
      // Get products that are not in cart
      const cartProductIds = cartStore.items.map(item => item.id)
      return productsStore.products
        .filter(product => !cartProductIds.includes(product.id))
        .slice(0, 4)
    })

    const formatPrice = (price) => {
      return price.toLocaleString('ar-DZ')
    }

    const updateQuantity = (productId, quantity) => {
      cartStore.updateQuantity(productId, quantity)
    }

    const removeItem = (productId) => {
      cartStore.removeFromCart(productId)
    }

    return {
      cartStore,
      recommendedProducts,
      formatPrice,
      updateQuantity,
      removeItem
    }
  }
}
</script> 