<template>
  <div class="px-4 sm:px-6 lg:px-8 py-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-gray-900">Webhooks</h1>
        <p class="text-sm text-gray-600 mt-1">Monitor and manage Maystro webhook processing</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="refreshAll"
          :disabled="loading"
          class="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
          <i v-else class="fas fa-sync-alt mr-2"></i>
          Refresh
        </button>
        <button
          @click="togglePolling"
          class="inline-flex items-center px-3 py-2 rounded-lg"
          :class="pollingStatus.active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'"
        >
          <i :class="pollingStatus.active ? 'fas fa-stop mr-2' : 'fas fa-play mr-2'"></i>
          {{ pollingStatus.active ? 'Stop Polling' : 'Start Polling' }}
        </button>
      </div>
    </div>

    <!-- Health summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500 mb-1">Recent Errors (7d)</div>
        <div class="text-2xl font-semibold">{{ retryStats.totalErrors }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500 mb-1">Retries Attempted (7d)</div>
        <div class="text-2xl font-semibold">{{ retryStats.totalRetries }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500 mb-1">Polling</div>
        <div class="text-2xl font-semibold">
          <span :class="pollingStatus.active ? 'text-green-600' : 'text-gray-600'">
            {{ pollingStatus.active ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Webhook Logs -->
      <div class="bg-white rounded-lg shadow">
        <div class="flex items-center justify-between p-4 border-b">
          <h2 class="text-sm font-semibold text-gray-800">Recent Webhook Logs</h2>
          <button @click="fetchWebhookLogs" class="text-xs text-indigo-600 hover:underline">Reload</button>
        </div>
        <div class="max-h-[420px] overflow-y-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Event</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Attempts</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Time</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="log in webhookLogs" :key="log.id" class="hover:bg-gray-50">
                <td class="px-3 py-2 text-xs text-gray-900 truncate" :title="log.event">{{ log.event }}</td>
                <td class="px-3 py-2 text-xs">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-medium"
                    :class="log.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                  >
                    {{ log.success ? 'Success' : 'Failed' }}
                  </span>
                </td>
                <td class="px-3 py-2 text-xs text-gray-900">{{ log.attempts }}</td>
                <td class="px-3 py-2 text-xs text-gray-500">{{ formatDate(log.created_at) }}</td>
              </tr>
              <tr v-if="!webhookLogs.length">
                <td colspan="4" class="px-3 py-6 text-center text-xs text-gray-500">No logs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Dead Letter Queue -->
      <div class="bg-white rounded-lg shadow">
        <div class="flex items-center justify-between p-4 border-b">
          <h2 class="text-sm font-semibold text-gray-800">Dead Letter Queue</h2>
          <button @click="fetchDeadLetterQueue" class="text-xs text-indigo-600 hover:underline">Reload</button>
        </div>
        <div class="max-h-[420px] overflow-y-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">ID</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Event</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Added</th>
                <th class="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in deadLetterQueue" :key="item.id" class="hover:bg-gray-50">
                <td class="px-3 py-2 text-xs text-gray-900 truncate" :title="item.id">{{ item.id }}</td>
                <td class="px-3 py-2 text-xs text-gray-900 truncate" :title="item.event">{{ item.event }}</td>
                <td class="px-3 py-2 text-xs text-gray-500">{{ formatDate(item.created_at) }}</td>
                <td class="px-3 py-2 text-right">
                  <button
                    @click="retryDeadLetter(item.id)"
                    class="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                  >Retry</button>
                </td>
              </tr>
              <tr v-if="!deadLetterQueue.length">
                <td colspan="4" class="px-3 py-6 text-center text-xs text-gray-500">Queue is empty</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'

const loading = ref(false)
const webhookLogs = ref([])
const deadLetterQueue = ref([])
const retryStats = ref({ totalErrors: 0, totalRetries: 0 })
const pollingStatus = ref({ active: false })

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const authHeaders = async () => {
  const session = await supabase.auth.getSession()
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.data.session?.access_token || ''}`
  }
}

const formatDate = (d) => d ? new Date(d).toLocaleString() : ''

const fetchWebhookLogs = async () => {
  try {
    const res = await fetch(`${apiBase}/api/error-handling/webhook-logs`, { headers: await authHeaders() })
    const data = await res.json()
    webhookLogs.value = Array.isArray(data) ? data : (data.logs || [])
  } catch (e) {
    console.error('Failed to load webhook logs', e)
    webhookLogs.value = []
  }
}

const fetchDeadLetterQueue = async () => {
  try {
    const res = await fetch(`${apiBase}/api/error-handling/dead-letter-queue`, { headers: await authHeaders() })
    const data = await res.json()
    deadLetterQueue.value = Array.isArray(data) ? data : (data.items || [])
  } catch (e) {
    console.error('Failed to load dead letter queue', e)
    deadLetterQueue.value = []
  }
}

const fetchRetryStats = async () => {
  try {
    const res = await fetch(`${apiBase}/api/error-handling/retry-stats`, { headers: await authHeaders() })
    const data = await res.json()
    retryStats.value = data || { totalErrors: 0, totalRetries: 0 }
  } catch (e) {
    console.error('Failed to load retry stats', e)
    retryStats.value = { totalErrors: 0, totalRetries: 0 }
  }
}

const fetchPollingStatus = async () => {
  try {
    const res = await fetch(`${apiBase}/api/error-handling/polling-status`, { headers: await authHeaders() })
    const data = await res.json()
    pollingStatus.value = data || { active: false }
  } catch (e) {
    console.error('Failed to load polling status', e)
    pollingStatus.value = { active: false }
  }
}

const retryDeadLetter = async (id) => {
  try {
    const res = await fetch(`${apiBase}/api/error-handling/retry-webhook`, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ id })
    })
    if (!res.ok) throw new Error('Retry failed')
    await Promise.all([fetchDeadLetterQueue(), fetchWebhookLogs(), fetchRetryStats()])
  } catch (e) {
    console.error('Failed to retry dead letter item', e)
  }
}

const togglePolling = async () => {
  try {
    const endpoint = pollingStatus.value.active ? 'stop-polling' : 'start-polling'
    const res = await fetch(`${apiBase}/api/error-handling/${endpoint}`, {
      method: 'POST',
      headers: await authHeaders()
    })
    if (!res.ok) throw new Error('Polling toggle failed')
    await fetchPollingStatus()
  } catch (e) {
    console.error('Failed to toggle polling', e)
  }
}

const refreshAll = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchWebhookLogs(),
      fetchDeadLetterQueue(),
      fetchRetryStats(),
      fetchPollingStatus()
    ])
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshAll()
})
</script>

<style scoped>
</style>
