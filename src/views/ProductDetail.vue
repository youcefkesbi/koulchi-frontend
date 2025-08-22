<template>
  <div v-if="product" class="space-y-8">
    <!-- Breadcrumb -->
    <nav class="text-sm text-gray-600">
      <router-link to="/" class="hover:text-primary">الرئيسية</router-link>
      <span class="mx-2">/</span>
      <router-link to="/products" class="hover:text-primary">المنتجات</router-link>
      <span class="mx-2">/</span>
      <span class="text-dark">{{ product.name || product.nameAr }}</span>
    </nav>

    <!-- Product Details -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Product Images -->
      <div class="space-y-4">
        <!-- Main Image -->
        <div class="relative overflow-hidden rounded-lg">
          <img 
            :src="mainImage" 
            :alt="product.name || product.nameAr"
            class="w-full h-96 object-cover"
          />
          
          <!-- Image Navigation -->
          <div v-if="product.image_urls && product.image_urls.length > 1" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <button
              v-for="(image, index) in product.image_urls"
              :key="index"
              @click="currentImageIndex = index"
              :class="[
                'w-3 h-3 rounded-full transition-colors',
                currentImageIndex === index ? 'bg-white' : 'bg-white/50'
              ]"
            ></button>
          </div>
          
          <!-- Previous/Next Buttons -->
          <div v-if="product.image_urls && product.image_urls.length > 1" class="absolute inset-0 flex items-center justify-between p-4">
            <button
              @click="previousImage"
              class="bg-white/80 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
            <button
              @click="nextImage"
              class="bg-white/80 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
          </div>
          
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
        <!-- Title and Stock Status -->
        <div>
          <h1 class="text-3xl font-bold text-dark mb-2">{{ product.name || product.nameAr }}</h1>
          
          <div class="flex items-center space-x-4 space-x-reverse mb-4">
            <div class="flex items-center">
              <i class="fas fa-box text-primary"></i>
              <span class="text-gray-700 mr-1">{{ product.stock_quantity || 0 }}</span>
            </div>
            <span class="text-gray-500">متوفر</span>
            <span v-if="(product.stock_quantity || 0) > 0" class="text-green-600 font-semibold">
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
          </div>
        </div>

        <!-- Description -->
        <div>
          <h3 class="text-lg font-semibold mb-2">الوصف</h3>
          <p class="text-gray-700 leading-relaxed">{{ product.description || 'لا يوجد وصف متاح' }}</p>
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
              <span>اكتشف المزيد، ادفع أقل</span>
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
              :disabled="(product.stock_quantity || 0) <= 0"
            >
              <i class="fas fa-shopping-cart ml-2"></i>
              {{ (product.stock_quantity || 0) > 0 ? 'أضف للسلة' : 'غير متوفر' }}
            </button>
            <button 
              @click="toggleWishlist"
              class="btn-outline text-lg py-4 px-6"
              :class="{ 'text-red-500 border-red-300': isInWishlist }"
              :title="isInWishlist ? 'إزالة من قائمة الأمنيات' : 'إضافة لقائمة الأمنيات'"
            >
              <i class="fas fa-heart" :class="{ 'text-red-500': isInWishlist }"></i>
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
  <div v-else-if="loading" class="text-center py-12">
    <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
    <p class="text-gray-600">جاري تحميل المنتج...</p>
  </div>

  <!-- Error State -->
  <div v-else-if="error" class="text-center py-12">
    <div class="text-red-600 mb-4">
      <i class="fas fa-exclamation-triangle text-4xl"></i>
    </div>
    <p class="text-gray-600 mb-4">{{ error }}</p>
    <router-link to="/products" class="btn-primary">
      العودة للمنتجات
    </router-link>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '../stores/product'
import { useCartStore } from '../stores/cart'
import { useWishlistStore } from '../stores/wishlist'
import ProductCard from '../components/ProductCard.vue'

export default {
  name: 'ProductDetail',
  components: {
    ProductCard
  },
  setup() {
    const route = useRoute()
    const productStore = useProductStore()
    const cartStore = useCartStore()
    const wishlistStore = useWishlistStore()
    const quantity = ref(1)
    const product = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const currentImageIndex = ref(0)

    const mainImage = computed(() => {
      if (!product.value) return ''
      if (product.value.image_urls && product.value.image_urls.length > 0) {
        return product.value.image_urls[currentImageIndex.value] || product.value.image_urls[0]
      }
      return product.value.image || ''
    })

    const relatedProducts = computed(() => {
      if (!product.value) return []
      return productStore.products
        .filter(p => p.category_id === product.value.category_id && p.id !== product.value.id)
        .slice(0, 4)
    })

    const getDiscountPercentage = computed(() => {
      // Since we removed original_price, we'll return 0 for now
      return 0
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

    const nextImage = () => {
      if (product.value && product.value.image_urls && product.value.image_urls.length > 1) {
        currentImageIndex.value = (currentImageIndex.value + 1) % product.value.image_urls.length
      }
    }

    const previousImage = () => {
      if (product.value && product.value.image_urls && product.value.image_urls.length > 1) {
        currentImageIndex.value = currentImageIndex.value === 0 
          ? product.value.image_urls.length - 1 
          : currentImageIndex.value - 1
      }
    }

    const addToCart = async () => {
      if (product.value && (product.value.stock_quantity || 0) > 0) {
        // Add multiple quantities
        for (let i = 0; i < quantity.value; i++) {
          await cartStore.addToCart(product.value)
        }
        quantity.value = 1
      }
    }

    const isInWishlist = computed(() => {
      if (!product.value) return false
      return wishlistStore.isInWishlist(product.value.id)
    })

    const toggleWishlist = async () => {
      if (!product.value) return
      
      try {
        if (isInWishlist.value) {
          await wishlistStore.removeProductFromWishlist(product.value.id)
        } else {
          await wishlistStore.addToWishlist(product.value.id)
        }
      } catch (error) {
        console.error('Failed to toggle wishlist:', error)
      }
    }

    const fetchProduct = async () => {
      try {
        loading.value = true
        error.value = null
        
        const productId = route.params.id
        
        if (!productId) {
          error.value = 'Invalid product ID'
          loading.value = false
          return
        }
        
        // Basic validation that the ID looks like a UUID
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(productId)) {
          error.value = `Invalid product ID format: ${productId}. Please check the URL.`
          loading.value = false
          return
        }
        
        const fetchedProduct = await productStore.fetchProductById(productId)
        
        if (fetchedProduct) {
          product.value = fetchedProduct
          // Update page title
          document.title = `${fetchedProduct.name || fetchedProduct.nameAr} - كولشي`
        } else {
          error.value = 'Product not found'
        }
      } catch (err) {
        error.value = err.message || 'Failed to fetch product'
      } finally {
        loading.value = false
      }
    }

    // Watch for route changes to reload product when navigating between products
    watch(() => route.params.id, (newId) => {
      if (newId) {
        fetchProduct()
      }
    })

    onMounted(async () => {
      await fetchProduct()
      
      // Fetch wishlist if user is authenticated
      if (wishlistStore.wishlistItems.length === 0) {
        try {
          await wishlistStore.fetchWishlist()
        } catch (error) {
          // User might not be authenticated, which is fine
        }
      }
    })

    return {
      product,
      mainImage,
      currentImageIndex,
      relatedProducts,
      quantity,
      loading,
      error,
      getDiscountPercentage,
      formatPrice,
      increaseQuantity,
      decreaseQuantity,
      nextImage,
      previousImage,
      addToCart,
      isInWishlist,
      toggleWishlist
    }
  }
}
</script> 