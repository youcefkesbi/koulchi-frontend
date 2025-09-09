<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-soft border-b border-gray-100">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">{{ $t('employee.dashboard') }}</h1>
            <p class="text-gray-600">{{ $t('employee.dashboardDescription') }}</p>
          </div>
          <div class="flex items-center space-x-4 space-x-reverse">
            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {{ $t('employee.employeeRole') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-soft p-6">
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

        <div class="bg-white rounded-xl shadow-soft p-6">
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

        <div class="bg-white rounded-xl shadow-soft p-6">
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

        <div class="bg-white rounded-xl shadow-soft p-6">
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

      <!-- Tabs -->
      <div class="bg-white rounded-2xl shadow-soft mb-8">
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 space-x-reverse px-6">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <i :class="tab.icon + ' mr-2'"></i>
              {{ tab.name }}
              <span v-if="tab.count > 0" class="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                {{ tab.count }}
              </span>
            </button>
          </nav>
        </div>

        <div class="p-6">
          <!-- Pending Stores Tab -->
          <div v-if="activeTab === 'stores'" class="space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-800">{{ $t('employee.pendingStores') }}</h2>
              <button
                @click="refreshData"
                :disabled="loading"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <i class="fas fa-sync-alt mr-2" :class="{ 'animate-spin': loading }"></i>
                {{ $t('common.refresh') }}
              </button>
            </div>

            <div v-if="loading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p class="text-gray-600">{{ $t('common.loading') }}</p>
            </div>

            <div v-else-if="pendingStores.length === 0" class="text-center py-12">
              <div class="text-gray-400 text-5xl mb-4">
                <i class="fas fa-check-circle"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ $t('employee.noPendingStores') }}</h3>
              <p class="text-gray-600">{{ $t('employee.noPendingStoresMessage') }}</p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="store in pendingStores"
                :key="store.id"
                class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between">
                  <div class="flex items-start space-x-4 space-x-reverse">
                    <div class="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                      <img 
                        v-if="store.logo_url" 
                        :src="store.logo_url" 
                        :alt="store.name"
                        class="w-full h-full object-cover rounded-xl"
                      />
                      <i v-else class="fas fa-store text-white text-2xl"></i>
                    </div>
                    
                    <div class="flex-1">
                      <div class="flex items-center space-x-3 space-x-reverse mb-2">
                        <h3 class="text-lg font-semibold text-gray-800">{{ store.name || $t('stores.defaultStoreName') }}</h3>
                        <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          {{ $t('employee.pending') }}
                        </span>
                      </div>
                      
                      <p class="text-gray-600 mb-2">{{ store.description || $t('stores.noDescription') }}</p>
                      
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                        <div>
                          <strong>{{ $t('employee.owner') }}:</strong> {{ store.owner_email }}
                        </div>
                        <div>
                          <strong>{{ $t('employee.pack') }}:</strong> {{ store.pack_name }}
                        </div>
                        <div>
                          <strong>{{ $t('employee.created') }}:</strong> {{ formatDate(store.created_at) }}
                        </div>
                        <div>
                          <strong>{{ $t('employee.location') }}:</strong> {{ store.location }}
                        </div>
                      </div>

                      <div v-if="store.external_buttons && store.external_buttons.length > 0" class="mt-3">
                        <strong class="text-sm text-gray-700">{{ $t('employee.externalButtons') }}:</strong>
                        <div class="flex flex-wrap gap-2 mt-1">
                          <span
                            v-for="button in store.external_buttons"
                            :key="button.platform"
                            class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {{ button.platform }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center space-x-2 space-x-reverse">
                    <button
                      @click="approveStore(store.id)"
                      :disabled="processing"
                      class="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                    >
                      <i class="fas fa-check mr-2"></i>
                      {{ $t('employee.approve') }}
                    </button>
                    <button
                      @click="rejectStore(store.id)"
                      :disabled="processing"
                      class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      <i class="fas fa-times mr-2"></i>
                      {{ $t('employee.reject') }}
                    </button>
                    <button
                      @click="viewStoreDetails(store)"
                      class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <i class="fas fa-eye mr-2"></i>
                      {{ $t('common.view') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pending Products Tab -->
          <div v-if="activeTab === 'products'" class="space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-800">{{ $t('employee.pendingProducts') }}</h2>
              <button
                @click="refreshData"
                :disabled="loading"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <i class="fas fa-sync-alt mr-2" :class="{ 'animate-spin': loading }"></i>
                {{ $t('common.refresh') }}
              </button>
            </div>

            <div v-if="loading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p class="text-gray-600">{{ $t('common.loading') }}</p>
            </div>

            <div v-else-if="pendingProducts.length === 0" class="text-center py-12">
              <div class="text-gray-400 text-5xl mb-4">
                <i class="fas fa-check-circle"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ $t('employee.noPendingProducts') }}</h3>
              <p class="text-gray-600">{{ $t('employee.noPendingProductsMessage') }}</p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="product in pendingProducts"
                :key="product.id"
                class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between">
                  <div class="flex items-start space-x-4 space-x-reverse">
                    <div class="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                      <img 
                        v-if="product.image_urls && product.image_urls.length > 0" 
                        :src="product.image_urls[0]" 
                        :alt="product.name"
                        class="w-full h-full object-cover rounded-xl"
                      />
                      <i v-else class="fas fa-box text-gray-400 text-2xl"></i>
                    </div>
                    
                    <div class="flex-1">
                      <div class="flex items-center space-x-3 space-x-reverse mb-2">
                        <h3 class="text-lg font-semibold text-gray-800">{{ product.name }}</h3>
                        <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          {{ $t('employee.pending') }}
                        </span>
                      </div>
                      
                      <p class="text-gray-600 mb-2">{{ product.description || $t('products.noDescription') }}</p>
                      
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                        <div>
                          <strong>{{ $t('employee.price') }}:</strong> {{ product.price }} DZD
                        </div>
                        <div>
                          <strong>{{ $t('employee.stock') }}:</strong> {{ product.stock_quantity }}
                        </div>
                        <div>
                          <strong>{{ $t('employee.store') }}:</strong> {{ product.store_name }}
                        </div>
                        <div>
                          <strong>{{ $t('employee.created') }}:</strong> {{ formatDate(product.created_at) }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center space-x-2 space-x-reverse">
                    <button
                      @click="approveProduct(product.id)"
                      :disabled="processing"
                      class="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                    >
                      <i class="fas fa-check mr-2"></i>
                      {{ $t('employee.approve') }}
                    </button>
                    <button
                      @click="rejectProduct(product.id)"
                      :disabled="processing"
                      class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      <i class="fas fa-times mr-2"></i>
                      {{ $t('employee.reject') }}
                    </button>
                    <button
                      @click="viewProductDetails(product)"
                      class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <i class="fas fa-eye mr-2"></i>
                      {{ $t('common.view') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pending Verifications Tab -->
          <div v-if="activeTab === 'verifications'" class="space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-800">{{ $t('employee.pendingVerifications') }}</h2>
              <button
                @click="refreshData"
                :disabled="loading"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <i class="fas fa-sync-alt mr-2" :class="{ 'animate-spin': loading }"></i>
                {{ $t('common.refresh') }}
              </button>
            </div>

            <div v-if="loading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p class="text-gray-600">{{ $t('common.loading') }}</p>
            </div>

            <div v-else-if="pendingVerifications.length === 0" class="text-center py-12">
              <div class="text-gray-400 text-5xl mb-4">
                <i class="fas fa-check-circle"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ $t('employee.noPendingVerifications') }}</h3>
              <p class="text-gray-600">{{ $t('employee.noPendingVerificationsMessage') }}</p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="verification in pendingVerifications"
                :key="verification.id"
                class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between">
                  <div class="flex items-start space-x-4 space-x-reverse">
                    <div class="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                      <i class="fas fa-file-image text-gray-600 text-2xl"></i>
                    </div>
                    
                    <div class="flex-1">
                      <div class="flex items-center space-x-3 space-x-reverse mb-2">
                        <h3 class="text-lg font-semibold text-gray-800">{{ getDocumentTypeName(verification.verification_type) }}</h3>
                        <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          {{ $t('employee.pending') }}
                        </span>
                      </div>
                      
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                        <div>
                          <strong>{{ $t('employee.user') }}:</strong> {{ verification.user_email }}
                        </div>
                        <div>
                          <strong>{{ $t('employee.uploaded') }}:</strong> {{ formatDate(verification.created_at) }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center space-x-2 space-x-reverse">
                    <button
                      @click="viewVerificationDocument(verification.document_url)"
                      class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <i class="fas fa-eye mr-2"></i>
                      {{ $t('common.view') }}
                    </button>
                    <button
                      @click="approveVerification(verification.id)"
                      :disabled="processing"
                      class="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                    >
                      <i class="fas fa-check mr-2"></i>
                      {{ $t('employee.approve') }}
                    </button>
                    <button
                      @click="rejectVerification(verification.id)"
                      :disabled="processing"
                      class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      <i class="fas fa-times mr-2"></i>
                      {{ $t('employee.reject') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rejection Modal -->
    <div v-if="showRejectionModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-soft max-w-md w-full">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('employee.rejectionReason') }}</h3>
          
          <textarea
            v-model="rejectionReason"
            rows="4"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
            :placeholder="$t('employee.rejectionReasonPlaceholder')"
          ></textarea>
          
          <div class="flex items-center justify-end space-x-3 space-x-reverse mt-6">
            <button
              @click="cancelRejection"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              @click="confirmRejection"
              :disabled="!rejectionReason.trim() || processing"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {{ $t('employee.reject') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Document Viewer Modal -->
    <div v-if="showDocumentViewer" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-soft max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div class="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">{{ $t('employee.documentViewer') }}</h3>
          <button
            @click="showDocumentViewer = false"
            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="p-6">
          <img 
            :src="viewingDocumentUrl" 
            :alt="viewingDocumentType"
            class="w-full h-auto max-h-[70vh] object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '../lib/supabase'

const { t: $t } = useI18n()

// State
const activeTab = ref('stores')
const loading = ref(false)
const processing = ref(false)
const showRejectionModal = ref(false)
const showDocumentViewer = ref(false)
const rejectionReason = ref('')
const currentRejectionTarget = ref(null)
const viewingDocumentUrl = ref('')
const viewingDocumentType = ref('')

// Data
const pendingStores = ref([])
const pendingProducts = ref([])
const pendingVerifications = ref([])

// Tabs configuration
const tabs = computed(() => [
  {
    id: 'stores',
    name: $t('employee.pendingStores'),
    icon: 'fas fa-store',
    count: pendingStores.value.length
  },
  {
    id: 'products',
    name: $t('employee.pendingProducts'),
    icon: 'fas fa-box',
    count: pendingProducts.value.length
  },
  {
    id: 'verifications',
    name: $t('employee.pendingVerifications'),
    icon: 'fas fa-file-alt',
    count: pendingVerifications.value.length
  }
])

// Computed properties
const pendingStoresCount = computed(() => pendingStores.value.length)
const pendingProductsCount = computed(() => pendingProducts.value.length)
const pendingVerificationsCount = computed(() => pendingVerifications.value.length)
const todayApprovalsCount = computed(() => 0) // TODO: Implement today's approvals count

// Methods
const fetchPendingStores = async () => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select(`
        *,
        profiles!stores_owner_id_fkey(email as owner_email),
        packs(name as pack_name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    pendingStores.value = data || []
  } catch (error) {
    console.error('Error fetching pending stores:', error)
  }
}

const fetchPendingProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        stores(name as store_name)
      `)
      .eq('is_active', false) // Assuming inactive means pending review
      .order('created_at', { ascending: false })

    if (error) throw error
    pendingProducts.value = data || []
  } catch (error) {
    console.error('Error fetching pending products:', error)
  }
}

const fetchPendingVerifications = async () => {
  try {
    const { data, error } = await supabase
      .from('verifications')
      .select(`
        *,
        profiles!verifications_user_id_fkey(email as user_email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    pendingVerifications.value = data || []
  } catch (error) {
    console.error('Error fetching pending verifications:', error)
  }
}

const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchPendingStores(),
      fetchPendingProducts(),
      fetchPendingVerifications()
    ])
  } finally {
    loading.value = false
  }
}

// Store actions
const approveStore = async (storeId) => {
  try {
    processing.value = true
    
    const { error } = await supabase
      .from('stores')
      .update({
        status: 'approved',
        reviewed_by: (await supabase.auth.getUser()).data.user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', storeId)

    if (error) throw error

    // Log the action
    await logEmployeeAction('approve_store', 'store', storeId, { action: 'approve' })

    // Refresh data
    await refreshData()
  } catch (error) {
    console.error('Error approving store:', error)
    alert('Failed to approve store')
  } finally {
    processing.value = false
  }
}

const rejectStore = (storeId) => {
  currentRejectionTarget.value = { type: 'store', id: storeId }
  showRejectionModal.value = true
}

const approveProduct = async (productId) => {
  try {
    processing.value = true
    
    const { error } = await supabase
      .from('products')
      .update({ is_active: true })
      .eq('id', productId)

    if (error) throw error

    // Log the action
    await logEmployeeAction('approve_product', 'product', productId, { action: 'approve' })

    // Refresh data
    await refreshData()
  } catch (error) {
    console.error('Error approving product:', error)
    alert('Failed to approve product')
  } finally {
    processing.value = false
  }
}

const rejectProduct = (productId) => {
  currentRejectionTarget.value = { type: 'product', id: productId }
  showRejectionModal.value = true
}

const approveVerification = async (verificationId) => {
  try {
    processing.value = true
    
    const { error } = await supabase
      .from('verifications')
      .update({
        status: 'approved',
        reviewed_by: (await supabase.auth.getUser()).data.user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', verificationId)

    if (error) throw error

    // Log the action
    await logEmployeeAction('approve_verification', 'verification', verificationId, { action: 'approve' })

    // Refresh data
    await refreshData()
  } catch (error) {
    console.error('Error approving verification:', error)
    alert('Failed to approve verification')
  } finally {
    processing.value = false
  }
}

const rejectVerification = (verificationId) => {
  currentRejectionTarget.value = { type: 'verification', id: verificationId }
  showRejectionModal.value = true
}

const confirmRejection = async () => {
  if (!rejectionReason.value.trim()) return

  try {
    processing.value = true
    
    const { type, id } = currentRejectionTarget.value
    let updateData = {
      status: 'rejected',
      reviewed_by: (await supabase.auth.getUser()).data.user.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: rejectionReason.value.trim()
    }

    let tableName = type === 'store' ? 'stores' : type === 'product' ? 'products' : 'verifications'
    
    if (type === 'product') {
      updateData = { is_active: false, rejection_reason: rejectionReason.value.trim() }
    }

    const { error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', id)

    if (error) throw error

    // Log the action
    await logEmployeeAction(`reject_${type}`, type, id, { 
      action: 'reject', 
      reason: rejectionReason.value.trim() 
    })

    // Reset modal
    showRejectionModal.value = false
    rejectionReason.value = ''
    currentRejectionTarget.value = null

    // Refresh data
    await refreshData()
  } catch (error) {
    console.error('Error rejecting item:', error)
    alert('Failed to reject item')
  } finally {
    processing.value = false
  }
}

const cancelRejection = () => {
  showRejectionModal.value = false
  rejectionReason.value = ''
  currentRejectionTarget.value = null
}

const viewStoreDetails = (store) => {
  // TODO: Implement store details modal
  console.log('View store details:', store)
}

const viewProductDetails = (product) => {
  // TODO: Implement product details modal
  console.log('View product details:', product)
}

const viewVerificationDocument = (documentUrl) => {
  viewingDocumentUrl.value = documentUrl
  viewingDocumentType.value = 'Document'
  showDocumentViewer.value = true
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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const logEmployeeAction = async (action, targetType, targetId, details = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.rpc('log_employee_action', {
      p_employee_id: user.id,
      p_action: action,
      p_target_type: targetType,
      p_target_id: targetId,
      p_details: details
    })
  } catch (error) {
    console.error('Error logging employee action:', error)
  }
}

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.btn-primary {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color, #3B82F6);
  color: white;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: var(--primary-dark, #2563EB);
}

.btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}
</style>
