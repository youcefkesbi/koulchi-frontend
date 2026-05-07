<template>
  <div class="space-y-8 overflow-hidden">
    <div class="px-0 sm:px-2 lg:px-4">
      <div class="card relative w-full">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 class="text-xl font-bold text-gray-900">{{ $t('dashboard.activeOrders') }}</h2>
          <div class="flex flex-wrap items-center gap-3">
            <select
              :value="statusFilter"
              :class="getStatusSelectClasses()"
              @change="setStatusFilter($event.target.value)"
            >
              <option value="">{{ $t('dashboard.orders.filters.allStatus') }}</option>
              <option value="pending">{{ $t('dashboard.orders.filters.pending') }}</option>
              <option value="confirmed">{{ $t('dashboard.orders.filters.confirmed') }}</option>
              <option value="shipped">{{ $t('dashboard.orders.filters.shipped') }}</option>
              <option value="delivered">{{ $t('dashboard.orders.filters.delivered') }}</option>
              <option value="cancelled">{{ $t('dashboard.orders.filters.cancelled') }}</option>
            </select>
            <select
              :value="categoryFilter"
              :class="getCategorySelectClasses()"
              @change="setCategoryFilter($event.target.value)"
            >
              <option value="">{{ $t('dashboard.categories') }}</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ getCategoryDisplayName(category) }}
              </option>
            </select>
          </div>
        </div>
        <div v-if="loading" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-primary text-2xl" />
          <p class="text-gray-600 mt-2">{{ $t('common.loading') }}</p>
        </div>
        <div v-else-if="filteredOrders.length > 0" class="space-y-4">
          <div
            v-for="order in filteredOrders"
            :key="order.order_id"
            class="border border-gray-200 rounded-lg p-4 bg-white"
          >
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <div class="flex items-center gap-3 flex-wrap">
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

            <div class="flex items-start gap-4">
              <div class="flex-shrink-0">
                <div class="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    v-if="getProductImage(order)"
                    :src="getProductImage(order)"
                    :alt="getProductName(order)"
                    class="w-full h-full object-cover"
                  >
                  <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center">
                    <i class="fas fa-image text-gray-400 text-lg" />
                  </div>
                </div>
              </div>

              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-800 text-lg mb-2 truncate">{{ getProductName(order) }}</h3>

                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div class="flex items-center gap-2">
                    <i class="fas fa-shopping-cart text-gray-400" />
                    <span class="text-gray-600">{{ $t('dashboard.quantity') }}:</span>
                    <span class="font-medium text-gray-800">{{ getOrderQuantity(order) }}</span>
                  </div>

                  <div class="flex items-center gap-2">
                    <i class="fas fa-tag text-gray-400" />
                    <span class="text-gray-600">{{ $t('common.price') }}:</span>
                    <span class="font-medium text-gray-800">{{ getOrderTotalPrice(order) }} {{ $t('common.currencyShort') }}</span>
                  </div>
                </div>

                <div v-if="getStoreName(order)" class="mt-3 text-sm text-gray-500">
                  <i class="fas fa-store mr-1" />
                  {{ $t('dashboard.soldBy') }}: {{ getStoreName(order) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8">
          <i class="fas fa-shopping-bag text-gray-400 text-4xl mb-4" />
          <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ $t('dashboard.noOrders') }}</h3>
          <p class="text-gray-600 mb-4">{{ $t('dashboard.noOrdersMessage') }}</p>
          <router-link
            :to="getLocalizedRoute('/')"
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
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useLocaleRouter } from '../composables/useLocaleRouter'
import { supabase } from '../lib/supabase'

const route = useRoute()
const { getLocalizedPath } = useLocaleRouter()

const getLocalizedRoute = (path) => {
  const currentLocale = route.meta.locale || 'en'
  return getLocalizedPath(path, { locale: currentLocale })
}

const categoryFilter = ref('')
const statusFilter = ref('')
const categories = ref([])
const buyerOrders = ref([])
const loading = ref(true)

const getCategorySelectClasses = () =>
  'rounded-md px-3 py-2 bg-gray-100 text-gray-700 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm'

const getStatusSelectClasses = () =>
  'rounded-md px-3 py-2 bg-gray-100 text-gray-700 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm'

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

const getOrderItemsArray = (order) => {
  if (!order.order_items) return []
  if (Array.isArray(order.order_items)) return order.order_items
  if (typeof order.order_items === 'object') return [order.order_items]
  return []
}

const getProductImage = (order) => {
  const items = getOrderItemsArray(order)
  if (items.length > 0) {
    const firstItem = items[0]
    if (firstItem?.product) {
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

const getStoreName = (order) => {
  const items = getOrderItemsArray(order)
  if (items.length > 0) {
    const firstItem = items[0]
    if (firstItem?.product?.store) {
      return firstItem.product.store.name || 'Unknown Store'
    }
  }
  return null
}

const getOrderTotalPrice = (order) => {
  if (order.total_amount) {
    return order.total_amount
  }
  const items = getOrderItemsArray(order)
  if (items.length > 0) {
    return items.reduce((total, item) =>
      total + (parseFloat(item.price || 0) * (item.quantity || 0)), 0)
  }
  return 0
}

const getProductCategory = (order) => {
  const items = getOrderItemsArray(order)
  if (items.length > 0) {
    const firstItem = items[0]
    if (firstItem?.product) {
      if (firstItem.product.category?.id) {
        return firstItem.product.category.id
      }
      if (firstItem.product.category_id) {
        return firstItem.product.category_id
      }
    }
  }
  return null
}

const getCategoryDisplayName = (category) => {
  const currentLocale = route.meta.locale || 'en'
  if (currentLocale === 'ar' && category.name_ar) {
    return category.name_ar
  }
  if (currentLocale === 'fr' && category.name_fr) {
    return category.name_fr
  }
  return category.name_en
}

const getProductName = (order) => {
  const items = getOrderItemsArray(order)
  if (items.length > 0) {
    const firstItem = items[0]
    if (firstItem?.product?.name) {
      return firstItem.product.name
    }
    if (firstItem?.product_id) {
      return `Product ${firstItem.product_id.slice(0, 8)}`
    }
  }
  return 'Unknown Product'
}

const getOrderQuantity = (order) => {
  const items = getOrderItemsArray(order)
  if (items.length > 0) {
    return items.reduce((total, item) => total + (item.quantity || 0), 0)
  }
  return 0
}

const filteredOrders = computed(() => {
  let filtered = [...buyerOrders.value]
  if (categoryFilter.value) {
    filtered = filtered.filter(order => getProductCategory(order) === categoryFilter.value)
  }
  if (statusFilter.value) {
    filtered = filtered.filter(order => order.order_status === statusFilter.value)
  }
  return filtered
})

const fetchBuyerOrders = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase.rpc('get_buyer_orders_with_details')
    if (error) throw error
    buyerOrders.value = data || []
  } catch (err) {
    console.error('Error fetching buyer orders:', err)
    buyerOrders.value = []
  } finally {
    loading.value = false
  }
}

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

const setCategoryFilter = (categoryId) => {
  categoryFilter.value = categoryId
}

const setStatusFilter = (status) => {
  statusFilter.value = status
}

onMounted(async () => {
  await Promise.all([fetchBuyerOrders(), fetchCategories()])
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
</style>
