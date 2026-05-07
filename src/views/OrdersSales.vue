<template>
  <div class="space-y-8 overflow-hidden">
    <div class="px-0 sm:px-2 lg:px-4">
      <div class="card relative w-full">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 class="text-xl font-bold text-gray-900">{{ $t('dashboard.orders.title') }}</h2>
          <select
            :value="statusFilter"
            :class="getStatusSelectClasses()"
            @change="statusFilter = $event.target.value"
          >
            <option value="">{{ $t('dashboard.orders.filters.allStatus') }}</option>
            <option value="pending">{{ $t('dashboard.orders.filters.pending') }}</option>
            <option value="confirmed">{{ $t('dashboard.orders.filters.confirmed') }}</option>
            <option value="shipped">{{ $t('dashboard.orders.filters.shipped') }}</option>
            <option value="delivered">{{ $t('dashboard.orders.filters.delivered') }}</option>
            <option value="cancelled">{{ $t('dashboard.orders.filters.cancelled') }}</option>
          </select>
        </div>

        <p class="text-sm text-gray-600 mb-4">{{ $t('ordersPage.salesHint') }}</p>

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
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-2 border-b border-gray-100">
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
              <div class="text-xs text-gray-500 space-y-1 sm:text-right">
                <div>{{ $t('dashboard.orderedOn') }}: {{ formatDate(order.created_at) }}</div>
                <div>
                  <i class="fas fa-user mr-1" />
                  {{ order.customer_name }}
                </div>
              </div>
            </div>

            <ul class="space-y-3">
              <li
                v-for="(line, idx) in order.lines"
                :key="`${order.order_id}-${line.product_id}-${idx}`"
                class="flex items-start gap-4"
              >
                <div class="shrink-0">
                  <div class="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      v-if="line.product_image"
                      :src="line.product_image"
                      :alt="line.product_name"
                      class="w-full h-full object-cover"
                    >
                    <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center">
                      <i class="fas fa-image text-gray-400 text-lg" />
                    </div>
                  </div>
                </div>
                <div class="flex-1 min-w-0 text-sm">
                  <p class="font-semibold text-gray-800 truncate">{{ line.product_name }}</p>
                  <div class="mt-2 grid grid-cols-2 gap-2 text-gray-600">
                    <span>{{ $t('dashboard.quantity') }}: <span class="font-medium text-gray-800">{{ line.quantity }}</span></span>
                    <span>{{ $t('common.price') }}: <span class="font-medium text-gray-800">{{ line.product_price }} {{ $t('common.currencyShort') }}</span></span>
                  </div>
                </div>
              </li>
            </ul>

            <div class="mt-4 pt-3 border-t border-gray-100 flex justify-end">
              <span class="text-sm text-gray-600">{{ $t('dashboard.orders.table.total') }}:</span>
              <span class="text-sm font-semibold text-gray-900 ml-2">{{ order.total_amount }} {{ $t('common.currencyShort') }}</span>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8">
          <i class="fas fa-store text-gray-400 text-4xl mb-4" />
          <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ $t('dashboard.orders.noOrders') }}</h3>
          <p class="text-gray-600 mb-4">{{ $t('dashboard.orders.noOrdersMessage') }}</p>
          <router-link
            :to="getLocalizedRoute('/dashboard')"
            class="btn-primary"
          >
            {{ $t('header.dashboard') }}
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

const rawRows = ref([])
const loading = ref(true)
const statusFilter = ref('')

const getStatusSelectClasses = () =>
  'rounded-md px-3 py-2 bg-gray-100 text-gray-700 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm'

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

const groupedOrders = computed(() => {
  const map = new Map()
  for (const row of rawRows.value) {
    if (!map.has(row.order_id)) {
      map.set(row.order_id, {
        order_id: row.order_id,
        order_status: row.order_status,
        total_amount: row.total_amount,
        shipping_address: row.shipping_address,
        created_at: row.order_date,
        customer_name: row.customer_name,
        lines: []
      })
    }
    map.get(row.order_id).lines.push(row)
  }
  return [...map.values()].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const filteredOrders = computed(() => {
  if (!statusFilter.value) {
    return groupedOrders.value
  }
  return groupedOrders.value.filter(o => o.order_status === statusFilter.value)
})

const fetchVendorOrders = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase.rpc('get_vendor_orders')
    if (error) throw error
    rawRows.value = data || []
  } catch (err) {
    console.error('Error fetching vendor orders:', err)
    rawRows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchVendorOrders()
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
