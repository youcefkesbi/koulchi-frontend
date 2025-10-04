<template>
  <div class="min-h-screen bg-white overflow-hidden">
  <div 
  :class="packInfo.is_pro ? 'grid grid-cols-[1fr_1fr]' : 'block w-full'"
    >
    <!-- Dashboard stats -->
    <div :class="packInfo.is_pro ? 'grid grid-cols-2 gap-6 w-140 max-w-4xl h-60 p-6' : 'flex gap-4 w-full h-40 p-6'">
      <!-- Loading State for Statistics -->
        <div v-if="statsLoading" :class="packInfo.is_pro ? 'col-span-2 text-center py-8' : 'w-full text-center py-8'">
        <i class="fas fa-spinner fa-spin text-blue-600 text-2xl mb-2"></i>
        <p class="text-gray-600">{{ t('dashboard.stats.loadingStats') }}</p>
      </div>

      <!-- Statistics Cards -->
      <template v-else class="h-60">
        <!-- Total Orders Card -->
        <div :class="packInfo.is_pro ? 'bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500' : 'bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 flex-1'">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">{{ t('dashboard.stats.totalOrders') }}</p>
              <p class="text-3xl font-bold text-gray-900">{{ storeStatistics.totalOrders }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-full">
              <i class="fas fa-shopping-cart text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Total Products Card -->
        <div :class="packInfo.is_pro ? 'bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500' : 'bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 flex-1'">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">{{ t('dashboard.stats.totalProducts') }}</p>
              <p class="text-3xl font-bold text-gray-900">{{ storeStatistics.totalProducts }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-full">
              <i class="fas fa-box text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Total Sales Card -->
        <div :class="packInfo.is_pro ? 'bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500' : 'bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500 flex-1'">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">{{ t('dashboard.stats.totalSales') }}</p>
              <p class="text-3xl font-bold text-gray-900">{{ formatCurrency(storeStatistics.totalSales) }}</p>
            </div>
            <div class="p-3 bg-yellow-100 rounded-full">
              <i class="fas fa-coins text-yellow-600 text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Total Visitors Card -->
        <div :class="packInfo.is_pro ? 'bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500' : 'bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 flex-1'">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">{{ t('dashboard.stats.totalVisitors') }}</p>
              <p class="text-3xl font-bold text-gray-900">{{ storeStatistics.totalVisitors }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-full">
              <i class="fas fa-users text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>

        <!-- No Store Message -->
        <div v-if="!storeStatistics.storeId && !statsLoading" :class="packInfo.is_pro ? 'col-span-2 text-center py-8' : 'w-full text-center py-8'">
          <div class="bg-gray-50 rounded-lg p-6">
            <i class="fas fa-store text-gray-400 text-4xl mb-4"></i>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('dashboard.stats.noStoreFound') }}</h3>
            <p class="text-gray-600 mb-4">{{ t('dashboard.stats.noStoreMessage') }}</p>
            <router-link 
              to="/create-store" 
              class="btn-primary inline-block"
            >
              {{ t('dashboard.stats.createStore') }}
            </router-link>
          </div>
        </div>
        
      </template>
      </div>

      <!-- Line chart - Only show for Pro pack users -->
      <div v-if="packInfo.is_pro" class=" h-50 pt-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ t('dashboard.monthlySales') }}</h3>
        <div class="h-55">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>      
  </div>

    <!-- Orders tab + best selling products tab -->
    <div :class="packInfo.is_pro ? 'grid grid-cols-[1fr_1fr] px-4 mt-12 sm:px-6 lg:px-8 pb-8 gap-2' : 'flex px-4 mt-2 sm:px-6 lg:px-8 pb-8 gap-2'">
      <!-- Loading State -->
      <div v-if="statsLoading" class="text-center py-12">
        <i class="fas fa-spinner fa-spin text-blue-600 text-3xl mb-4"></i>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('common.loading') }}</h3>
        <p class="text-gray-600">{{ t('dashboard.loadingProfile') }}</p>
      </div>
      <!-- Manage orders -->
      <div :class="packInfo.is_pro ? 'relative bg-white rounded-lg shadow-md px-3 pb-6' : 'relative bg-white rounded-lg shadow-md px-3 pb-6 flex-1'">
        <div class="flex pb-2 items-center">
        <h3 
        class="ml-4 mt-3 text-lg font-semibold text-gray-800 mb-4">{{ t('dashboard.orders.title') }}</h3>
        
        <!-- Orders Filtering tab -->
        <div class="flex justify-center gap-4 absolute" :class="route.meta.locale === 'ar' ? 'left-8' : 'right-8'">
        <button 
          @click="setSortFilter('date')"
          :class="sortFilter === 'date' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
          class="w-32 rounded-md px-4 py-2 transition-colors text-center">
           <span>{{ t('dashboard.orders.filters.date') }}</span><span class="ml-1">{{ sortOrder === 'desc' ? '↓' : '↑' }}</span>
          
        </button>
        <button 
          @click="setSortFilter('quantity')"
          :class="sortFilter === 'quantity' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
          class="w-32 rounded-md px-4 py-2 transition-colors text-center">
          <span>{{ t('dashboard.orders.filters.quantity') }}</span><span class="ml-1">{{ sortOrder === 'desc' ? '↓' : '↑' }}</span>
        </button>
        <div class="relative">
          <select 
            @change="setStatusFilter($event.target.value)"
            :value="statusFilter"
            class="w-32 rounded-md px-4 py-2 transition-colors bg-gray-200 text-gray-700 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center">
            <option value="">{{ t('dashboard.orders.filters.allStatus') }}</option>
            <option value="pending">{{ t('dashboard.orders.filters.pending') }}</option>
            <option value="confirmed">{{ t('dashboard.orders.filters.confirmed') }}</option>
            <option value="shipped">{{ t('dashboard.orders.filters.shipped') }}</option>
            <option value="delivered">{{ t('dashboard.orders.filters.delivered') }}</option>
            <option value="cancelled">{{ t('dashboard.orders.filters.cancelled') }}</option>
          </select>
        </div>
        </div>
        </div>
        <!-- Loading State -->
        <div v-if="ordersStore.loading" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-blue-600 text-2xl mb-2"></i>
          <p class="text-gray-600">{{ t('dashboard.orders.loading') }}</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="ordersStore.error" class="text-center py-8">
          <i class="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
          <p class="text-red-600">{{ ordersStore.error }}</p>
        </div>
        
        <!-- Orders Table -->
        <div v-else-if="ordersStore.orders.length > 0" class="max-h-64 overflow-y-auto scrollbar-hide">
          <table class="divide-y divide-gray-200 w-full table-fixed">

            <thead class=" bg-gray-50">
              <tr>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">{{ t('dashboard.orders.table.product') }}</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">{{ t('dashboard.orders.table.customer') }}</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">{{ t('dashboard.orders.table.date') }}</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">{{ t('dashboard.orders.table.price') }}</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">{{ t('dashboard.orders.table.qty') }}</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">{{ t('dashboard.orders.table.status') }}</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">{{ t('dashboard.orders.table.total') }}</th>
              </tr>
            </thead>
            <tbody class=" bg-white divide-y divide-gray-200">
              <tr v-for="order in ordersStore.orders" :key="`${order.order_id}-${order.product_id}`" class="hover:bg-gray-50">
                <td class="px-3 py-4  text-xs font-medium text-gray-900 truncate" :title="order.product_name">
                  {{ order.product_name }}
                </td>
                <td class="px-3 py-4 text-xs text-gray-900 truncate" :title="order.customer_name">{{ order.customer_name }}</td>
                <td class="px-3 py-4 text-xs text-gray-900">{{ formatDate(order.order_date) }}</td>
                <td class="px-3 py-4 text-xs text-gray-900">{{ formatCurrency(order.product_price) }}</td>
                <td class="px-3 py-4 text-xs text-gray-900 text-center">{{ order.quantity }}</td>
                <td class="px-3 py-4">
                  <select 
                    :value="order.order_status"
                    @change="updateOrderStatus(order.order_id, order.product_id, $event.target.value)"
                    class="text-xs font-semibold rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    :class="{
                      'bg-yellow-100 text-yellow-800': order.order_status === 'pending',
                      'bg-blue-100 text-blue-800': order.order_status === 'confirmed',
                      'bg-purple-100 text-purple-800': order.order_status === 'shipped',
                      'bg-green-100 text-green-800': order.order_status === 'delivered',
                      'bg-red-100 text-red-800': order.order_status === 'cancelled'
                    }">
                    <option value="pending" class="bg-white text-gray-900">{{ t('dashboard.orders.filters.pending') }}</option>
                    <option value="confirmed" class="bg-white text-gray-900">{{ t('dashboard.orders.filters.confirmed') }}</option>
                    <option value="shipped" class="bg-white text-gray-900">{{ t('dashboard.orders.filters.shipped') }}</option>
                    <option value="delivered" class="bg-white text-gray-900">{{ t('dashboard.orders.filters.delivered') }}</option>
                    <option value="cancelled" class="bg-white text-gray-900">{{ t('dashboard.orders.filters.cancelled') }}</option>
                  </select>
                </td>
                <td class="px-3 py-4 text-xs font-medium text-gray-900">{{ formatCurrency(order.item_total || 0) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- No Orders State -->
        <div v-else class="text-center py-8">
          <i class="fas fa-shopping-cart text-gray-400 text-4xl mb-4"></i>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('dashboard.orders.noOrders') }}</h3>
          <p class="text-gray-600">{{ t('dashboard.orders.noOrdersMessage') }}</p>
        </div>
      </div>
      <!-- Best selling products - Only show for Pro pack users -->
      <div v-if="packInfo.is_pro" class="w-60 bg-white mt-8 rounded-lg shadow-md px-3 pb-6">
        <h3 class="text-lg -mt-4 font-semibold text-gray-800 mb-4">{{ t('bestSelling.title') }}</h3>
        
        <!-- Loading State -->
        <div v-if="bestSellingLoading" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-blue-600 text-2xl mb-2"></i>
          <p class="text-gray-600">{{ t('bestSelling.loading') }}</p>
        </div>
        
        <!-- Best Selling Products List -->
        <div v-else-if="bestSellingProducts.length > 0" 
        class="space-y-4">
          <div 
            v-for="(product, index) in bestSellingProducts" 
            :key="product.product_id"
            class="flex items-center space-x-3 py-3  rounded-lg transition-colors">
            <!-- Rank Badge -->
            <div class="flex-shrink-0">
              <span class="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white rounded-full"
                    :class="{
                      'bg-yellow-500': index === 0,
                      'bg-blue-400': index === 1,
                      'bg-orange-500': index === 2
                    }">
                {{ index + 1 }}
              </span>
            </div>
            
            <!-- Product Image -->
            <div class="flex-shrink-0">
              <img 
                v-if="product.product_image" 
                :src="product.product_image" 
                :alt="product.product_name"
                class="w-10 h-10 rounded-lg object-cover">
              <div v-else class="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                <i class="fas fa-image text-gray-400 text-xs"></i>
              </div>
            </div>
            
            <!-- Product Info -->
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium text-gray-900 truncate" :title="product.product_name">
                {{ product.product_name }}
              </h4>
              <div class="flex items-center space-x-2 mt-1">
                <span class="text-xs text-gray-500">
                  {{ product.total_quantity_sold }} {{ t('bestSelling.sold') }}
                </span>
                <span class="text-xs text-gray-500">•</span>
                <span class="text-xs font-medium text-green-600">
                  {{ formatCurrency(product.total_revenue) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- No Products State -->
        <div v-else class="text-center py-8">
          <i class="fas fa-chart-line text-gray-400 text-4xl mb-4"></i>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('bestSelling.noSales') }}</h3>
          <p class="text-gray-600">{{ t('bestSelling.noSalesMessage') }}</p>
        </div>
      </div>
      
    
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useStoreStore } from '../stores/store'
import { useOrdersStore } from '../stores/orders'
import { supabase } from '../lib/supabase'
import SellingTab from '../components/dashboard/SellingTab.vue'
import AdminTab from '../components/dashboard/AdminTab.vue'
import EmployeeTab from '../components/dashboard/EmployeeTab.vue'
import { getLocalizedPath } from '../lib/i18n-utils'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const storeStore = useStoreStore()
const ordersStore = useOrdersStore()

// Default to selling dashboard
const activeTab = ref('selling')

// Store statistics
const storeStatistics = computed(() => storeStore.storeStatistics)
const statsLoading = ref(false)

// Best selling products
const bestSellingProducts = ref([])
const bestSellingLoading = ref(false)

// Pack information
const packInfo = ref({
  has_vendor_role: false,
  store_id: null,
  pack_name_en: null,
  pack_name_ar: null,
  pack_name_fr: null,
  pack_id: null,
  is_pro: false
})
const packLoading = ref(false)

// Filtering state
const sortFilter = ref('date')
const sortOrder = ref('desc')
const statusFilter = ref('')

// Chart data
const chartData = ref({
  labels: [],
  datasets: [{
    label: 'Monthly Sales',
    data: [],
    borderColor: 'rgb(59, 130, 246)',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    tension: 0.4
  }]
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      min: 0,
      max: 50000,
      ticks: {
        stepSize: 10000,
        callback: function(value) {
          return value.toLocaleString();
        }
      },
      grid: {
        display: true
      }
    }
  }
})

// Format currency function using i18n
const formatCurrency = (amount) => {
  const currentLocale = route.meta.locale || 'en'
  
  // Get currency symbol from translations
  const currencySymbol = t('dashboard.currency.dzdSymbol')
  
  // For Arabic locale, use custom formatting with Arabic currency symbol
  if (currentLocale === 'ar') {
    return `${amount.toLocaleString('ar-DZ')} ${currencySymbol}`
  }
  
  // For other locales, use standard currency formatting
  const currencyCode = 'DZD'
  const formatted = new Intl.NumberFormat(currentLocale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0
  }).format(amount)
  
  return formatted
}

// Format date function using i18n
const formatDate = (dateString) => {
  const currentLocale = route.meta.locale || 'en'
  const date = new Date(dateString)
  
  // Use locale-specific formatting
  const localeMap = {
    'en': 'en-US',
    'fr': 'fr-FR',
    'ar': 'ar-DZ'
  }
  
  const locale = localeMap[currentLocale] || 'en-US'
  
  return date.toLocaleDateString(locale, { 
    month: 'short', 
    day: 'numeric' 
  })
}

// Available tabs based on user role
const availableTabs = computed(() => {
  const userRole = authStore.userRole || 'customer'
  
  const tabs = [
    {
      id: 'selling',
      name: t('dashboard.sellingDashboard'),
      icon: 'fas fa-store',
      roles: ['customer', 'admin', 'employee', 'vendor']
    }
  ]

  // Add admin tab for admins
  if (userRole === 'admin') {
    tabs.push({
      id: 'admin',
      name: t('admin.dashboard'),
      icon: 'fas fa-crown',
      roles: ['admin']
    })
  } else {
  }

  // Add employee tab for employees
  if (userRole === 'employee') {
    tabs.push({
      id: 'employee',
      name: t('employee.dashboard'),
      icon: 'fas fa-user-tie',
      roles: ['employee']
    })
  } else {
  }
  return tabs
})

// Handle admin navigation
const handleAdminNavigation = (section) => {
  // Navigate to admin section or show admin modal
  // This could open a modal or navigate to a different route
  // For now, we'll just log it
}

// Handle employee navigation
const handleEmployeeNavigation = (section) => {
  // Navigate to employee section or show employee modal
  // This could open a modal or navigate to a different route
  // For now, we'll just log it
}

// Get localized route path
const getLocalizedRoute = (path) => {
  const currentLocale = route.meta.locale || 'en'
  return getLocalizedPath(path, currentLocale)
}

// Check if user has access to a specific tab
const hasAccessToTab = (tabId) => {
  const tab = availableTabs.value.find(t => t.id === tabId)
  return tab && tab.roles.includes(authStore.userRole)
}

// Redirect to appropriate tab if current tab is not accessible
const validateTabAccess = () => {
  if (!hasAccessToTab(activeTab.value)) {
    // Redirect to first available tab
    activeTab.value = availableTabs.value[0]?.id || 'selling'
  }
}

// Watch for role changes and refresh tabs
watch(() => authStore.userRole, (newRole, oldRole) => {
  validateTabAccess()
}, { immediate: true })

// Set sort filter and toggle order
const setSortFilter = async (filter) => {
  if (sortFilter.value === filter) {
    // Toggle order if same filter is clicked
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    // Set new filter with default desc order
    sortFilter.value = filter
    sortOrder.value = 'desc'
  }
  
  // Fetch filtered orders
  await fetchFilteredOrders()
}

// Set status filter
const setStatusFilter = async (status) => {
  statusFilter.value = status
  await fetchFilteredOrders()
}

// Update order status
const updateOrderStatus = async (orderId, productId, newStatus) => {
  try {
    // Update the order status in the orders table (not order_items)
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
    
    if (error) throw error
    
    // Update the local orders array to reflect the change immediately
    const orderIndex = ordersStore.orders.findIndex(
      order => order.order_id === orderId && order.product_id === productId
    )
    
    if (orderIndex !== -1) {
      ordersStore.orders[orderIndex].order_status = newStatus
    }
    
    console.log(`Order status updated to ${newStatus}`)
  } catch (error) {
    console.error('Error updating order status:', error)
    // You might want to show a user-friendly error message here
  }
}

// Fetch filtered orders using the new RPC function
const fetchFilteredOrders = async () => {
  try {
    const { data, error } = await supabase.rpc('get_vendor_orders_filtered', {
      p_sort_by: sortFilter.value,
      p_sort_order: sortOrder.value,
      p_status_filter: statusFilter.value || null
    })
    
    if (error) throw error
    
    // Update orders store with filtered data
    ordersStore.orders = data || []
  } catch (error) {
    console.error('Error fetching filtered orders:', error)
  }
}

// Fetch monthly sales data
const fetchMonthlySales = async () => {
  try {
    const { data, error } = await supabase.rpc('get_my_store_monthly_sales')
    if (error) throw error
    
    if (data && data.length > 0) {
      const result = data[0]
      chartData.value = {
        labels: result.labels || [],
        datasets: [{
          label: 'Monthly Sales',
          data: result.datasets?.data || [],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }]
      }
    }
  } catch (error) {
    console.error('Error fetching monthly sales:', error)
  }
}

// Fetch pack information
const fetchPackInfo = async () => {
  try {
    packLoading.value = true
    const { data, error } = await supabase.rpc('get_user_store_pack')
    
    if (error) throw error
    
    if (data && data.length > 0) {
      packInfo.value = data[0]
    }
  } catch (error) {
    console.error('Error fetching pack information:', error)
  } finally {
    packLoading.value = false
  }
}

// Fetch best selling products
const fetchBestSellingProducts = async () => {
  try {
    bestSellingLoading.value = true
    const { data, error } = await supabase.rpc('get_best_selling_products')
    
    if (error) throw error
    
    bestSellingProducts.value = data || []
  } catch (error) {
    console.error('Error fetching best selling products:', error)
    bestSellingProducts.value = []
  } finally {
    bestSellingLoading.value = false
  }
}

onMounted(async () => {
  // Avoid forcing role refresh here to prevent loops
  if (authStore.isAuthenticated) {
    statsLoading.value = true
    try {
      await storeStore.fetchStoreStatistics()
      await fetchFilteredOrders() // Use filtered orders instead of regular fetch
      await fetchPackInfo() // Fetch pack information
      await fetchMonthlySales()
      await fetchBestSellingProducts()
    } catch (error) {
      console.error('Error fetching store statistics:', error)
    } finally {
      statsLoading.value = false
    }
  }

  // Validate tab access on mount
  validateTabAccess()
})
</script>

<style scoped>
.card {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04);
  padding: 1.5rem;
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
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  background-color: transparent;
  font-weight: 500;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  background-color: var(--color-primary);
  color: white;
}

.btn-outline:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-primary);
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background-color: #f3f4f6;
  color: #374151;
  font-weight: 500;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-secondary:focus {
  outline: none;
  box-shadow: 0 0 0 2px #6b7280;
}

/* Hide scrollbar but keep scroll functionality */
.scrollbar-hide {
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;  /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar { 
  display: none;  /* Safari and Chrome */
}
</style> 