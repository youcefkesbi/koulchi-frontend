<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">{{ $t('admin.packs.title') || 'Manage Packs' }}</h1>
            <p class="text-gray-600 mt-1">{{ $t('admin.packs.description') || 'Manage subscription packs and their features' }}</p>
          </div>
          <button
            @click="refreshPacks"
            :disabled="loading"
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <i class="fas fa-sync-alt mr-2" :class="{ 'fa-spin': loading }"></i>
            {{ $t('common.refresh') || 'Refresh' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <!-- Search and Filter Bar -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Search Input -->
          <div class="flex-1">
            <div class="relative">
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="$t('admin.packs.searchPlaceholder') || 'Search packs...'"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>

          <!-- Status Filter -->
          <div class="md:w-48">
            <select
              v-model="statusFilter"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="">{{ $t('admin.packs.allStatuses') || 'All Statuses' }}</option>
              <option value="true">{{ $t('admin.packs.active') || 'Active' }}</option>
              <option value="false">{{ $t('admin.packs.inactive') || 'Inactive' }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Packs Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('admin.packs.name') || 'Name' }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('admin.packs.description') || 'Description' }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('admin.packs.price') || 'Price' }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('admin.packs.maxAnnouncements') || 'Max Announcements' }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('admin.packs.maxImages') || 'Max Images' }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('admin.packs.status') || 'Status' }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- Loading State -->
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-12 text-center">
                <div class="flex items-center justify-center">
                  <i class="fas fa-spinner fa-spin text-2xl text-primary mr-3"></i>
                  <span class="text-gray-600">{{ $t('common.loading') || 'Loading...' }}</span>
                </div>
              </td>
            </tr>

            <!-- Error State -->
            <tr v-else-if="error">
              <td colspan="6" class="px-6 py-12 text-center">
                <div class="text-red-600">
                  <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                  <p>{{ error }}</p>
                  <button
                    @click="fetchPacks"
                    class="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {{ $t('common.retry') || 'Retry' }}
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-else-if="filteredPacks.length === 0">
              <td colspan="6" class="px-6 py-12 text-center">
                <div class="text-gray-500">
                  <i class="fas fa-box-open text-4xl mb-4"></i>
                  <p class="text-lg font-medium">{{ $t('admin.packs.noPacks') || 'No packs found' }}</p>
                  <p class="text-sm">{{ $t('admin.packs.noPacksDescription') || 'Try adjusting your search or filter criteria' }}</p>
                </div>
              </td>
            </tr>

            <!-- Pack Rows -->
            <tr
              v-else
              v-for="pack in filteredPacks"
              :key="pack.pack_id"
              class="hover:bg-gray-50 transition-colors"
            >
              <!-- Name -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <i class="fas fa-crown text-primary"></i>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ getLocalizedPackName(pack) }}
                    </div>
                    <div class="text-sm text-gray-500">
                      ID: {{ pack.pack_id.substring(0, 8) }}...
                    </div>
                  </div>
                </div>
              </td>

              <!-- Description -->
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 max-w-xs">
                  {{ getLocalizedPackDescription(pack) }}
                </div>
              </td>

              <!-- Price -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ formatPrice(pack.price) }}
                </div>
              </td>

              <!-- Max Announcements -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ pack.max_announcements.toLocaleString() }}
                </div>
              </td>

              <!-- Max Images -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ pack.max_images.toLocaleString() }}
                </div>
              </td>

              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center justify-between">
                  <span
                    :class="[
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      pack.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ pack.is_active ? ($t('admin.packs.active') || 'Active') : ($t('admin.packs.inactive') || 'Inactive') }}
                  </span>
                  <!-- Actions -->
                  <div class="flex items-center space-x-2">
                    <button
                      @click="editPack(pack)"
                      class="text-primary hover:text-primary/80 transition-colors"
                      :title="$t('admin.packs.edit') || 'Edit pack'"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      @click="deletePack(pack)"
                      class="text-red-600 hover:text-red-800 transition-colors"
                      :title="$t('admin.packs.delete') || 'Delete pack'"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination (if needed in the future) -->
      <div v-if="filteredPacks.length > 0" class="mt-6 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          {{ $t('admin.packs.showingResults', { count: filteredPacks.length }) || `Showing ${filteredPacks.length} results` }}
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
const packs = ref([])
const loading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const statusFilter = ref('')

// Computed properties
const filteredPacks = computed(() => {
  let filtered = packs.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(pack => {
      const name = getLocalizedPackName(pack).toLowerCase()
      const description = getLocalizedPackDescription(pack).toLowerCase()
      return name.includes(query) || description.includes(query)
    })
  }

  // Filter by status
  if (statusFilter.value !== '') {
    const isActive = statusFilter.value === 'true'
    filtered = filtered.filter(pack => pack.is_active === isActive)
  }

  return filtered
})

// Helper functions
const getLocalizedPackName = (pack) => {
  const currentLocale = locale.value
  switch (currentLocale) {
    case 'fr':
      return pack.name_fr || pack.name_en
    case 'ar':
      return pack.name_ar || pack.name_en
    default:
      return pack.name_en
  }
}

const getLocalizedPackDescription = (pack) => {
  const currentLocale = locale.value
  switch (currentLocale) {
    case 'fr':
      return pack.description_fr || pack.description_en
    case 'ar':
      return pack.description_ar || pack.description_en
    default:
      return pack.description_en
  }
}

const formatPrice = (price) => {
  if (price === 0) {
    return t('admin.packs.free') || 'Free'
  }
  return `${price.toLocaleString()} ${t('admin.packs.currency') || 'DZD'}`
}

// API functions
const fetchPacks = async () => {
  try {
    loading.value = true
    error.value = null

    const { data, error: fetchError } = await supabase
      .rpc('get_all_packs_with_features')

    if (fetchError) {
      throw fetchError
    }

    packs.value = data || []
  } catch (err) {
    console.error('Error fetching packs:', err)
    error.value = err.message || 'Failed to fetch packs'
  } finally {
    loading.value = false
  }
}

const refreshPacks = () => {
  fetchPacks()
}

// Action handlers
const editPack = (pack) => {
  console.log('Edit pack:', pack)
  // TODO: Implement edit functionality
}

const deletePack = (pack) => {
  console.log('Delete pack:', pack)
  // TODO: Implement delete functionality
}

// Lifecycle
onMounted(() => {
  fetchPacks()
})
</script>

<style scoped>
/* Custom styles if needed */
</style>