<template>
  <div class="space-y-8 overflow-hidden">
    <!-- Page Header -->
    <div class="text-center pt-8">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('dashboard.buyingDashboard') }}</h2>
      <p class="text-lg text-gray-600">{{ $t('dashboard.buyingDescription') }}</p>
    </div>

    <!-- Dashboard Grid -->
    <div class="px-12">
      <!-- Active Orders -->
      <div class="card relative w-full">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-900">{{ $t('dashboard.activeOrders') }}</h3>
          <div class="flex items-center gap-3">
            <!-- Filter by status -->
            <select 
              @change="setStatusFilter($event.target.value)"
              :value="statusFilter"
              :class="getStatusSelectClasses()">
              <option value="">{{ $t('dashboard.orders.filters.allStatus') }}</option>
              <option value="pending">{{ $t('dashboard.orders.filters.pending') }}</option>
              <option value="confirmed">{{ $t('dashboard.orders.filters.confirmed') }}</option>
              <option value="shipped">{{ $t('dashboard.orders.filters.shipped') }}</option>
              <option value="delivered">{{ $t('dashboard.orders.filters.delivered') }}</option>
              <option value="cancelled">{{ $t('dashboard.orders.filters.cancelled') }}</option>
            </select>
            <!-- Filter by category -->
            <select 
              @change="setCategoryFilter($event.target.value)"
              :value="categoryFilter"
              :class="getCategorySelectClasses()">
              <option value="">{{ $t('dashboard.categories') }}</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ getCategoryDisplayName(category) }}
              </option>
            </select>
          </div>
        </div>
        <div v-if="ordersStore.loading" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-primary text-2xl"></i>
          <p class="text-gray-600 mt-2">{{ $t('common.loading') }}</p>
        </div>
        <div v-else-if="filteredOrders.length > 0" class="space-y-4">
          <div 
            v-for="order in filteredOrders" 
            :key="order.order_id"
            class="border border-gray-200 rounded-lg p-4 bg-white"
          >
            <!-- Order Header with ID and Status -->
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <div class="flex items-center gap-3">
                <span class="text-sm font-medium text-gray-500">{{ $t('dashboard.orderLabel') }} #{{ order.order_id.slice(-8) }}</span>
                <span 
                  :class="[
                    'px-3 py-1 text-xs rounded-full font-medium',
                    order.order_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.order_status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    order.order_status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                    order.order_status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.order_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ $t(`orderStatusLabels.${order.order_status}`) }}
                </span>
              </div>
              <div class="text-xs text-gray-500">
                {{ $t('dashboard.orderedOn') }}: {{ formatDate(order.created_at) }}
              </div>
            </div>

            <!-- Order Content with Product Image and Details -->
            <div class="flex items-start gap-4">
              <!-- Product Image -->
              <div class="flex-shrink-0">
                <div class="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    v-if="getProductImage(order)" 
                    :src="getProductImage(order)" 
                    :alt="getProductName(order)"
                    class="w-full h-full object-cover"
                  >
                  <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center">
                    <i class="fas fa-image text-gray-400 text-lg"></i>
                  </div>
                </div>
              </div>

              <!-- Product Details -->
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-gray-800 text-lg mb-2 truncate">{{ getProductName(order) }}</h4>
                
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div class="flex items-center gap-2">
                    <i class="fas fa-shopping-cart text-gray-400"></i>
                    <span class="text-gray-600">{{ $t('dashboard.quantity') }}:</span>
                    <span class="font-medium text-gray-800">{{ getOrderQuantity(order) }}</span>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <i class="fas fa-tag text-gray-400"></i>
                    <span class="text-gray-600">{{ $t('common.price') }}:</span>
                    <span class="font-medium text-gray-800">{{ getOrderTotalPrice(order) }} {{ $t('common.currency') }}</span>
                  </div>
                </div>

                <!-- Store Info if available -->
                <div v-if="getStoreName(order)" class="mt-3 text-sm text-gray-500">
                  <i class="fas fa-store mr-1"></i>
                  {{ $t('dashboard.soldBy') }}: {{ getStoreName(order) }}
                </div>
              </div>
            </div>
          </div>      
        </div>
        <div v-else class="text-center py-8">
          <i class="fas fa-shopping-bag text-gray-400 text-4xl mb-4"></i>
          <h4 class="text-lg font-semibold text-gray-800 mb-2">{{ $t('dashboard.noOrders') }}</h4>
          <p class="text-gray-600 mb-4">{{ $t('dashboard.noOrdersMessage') }}</p>
          <router-link 
            :to="getLocalizedRoute('/products')" 
            class="btn-primary"
          >
            {{ $t('dashboard.startShopping') }}
          </router-link>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useOrdersStore } from '../stores/useOrdersStore'
import { useWishlistStore } from '../stores/useWishlistStore'
import { useLocaleRouter } from '../composables/useLocaleRouter'
import { supabase } from '../lib/supabase'

const { t: $t } = useI18n()
const route = useRoute()
const ordersStore = useOrdersStore()
const wishlistStore = useWishlistStore()

// Filtering state
const categoryFilter = ref('')
const statusFilter = ref('')
const categories = ref([])
const filteredOrders = ref([])
const buyerOrders = ref([])

// Get localized route path
const { getLocalizedPath } = useLocaleRouter()

// Get localized route (wrapper for getLocalizedPath)
const getLocalizedRoute = (path) => {
  const currentLocale = route.meta.locale || 'en'
  return getLocalizedPath(path, currentLocale)
}

// Get category select classes based on language direction
const getCategorySelectClasses = () => {
  const baseClasses = 'rounded-md px-3 py-2 bg-gray-100 text-gray-700 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm'
  return baseClasses
}

// Get status select classes
const getStatusSelectClasses = () => {
  const baseClasses = 'rounded-md px-3 py-2 bg-gray-100 text-gray-700 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm'
  return baseClasses
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Helper function to get order items as array (handles both array and object formats)
const getOrderItemsArray = (order) => {
  if (!order.order_items) return []
  if (Array.isArray(order.order_items)) return order.order_items
  if (typeof order.order_items === 'object') return [order.order_items]
  return []
}

// Helper function to get product image from order
const getProductImage = (order) => {
  const items = getOrderItemsArray(order)
  if (items.length > 0) {
    const firstItem = items[0]
    if (firstItem && firstItem.product) {
      if (firstItem.product.image_urls && Array.isArray(firstItem.product.image_urls) && firstItem.product.image_urls.length > 0) {
        return firstItem.product.image_urls[0]
      }
      if (firstItem.product.thumbnail_url) {
        return firstItem.product.thumbnail_url
      }
    }
  }
  return null
}

// Helper function to get store name from order
const getStoreName = (order) => {
  const items = getOrderItemsArray(order)
  if (items.length > 0) {
    const firstItem = items[0]
    if (firstItem && firstItem.product && firstItem.product.store) {
      return firstItem.product.store.name || 'Unknown Store'
    }
  }
  return null
}

// Helper function to get order total price
const getOrderTotalPrice = (order) => {
  if (order.total_amount) {
    return order.total_amount
  }
  // Calculate from order_items if total_amount is not available
  const items = getOrderItemsArray(order)
  if (items.length > 0) {
    return items.reduce((total, item) => {
      return total + (parseFloat(item.price || 0) * (item.quantity || 0))
    }, 0)
  }
  return 0
}

// Helper function to get product category from order
const getProductCategory = (order) => {
  const items = getOrderItemsArray(order)
  if (items.length > 0) {
    const firstItem = items[0]
    if (firstItem && firstItem.product) {
      if (firstItem.product.category && firstItem.product.category.id) {
        return firstItem.product.category.id
      }
      // Fallback to category_id if category object doesn't exist
      if (firstItem.product.category_id) {
        return firstItem.product.category_id
      }
    }
  }
  return null
}

// Helper function to get category name in current language
const getCategoryName = (order) => {
  const items = getOrderItemsArray(order)
  if (items.length > 0) {
    const firstItem = items[0]
    if (firstItem && firstItem.product && firstItem.product.category) {
      const currentLocale = route.meta.locale || 'en'
      const category = firstItem.product.category
      
      if (currentLocale === 'ar' && category.name_ar) {
        return category.name_ar
      } else if (currentLocale === 'fr' && category.name_fr) {
        return category.name_fr
      } else {
        return category.name_en || 'Unknown Category'
      }
    }
  }
  return 'Unknown Category'
}

// Helper function to get category display name for dropdown
const getCategoryDisplayName = (category) => {
  const currentLocale = route.meta.locale || 'en'
  
  if (currentLocale === 'ar' && category.name_ar) {
    return category.name_ar
  } else if (currentLocale === 'fr' && category.name_fr) {
    return category.name_fr
  } else {
    return category.name_en
  }
}

// Helper function to get product name from order
const getProductName = (order) => {
  const items = getOrderItemsArray(order)
  if (items.length > 0) {
    const firstItem = items[0]
    if (firstItem && firstItem.product && firstItem.product.name) {
      return firstItem.product.name
    }
    // Fallback if product data is missing
    if (firstItem && firstItem.product_id) {
      return `Product ${firstItem.product_id.slice(0, 8)}`
    }
  }
  return 'Unknown Product'
}

// Helper function to get quantity from order
const getOrderQuantity = (order) => {
  const items = getOrderItemsArray(order)
  if (items.length > 0) {
    // Sum all quantities if multiple items
    return items.reduce((total, item) => total + (item.quantity || 0), 0)
  }
  return 0
}

// Fetch buyer orders using RPC function
const fetchBuyerOrders = async () => {
  try {
    console.log('🛒 [MyPurchases] Fetching buyer orders...')
    const { data, error } = await supabase.rpc('get_buyer_orders_with_details')
    
    if (error) {
      console.error('❌ [MyPurchases] Error fetching buyer orders:', error)
      throw error
    }
    
    console.log('✅ [MyPurchases] Buyer orders fetched:', {
      count: data?.length || 0,
      orders: data?.map(o => ({
        order_id: o.order_id,
        status: o.order_status,
        items_count: Array.isArray(o.order_items) ? o.order_items.length : (o.order_items ? 1 : 0),
        total_amount: o.total_amount,
        shipping_address: o.shipping_address?.substring(0, 50) || 'N/A'
      }))
    })
    
    buyerOrders.value = data || []
  } catch (err) {
    console.error('❌ [MyPurchases] Error fetching buyer orders:', err)
    buyerOrders.value = []
  }
}

// Fetch categories
const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name_en, name_ar, name_fr, description, icon_url, is_active, created_at, updated_at')
      .eq('is_active', true)
      .order('name_en')

    if (error) throw error
    categories.value = data || []
  } catch (err) {
    console.error('Error fetching categories:', err)
  }
}

// Filter orders by category
const setCategoryFilter = (categoryId) => {
  categoryFilter.value = categoryId
  applyFilters()
}

// Filter orders by status
const setStatusFilter = (status) => {
  statusFilter.value = status
  applyFilters()
}

// Apply both category and status filters
const applyFilters = () => {
  let filtered = [...buyerOrders.value]
  
  // Apply category filter
  if (categoryFilter.value) {
    filtered = filtered.filter(order => {
      const productCategory = getProductCategory(order)
      return productCategory === categoryFilter.value
    })
  }
  
  // Apply status filter
  if (statusFilter.value) {
    filtered = filtered.filter(order => {
      return order.order_status === statusFilter.value
    })
  }
  
  // Show all filtered orders (no limit)
  filteredOrders.value = filtered
}

// Initialize filtered orders
const initializeFilteredOrders = () => {
  applyFilters()
}

const removeFromWishlist = async (itemId) => {
  try {
    await wishlistStore.removeFromWishlist(itemId)
  } catch (error) {
    console.error('Error removing from wishlist:', error)
  }
}

// Watch for changes in buyer orders and reinitialize filtered orders
watch(() => buyerOrders.value, () => {
  initializeFilteredOrders()
}, { deep: true })

onMounted(async () => {
  // Load data when component mounts
  await Promise.all([
    fetchBuyerOrders(),
    wishlistStore.fetchWishlist(),
    fetchCategories()
  ])
  
  // Initialize filtered orders after data is loaded
  initializeFilteredOrders()
})
</script>

<style scoped>
.card {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04);
  padding: 1.5rem;
  transform: none !important;
  transition: none !important;
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