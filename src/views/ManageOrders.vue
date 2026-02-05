<template>
  <div class="min-h-screen bg-white">
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Order Management</h1>
        <p class="mt-2 text-gray-600">View and manage all orders</p>
      </div>

      <!-- Order Management Table -->
      <div class="bg-white rounded-lg shadow-md">
        <!-- Table Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-800">All Orders</h2>
            
            <!-- Search and Filter Controls -->
            <div class="flex items-center space-x-4">
              <!-- Search Input -->
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search orders..."
                  class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              </div>
              
              <!-- Status Filter -->
              <select 
                v-model="statusFilter"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <i class="fas fa-spinner fa-spin text-blue-600 text-3xl mb-4"></i>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Loading Orders</h3>
          <p class="text-gray-600">Please wait while we fetch order data...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-4"></i>
          <h3 class="text-lg font-semibold text-red-800 mb-2">Error Loading Orders</h3>
          <p class="text-red-600">{{ error }}</p>
          <button 
            @click="fetchOrders"
            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
        
        <!-- Orders Table -->
        <div v-else-if="filteredOrders.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="order in filteredOrders" :key="order.order_id" class="hover:bg-gray-50 cursor-pointer" @click="openOrderDetails(order.order_id)">
                <!-- Order ID -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900" :title="order.order_id">
                    {{ order.order_id.substring(0, 8) }}...
                  </div>
                </td>
                
                <!-- Customer -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ order.customer_name }}</div>
                  <div class="text-sm text-gray-500">{{ order.customer_email }}</div>
                </td>
                
                <!-- Store -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ order.store_name }}</div>
                </td>
                
                <!-- Items Count -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ order.items_count }} items</div>
                </td>
                
                <!-- Total Amount -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ formatPrice(order.total_amount) }}</div>
                </td>
                
                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClasses(order.order_status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ order.order_status }}
                  </span>
                </td>
                
                <!-- Date -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(order.created_at) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- No Orders Message -->
        <div v-else class="text-center py-12">
          <i class="fas fa-shopping-cart text-4xl text-gray-400 mb-4"></i>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">No Orders Found</h3>
          <p class="text-gray-600">No orders match your current filters</p>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div v-if="selectedOrder" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <i class="fas fa-shopping-cart text-blue-600"></i>
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-800">Order Details</h2>
              <p class="text-sm text-gray-500" :title="selectedOrder.order_id">Order ID: {{ selectedOrder.order_id.substring(0, 8) }}...</p>
            </div>
          </div>
          <button @click="closeOrderDetails" class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6 flex-1 overflow-y-auto">
          <div v-if="orderDetailsLoading" class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-blue-600 text-2xl mb-4"></i>
            <p class="text-gray-600">Loading order details...</p>
          </div>
          
          <div v-else-if="orderDetailsError" class="text-center py-8">
            <i class="fas fa-exclamation-triangle text-red-500 text-2xl mb-4"></i>
            <p class="text-red-600">{{ orderDetailsError }}</p>
          </div>
          
          <div v-else-if="orderDetails" class="space-y-6">
            <!-- Order Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Order Information</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Order ID:</span>
                    <span class="font-medium">{{ orderDetails.order_id }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Status:</span>
                    <span :class="getStatusClasses(orderDetails.order_status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                      {{ orderDetails.order_status }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Total Amount:</span>
                    <span class="font-medium">{{ formatPrice(orderDetails.total_amount) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Items Count:</span>
                    <span class="font-medium">{{ orderDetails.items_count }} items</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Created:</span>
                    <span class="font-medium">{{ formatDate(orderDetails.created_at) }}</span>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Name:</span>
                    <span class="font-medium">{{ orderDetails.customer_name }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Email:</span>
                    <span class="font-medium">{{ orderDetails.customer_email }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Store:</span>
                    <span class="font-medium">{{ orderDetails.store_name }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Shipping Address -->
            <div v-if="orderDetails.shipping_address" class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Shipping Address</h3>
              <p class="text-gray-700">{{ orderDetails.shipping_address }}</p>
            </div>

            <!-- Notes -->
            <div v-if="orderDetails.notes" class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Notes</h3>
              <p class="text-gray-700">{{ orderDetails.notes }}</p>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-end">
          <button @click="closeOrderDetails" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '../lib/supabase'

const { t } = useI18n()

// Reactive data
const orders = ref([])
const loading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const statusFilter = ref('')

const selectedOrder = ref(null)
const orderDetails = ref(null)
const orderDetailsLoading = ref(false)
const orderDetailsError = ref(null)

// Computed properties
const filteredOrders = computed(() => {
  let filtered = orders.value

  // Filter by search query (customer name or email)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(order => 
      order.customer_name?.toLowerCase().includes(query) ||
      order.customer_email?.toLowerCase().includes(query) ||
      order.order_id.toLowerCase().includes(query)
    )
  }

  // Filter by status
  if (statusFilter.value) {
    filtered = filtered.filter(order => order.order_status === statusFilter.value)
  }

  return filtered
})

// Methods
const fetchOrders = async () => {
  try {
    loading.value = true
    error.value = null

    const { data, error: fetchError } = await supabase.rpc('get_all_orders_for_admin')
    
    if (fetchError) throw fetchError
    
    orders.value = data || []
  } catch (err) {
    console.error('Error fetching orders:', err)
    error.value = err.message || 'Failed to fetch orders'
  } finally {
    loading.value = false
  }
}

const openOrderDetails = async (orderId) => {
  selectedOrder.value = orders.value.find(o => o.order_id === orderId)
  if (selectedOrder.value) {
    await fetchOrderDetails(orderId)
  }
}

const closeOrderDetails = () => {
  selectedOrder.value = null
  orderDetails.value = null
  orderDetailsError.value = null
}

const fetchOrderDetails = async (orderId) => {
  try {
    orderDetailsLoading.value = true
    orderDetailsError.value = null

    // For now, we'll use the same RPC function and find the specific order
    // In a real implementation, you might want a separate RPC function for order details
    const order = orders.value.find(o => o.order_id === orderId)
    if (order) {
      orderDetails.value = order
    } else {
      throw new Error('Order not found')
    }
  } catch (err) {
    console.error('Error fetching order details:', err)
    orderDetailsError.value = err.message || 'Failed to fetch order details'
  } finally {
    orderDetailsLoading.value = false
  }
}

const formatPrice = (price) => {
  if (price === null || price === undefined) return 'N/A'
  return `${price.toLocaleString()} ${t('common.currencyShort')}`
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusClasses = (status) => {
  const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full'
  
  switch (status) {
    case 'pending':
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    case 'confirmed':
      return `${baseClasses} bg-blue-100 text-blue-800`
    case 'shipped':
      return `${baseClasses} bg-purple-100 text-purple-800`
    case 'delivered':
      return `${baseClasses} bg-green-100 text-green-800`
    case 'cancelled':
      return `${baseClasses} bg-red-100 text-red-800`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`
  }
}

// Lifecycle
onMounted(() => {
  fetchOrders()
})
</script>