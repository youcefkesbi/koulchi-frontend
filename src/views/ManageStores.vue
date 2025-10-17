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
                  Roles
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="store in filteredStores" :key="store.store_id" class="hover:bg-gray-50 cursor-pointer" @click="openStoreDetails(store.store_id)">
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
                
                <!-- Roles -->
                <td class="px-6 py-4" @click.stop>
                  <div class="flex flex-col space-y-2">
                    <!-- Current Roles Display -->
                    <div class="flex flex-wrap gap-1">
                      <span 
                        v-for="role in store.roles || []" 
                        :key="role"
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {{ role }}
                        <button 
                          @click="removeRole(store.store_id, role)"
                          class="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <i class="fas fa-times text-xs"></i>
                        </button>
                      </span>
                    </div>
                    
                    <!-- Add Role Select -->
                    <div class="flex items-center space-x-2">
                      <select 
                        v-model="newRole[store.store_id]"
                        @change="addRole(store.store_id, $event.target.value)"
                        class="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        @click.stop
                      >
                        <option value="">Add Role</option>
                        <option value="customer">Customer</option>
                        <option value="vendor">Vendor</option>
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </td>
                
                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <!-- Show select button for approved and suspended stores -->
                  <select 
                    v-if="store.status === 'approved' || store.status === 'suspended'"
                    :value="store.status"
                    @change="updateStoreStatus(store.store_id, $event.target.value)"
                    @click.stop
                    class="text-sm font-semibold rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    :class="{
                      'bg-green-100 text-green-800': store.status === 'approved',
                      'bg-gray-100 text-gray-800': store.status === 'suspended'
                    }"
                  >
                    <option value="approved" class="bg-white text-gray-900">Approved</option>
                    <option value="suspended" class="bg-white text-gray-900">Suspended</option>
                  </select>
                  
                  <!-- Show static badge for pending and rejected stores -->
                  <span 
                    v-else
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-yellow-100 text-yellow-800': store.status === 'pending',
                      'bg-red-100 text-red-800': store.status === 'rejected'
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

    <!-- Store Details Modal -->
    <div v-if="selectedStore" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">Store Details</h2>
            <p class="text-gray-600 mt-1">{{ selectedStore.store_name }}</p>
          </div>
          <button
            @click="closeStoreDetails"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6 flex-1 overflow-y-auto">
          <div v-if="storeDetailsLoading" class="text-center py-12">
            <i class="fas fa-spinner fa-spin text-3xl text-blue-500 mb-4"></i>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Loading Store Details</h3>
            <p class="text-gray-600">Please wait while we fetch detailed information...</p>
          </div>

          <div v-else-if="storeDetailsError" class="text-center py-12">
            <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-4"></i>
            <h3 class="text-lg font-semibold text-red-800 mb-2">Error Loading Details</h3>
            <p class="text-red-600">{{ storeDetailsError }}</p>
            <button 
              @click="fetchStoreDetails(selectedStore.store_id)"
              class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>

          <div v-else-if="storeDetails" class="space-y-6">
            <!-- Basic Information -->
            <div class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                  <p class="text-sm text-gray-900">{{ storeDetails.store_name }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-yellow-100 text-yellow-800': storeDetails.status === 'pending',
                      'bg-green-100 text-green-800': storeDetails.status === 'approved',
                      'bg-red-100 text-red-800': storeDetails.status === 'rejected',
                      'bg-gray-100 text-gray-800': storeDetails.status === 'suspended'
                    }"
                  >
                    {{ storeDetails.status.charAt(0).toUpperCase() + storeDetails.status.slice(1) }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p class="text-sm text-gray-900">{{ storeDetails.store_description }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <p class="text-sm text-gray-900">{{ storeDetails.store_location }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                  <p class="text-sm text-gray-900">{{ formatDate(storeDetails.created_at) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                  <p class="text-sm text-gray-900">{{ formatDate(storeDetails.updated_at) }}</p>
                </div>
              </div>
            </div>

            <!-- Owner Information -->
            <div class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Owner Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                  <p class="text-sm text-gray-900">{{ storeDetails.owner_name }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <p class="text-sm text-gray-900">{{ storeDetails.owner_city }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Owner ID</label>
                  <p class="text-sm text-gray-900 font-mono">{{ storeDetails.owner_id }}</p>
                </div>
              </div>
            </div>

            <!-- Pack Information -->
            <div class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Pack Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Pack Name</label>
                  <p class="text-sm text-gray-900">{{ getPackNameByLanguage() }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <p class="text-sm text-gray-900">{{ formatPrice(storeDetails.pack_price) }}</p>
                </div>
              </div>
            </div>


            <!-- Statistics -->
            <div class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Store Statistics</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white rounded-lg p-4 text-center">
                  <div class="text-2xl font-bold text-blue-600">{{ storeDetails.total_products }}</div>
                  <div class="text-sm text-gray-600">Total Products</div>
                </div>
                <div class="bg-white rounded-lg p-4 text-center">
                  <div class="text-2xl font-bold text-green-600">{{ storeDetails.total_orders }}</div>
                  <div class="text-sm text-gray-600">Total Orders</div>
                </div>
                <div class="bg-white rounded-lg p-4 text-center">
                  <div class="text-2xl font-bold text-purple-600">{{ formatPrice(storeDetails.total_sales) }}</div>
                  <div class="text-sm text-gray-600">Total Sales</div>
                </div>
              </div>
            </div>

            <!-- External Buttons -->
            <div v-if="storeDetails.external_buttons && storeDetails.external_buttons.length > 0" class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">External Buttons</h3>
              <div class="space-y-2">
                <div 
                  v-for="(button, index) in storeDetails.external_buttons" 
                  :key="index"
                  class="bg-white rounded-lg p-3 border border-gray-200"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-gray-800">{{ button.name || `Button ${index + 1}` }}</span>
                    <a 
                      :href="button.url" 
                      target="_blank" 
                      class="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {{ button.url }}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Images -->
            <div class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Store Images</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-if="storeDetails.logo_url">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                  <img 
                    :src="storeDetails.logo_url" 
                    :alt="storeDetails.store_name + ' Logo'"
                    class="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                </div>
                <div v-if="storeDetails.banner_url">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Banner</label>
                  <img 
                    :src="storeDetails.banner_url" 
                    :alt="storeDetails.store_name + ' Banner'"
                    class="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '../lib/supabase'

const { t, locale } = useI18n()

// Reactive data
const stores = ref([])
const loading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const statusFilter = ref('')

// Store details modal
const selectedStore = ref(null)
const storeDetails = ref(null)
const storeDetailsLoading = ref(false)
const storeDetailsError = ref(null)

// Role management
const newRole = ref({})

// Computed properties
const filteredStores = computed(() => {
  let filtered = stores.value

  // Filter by search query (store name only)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(store => 
      store.store_name.toLowerCase().includes(query)
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
    
    // Fetch roles for each store owner
    const storesWithRoles = await Promise.all(
      (data || []).map(async (store) => {
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', store.owner_id)
        
        return {
          ...store,
          roles: rolesData?.map(r => r.role) || []
        }
      })
    )
    
    stores.value = storesWithRoles
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
    
    // Update store details if modal is open
    if (storeDetails.value && storeDetails.value.store_id === storeId) {
      storeDetails.value.status = newStatus
    }
    
    console.log(`Store ${storeId} status updated to ${newStatus}`)
  } catch (err) {
    console.error('Error updating store status:', err)
    error.value = err.message || 'Failed to update store status'
    alert(`Error: ${err.message}`)
  }
}

// Store details modal methods
const openStoreDetails = async (storeId) => {
  selectedStore.value = stores.value.find(s => s.store_id === storeId)
  if (selectedStore.value) {
    await fetchStoreDetails(storeId)
  }
}

const closeStoreDetails = () => {
  selectedStore.value = null
  storeDetails.value = null
  storeDetailsError.value = null
}

const fetchStoreDetails = async (storeId) => {
  try {
    storeDetailsLoading.value = true
    storeDetailsError.value = null

    const { data, error: fetchError } = await supabase
      .rpc('get_store_details_for_admin', { store_uuid: storeId })
    
    if (fetchError) throw fetchError
    
    if (data && data.length > 0) {
      storeDetails.value = data[0]
    } else {
      throw new Error('Store details not found')
    }
  } catch (err) {
    console.error('Error fetching store details:', err)
    storeDetailsError.value = err.message || 'Failed to fetch store details'
  } finally {
    storeDetailsLoading.value = false
  }
}

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPrice = (price) => {
  if (price === null || price === undefined) return 'N/A'
  return `${price.toLocaleString()} DZD`
}

// Role management methods
const addRole = async (storeId, role) => {
  console.log('🔍 addRole called:', { storeId, role })
  
  if (!role) {
    console.log('❌ No role provided')
    return
  }
  
  try {
    // Find the store to get owner_id
    const store = stores.value.find(s => s.store_id === storeId)
    if (!store) {
      console.log('❌ Store not found:', storeId)
      return
    }
    
    console.log('📝 Adding role to database:', { user_id: store.owner_id, role })
    
    // Add role to database
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: store.owner_id,
        role: role,
        status: 'active'
      })
    
    if (error) {
      console.log('❌ Database error:', error)
      if (error.code === '23505') { // Unique constraint violation
        alert('User already has this role')
      } else {
        throw error
      }
      return
    }
    
    // Update local state
    const storeIndex = stores.value.findIndex(s => s.store_id === storeId)
    if (storeIndex !== -1) {
      if (!stores.value[storeIndex].roles) {
        stores.value[storeIndex].roles = []
      }
      stores.value[storeIndex].roles.push(role)
      console.log('✅ Role added to frontend:', stores.value[storeIndex].roles)
    }
    
    // Clear the select
    newRole.value[storeId] = ''
    
    console.log(`✅ Role ${role} added to store ${storeId}`)
  } catch (err) {
    console.error('❌ Error adding role:', err)
    alert(`Error: ${err.message}`)
  }
}

const removeRole = async (storeId, role) => {
  console.log('🔍 removeRole called:', { storeId, role })
  
  try {
    // Find the store to get owner_id
    const store = stores.value.find(s => s.store_id === storeId)
    if (!store) {
      console.log('❌ Store not found:', storeId)
      return
    }
    
    console.log('📝 Removing role from database:', { user_id: store.owner_id, role })
    
    // Remove role from database
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', store.owner_id)
      .eq('role', role)
    
    if (error) {
      console.log('❌ Database error:', error)
      throw error
    }
    
    // Update local state
    const storeIndex = stores.value.findIndex(s => s.store_id === storeId)
    if (storeIndex !== -1) {
      const oldRoles = [...stores.value[storeIndex].roles]
      stores.value[storeIndex].roles = stores.value[storeIndex].roles.filter(r => r !== role)
      console.log('✅ Role removed from frontend:', { old: oldRoles, new: stores.value[storeIndex].roles })
    }
    
    console.log(`✅ Role ${role} removed from store ${storeId}`)
  } catch (err) {
    console.error('❌ Error removing role:', err)
    alert(`Error: ${err.message}`)
  }
}

const getPackNameByLanguage = () => {
  if (!storeDetails.value) return 'N/A'
  
  const currentLocale = locale.value || 'en'
  
  switch (currentLocale) {
    case 'ar':
      return storeDetails.value.pack_name_ar || storeDetails.value.pack_name_en || 'N/A'
    case 'fr':
      return storeDetails.value.pack_name_fr || storeDetails.value.pack_name_en || 'N/A'
    case 'en':
    default:
      return storeDetails.value.pack_name_en || 'N/A'
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