<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Store Dashboard Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4 space-x-reverse">
            <router-link 
              to="/dashboard" 
              class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <i class="fas fa-arrow-left text-xl"></i>
            </router-link>
            <div>
              <h1 class="text-2xl font-bold text-gray-800">
                {{ storeStore.currentStore?.name || $t('stores.storeDashboard') }}
              </h1>
              <p class="text-gray-600">{{ $t('stores.manageDashboardDescription') }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <!-- View Public Store -->
            <router-link 
              :to="`/stores/${$route.params.id}`"
              class="btn-outline"
            >
              <i class="fas fa-eye mr-2"></i>
              {{ $t('stores.viewPublicStore') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="storeStore.loading" class="container mx-auto px-4 py-8">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="mt-2 text-gray-600">{{ $t('stores.loading') }}</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="storeStore.error" class="container mx-auto px-4 py-8">
      <div class="text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ $t('stores.errorTitle') }}</h3>
        <p class="text-gray-600 mb-4">{{ storeStore.error }}</p>
        <button @click="retryFetch" class="btn-primary">
          {{ $t('stores.retry') }}
        </button>
      </div>
    </div>

    <!-- Store Status Display -->
    <div v-else-if="storeStore.currentStore && storeStatus && storeStatus.status !== 'approved'" class="container mx-auto px-4 py-8">
      <!-- Pending Status -->
      <div v-if="storeStatus.status === 'pending'" class="text-center">
        <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="fas fa-clock text-yellow-600 text-3xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ $t('stores.statusPending') }}</h2>
        <p class="text-gray-600 mb-6 max-w-md mx-auto">{{ $t('stores.pendingMessage') }}</p>
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
          <div class="flex items-center justify-center space-x-2">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
            <span class="text-yellow-800 font-medium">{{ $t('stores.storeStatus') }}: {{ $t('stores.statusPending') }}</span>
          </div>
        </div>
      </div>

      <!-- Rejected Status -->
      <div v-else-if="storeStatus.status === 'rejected'" class="text-center">
        <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="fas fa-times-circle text-red-600 text-3xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ $t('stores.statusRejected') }}</h2>
        <p class="text-gray-600 mb-6 max-w-md mx-auto">{{ $t('stores.rejectedMessage') }}</p>
        
        <div v-if="storeStatus.rejection_reason" class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto mb-6">
          <h3 class="text-lg font-semibold text-red-800 mb-3">{{ $t('stores.rejectionReason') }}</h3>
          <p class="text-red-700 text-left">{{ storeStatus.rejection_reason }}</p>
        </div>
        
      </div>

      <!-- Unknown Status -->
      <div v-else class="text-center">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="fas fa-question-circle text-gray-600 text-3xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ $t('stores.storeStatus') }}</h2>
        <p class="text-gray-600 mb-6">{{ $t('stores.errorTitle') }}</p>
        <button @click="retryFetch" class="btn-primary">
          {{ $t('stores.retry') }}
        </button>
      </div>
    </div>

    <!-- Store Dashboard Content (Only for approved stores) -->
    <div v-else-if="storeStore.currentStore && storeStatus && storeStatus.status === 'approved'" class="container mx-auto px-4 py-8">
      
      <!-- Store Overview -->
      <div class="bg-white rounded-xl shadow-soft p-6 mb-8">
        <div class="flex items-start space-x-6">
          <!-- Store Logo -->
          <div class="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center">
            <img 
              v-if="storeStore.currentStore.logo_url" 
              :src="storeStore.currentStore.logo_url" 
              :alt="storeStore.currentStore.name"
              class="w-full h-full object-cover rounded-xl"
            />
            <i v-else class="fas fa-store text-gray-400 text-2xl"></i>
          </div>

          <!-- Store Info -->
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">
              {{ storeStore.currentStore.name }}
            </h2>
            <p v-if="storeStore.currentStore.description" class="text-gray-600 mb-4">
              {{ storeStore.currentStore.description }}
            </p>
            <div class="flex items-center space-x-4 text-sm text-gray-500">
              <span>
                <i class="fas fa-calendar-alt mr-1"></i>
                {{ $t('stores.createdOn') }} {{ formatDate(storeStore.currentStore.created_at) }}
              </span>
              <span>
                <i class="fas fa-box mr-1"></i>
                {{ storeProducts.length }} {{ $t('stores.products') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Total Products -->
        <div class="bg-white rounded-xl shadow-soft p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fas fa-box text-blue-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-800">{{ storeProducts.length }}</h3>
              <p class="text-gray-600">{{ $t('stores.totalProducts') }}</p>
            </div>
          </div>
        </div>

        <!-- Store Views -->
        <div class="bg-white rounded-xl shadow-soft p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fas fa-eye text-green-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-800">-</h3>
              <p class="text-gray-600">{{ $t('stores.storeViews') }}</p>
            </div>
          </div>
        </div>

        <!-- Total Sales -->
        <div class="bg-white rounded-xl shadow-soft p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fas fa-chart-line text-purple-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-800">-</h3>
              <p class="text-gray-600">{{ $t('stores.totalSales') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-xl shadow-soft p-6 mb-8">
        <h3 class="text-xl font-bold text-gray-800 mb-6">{{ $t('stores.quickActions') }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <router-link :to="`/myannouncements/new?store_id=${storeStore.currentStore.id}`" class="btn-primary text-center py-4">
            <i class="fas fa-plus text-2xl mb-2 block"></i>
            {{ $t('stores.addProduct') }}
          </router-link>
          <button @click="showEditModal = true" class="btn-outline text-center py-4">
            <i class="fas fa-edit text-2xl mb-2 block"></i>
            {{ $t('stores.editStore') }}
          </button>
          <router-link :to="`/stores/${storeStore.currentStore.id}`" class="btn-secondary text-center py-4">
            <i class="fas fa-eye text-2xl mb-2 block"></i>
            {{ $t('stores.viewPublicStore') }}
          </router-link>
          <button @click="showAnalytics = !showAnalytics" class="btn-outline text-center py-4">
            <i class="fas fa-chart-bar text-2xl mb-2 block"></i>
            {{ $t('stores.analytics') }}
          </button>
        </div>
      </div>

      <!-- Store Products -->
      <div class="bg-white rounded-xl shadow-soft p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-gray-800">{{ $t('stores.storeProducts') }}</h3>
          <router-link :to="`/myannouncements/new?store_id=${storeStore.currentStore.id}`" class="btn-primary">
            <i class="fas fa-plus mr-2"></i>
            {{ $t('stores.addProduct') }}
          </router-link>
        </div>

        <!-- Products Grid -->
        <div v-if="storeProducts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ProductCard 
            v-for="product in storeProducts" 
            :key="product.id" 
            :product="product"
            class="h-full"
          />
        </div>

        <!-- No Products State -->
        <div v-else class="text-center py-12">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-box-open text-gray-400 text-3xl"></i>
          </div>
          <h4 class="text-lg font-semibold text-gray-800 mb-2">{{ $t('stores.noProductsTitle') }}</h4>
          <p class="text-gray-600 mb-6">{{ $t('stores.noProductsMessage') }}</p>
          <router-link :to="`/myannouncements/new?store_id=${storeStore.currentStore.id}`" class="btn-primary">
            <i class="fas fa-plus mr-2"></i>
            {{ $t('stores.addFirstProduct') }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- Edit Store Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-soft max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-800">{{ $t('stores.editStore') }}</h3>
            <button
              @click="closeEditModal"
              class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form @submit.prevent="handleUpdateStore" class="space-y-6">
            <!-- Store Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('stores.storeName') }} *
              </label>
              <input
                v-model="editForm.name"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                :placeholder="$t('stores.storeNamePlaceholder')"
              />
            </div>

            <!-- Store Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('stores.storeDescription') }}
              </label>
              <textarea
                v-model="editForm.description"
                rows="4"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-none"
                :placeholder="$t('stores.storeDescriptionPlaceholder')"
              ></textarea>
            </div>

            <!-- Form Actions -->
            <div class="flex items-center justify-end space-x-3 space-x-reverse pt-4 border-t border-gray-200">
              <button
                type="button"
                @click="closeEditModal"
                class="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="updateLoading"
                class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div v-if="updateLoading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {{ $t('stores.updateStore') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStoreStore } from '../stores/store'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/ProductCard.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const storeStore = useStoreStore()

const showEditModal = ref(false)
const showAnalytics = ref(false)
const updateLoading = ref(false)
const storeProducts = ref([])
const storeStatus = ref(null)
const statusLoading = ref(false)

const editForm = reactive({
  name: '',
  description: ''
})

const fetchStoreProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(id, name_en, name_ar, name_fr, description, icon_url, is_active)')
      .eq('store_id', route.params.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    storeProducts.value = data || []
  } catch (err) {
    console.error('Error fetching store products:', err)
  }
}

const checkStoreStatus = async () => {
  try {
    statusLoading.value = true
    const statusData = await storeStore.getStoreStatus(route.params.id)
    storeStatus.value = statusData
  } catch (err) {
    console.error('Error checking store status:', err)
    storeStatus.value = { status: 'unknown', rejection_reason: null }
  } finally {
    statusLoading.value = false
  }
}

const retryFetch = async () => {
  storeStore.clearError()
  await Promise.all([
    storeStore.fetchStoreById(route.params.id),
    fetchStoreProducts(),
    checkStoreStatus()
  ])
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const closeEditModal = () => {
  showEditModal.value = false
  // Reset form to current store data
  if (storeStore.currentStore) {
    editForm.name = storeStore.currentStore.name
    editForm.description = storeStore.currentStore.description || ''
  }
}

const handleUpdateStore = async () => {
  try {
    updateLoading.value = true
    
    const updateData = {
      name: editForm.name.trim(),
      description: editForm.description?.trim() || null
    }

    await storeStore.updateStore(route.params.id, updateData)
    
    closeEditModal()
  } catch (error) {
    console.error('Error updating store:', error)
    alert(error.message || 'Failed to update store')
  } finally {
    updateLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    storeStore.fetchStoreById(route.params.id),
    fetchStoreProducts(),
    checkStoreStatus()
  ])
  
  // Initialize edit form with current store data
  if (storeStore.currentStore) {
    editForm.name = storeStore.currentStore.name
    editForm.description = storeStore.currentStore.description || ''
  }
})

onUnmounted(() => {
  storeStore.clearCurrentStore()
})
</script>

<style scoped>
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
  border: 2px solid #d1d5db;
  color: #374151;
  background-color: transparent;
  font-weight: 500;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-outline:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-primary);
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background-color: #e5e7eb;
  color: #1f2937;
  font-weight: 500;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}

.btn-secondary:focus {
  outline: none;
  box-shadow: 0 0 0 2px #6b7280;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.shadow-soft {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
