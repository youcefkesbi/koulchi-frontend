<template>
  <div class="min-h-screen bg-white">
  <div class="grid grid-cols-[1fr_1fr]">


    <!-- Dashboard stats -->
    <div class="grid grid-cols-2 gap-6 w-140 max-w-4xl h-60 p-6">
      <!-- Loading State for Statistics -->
      <div v-if="statsLoading" class="col-span-2 text-center py-8">
        <i class="fas fa-spinner fa-spin text-primary text-2xl mb-2"></i>
        <p class="text-gray-600">{{ t('dashboard.stats.loadingStats') }}</p>
      </div>

      <!-- Statistics Cards -->
      <template v-else>
        <!-- Total Orders Card -->
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
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
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
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
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
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
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
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
        <div v-if="!storeStatistics.storeId && !statsLoading" class="col-span-2 text-center py-8">
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

      <!-- Line chart -->
      <div class=" ">
       <Line :data="chartData" :options="chartOptions" />
      </div>      
  </div>

    <!-- Orders tab + best selling products tab -->
    <div class="grid grid-cols-[1fr_1fr] w-full px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="statsLoading" class="text-center py-12">
        <i class="fas fa-spinner fa-spin text-primary text-3xl mb-4"></i>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('common.loading') }}</h3>
        <p class="text-gray-600">{{ t('dashboard.loadingProfile') }}</p>
      </div>
      <!-- Manage orders -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Store Orders</h3>
        
        <!-- Loading State -->
        <div v-if="ordersStore.loading" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-primary text-2xl mb-2"></i>
          <p class="text-gray-600">Loading orders...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="ordersStore.error" class="text-center py-8">
          <i class="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
          <p class="text-red-600">{{ ordersStore.error }}</p>
        </div>
        
        <!-- Orders Table -->
        <div v-else-if="ordersStore.orders.length > 0" class="overflow-x-auto">
          <table class="divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="order in ordersStore.orders" :key="`${order.order_id}-${order.product_id}`" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <img v-if="order.product_image" :src="order.product_image" :alt="order.product_name" class="h-10 w-10 rounded-full object-cover">
                      <div v-else class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <i class="fas fa-image text-gray-400"></i>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ order.product_name }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ order.customer_name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ new Date(order.order_date).toLocaleDateString() }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(order.product_price) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ order.quantity }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        :class="{
                          'bg-yellow-100 text-yellow-800': order.order_status === 'pending',
                          'bg-blue-100 text-blue-800': order.order_status === 'confirmed',
                          'bg-purple-100 text-purple-800': order.order_status === 'shipped',
                          'bg-green-100 text-green-800': order.order_status === 'delivered',
                          'bg-red-100 text-red-800': order.order_status === 'cancelled'
                        }">
                    {{ order.order_status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ formatCurrency(order.item_total || 0) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- No Orders State -->
        <div v-else class="text-center py-8">
          <i class="fas fa-shopping-cart text-gray-400 text-4xl mb-4"></i>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">No Orders Found</h3>
          <p class="text-gray-600">No customers have placed orders for your products yet.</p>
        </div>
      </div>
      <!-- Best selling products -->
      <div class="bg-blue-50 ">Best selling products</div>
      
    
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/useAuthStore'
import { useStoreStore } from '../stores/useStoresStore'
import { useOrdersStore } from '../stores/useOrdersStore'
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
      display: true
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
})

// Format currency function using i18n
const formatCurrency = (amount) => {
  const locale = 'en' // Use default locale to avoid i18n error
  const currencySymbol = 'DZD'
  
  // Always use DZD as the currency code for Intl.NumberFormat
  const currencyCode = 'DZD'
  
  // Format with proper currency code
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0
  }).format(amount)
  
  return formatted
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

onMounted(async () => {
  // Avoid forcing role refresh here to prevent loops
  if (authStore.isAuthenticated) {
    statsLoading.value = true
    try {
      await storeStore.fetchStoreStatistics()
      await ordersStore.fetchVendorOrders()
      await fetchMonthlySales()
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
</style> 