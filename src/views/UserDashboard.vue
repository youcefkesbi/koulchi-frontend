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
      
      <router-link
        to="/myannouncements/new"
        class="btn-primary inline-flex items-center no-underline"
      >
        <i class="fas fa-plus ml-2"></i>
        {{ $t('announcement.postAnnouncement') }}
      </router-link>
    </div>

    <!-- Dashboard Tabs -->
    <div class="bg-white rounded-2xl shadow-soft p-1">
      <div class="flex space-x-1">
        <button
          @click="activeTab = 'buying'"
          :class="[
            'flex-1 px-6 py-4 text-sm font-medium rounded-xl transition-all duration-200',
            activeTab === 'buying'
              ? 'bg-primary text-white shadow-soft'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          ]"
        >
          <i class="fas fa-shopping-cart mr-3"></i>
          {{ $t('dashboard.buyingSection') }}
        </button>
        <button
          @click="activeTab = 'selling'"
          :class="[
            'flex-1 px-6 py-4 text-sm font-medium rounded-xl transition-all duration-200',
            activeTab === 'selling'
              ? 'bg-primary text-white shadow-soft'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          ]"
        >
          <i class="fas fa-store mr-3"></i>
          {{ $t('dashboard.sellingSection') }}
        </button>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div class="bg-white rounded-2xl shadow-soft p-8">
      <!-- Buying View -->
      <div v-if="activeTab === 'buying'" class="space-y-8">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-dark mb-2">
            {{ $t('dashboard.buyingSection') }}
          </h2>
          <p class="text-gray-600">{{ $t('dashboard.buyingDescription') }}</p>
        </div>

        <!-- Active Orders -->
        <div class="border-b border-gray-200 pb-8">
          <h3 class="text-xl font-semibold text-gray-800 mb-6">{{ $t('dashboard.activeOrders') }}</h3>
          <div v-if="orders.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="order in orders" :key="order.id" class="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div class="flex justify-between items-center mb-3">
                <span class="text-lg font-semibold text-gray-800">Order #{{ order.id }}</span>
                <span class="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">{{ order.status }}</span>
              </div>
              <div class="text-sm text-gray-600">
                <p class="mb-2">{{ order.date }}</p>
                <p class="font-medium">{{ order.total }} دج</p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12 text-gray-500">
            <i class="fas fa-shopping-bag text-5xl mb-4 text-gray-300"></i>
            <h4 class="text-lg font-semibold text-gray-600 mb-2">{{ $t('dashboard.noOrders') }}</h4>
            <p class="text-gray-500">{{ $t('dashboard.noOrdersMessage') }}</p>
          </div>
        </div>

        <!-- Wishlist -->
        <div>
          <h3 class="text-xl font-semibold text-gray-800 mb-6">{{ $t('dashboard.wishlist') }}</h3>
          <div v-if="wishlist.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="item in wishlist" :key="item.id" class="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div class="flex justify-between items-center mb-3">
                <span class="text-lg font-semibold text-gray-800">{{ item.name }}</span>
                <span class="text-2xl font-bold text-primary">{{ formatPrice(item.price) }} دج</span>
              </div>
              <div class="text-sm text-gray-600">
                <p class="mb-2">{{ item.store }}</p>
                <p class="text-xs text-gray-500">{{ item.addedDate }}</p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12 text-gray-500">
            <i class="fas fa-heart text-5xl mb-4 text-gray-300"></i>
            <h4 class="text-lg font-semibold text-gray-600 mb-2">{{ $t('dashboard.noWishlist') }}</h4>
            <p class="text-gray-500">{{ $t('dashboard.noWishlistMessage') }}</p>
          </div>
        </div>
      </div>

      <!-- Selling View -->
      <div v-else-if="activeTab === 'selling'" class="space-y-8">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 class="text-2xl font-bold text-dark mb-2">
              {{ $t('dashboard.sellingSection') }}
            </h2>
            <p class="text-gray-600">{{ $t('dashboard.sellingDescription') }}</p>
          </div>
          
          <router-link
            to="/dashboard/store/create"
            class="btn-primary inline-flex items-center no-underline mt-4 md:mt-0"
          >
            <i class="fas fa-plus mr-2"></i>
            {{ $t('stores.createStore') }}
          </router-link>
        </div>

        <!-- Store Management Section -->
        <div class="border-b border-gray-200 pb-8">
          <StoreManagement />
        </div>

        <!-- Current Listings -->
        <div class="border-b border-gray-200 pb-8">
          <h3 class="text-xl font-semibold text-gray-800 mb-6">{{ $t('dashboard.currentListings') }}</h3>
          <div v-if="sellerStore.products.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="product in sellerStore.products.slice(0, 6)" :key="product.id" class="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div class="flex justify-between items-center mb-3">
                <span class="text-lg font-semibold text-gray-800">{{ product.name_ar || product.name }}</span>
                <span class="text-2xl font-bold text-primary">{{ formatPrice(product.price) }} دج</span>
              </div>
              <div class="text-sm text-gray-600">
                <p class="mb-2">{{ product.category?.name || 'No Category' }}</p>
                <p class="text-xs text-gray-500">{{ product.store?.name || 'Profile Product' }}</p>
              </div>
            </div>
            <div v-if="sellerStore.products.length > 6" class="col-span-full text-center">
              <router-link to="/dashboard/listings" class="text-primary text-lg hover:underline font-medium">
                {{ $t('sections.viewAll') }} ({{ sellerStore.totalProducts }})
              </router-link>
            </div>
          </div>
          <div v-else class="text-center py-12 text-gray-500">
            <i class="fas fa-box text-5xl mb-4 text-gray-300"></i>
            <h4 class="text-lg font-semibold text-gray-600 mb-2">{{ $t('dashboard.noListings') }}</h4>
            <p class="text-gray-500 mb-6">{{ $t('dashboard.noListingsMessage') }}</p>
            <router-link
              to="/myannouncements/new"
              class="btn-primary inline-block"
            >
              {{ $t('dashboard.postFirstAnnouncement') }}
            </router-link>
          </div>
        </div>

        <!-- Pending Shipments -->
        <div class="border-b border-gray-200 pb-8">
          <h3 class="text-xl font-semibold text-gray-800 mb-6">{{ $t('dashboard.pendingShipments') }}</h3>
          <div v-if="pendingShipments.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="shipment in pendingShipments" :key="shipment.id" class="p-6 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors">
              <div class="flex justify-between items-center mb-3">
                <span class="text-lg font-semibold text-gray-800">{{ shipment.product_name }}</span>
                <span class="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">{{ shipment.status }}</span>
              </div>
              <div class="text-sm text-gray-600">
                <p class="mb-2">{{ shipment.customer }}</p>
                <p class="text-xs text-gray-500">{{ shipment.date }}</p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            <p class="text-gray-500">{{ $t('dashboard.noPendingShipments') }}</p>
          </div>
        </div>

        <!-- Sales Statistics -->
        <div>
          <h3 class="text-xl font-semibold text-gray-800 mb-6">{{ $t('dashboard.salesStatistics') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center p-6 bg-blue-50 rounded-xl">
              <div class="text-3xl font-bold text-blue-600 mb-2">{{ sellerStore.totalProducts }}</div>
              <div class="text-sm text-blue-600 font-medium">{{ $t('seller.totalProducts') }}</div>
            </div>
            <div class="text-center p-6 bg-green-50 rounded-xl">
              <div class="text-3xl font-bold text-green-600 mb-2">{{ sellerStore.activeProducts.length }}</div>
              <div class="text-sm text-green-600 font-medium">{{ $t('seller.activeProducts') }}</div>
            </div>
            <div class="text-center p-6 bg-purple-50 rounded-xl">
              <div class="text-3xl font-bold text-purple-600 mb-2">{{ storeStore.userTotalStores }}</div>
              <div class="text-sm text-purple-600 font-medium">{{ $t('stores.totalStores') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useSellerStore } from '../stores/seller'
import { useStoreStore } from '../stores/store'
import StoreManagement from '../components/StoreManagement.vue'

export default {
  name: 'UserDashboard',
  components: {
    StoreManagement
  },
  setup() {
    const authStore = useAuthStore()
    const sellerStore = useSellerStore()
    const storeStore = useStoreStore()
    
    const activeTab = ref('buying')
    
    // Mock data for now - these would come from actual Supabase calls
    const orders = ref([
      { id: 'ORD001', status: 'Processing', date: '2025-01-15', total: '2,500' },
      { id: 'ORD002', status: 'Shipped', date: '2025-01-14', total: '1,800' }
    ])
    const wishlist = ref([
      { id: 1, name: 'Smartphone', price: 45000, store: 'Tech Store', addedDate: '2025-01-10' },
      { id: 2, name: 'Laptop', price: 120000, store: 'Electronics Hub', addedDate: '2025-01-08' }
    ])
    const pendingShipments = ref([
      { id: 1, product_name: 'Gaming Mouse', customer: 'Ahmed B.', status: 'Ready to Ship', date: '2025-01-16' },
      { id: 2, product_name: 'Wireless Headphones', customer: 'Fatima K.', status: 'Packaging', date: '2025-01-15' }
    ])

    const formatPrice = (price) => {
      return price.toLocaleString('ar-DZ')
    }

    onMounted(async () => {
      await Promise.all([
        sellerStore.fetchSellerProducts(),
        storeStore.fetchUserStores()
      ])
    })

    return {
      authStore,
      sellerStore,
      storeStore,
      activeTab,
      orders,
      wishlist,
      pendingShipments,
      formatPrice
    }
  }
}
</script>

<style scoped>
.btn-primary {
  @apply px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors;
}
</style> 