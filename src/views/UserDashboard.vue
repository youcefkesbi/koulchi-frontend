<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
      <div>
        <h1 class="text-3xl font-bold text-dark">
          {{ $t('dashboard.userDashboard') }}
        </h1>
        <p class="text-gray-600 mt-2">
          {{ $t('dashboard.welcomeMessage', { name: authStore.userDisplayName }) }}
          <span class="text-gray-500 text-sm">(Role: {{ authStore.userRole }})</span>
        </p>
      </div>
      
      <button
        @click="showPostAnnouncementModal = true"
        class="btn-primary"
      >
        <i class="fas fa-plus ml-2"></i>
        {{ $t('announcement.postAnnouncement') }}
      </button>
    </div>

    <!-- Dashboard Sections -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Buying Section -->
      <div class="card">
        <h2 class="text-xl font-bold text-dark mb-6 flex items-center">
          <i class="fas fa-shopping-cart mr-3 text-primary"></i>
          {{ $t('dashboard.buyingSection') }}
        </h2>
        
        <!-- Active Orders -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('dashboard.activeOrders') }}</h3>
          <div v-if="orders.length > 0" class="space-y-3">
            <div v-for="order in orders" :key="order.id" class="p-3 bg-gray-50 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium">Order #{{ order.id }}</span>
                <span class="text-xs text-gray-500">{{ order.status }}</span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-shopping-bag text-3xl mb-3"></i>
            <p>{{ $t('dashboard.noOrders') }}</p>
            <p class="text-sm">{{ $t('dashboard.noOrdersMessage') }}</p>
          </div>
        </div>

        <!-- Wishlist -->
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('dashboard.wishlist') }}</h3>
          <div v-if="wishlist.length > 0" class="space-y-3">
            <div v-for="item in wishlist" :key="item.id" class="p-3 bg-gray-50 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium">{{ item.name }}</span>
                <span class="text-xs text-gray-500">{{ formatPrice(item.price) }} دج</span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-heart text-3xl mb-3"></i>
            <p>{{ $t('dashboard.noWishlist') }}</p>
            <p class="text-sm">{{ $t('dashboard.noWishlistMessage') }}</p>
          </div>
        </div>
      </div>

      <!-- Selling Section -->
      <div class="card">
        <h2 class="text-xl font-bold text-dark mb-6 flex items-center">
          <i class="fas fa-store mr-3 text-primary"></i>
          {{ $t('dashboard.sellingSection') }}
        </h2>
        
        <!-- Current Listings -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('dashboard.currentListings') }}</h3>
          <div v-if="sellerStore.products.length > 0" class="space-y-3">
            <div v-for="product in sellerStore.products.slice(0, 3)" :key="product.id" class="p-3 bg-gray-50 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium">{{ product.name_ar || product.name }}</span>
                <span class="text-xs text-gray-500">{{ formatPrice(product.price) }} دج</span>
              </div>
            </div>
            <div v-if="sellerStore.products.length > 3" class="text-center">
              <router-link to="/dashboard/listings" class="text-primary text-sm hover:underline">
                {{ $t('sections.viewAll') }}
              </router-link>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-box text-3xl mb-3"></i>
            <p>{{ $t('dashboard.noListings') }}</p>
            <p class="text-sm">{{ $t('dashboard.noListingsMessage') }}</p>
            <button
              @click="showPostAnnouncementModal = true"
              class="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              {{ $t('dashboard.postFirstAnnouncement') }}
            </button>
          </div>
        </div>

        <!-- Pending Shipments -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('dashboard.pendingShipments') }}</h3>
          <div v-if="pendingShipments.length > 0" class="space-y-3">
            <div v-for="shipment in pendingShipments" :key="shipment.id" class="p-3 bg-yellow-50 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium">{{ shipment.product_name }}</span>
                <span class="text-xs text-yellow-600">{{ shipment.status }}</span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4 text-gray-500">
            <p class="text-sm">{{ $t('dashboard.noPendingShipments') }}</p>
          </div>
        </div>

        <!-- Simple Stats -->
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center p-3 bg-blue-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">{{ sellerStore.totalProducts }}</div>
            <div class="text-xs text-blue-600">{{ $t('seller.totalProducts') }}</div>
          </div>
          <div class="text-center p-3 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">{{ sellerStore.activeProducts.length }}</div>
            <div class="text-xs text-green-600">{{ $t('seller.activeProducts') }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Post Announcement Modal -->
    <PostAnnouncement
      :is-open="showPostAnnouncementModal"
      @close="showPostAnnouncementModal = false"
      @announcement-posted="onAnnouncementPosted"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useSellerStore } from '../stores/seller'
import PostAnnouncement from '../components/PostAnnouncement.vue'

export default {
  name: 'UserDashboard',
  components: {
    PostAnnouncement
  },
  setup() {
    const authStore = useAuthStore()
    const sellerStore = useSellerStore()
    const showPostAnnouncementModal = ref(false)
    
    // Mock data for now - these would come from actual Supabase calls
    const orders = ref([])
    const wishlist = ref([])
    const pendingShipments = ref([])

    const formatPrice = (price) => {
      return price.toLocaleString('ar-DZ')
    }

    const onAnnouncementPosted = () => {
      // Refresh the seller products
      sellerStore.fetchSellerProducts()
    }

    onMounted(async () => {
      await sellerStore.fetchSellerProducts()
      
      // Here you would also fetch orders, wishlist, and pending shipments data
    })

    return {
      authStore,
      sellerStore,
      showPostAnnouncementModal,
      orders,
      wishlist,
      pendingShipments,
      formatPrice,
      onAnnouncementPosted
    }
  }
}
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-md p-6;
}

.btn-primary {
  @apply px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors;
}
</style> 