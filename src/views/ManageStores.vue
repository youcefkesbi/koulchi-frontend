<template>
  <div class="min-h-screen bg-white">
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Store Management</h1>
        <p class="mt-2 text-gray-600">Manage all stores and their status</p>
      </div>

      <!-- Store Management Table -->
      <div class="bg-white rounded-lg shadow-md">
        <!-- Table Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-800">All Stores</h2>
            
            <!-- Search and Filter Controls -->
            <div class="flex items-center space-x-4">
              <!-- Search Input -->
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search stores..."
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
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <i class="fas fa-spinner fa-spin text-blue-600 text-3xl mb-4"></i>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Loading Stores</h3>
          <p class="text-gray-600">Please wait while we fetch store data...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-4"></i>
          <h3 class="text-lg font-semibold text-red-800 mb-2">Error Loading Stores</h3>
          <p class="text-red-600">{{ error }}</p>
          <button 
            @click="fetchStores"
            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
        
        <!-- Stores Table -->
        <div v-else-if="filteredStores.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pack
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="store in filteredStores" :key="store.store_id" class="hover:bg-gray-50">
                <!-- Store Name -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ store.store_name }}
                  </div>
                </td>
                
                <!-- Description -->
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 max-w-xs truncate" :title="store.store_description">
                    {{ store.store_description }}
                  </div>
                </td>
                
                <!-- Owner -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ store.owner_name }}</div>
                </td>
                
                <!-- Pack -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ store.pack_name }}</div>
                </td>
                
                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <!-- Show select button only for approved stores -->
                  <select 
                    v-if="store.status === 'approved'"
                    :value="store.status"
                    @change="updateStoreStatus(store.store_id, $event.target.value)"
                    class="text-sm font-semibold rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer bg-green-100 text-green-800"
                  >
                    <option value="approved" class="bg-white text-gray-900">Approved</option>
                    <option value="suspended" class="bg-white text-gray-900">Suspended</option>
                  </select>
                  
                  <!-- Show static badge for non-approved stores -->
                  <span 
                    v-else
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-yellow-100 text-yellow-800': store.status === 'pending',
                      'bg-red-100 text-red-800': store.status === 'rejected',
                      'bg-gray-100 text-gray-800': store.status === 'suspended'
                    }"
                  >
                    {{ store.status.charAt(0).toUpperCase() + store.status.slice(1) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- No Stores State -->
        <div v-else class="text-center py-12">
          <i class="fas fa-store text-gray-400 text-4xl mb-4"></i>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">No Stores Found</h3>
          <p class="text-gray-600">
            {{ searchQuery || statusFilter ? 'No stores match your search criteria.' : 'No stores have been created yet.' }}
          </p>
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
const stores = ref([])
const loading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const statusFilter = ref('')

// Computed properties
const filteredStores = computed(() => {
  let filtered = stores.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(store => 
      store.store_name.toLowerCase().includes(query) ||
      store.store_description.toLowerCase().includes(query) ||
      store.owner_name.toLowerCase().includes(query) ||
      store.pack_name.toLowerCase().includes(query)
    )
  }

  // Filter by status
  if (statusFilter.value) {
    filtered = filtered.filter(store => store.status === statusFilter.value)
  }

  return filtered
})

// Methods
const fetchStores = async () => {
  try {
    loading.value = true
    error.value = null

    const { data, error: fetchError } = await supabase.rpc('get_all_stores_for_admin')
    
    if (fetchError) throw fetchError
    
    stores.value = data || []
  } catch (err) {
    console.error('Error fetching stores:', err)
    error.value = err.message || 'Failed to fetch stores'
  } finally {
    loading.value = false
  }
}

const updateStoreStatus = async (storeId, newStatus) => {
  try {
    // Check if user has admin role before proceeding
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      throw new Error('You must be logged in to perform this action')
    }
    
    // Verify admin role
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
    
    if (roleError) {
      console.error('Error checking user roles:', roleError)
      throw new Error('Unable to verify permissions')
    }
    
    const hasAdminRole = userRoles?.some(ur => ur.role === 'admin')
    if (!hasAdminRole) {
      throw new Error('Admin access required to manage stores')
    }
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout - please try again')), 15000)
    })
    
    const updatePromise = supabase
      .from('stores')
      .update({ 
        status: newStatus,
        reviewed_by: session.user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', storeId)
    
    // Race between operation and timeout
    const { error: updateError } = await Promise.race([
      updatePromise,
      timeoutPromise
    ])
    
    if (updateError) {
      console.error('Update operation error:', updateError)
      
      // Handle specific error types
      if (updateError.code === 'PGRST301') {
        throw new Error('Permission denied - you may not have admin access')
      } else if (updateError.code === '23514') {
        throw new Error('Invalid status value provided')
      } else {
        throw new Error(updateError.message || 'Failed to update store status')
      }
    }
    
    // Update local state
    const storeIndex = stores.value.findIndex(s => s.store_id === storeId)
    if (storeIndex !== -1) {
      stores.value[storeIndex].status = newStatus
    }
    
    console.log(`Store ${storeId} status updated to ${newStatus}`)
  } catch (err) {
    console.error('Error updating store status:', err)
    error.value = err.message || 'Failed to update store status'
    alert(`Error: ${err.message}`)
  }
}

// Lifecycle
onMounted(() => {
  fetchStores()
})
</script>

<style scoped>
/* Custom styles if needed */
</style>