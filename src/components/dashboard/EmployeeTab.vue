<template>
  <div class="space-y-8">
    <!-- Page Header -->
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('employee.dashboard') }}</h2>
      <p class="text-lg text-gray-600">{{ $t('employee.dashboardDescription') }}</p>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center space-x-3 space-x-reverse">
          <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-store text-yellow-600 text-xl"></i>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-800">{{ pendingStoresCount }}</h3>
            <p class="text-sm text-gray-600">{{ $t('employee.pendingStores') }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center space-x-3 space-x-reverse">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-box text-blue-600 text-xl"></i>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-800">{{ pendingProductsCount }}</h3>
            <p class="text-sm text-gray-600">{{ $t('employee.pendingProducts') }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center space-x-3 space-x-reverse">
          <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-file-alt text-purple-600 text-xl"></i>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-800">{{ pendingVerificationsCount }}</h3>
            <p class="text-sm text-gray-600">{{ $t('employee.pendingVerifications') }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center space-x-3 space-x-reverse">
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-check-circle text-green-600 text-xl"></i>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-800">{{ todayApprovalsCount }}</h3>
            <p class="text-sm text-gray-600">{{ $t('employee.todayApprovals') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('employee.quickActions') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          @click="$emit('navigate-to', 'stores')"
          class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
        >
          <i class="fas fa-store text-2xl text-gray-600 mb-2"></i>
          <h3 class="font-semibold text-gray-800">{{ $t('employee.reviewStores') }}</h3>
          <p class="text-sm text-gray-600">{{ $t('employee.reviewStoresDescription') }}</p>
        </button>

        <button
          @click="$emit('navigate-to', 'products')"
          class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
        >
          <i class="fas fa-box text-2xl text-gray-600 mb-2"></i>
          <h3 class="font-semibold text-gray-800">{{ $t('employee.reviewProducts') }}</h3>
          <p class="text-sm text-gray-600">{{ $t('employee.reviewProductsDescription') }}</p>
        </button>

        <button
          @click="$emit('navigate-to', 'verifications')"
          class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
        >
          <i class="fas fa-file-alt text-2xl text-gray-600 mb-2"></i>
          <h3 class="font-semibold text-gray-800">{{ $t('employee.reviewVerifications') }}</h3>
          <p class="text-sm text-gray-600">{{ $t('employee.reviewVerificationsDescription') }}</p>
        </button>
      </div>
    </div>

    <!-- Recent Pending Items -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Pending Stores -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">{{ $t('employee.pendingStores') }}</h3>
          <button
            @click="$emit('navigate-to', 'stores')"
            class="text-primary hover:text-primary-dark font-medium text-sm"
          >
            {{ $t('common.viewAll') }}
          </button>
        </div>
        
        <div v-if="loading" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-primary text-2xl"></i>
          <p class="text-gray-600 mt-2">{{ $t('common.loading') }}</p>
        </div>
        
        <div v-else-if="pendingStores.length === 0" class="text-center py-8">
          <i class="fas fa-check-circle text-gray-400 text-4xl mb-4"></i>
          <h4 class="text-lg font-semibold text-gray-800 mb-2">{{ $t('employee.noPendingStores') }}</h4>
          <p class="text-gray-600">{{ $t('employee.noPendingStoresMessage') }}</p>
        </div>
        
        <div v-else class="space-y-3">
          <div
            v-for="store in pendingStores.slice(0, 3)"
            :key="store.id"
            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div class="flex items-center space-x-3 space-x-reverse">
              <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <img 
                  v-if="store.logo_url" 
                  :src="store.logo_url" 
                  :alt="store.name"
                  class="w-full h-full object-cover rounded-xl"
                />
                <i v-else class="fas fa-store text-white text-lg"></i>
              </div>
              <div>
                <h4 class="font-semibold text-gray-800">{{ store.name || $t('stores.defaultStoreName') }}</h4>
                <p class="text-sm text-gray-600">{{ store.owner_email }}</p>
              </div>
            </div>
            <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
              {{ $t('employee.pending') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Pending Verifications -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">{{ $t('employee.pendingVerifications') }}</h3>
          <button
            @click="$emit('navigate-to', 'verifications')"
            class="text-primary hover:text-primary-dark font-medium text-sm"
          >
            {{ $t('common.viewAll') }}
          </button>
        </div>
        
        <div v-if="loading" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-primary text-2xl"></i>
          <p class="text-gray-600 mt-2">{{ $t('common.loading') }}</p>
        </div>
        
        <div v-else-if="pendingVerifications.length === 0" class="text-center py-8">
          <i class="fas fa-check-circle text-gray-400 text-4xl mb-4"></i>
          <h4 class="text-lg font-semibold text-gray-800 mb-2">{{ $t('employee.noPendingVerifications') }}</h4>
          <p class="text-gray-600">{{ $t('employee.noPendingVerificationsMessage') }}</p>
        </div>
        
        <div v-else class="space-y-3">
          <div
            v-for="verification in pendingVerifications.slice(0, 3)"
            :key="verification.id"
            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div class="flex items-center space-x-3 space-x-reverse">
              <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <i class="fas fa-file-image text-gray-600 text-lg"></i>
              </div>
              <div>
                <h4 class="font-semibold text-gray-800">{{ getDocumentTypeName(verification.verification_type) }}</h4>
                <p class="text-sm text-gray-600">{{ verification.user_email }}</p>
              </div>
            </div>
            <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
              {{ $t('employee.pending') }}
            </span>
          </div>
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
const pendingStores = ref([])
const pendingProducts = ref([])
const pendingVerifications = ref([])

// Computed
const pendingStoresCount = computed(() => pendingStores.value.length)
const pendingProductsCount = computed(() => pendingProducts.value.length)
const pendingVerificationsCount = computed(() => pendingVerifications.value.length)
const todayApprovalsCount = computed(() => 0) // TODO: Implement today's approvals count

// Methods
const fetchPendingData = async () => {
  try {
    loading.value = true
    
    // Fetch pending stores
    const { data: stores } = await supabase
      .from('stores')
      .select(`
        *,
        profiles!stores_owner_id_fkey(email as owner_email),
        packs(name as pack_name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5)

    // Fetch pending verifications
    const { data: verifications } = await supabase
      .from('verifications')
      .select(`
        *,
        profiles!verifications_user_id_fkey(email as user_email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5)

    pendingStores.value = stores || []
    pendingVerifications.value = verifications || []
    
  } catch (error) {
    console.error('Error fetching pending data:', error)
  } finally {
    loading.value = false
  }
}

const getDocumentTypeName = (type) => {
  const types = {
    'id_card': $t('verification.idCard'),
    'driving_license': $t('verification.drivingLicense'),
    'passport': $t('verification.passport'),
    'commerce_register': $t('verification.commerceRegister'),
    'payment_receipt': $t('verification.paymentReceipt')
  }
  return types[type] || type
}

// Lifecycle
onMounted(() => {
  fetchPendingData()
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-xl shadow-soft p-6;
}
</style>
