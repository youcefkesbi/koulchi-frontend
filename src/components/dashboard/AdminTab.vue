<template>
  <div class="min-h-screen bg-white overflow-hidden">
    <!-- Page Header -->
    <div class="text-center py-6">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('admin.dashboard') }}</h2>
      <p class="text-lg text-gray-600">{{ $t('admin.dashboardDescription') }}</p>
    </div>

    <!-- Dashboard stats -->
    <div class="grid grid-cols-3 gap-6 w-full max-w-6xl mx-auto p-6">
      <!-- Loading State for Statistics -->
      <div v-if="loading" class="col-span-3 text-center py-8">
        <i class="fas fa-spinner fa-spin text-blue-600 text-2xl mb-2"></i>
        <p class="text-gray-600">{{ $t('common.loading') }}</p>
      </div>

      <!-- Statistics Cards -->
      <template v-else>
        <!-- Products Card -->
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">{{ $t('admin.totalProducts') }}</p>
              <p class="text-3xl font-bold text-gray-900">{{ dashboardStats.total_products }}</p>
              <div class="mt-2 text-xs text-gray-500">
                <div>Pending: {{ dashboardStats.products_pending }}</div>
                <div>Approved: {{ dashboardStats.products_approved }}</div>
                <div>Rejected: {{ dashboardStats.products_rejected }}</div>
                <div>Inactive: {{ dashboardStats.products_inactive }}</div>
              </div>
            </div>
            <div class="p-3 bg-blue-100 rounded-full">
              <i class="fas fa-box text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Stores Card -->
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">{{ $t('admin.totalStores') }}</p>
              <p class="text-3xl font-bold text-gray-900">{{ dashboardStats.total_stores }}</p>
              <div class="mt-2 text-xs text-gray-500">
                <div>💎 Pro: {{ dashboardStats.pro_stores }}</div>
                <div>🧺 Basic: {{ dashboardStats.basic_stores }}</div>
              </div>
            </div>
            <div class="p-3 bg-green-100 rounded-full">
              <i class="fas fa-store text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Users Card -->
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">{{ $t('admin.totalUsers') }}</p>
              <p class="text-3xl font-bold text-gray-900">{{ dashboardStats.total_users }}</p>
              <div class="mt-2 text-xs text-gray-500">
                <div>Customers: {{ dashboardStats.customers }}</div>
                <div>Vendors: {{ dashboardStats.vendors }}</div>
              </div>
            </div>
            <div class="p-3 bg-purple-100 rounded-full">
              <i class="fas fa-users text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Orders Card -->
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">{{ $t('admin.totalOrders') }}</p>
              <p class="text-3xl font-bold text-gray-900">{{ dashboardStats.total_orders }}</p>
              <div class="mt-2 text-xs text-gray-500">
                <div>Today: {{ dashboardStats.orders_today }}</div>
                <div>This Month: {{ dashboardStats.orders_this_month }}</div>
              </div>
            </div>
            <div class="p-3 bg-yellow-100 rounded-full">
              <i class="fas fa-shopping-cart text-yellow-600 text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Revenue Card -->
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">{{ $t('admin.totalRevenue') }}</p>
              <p class="text-3xl font-bold text-gray-900">{{ formatCurrency(dashboardStats.revenue_this_month) }}</p>
              <div class="mt-2 text-xs text-gray-500">
                <div>Today: {{ formatCurrency(dashboardStats.revenue_today) }}</div>
                <div>This Month: {{ formatCurrency(dashboardStats.revenue_this_month) }}</div>
              </div>
            </div>
            <div class="p-3 bg-indigo-100 rounded-full">
              <i class="fas fa-coins text-indigo-600 text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Alerts Card -->
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">{{ $t('admin.alerts') }}</p>
              <p class="text-3xl font-bold text-gray-900">{{ dashboardStats.low_stock_count + dashboardStats.pending_approvals }}</p>
              <div class="mt-2 text-xs text-gray-500">
                <div>Low Stock: {{ dashboardStats.low_stock_count }}</div>
                <div>Pending: {{ dashboardStats.pending_approvals }}</div>
              </div>
            </div>
            <div class="p-3 bg-red-100 rounded-full">
              <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl mx-auto p-6">
      <!-- Sales Trend Chart -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('admin.salesTrend') }}</h3>
        <div class="h-64">
          <Line v-if="!chartsLoading" :data="salesTrendData" :options="salesTrendOptions" />
          <div v-else class="flex items-center justify-center h-full">
            <i class="fas fa-spinner fa-spin text-blue-600 text-2xl"></i>
          </div>
        </div>
      </div>

      <!-- Orders by Status Chart -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('admin.ordersByStatus') }}</h3>
        <div class="h-64">
          <Bar v-if="!chartsLoading" :data="ordersByStatusData" :options="ordersByStatusOptions" />
          <div v-else class="flex items-center justify-center h-full">
            <i class="fas fa-spinner fa-spin text-blue-600 text-2xl"></i>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend
)

const { t: $t } = useI18n()
const route = useRoute()

// Props
defineProps({
  // No props needed for this component
})

// Emits
defineEmits(['navigate-to'])

// State
const loading = ref(false)
const chartsLoading = ref(false)
const dashboardStats = ref({
  total_products: 0,
  products_pending: 0,
  products_approved: 0,
  products_rejected: 0,
  products_inactive: 0,
  total_stores: 0,
  pro_stores: 0,
  basic_stores: 0,
  total_users: 0,
  customers: 0,
  vendors: 0,
  total_orders: 0,
  orders_today: 0,
  orders_this_month: 0,
  revenue_today: 0,
  revenue_this_month: 0,
  low_stock_count: 0,
  pending_approvals: 0
})

// Chart data
const salesTrendData = ref({
  labels: [],
  datasets: [{
    label: 'Daily Sales',
    data: [],
    borderColor: 'rgb(59, 130, 246)',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    tension: 0.4
  }]
})

const ordersByStatusData = ref({
  labels: [],
  datasets: [{
    label: 'Orders',
    data: [],
    backgroundColor: [],
    borderColor: [],
    borderWidth: 1
  }]
})

// Chart options
const salesTrendOptions = ref({
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
      max: 10000,
      ticks: {
        stepSize: 1000,
        callback: function(value) {
          return value + 'Da'
        }
      }
    }
  }
})

const ordersByStatusOptions = ref({
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
      ticks: {
        stepSize: 1
      }
    }
  }
})

// Methods
const fetchDashboardStats = async () => {
  try {
    loading.value = true
    
    const { data, error } = await supabase.rpc('get_dashboard_stats')
    
    if (error) throw error
    
    if (data && data.length > 0) {
      dashboardStats.value = data[0]
    }
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
  } finally {
    loading.value = false
  }
}

const fetchChartsData = async () => {
  try {
    chartsLoading.value = true
    
    // Fetch sales trend data
    const { data: salesData, error: salesError } = await supabase.rpc('get_dashboard_sales_trend')
    if (salesError) throw salesError
    
    if (salesData && salesData.length > 0) {
      const result = salesData[0]
      salesTrendData.value = {
        labels: result.labels || [],
        datasets: [{
          label: 'Daily Sales',
          data: result.datasets?.data || [],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }]
      }
    }
    
    // Fetch orders by status data
    const { data: ordersData, error: ordersError } = await supabase.rpc('get_dashboard_orders_by_status')
    if (ordersError) throw ordersError
    
    if (ordersData && ordersData.length > 0) {
      const result = ordersData[0]
      ordersByStatusData.value = {
        labels: result.labels || [],
        datasets: [{
          label: 'Orders',
          data: result.datasets?.data || [],
          backgroundColor: result.datasets?.backgroundColor || [],
          borderColor: result.datasets?.borderColor || [],
          borderWidth: 1
        }]
      }
    }
    
  } catch (error) {
    console.error('Error fetching charts data:', error)
  } finally {
    chartsLoading.value = false
  }
}

// Format currency: number localized, symbol from i18n (EN/FR: DA, AR: دج)
const formatCurrency = (amount) => {
  const localeMap = { en: 'en-US', fr: 'fr-FR', ar: 'ar-DZ' }
  const numLocale = localeMap[route.meta.locale] || 'en-US'
  return `${Number(amount).toLocaleString(numLocale)} ${$t('common.currencyShort')}`
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchDashboardStats(),
    fetchChartsData()
  ])
})
</script>

<style scoped>
.card {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04);
  padding: 1.5rem;
}
</style>
