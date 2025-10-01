<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-soft border-b border-gray-100">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">{{ $t('admin.dashboard') }}</h1>
            <p class="text-gray-600">{{ $t('admin.dashboardDescription') }}</p>
          </div>
          <div class="flex items-center space-x-4 space-x-reverse">
            <span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              {{ $t('admin.adminRole') }}
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
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <i class="fas fa-users text-blue-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-800">{{ totalUsers }}</h3>
              <p class="text-sm text-gray-600">{{ $t('admin.totalUsers') }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-soft p-6">
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

        <div class="bg-white rounded-xl shadow-soft p-6">
          <div class="flex items-center space-x-3 space-x-reverse">
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <i class="fas fa-box text-purple-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-800">{{ totalProducts }}</h3>
              <p class="text-sm text-gray-600">{{ $t('admin.totalProducts') }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-soft p-6">
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
      <div class="bg-white rounded-2xl shadow-soft p-6 mb-8">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('admin.quickActions') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            @click="activeTab = 'users'"
            class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
          >
            <i class="fas fa-users text-2xl text-gray-600 mb-2"></i>
            <h3 class="font-semibold text-gray-800">{{ $t('admin.manageUsers') }}</h3>
            <p class="text-sm text-gray-600">{{ $t('admin.manageUsersDescription') }}</p>
          </button>

          <button
            @click="activeTab = 'stores'"
            class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
          >
            <i class="fas fa-store text-2xl text-gray-600 mb-2"></i>
            <h3 class="font-semibold text-gray-800">{{ $t('admin.manageStores') }}</h3>
            <p class="text-sm text-gray-600">{{ $t('admin.manageStoresDescription') }}</p>
          </button>

          <button
            @click="activeTab = 'packs'"
            class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
          >
            <i class="fas fa-crown text-2xl text-gray-600 mb-2"></i>
            <h3 class="font-semibold text-gray-800">{{ $t('admin.managePacks') }}</h3>
            <p class="text-sm text-gray-600">{{ $t('admin.managePacksDescription') }}</p>
          </button>

          <button
            @click="activeTab = 'logs'"
            class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
          >
            <i class="fas fa-list-alt text-2xl text-gray-600 mb-2"></i>
            <h3 class="font-semibold text-gray-800">{{ $t('admin.viewLogs') }}</h3>
            <p class="text-sm text-gray-600">{{ $t('admin.viewLogsDescription') }}</p>
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="bg-white rounded-2xl shadow-soft">
        <!-- Tabs -->
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
            </button>
          </nav>
        </div>

        <div class="p-6">
          <!-- Users Management Tab -->
          <div v-if="activeTab === 'users'" class="space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-800">{{ $t('admin.manageUsers') }}</h2>
              <div class="flex items-center space-x-3 space-x-reverse">
                <input
                  v-model="userSearchQuery"
                  type="text"
                  :placeholder="$t('admin.searchUsers')"
                  class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                <button
                  @click="refreshUsers"
                  :disabled="loading"
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <i class="fas fa-sync-alt mr-2" :class="{ 'animate-spin': loading }"></i>
                  {{ $t('common.refresh') }}
                </button>
              </div>
            </div>

            <div v-if="loading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p class="text-gray-600">{{ $t('common.loading') }}</p>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('admin.user') }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('admin.email') }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('admin.role') }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('admin.joined') }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('admin.actions') }}
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span class="text-white font-medium">{{ user.full_name?.charAt(0) || 'U' }}</span>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ user.full_name || 'No Name' }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.email }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span 
                        :class="[
                          'px-2 py-1 text-xs rounded-full font-medium',
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'employee' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        ]"
                      >
                        {{ user.role }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(user.created_at) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex items-center space-x-2 space-x-reverse">
                        <button
                          @click="editUser(user)"
                          class="text-primary hover:text-primary-dark"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button
                          @click="deleteUser(user.id)"
                          class="text-red-600 hover:text-red-900"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Stores Management Tab -->
          <div v-if="activeTab === 'stores'" class="space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-800">{{ $t('admin.manageStores') }}</h2>
              <div class="flex items-center space-x-3 space-x-reverse">
                <select
                  v-model="storeStatusFilter"
                  class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                >
                  <option value="">{{ $t('admin.allStatuses') }}</option>
                  <option value="pending">{{ $t('admin.pending') }}</option>
                  <option value="approved">{{ $t('admin.approved') }}</option>
                  <option value="rejected">{{ $t('admin.rejected') }}</option>
                </select>
                <button
                  @click="refreshStores"
                  :disabled="loading"
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <i class="fas fa-sync-alt mr-2" :class="{ 'animate-spin': loading }"></i>
                  {{ $t('common.refresh') }}
                </button>
              </div>
            </div>

            <div v-if="loading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p class="text-gray-600">{{ $t('common.loading') }}</p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="store in filteredStores"
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
                        <span 
                          :class="[
                            'px-2 py-1 rounded-full text-xs font-medium',
                            store.status === 'approved' ? 'bg-green-100 text-green-800' :
                            store.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          ]"
                        >
                          {{ store.status }}
                        </span>
                      </div>
                      
                      <p class="text-gray-600 mb-2">{{ store.description || $t('stores.noDescription') }}</p>
                      
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                        <div>
                          <strong>{{ $t('admin.owner') }}:</strong> {{ store.owner_email }}
                        </div>
                        <div>
                          <strong>{{ $t('admin.pack') }}:</strong> {{ store.pack_name }}
                        </div>
                        <div>
                          <strong>{{ $t('admin.created') }}:</strong> {{ formatDate(store.created_at) }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center space-x-2 space-x-reverse">
                    <button
                      @click="viewStoreDetails(store)"
                      class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <i class="fas fa-eye mr-2"></i>
                      {{ $t('common.view') }}
                    </button>
                    <button
                      @click="editStore(store)"
                      class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <i class="fas fa-edit mr-2"></i>
                      {{ $t('common.edit') }}
                    </button>
                    <button
                      @click="deleteStore(store.id)"
                      class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <i class="fas fa-trash mr-2"></i>
                      {{ $t('common.delete') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Packs Management Tab -->
          <div v-if="activeTab === 'packs'" class="space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-800">{{ $t('admin.managePacks') }}</h2>
              <button
                @click="showCreatePackModal = true"
                class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                <i class="fas fa-plus mr-2"></i>
                {{ $t('admin.createPack') }}
              </button>
            </div>

            <div v-if="loading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p class="text-gray-600">{{ $t('common.loading') }}</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="pack in packs"
                :key="pack.id"
                class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-800">{{ pack.name }}</h3>
                  <span 
                    :class="[
                      'px-2 py-1 text-xs rounded-full font-medium',
                      pack.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ pack.is_active ? $t('admin.active') : $t('admin.inactive') }}
                  </span>
                </div>
                
                <p class="text-gray-600 mb-4">{{ pack.description }}</p>
                
                <div class="space-y-2 mb-4">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-600">{{ $t('admin.price') }}:</span>
                    <span class="font-semibold">{{ pack.price }} DZD</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-600">{{ $t('admin.maxAnnouncements') }}:</span>
                    <span class="font-semibold">{{ pack.max_announcements }}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-600">{{ $t('admin.maxImages') }}:</span>
                    <span class="font-semibold">{{ pack.max_images }}</span>
                  </div>
                </div>

                <div class="flex items-center space-x-2 space-x-reverse">
                  <button
                    @click="editPack(pack)"
                    class="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <i class="fas fa-edit mr-2"></i>
                    {{ $t('common.edit') }}
                  </button>
                  <button
                    @click="deletePack(pack.id)"
                    class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Audit Logs Tab -->
          <div v-if="activeTab === 'logs'" class="space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-800">{{ $t('admin.auditLogs') }}</h2>
              <div class="flex items-center space-x-3 space-x-reverse">
                <input
                  v-model="logDateFilter"
                  type="date"
                  class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                <button
                  @click="refreshLogs"
                  :disabled="loading"
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <i class="fas fa-sync-alt mr-2" :class="{ 'animate-spin': loading }"></i>
                  {{ $t('common.refresh') }}
                </button>
              </div>
            </div>

            <div v-if="loading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p class="text-gray-600">{{ $t('common.loading') }}</p>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('admin.employee') }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('admin.action') }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('admin.target') }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('admin.details') }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('admin.timestamp') }}
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="log in filteredLogs" :key="log.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ log.employee_email }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {{ log.action }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ log.target_type }}: {{ log.target_id }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ JSON.stringify(log.details) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(log.created_at) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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
const activeTab = ref('users')
const loading = ref(false)
const showCreatePackModal = ref(false)

// Data
const users = ref([])
const stores = ref([])
const packs = ref([])
const logs = ref([])

// Filters
const userSearchQuery = ref('')
const storeStatusFilter = ref('')
const logDateFilter = ref('')

// Tabs configuration
const tabs = [
  { id: 'users', name: $t('admin.users'), icon: 'fas fa-users' },
  { id: 'stores', name: $t('admin.stores'), icon: 'fas fa-store' },
  { id: 'packs', name: $t('admin.packs'), icon: 'fas fa-crown' },
  { id: 'logs', name: $t('admin.logs'), icon: 'fas fa-list-alt' }
]

// Computed properties
const totalUsers = computed(() => users.value.length)
const totalStores = computed(() => stores.value.length)
const totalProducts = computed(() => 0) // TODO: Implement
const totalRevenue = computed(() => 0) // TODO: Implement

const filteredUsers = computed(() => {
  if (!userSearchQuery.value) return users.value
  return users.value.filter(user => 
    user.full_name?.toLowerCase().includes(userSearchQuery.value.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchQuery.value.toLowerCase())
  )
})

const filteredStores = computed(() => {
  if (!storeStatusFilter.value) return stores.value
  return stores.value.filter(store => store.status === storeStatusFilter.value)
})

const filteredLogs = computed(() => {
  if (!logDateFilter.value) return logs.value
  return logs.value.filter(log => 
    new Date(log.created_at).toDateString() === new Date(logDateFilter.value).toDateString()
  )
})

// Methods
const fetchUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    users.value = data || []
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

const fetchStores = async () => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select(`
        *,
        profiles!stores_owner_id_fkey(email as owner_email),
        packs(name as pack_name)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    stores.value = data || []
  } catch (error) {
    console.error('Error fetching stores:', error)
  }
}

const fetchPacks = async () => {
  try {
    const { data, error } = await supabase
      .from('packs')
      .select('*')
      .order('price', { ascending: true })

    if (error) throw error
    packs.value = data || []
  } catch (error) {
    console.error('Error fetching packs:', error)
  }
}

const fetchLogs = async () => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        profiles!audit_logs_employee_id_fkey(email as employee_email)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error
    logs.value = data || []
  } catch (error) {
    console.error('Error fetching logs:', error)
  }
}

const refreshUsers = async () => {
  loading.value = true
  try {
    await fetchUsers()
  } finally {
    loading.value = false
  }
}

const refreshStores = async () => {
  loading.value = true
  try {
    await fetchStores()
  } finally {
    loading.value = false
  }
}

const refreshLogs = async () => {
  loading.value = true
  try {
    await fetchLogs()
  } finally {
    loading.value = false
  }
}

const editUser = (user) => {
  // TODO: Implement user edit modal
}

const deleteUser = async (userId) => {
  if (!confirm('Are you sure you want to delete this user?')) return
  
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (error) throw error
    
    await refreshUsers()
  } catch (error) {
    console.error('Error deleting user:', error)
    alert('Failed to delete user')
  }
}

const viewStoreDetails = (store) => {
  // TODO: Implement store details modal
}

const editStore = (store) => {
  // TODO: Implement store edit modal
}

const deleteStore = async (storeId) => {
  if (!confirm('Are you sure you want to delete this store?')) return
  
  try {
    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', storeId)

    if (error) throw error
    
    await refreshStores()
  } catch (error) {
    console.error('Error deleting store:', error)
    alert('Failed to delete store')
  }
}

const editPack = (pack) => {
  // TODO: Implement pack edit modal
}

const deletePack = async (packId) => {
  if (!confirm('Are you sure you want to delete this pack?')) return
  
  try {
    const { error } = await supabase
      .from('packs')
      .delete()
      .eq('id', packId)

    if (error) throw error
    
    await fetchPacks()
  } catch (error) {
    console.error('Error deleting pack:', error)
    alert('Failed to delete pack')
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
  fetchUsers()
  fetchStores()
  fetchPacks()
  fetchLogs()
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
