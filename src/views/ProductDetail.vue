<template>
  <div v-if="product" class="space-y-8">
    <!-- Breadcrumb -->
    <nav class="text-sm text-gray-600">
      <router-link to="/" class="hover:text-primary">الرئيسية</router-link>
      <span class="mx-2">/</span>
      <router-link to="/products" class="hover:text-primary">المنتجات</router-link>
      <span class="mx-2">/</span>
      <span class="text-dark">{{ product.nameAr }}</span>
    </nav>

    <!-- Product Details -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Product Images -->
      <div class="space-y-4">
        <div class="relative overflow-hidden rounded-lg">
          <img 
            :src="product.image" 
            :alt="product.name"
            class="w-full h-96 object-cover"
          />
          
          <!-- Badges -->
          <div class="absolute top-4 right-4 flex flex-col space-y-2">
            <span v-if="product.isNew" class="badge badge-new">
              جديد
            </span>
            <span v-if="product.isOnSale" class="badge badge-sale">
              تخفيض {{ getDiscountPercentage }}%
            </span>
          </div>
          
          <!-- COD Badge -->
          <div class="absolute top-4 left-4">
            <span class="badge badge-cod">
              <i class="fas fa-money-bill-wave ml-1"></i>
              دفع عند الاستلام
            </span>
          </div>
        </div>
      </div>

      <!-- Product Info -->
      <div class="space-y-6">
        <!-- Title and Rating -->
        <div>
          <h1 class="text-3xl font-bold text-dark mb-2">{{ product.nameAr }}</h1>
          <p class="text-lg text-gray-600 mb-4">{{ product.name }}</p>
          
          <div class="flex items-center space-x-4 space-x-reverse mb-4">
            <div class="flex items-center">
              <i class="fas fa-star text-yellow-400"></i>
              <span class="text-gray-700 mr-1">{{ product.rating }}</span>
            </div>
            <span class="text-gray-500">({{ product.reviews }} تقييم)</span>
            <span v-if="product.inStock" class="text-green-600 font-semibold">
              <i class="fas fa-check-circle ml-1"></i>
              متوفر
            </span>
            <span v-else class="text-red-600 font-semibold">
              <i class="fas fa-times-circle ml-1"></i>
              غير متوفر
            </span>
          </div>
        </div>

        <!-- Price -->
        <div class="space-y-2">
          <div class="flex items-center space-x-4 space-x-reverse">
            <span class="text-3xl font-bold text-primary">
              {{ formatPrice(product.price) }} دج
            </span>
            <span v-if="product.originalPrice > product.price" class="text-xl text-gray-500 line-through">
              {{ formatPrice(product.originalPrice) }} دج
            </span>
          </div>
          <!-- <p class="text-sm text-gray-600">
            السعر يشمل الضريبة على القيمة المضافة
          </p> -->
        </div>

        <!-- Description -->
        <div>
          <h3 class="text-lg font-semibold mb-2">الوصف</h3>
          <p class="text-gray-700 leading-relaxed">{{ product.descriptionAr }}</p>
        </div>

        <!-- Features -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="font-semibold mb-3">مميزات المنتج</h3>
          <ul class="space-y-2">
            <li class="flex items-center space-x-2 space-x-reverse">
              <i class="fas fa-check text-green-500"></i>
              <span>دفع آمن عند الاستلام</span>
            </li>
            <li class="flex items-center space-x-2 space-x-reverse">
              <i class="fas fa-check text-green-500"></i>
              <span>توصيل سريع في جميع أنحاء الجزائر</span>
            </li>
            <li class="flex items-center space-x-2 space-x-reverse">
              <i class="fas fa-check text-green-500"></i>
              <span>ضمان الجودة والأصلية</span>
            </li>
            <li class="flex items-center space-x-2 space-x-reverse">
              <i class="fas fa-check text-green-500"></i>
              <span>إمكانية الإرجاع خلال 14 يوم</span>
            </li>
          </ul>
        </div>

        <!-- Add to Cart -->
        <div class="space-y-4">
          <div class="flex items-center space-x-4 space-x-reverse">
            <label class="font-semibold">الكمية:</label>
            <div class="flex items-center border border-gray-300 rounded-lg">
              <button
                @click="decreaseQuantity"
                class="px-3 py-2 hover:bg-gray-100 transition-colors"
                :disabled="quantity <= 1"
              >
                <i class="fas fa-minus"></i>
              </button>
              <span class="px-4 py-2 border-x border-gray-300">{{ quantity }}</span>
              <button
                @click="increaseQuantity"
                class="px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>

          <div class="flex space-x-4 space-x-reverse">
            <button
              @click="addToCart"
              class="flex-1 btn-primary text-lg py-4"
              :disabled="!product.inStock"
            >
              <i class="fas fa-shopping-cart ml-2"></i>
              {{ product.inStock ? 'أضف للسلة' : 'غير متوفر' }}
            </button>
            <button class="btn-outline text-lg py-4 px-6">
              <i class="fas fa-heart"></i>
            </button>
          </div>
        </div>

        <!-- COD Info -->
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-start space-x-3 space-x-reverse">
            <i class="fas fa-money-bill-wave text-green-600 text-xl mt-1"></i>
            <div>
              <h4 class="font-semibold text-green-800 mb-1">دفع عند الاستلام</h4>
              <p class="text-green-700 text-sm">
                ادفع عند استلام طلبك وفحصه. لا تدفع شيئاً مقدماً!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Related Products -->
    <section class="mt-12">
      <h2 class="text-2xl font-bold text-dark mb-6">منتجات مشابهة</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProductCard
          v-for="relatedProduct in relatedProducts"
          :key="relatedProduct.id"
          :product="relatedProduct"
        />
      </div>
    </section>
  </div>

  <!-- Loading State -->
  <div v-else class="text-center py-12">
    <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
    <p class="text-gray-600">جاري تحميل المنتج...</p>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '../stores/products'
import { useCartStore } from '../stores/cart'
import ProductCard from '../components/ProductCard.vue'

export default {
  name: 'ProductDetail',
  components: {
    ProductCard
  },
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const route = useRoute()
    const productsStore = useProductsStore()
    const cartStore = useCartStore()
    const quantity = ref(1)

    const product = computed(() => {
      const productId = parseInt(props.id)
      return productsStore.getProductById(productId)
    })

    const relatedProducts = computed(() => {
      if (!product.value) return []
      return productsStore.products
        .filter(p => p.category === product.value.category && p.id !== product.value.id)
        .slice(0, 4)
    })

    const getDiscountPercentage = computed(() => {
      if (!product.value || product.value.originalPrice <= product.value.price) return 0
      return Math.round(((product.value.originalPrice - product.value.price) / product.value.originalPrice) * 100)
    })

    const formatPrice = (price) => {
      return price.toLocaleString('ar-DZ')
    }

    const increaseQuantity = () => {
      quantity.value++
    }

    const decreaseQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--
      }
    }

    const addToCart = () => {
      if (product.value && product.value.inStock) {
        // Add multiple quantities
        for (let i = 0; i < quantity.value; i++) {
          cartStore.addToCart(product.value)
        }
        quantity.value = 1
      }
    }

    onMounted(() => {
      // Update page title
      if (product.value) {
        document.title = `${product.value.nameAr} - كولشي`
      }
    })

    return {
      product,
      relatedProducts,
      quantity,
      getDiscountPercentage,
      formatPrice,
      increaseQuantity,
      decreaseQuantity,
      addToCart
    }
  }
}
</script> 