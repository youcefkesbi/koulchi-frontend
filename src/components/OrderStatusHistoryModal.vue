<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
    @click.self="close"
  >
    <div class="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500/75 transition-opacity" aria-hidden="true"></div>
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      
      <div class="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
          <!-- Header -->
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              {{ $t('maystro.orders.statusHistory.title') }}
            </h3>
            <button
              @click="close"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-blue-600 text-2xl mb-2"></i>
            <p class="text-gray-600">{{ $t('common.loading') }}</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="text-center py-8">
            <i class="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
            <p class="text-red-600">{{ error }}</p>
          </div>

          <!-- Status Timeline -->
          <div v-else-if="statusHistory.length > 0" class="space-y-4">
            <div class="flow-root">
              <ul class="-mb-8">
                <li v-for="(log, index) in statusHistory" :key="log.id" class="relative pb-8">
                  <div v-if="index !== statusHistory.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></div>
                  <div class="relative flex space-x-3">
                    <div>
                      <span
                        :class="[
                          'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white',
                          getStatusColor(log.new_status)
                        ]"
                      >
                        <svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div>
                        <p class="text-sm font-medium text-gray-900">
                          {{ formatStatus(log.new_status) }}
                        </p>
                        <p class="text-xs text-gray-500 mt-1">
                          {{ formatDate(log.created_at) }}
                        </p>
                        <p v-if="log.old_status && log.old_status !== log.new_status" class="text-xs text-gray-400 mt-1">
                          {{ $t('maystro.orders.statusHistory.from') }} {{ formatStatus(log.old_status) }}
                        </p>
                        <p v-if="log.triggered_by" class="text-xs text-gray-400 mt-1">
                          {{ $t('maystro.orders.statusHistory.triggeredBy') }}: {{ formatTriggeredBy(log.triggered_by) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <!-- No History State -->
          <div v-else class="text-center py-8">
            <i class="fas fa-clock text-gray-400 text-3xl mb-4"></i>
            <p class="text-gray-600">{{ $t('maystro.orders.statusHistory.noHistory') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '../lib/supabase'

export default {
  name: 'OrderStatusHistoryModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    orderId: {
      type: String,
      default: null
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const loading = ref(false)
    const error = ref(null)
    const statusHistory = ref([])

    const loadStatusHistory = async () => {
      if (!props.orderId) {
        statusHistory.value = []
        return
      }

      try {
        loading.value = true
        error.value = null

        // Fetch current order status first
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('status, created_at')
          .eq('id', props.orderId)
          .single()

        if (orderError) throw orderError

        // Call RPC function to get status history
        const { data: historyData, error: fetchError } = await supabase.rpc('get_order_status_history', {
          order_uuid: props.orderId
        })

        if (fetchError) throw fetchError

        // Build timeline: start with initial status, then add history
        const timeline = []
        
        // Add initial status
        if (!historyData || historyData.length === 0) {
          // No history, show current status as initial
          timeline.push({
            id: 'initial',
            old_status: null,
            new_status: orderData.status,
            triggered_by: 'system',
            created_at: orderData.created_at || new Date().toISOString()
          })
        } else {
          // Reverse to get oldest first (RPC returns DESC order)
          const sortedHistory = [...historyData].reverse()
          
          // Get the initial status from the oldest entry's old_status
          const oldestEntry = sortedHistory[0]
          const initialStatus = oldestEntry.old_status || orderData.status
          
          // Add initial status entry
          timeline.push({
            id: 'initial',
            old_status: null,
            new_status: initialStatus,
            triggered_by: 'system',
            created_at: orderData.created_at || sortedHistory[0].created_at || new Date().toISOString()
          })
          
          // Add all history entries (already in oldest-first order)
          timeline.push(...sortedHistory)
        }

        // Ensure timeline is sorted by created_at ascending (oldest first)
        timeline.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

        statusHistory.value = timeline
      } catch (err) {
        error.value = err.message
        console.error('Error loading status history:', err)
      } finally {
        loading.value = false
      }
    }

    const close = () => {
      emit('close')
    }

    const formatStatus = (status) => {
      const statusMap = {
        pending: t('dashboard.orders.filters.pending'),
        confirmed: t('dashboard.orders.filters.confirmed'),
        shipped: t('dashboard.orders.filters.shipped'),
        delivered: t('dashboard.orders.filters.delivered'),
        cancelled: t('dashboard.orders.filters.cancelled')
      }
      return statusMap[status] || status
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleString()
    }

    const formatTriggeredBy = (triggeredBy) => {
      const triggeredByMap = {
        webhook: t('maystro.orders.statusHistory.webhook'),
        manual: t('maystro.orders.statusHistory.manual'),
        system: t('maystro.orders.statusHistory.system')
      }
      return triggeredByMap[triggeredBy] || triggeredBy
    }

    const getStatusColor = (status) => {
      const colorMap = {
        pending: 'bg-yellow-500',
        confirmed: 'bg-blue-500',
        shipped: 'bg-purple-500',
        delivered: 'bg-green-500',
        cancelled: 'bg-red-500'
      }
      return colorMap[status] || 'bg-gray-500'
    }

    // Watch for orderId changes and load history
    watch(() => [props.show, props.orderId], () => {
      if (props.show && props.orderId) {
        loadStatusHistory()
      } else {
        statusHistory.value = []
        error.value = null
      }
    }, { immediate: true })

    return {
      loading,
      error,
      statusHistory,
      close,
      formatStatus,
      formatDate,
      formatTriggeredBy,
      getStatusColor
    }
  }
}
</script>

<style scoped>
/* Additional styles if needed */
</style>


