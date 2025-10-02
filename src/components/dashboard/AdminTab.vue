<template>
  <div class="space-y-8">
    <!-- Page Header -->
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('admin.dashboard') }}</h2>
      <p class="text-lg text-gray-600">{{ $t('admin.dashboardDescription') }}</p>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center space-x-3 space-x-reverse">
          <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-users text-primary-600 text-xl"></i>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-800">{{ totalUsers }}</h3>
            <p class="text-sm text-gray-600">{{ $t('admin.totalUsers') }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center space-x-3 space-x-reverse">
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-store text-green-600 text-xl"></i>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-800">{{ totalStores }}</h3>
            <p class="text-sm text-gray-600">{{ $t('admin.totalStores') }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center space-x-3 space-x-reverse">
          <div class="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-box text-accent-600 text-xl"></i>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-800">{{ totalProducts }}</h3>
            <p class="text-sm text-gray-600">{{ $t('admin.totalProducts') }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center space-x-3 space-x-reverse">
          <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-chart-line text-yellow-600 text-xl"></i>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-800">{{ totalRevenue }}</h3>
            <p class="text-sm text-gray-600">{{ $t('admin.totalRevenue') }} (DZD)</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('admin.quickActions') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          @click="$emit('navigate-to', 'users')"
          class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
        >
          <i class="fas fa-users text-2xl text-gray-600 mb-2"></i>
          <h3 class="font-semibold text-gray-800">{{ $t('admin.manageUsers') }}</h3>
          <p class="text-sm text-gray-600">{{ $t('admin.manageUsersDescription') }}</p>
        </button>

        <button
          @click="$emit('navigate-to', 'stores')"
          class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
        >
          <i class="fas fa-store text-2xl text-gray-600 mb-2"></i>
          <h3 class="font-semibold text-gray-800">{{ $t('admin.manageStores') }}</h3>
          <p class="text-sm text-gray-600">{{ $t('admin.manageStoresDescription') }}</p>
        </button>

        <button
          @click="$emit('navigate-to', 'packs')"
          class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
        >
          <i class="fas fa-crown text-2xl text-gray-600 mb-2"></i>
          <h3 class="font-semibold text-gray-800">{{ $t('admin.managePacks') }}</h3>
          <p class="text-sm text-gray-600">{{ $t('admin.managePacksDescription') }}</p>
        </button>

        <button
          @click="$emit('navigate-to', 'logs')"
          class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
        >
          <i class="fas fa-list-alt text-2xl text-gray-600 mb-2"></i>
          <h3 class="font-semibold text-gray-800">{{ $t('admin.viewLogs') }}</h3>
          <p class="text-sm text-gray-600">{{ $t('admin.viewLogsDescription') }}</p>
        </button>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('admin.recentActivity') }}</h2>
      <div v-if="loading" class="text-center py-8">
        <i class="fas fa-spinner fa-spin text-primary text-2xl"></i>
        <p class="text-gray-600 mt-2">{{ $t('common.loading') }}</p>
      </div>
      <div v-else-if="recentLogs.length === 0" class="text-center py-8">
        <i class="fas fa-list-alt text-gray-400 text-4xl mb-4"></i>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ $t('admin.noRecentActivity') }}</h3>
        <p class="text-gray-600">{{ $t('admin.noRecentActivityMessage') }}</p>
      </div>
      <div v-else class="space-y-4">
        <div 
          v-for="log in recentLogs" 
          :key="log.id"
          class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <div class="flex items-center space-x-3 space-x-reverse">
            <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span class="text-white font-medium">{{ log.employee_email?.charAt(0) || 'A' }}</span>
            </div>
            <div>
              <h4 class="font-semibold text-gray-800">{{ log.action }}</h4>
              <p class="text-sm text-gray-600">{{ log.target_type }}: {{ log.target_id }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">{{ formatDate(log.created_at) }}</p>
            <span class="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800">
              {{ log.employee_email }}
            </span>
          </div>
        </div>
        <div class="text-center pt-4">
          <button 
            @click="$emit('navigate-to', 'logs')"
            class="text-primary hover:text-primary-dark font-medium"
          >
            {{ $t('admin.viewAllLogs') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '../../lib/supabase'

const { t: $t } = useI18n()

// Props
defineProps({
  // No props needed for this component
})

// Emits
defineEmits(['navigate-to'])

// State
const loading = ref(false)
const totalUsers = ref(0)
const totalStores = ref(0)
const totalProducts = ref(0)
const totalRevenue = ref(0)
const recentLogs = ref([])

// Methods
const fetchStats = async () => {
  try {
    loading.value = true
    
    // Fetch users count
    const { count: usersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    // Fetch stores count
    const { count: storesCount } = await supabase
      .from('stores')
      .select('*', { count: 'exact', head: true })
    
    // Fetch products count
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    // Fetch recent audit logs
    const { data: logs } = await supabase
      .from('audit_logs')
      .select(`
        *,
        profiles!audit_logs_employee_id_fkey(email as employee_email)
      `)
      .order('created_at', { ascending: false })
      .limit(5)
    
    totalUsers.value = usersCount || 0
    totalStores.value = storesCount || 0
    totalProducts.value = productsCount || 0
    totalRevenue.value = 0 // TODO: Calculate from orders
    recentLogs.value = logs || []
    
  } catch (error) {
    console.error('Error fetching admin stats:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  fetchStats()
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
