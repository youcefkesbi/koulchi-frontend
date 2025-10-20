<template>
  <div class="min-h-screen bg-white">
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">User Management</h1>
        <p class="mt-2 text-gray-600">Manage all users and their account status</p>
      </div>

      <!-- User Management Table -->
      <div class="bg-white rounded-lg shadow-md">
        <!-- Table Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-800">All Users</h2>
            
            <!-- Search and Filter Controls -->
            <div class="flex items-center space-x-4">
              <!-- Search Input -->
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search by name..."
                  class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              </div>
              
              <!-- Role Filter -->
              <select 
                v-model="roleFilter"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Roles</option>
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <i class="fas fa-spinner fa-spin text-blue-600 text-3xl mb-4"></i>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Loading Users</h3>
          <p class="text-gray-600">Please wait while we fetch user data...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-4"></i>
          <h3 class="text-lg font-semibold text-red-800 mb-2">Error Loading Users</h3>
          <p class="text-red-600">{{ error }}</p>
          <button 
            @click="fetchUsers"
            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
        
        <!-- Users Table -->
        <div v-else-if="filteredUsers.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store Names
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Status
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in filteredUsers" :key="user.user_id" class="hover:bg-gray-50">
                <!-- User Info -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ user.full_name || 'No Name' }}
                  </div>
                </td>
                
                <!-- Email -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ user.email }}</div>
                </td>
                
                <!-- Role -->
                <td class="px-6 py-4">
                  <div class="flex flex-col space-y-2">
                    <!-- Add Role Button - At Top -->
                    <div class="flex items-center">
                      <select 
                        v-model="newRole[user.user_id]"
                        @change="addRole(user.user_id, $event.target.value)"
                        class="text-xs border border-blue-300 rounded-lg px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">+ Add Role</option>
                        <option value="customer">Customer</option>
                        <option value="vendor">Vendor</option>
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    
                    <!-- Existing Roles -->
                    <div class="flex flex-col space-y-1">
                      <div 
                        v-for="role in user.roles.split('\n')" 
                        :key="role"
                        class="flex items-center space-x-2 w-fit"
                      >
                        <span 
                          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm"
                          :class="{
                            'bg-blue-100 text-blue-800 border border-blue-200': role === 'customer',
                            'bg-green-100 text-green-800 border border-green-200': role === 'vendor',
                            'bg-purple-100 text-purple-800 border border-purple-200': role === 'employee',
                            'bg-red-100 text-red-800 border border-red-200': role === 'admin'
                          }">
                          <i :class="{
                            'fas fa-user mr-1': role === 'customer',
                            'fas fa-store mr-1': role === 'vendor',
                            'fas fa-user-tie mr-1': role === 'employee',
                            'fas fa-crown mr-1': role === 'admin'
                          }"></i>
                          {{ role }}
                        </span>
                        <button 
                          @click="removeRole(user.user_id, role)"
                          class="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1 transition-colors"
                          title="Remove role"
                        >
                          <i class="fas fa-times text-xs"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
                
                <!-- Store Names -->
                <td class="px-6 py-4">
                  <div class="flex flex-col space-y-1">
                    <span 
                      v-for="storeName in (user.store_names || '').split('\n')" 
                      :key="storeName"
                      class="text-sm px-2 py-1 rounded w-fit"
                      :class="{
                        'text-gray-900 bg-blue-50': storeName !== 'Basic Pack Store' && storeName !== '-',
                        'text-orange-800 bg-orange-100': storeName === 'Basic Pack Store',
                        'text-gray-500': storeName === '-'
                      }"
                      v-if="storeName && storeName !== '-'">
                      {{ storeName }}
                    </span>
                    <span 
                      v-if="!user.store_names || user.store_names === '-'"
                      class="text-sm text-gray-500">
                      -
                    </span>
                  </div>
                </td>
                
                <!-- Account Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <select 
                    :value="user.account_status"
                    @change="updateUserStatus(user.user_id, $event.target.value)"
                    class="text-sm font-semibold rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    :class="{
                      'bg-green-100 text-green-800': user.account_status === 'active',
                      'bg-gray-100 text-gray-800': user.account_status === 'suspended'
                    }"
                    :style="{
                      backgroundColor: user.account_status === 'active' ? '#dcfce7' : user.account_status === 'suspended' ? '#f3f4f6' : '',
                      color: user.account_status === 'active' ? '#166534' : user.account_status === 'suspended' ? '#374151' : ''
                    }"
                  >
                    <option value="active" class="bg-white text-gray-900">Active</option>
                    <option value="suspended" class="bg-white text-gray-900">Suspended</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- No Users State -->
        <div v-else class="text-center py-12">
          <i class="fas fa-users text-gray-400 text-4xl mb-4"></i>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">No Users Found</h3>
          <p class="text-gray-600">
            {{ searchQuery || roleFilter ? 'No users match your search criteria.' : 'No users have been registered yet.' }}
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
const users = ref([])
const loading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const roleFilter = ref('')
const newRole = ref({}) // Track new role selections per user

// Computed properties
const filteredUsers = computed(() => {
  let filtered = users.value

  // Filter by search query (user name only)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.full_name && user.full_name.toLowerCase().includes(query)
    )
  }

  // Filter by role
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.roles.includes(roleFilter.value))
  }

  return filtered
})

// Methods
const fetchUsers = async () => {
  try {
    loading.value = true
    error.value = null

    const { data, error: fetchError } = await supabase.rpc('get_all_users_for_admin')
    
    if (fetchError) throw fetchError
    
    users.value = data || []
  } catch (err) {
    console.error('Error fetching users:', err)
    error.value = err.message || 'Failed to fetch users'
  } finally {
    loading.value = false
  }
}

const updateUserStatus = async (userId, newStatus) => {
  try {
    // Update the status in profiles table
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', userId)
    
    if (error) throw error
    
    console.log(`User ${userId} status updated to ${newStatus} in database`)
    
    // Refresh the page to ensure latest data
    window.location.reload()
  } catch (err) {
    console.error('Error updating user status:', err)
  }
}

const addRole = async (userId, role) => {
  const normalizedRole = (role || '').trim()
  if (!normalizedRole) return
  
  try {
    // Attempt insert; rely on UNIQUE(user_id, role) to prevent duplicates
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role: normalizedRole })
    
    // If duplicate, ignore gracefully; otherwise throw
    if (insertError && insertError.code !== '23505') throw insertError
    
    // Refresh roles from DB to ensure UI is consistent with backend
    const { data: rolesRows, error: fetchRolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (fetchRolesError) throw fetchRolesError
    
    const userIndex = users.value.findIndex(user => user.user_id === userId)
    if (userIndex !== -1) {
      const rolesList = (rolesRows || []).map(r => r.role)
      users.value[userIndex].roles = rolesList.length > 0 ? rolesList.join('\n') : 'customer'
    }
    
    // Reset dropdown
    newRole.value[userId] = ''
    console.log(`Role ${normalizedRole} added to user ${userId}`)
  } catch (err) {
    console.error('Error adding role:', err)
  }
}

const removeRole = async (userId, role) => {
  const normalizedRole = (role || '').trim()
  if (!normalizedRole) return
  try {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', normalizedRole)
    
    if (error) throw error
    
    // Refresh roles from DB to ensure UI is consistent with backend
    const { data: rolesRows, error: fetchRolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (fetchRolesError) throw fetchRolesError
    
    const userIndex = users.value.findIndex(user => user.user_id === userId)
    if (userIndex !== -1) {
      const rolesList = (rolesRows || []).map(r => r.role)
      users.value[userIndex].roles = rolesList.length > 0 ? rolesList.join('\n') : 'customer'
    }
    
    console.log(`Role ${normalizedRole} removed from user ${userId}`)
  } catch (err) {
    console.error('Error removing role:', err)
  }
}


// Lifecycle
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
/* Custom styles if needed */
</style>
