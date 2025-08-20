<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
      <div>
        <h1 class="text-3xl font-bold text-dark">
          {{ authStore.isAdmin ? $t('dashboard.adminDashboard') : $t('dashboard.userDashboard') }}
        </h1>
        <p class="text-gray-600 mt-2">
          {{ $t('dashboard.welcomeMessage', { name: authStore.userDisplayName }) }}
          <span v-if="authStore.isAdmin" class="text-primary font-semibold">(Admin)</span>
          <span v-else class="text-gray-500 text-sm">(Role: {{ authStore.userRole }})</span>
          
          <!-- Debug button for development -->
          <button 
            @click="authStore.debugUserRole()"
            class="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
            title="Debug user role (dev only)"
          >
            Debug Role
          </button>
        </p>
      </div>
      
      <button
        v-if="!authStore.isAdmin"
        @click="showPostAnnouncementModal = true"
        class="btn-primary"
      >
        <i class="fas fa-plus ml-2"></i>
        {{ $t('announcement.postAnnouncement') }}
      </button>
    </div>

    <!-- Admin Dashboard -->
    <div v-if="authStore.isAdmin" class="space-y-8">
      <!-- Admin Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl shadow-soft p-6 border-l-4 border-blue-500">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-full">
              <i class="fas fa-users text-2xl text-blue-600"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">{{ $t('dashboard.totalUsers') }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ adminStats.totalUsers }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-soft p-6 border-l-4 border-green-500">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-full">
              <i class="fas fa-box text-2xl text-green-600"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">{{ $t('dashboard.totalProducts') }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ adminStats.totalProducts }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-soft p-6 border-l-4 border-purple-500">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 rounded-full">
              <i class="fas fa-shopping-cart text-2xl text-purple-600"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">{{ $t('dashboard.totalOrders') }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ adminStats.totalOrders }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl shadow-soft p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('dashboard.quickActions') }}</h3>
          <div class="space-y-3">
            <button @click="showUserManagement = true" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <i class="fas fa-users-cog mr-3 text-blue-600"></i>
              {{ $t('dashboard.manageUsers') }}
            </button>
            <button @click="showProductManagement = true" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <i class="fas fa-boxes mr-3 text-green-600"></i>
              {{ $t('dashboard.manageProducts') }}
            </button>
            <button @click="showOrderManagement = true" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <i class="fas fa-clipboard-list mr-3 text-purple-600"></i>
              {{ $t('dashboard.manageOrders') }}
            </button>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-soft p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('dashboard.recentActivity') }}</h3>
          <div class="space-y-3">
            <div v-for="activity in recentActivity" :key="activity.id" class="flex items-center p-3 rounded-lg bg-gray-50">
              <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div class="flex-1">
                <p class="text-sm text-gray-900">{{ activity.description }}</p>
                <p class="text-xs text-gray-500">{{ formatTime(activity.timestamp) }}</p>
              </div>
            </div>
            <div v-if="recentActivity.length === 0" class="text-center py-4 text-gray-500">
              <p class="text-sm">{{ $t('dashboard.noRecentActivity') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Sections -->
    <div v-if="!authStore.isAdmin" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
import { supabase } from '../lib/supabase'
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
    
    // Admin state
    const showUserManagement = ref(false)
    const showProductManagement = ref(false)
    const showOrderManagement = ref(false)
    
    // Admin statistics
    const adminStats = ref({
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0
    })
    
    // Recent activity
    const recentActivity = ref([])
    
    // Mock data for now - these would come from actual Supabase calls
    const orders = ref([])
    const wishlist = ref([])
    const pendingShipments = ref([])

    const formatPrice = (price) => {
      return price.toLocaleString('ar-DZ')
    }

    const formatTime = (timestamp) => {
      if (!timestamp) return 'Just now'
      const date = new Date(timestamp)
      const now = new Date()
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      
      if (diffInMinutes < 1) return 'Just now'
      if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
      return date.toLocaleDateString()
    }

    const onAnnouncementPosted = () => {
      // Refresh the seller products
      sellerStore.fetchSellerProducts()
    }

    // Fetch admin statistics
    const fetchAdminStats = async () => {
      if (!authStore.isAdmin) return
      
      try {
        // Fetch total users
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
        
        // Fetch total products
        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
        
        // For now, set orders to 0 (orders table doesn't exist yet)
        const orderCount = 0
        
        adminStats.value = {
          totalUsers: userCount || 0,
          totalProducts: productCount || 0,
          totalOrders: orderCount
        }
        
        // Mock recent activity
        recentActivity.value = [
          {
            id: 1,
            description: 'New user registered',
            timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
          },
          {
            id: 2,
            description: 'Product added to catalog',
            timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
          }
        ]
      } catch (error) {
        console.error('Error fetching admin stats:', error)
      }
    }

    onMounted(async () => {
      await sellerStore.fetchSellerProducts()
      
      // Debug: Log user role and admin status
      console.log('Dashboard mounted - User role check:', {
        userId: authStore.user?.id,
        userRole: authStore.userRole,
        isAdmin: authStore.isAdmin,
        user: authStore.user
      })
      
      // Fetch admin data if user is admin
      if (authStore.isAdmin) {
        console.log('User is admin, fetching admin stats...')
        await fetchAdminStats()
      } else {
        console.log('User is not admin, showing regular dashboard')
      }
      
      // Here you would also fetch orders, wishlist, and pending shipments data
    })

    return {
      authStore,
      sellerStore,
      showPostAnnouncementModal,
      showUserManagement,
      showProductManagement,
      showOrderManagement,
      adminStats,
      recentActivity,
      orders,
      wishlist,
      pendingShipments,
      formatPrice,
      formatTime,
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