<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">{{ $t('admin.packs.title') || 'Manage Packs' }}</h1>
            <p class="text-gray-600 mt-1">{{ $t('admin.packs.description') || 'Manage subscription packs and their features' }}</p>
            <div v-if="roleLoaded" class="mt-2">
              <span v-if="isAdmin" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <i class="fas fa-check-circle mr-1"></i>
                Admin Access Granted
              </span>
              <span v-else class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <i class="fas fa-times-circle mr-1"></i>
                Admin Access Denied
              </span>
            </div>
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
              class="hover:bg-gray-50 transition-colors cursor-pointer"
              @click="openPackDetails(pack)"
            >
              <!-- Name -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <i :class="pack.rawPrice === 0 ? 'fas fa-gift text-green-500' : 'fas fa-crown text-primary'"></i>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ getLocalizedPackName(pack) }}
                    </div>
                    <div class="text-sm text-gray-500 relative group cursor-pointer" :title="pack.pack_id">
                      ID: {{ pack.pack_id.substring(0, 8) }}...
                      <div class="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                        {{ pack.pack_id }}
                      </div>
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
                  <!-- Actions removed - click on row to open details -->
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

    <!-- Pack Details Modal -->
    <div v-if="selectedPack" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <i :class="selectedPack.rawPrice === 0 ? 'fas fa-gift text-green-500' : 'fas fa-crown text-primary'"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-800">{{ getLocalizedPackName(selectedPack) }}</h2>
              <p class="text-sm text-gray-500">Pack Management</p>
            </div>
          </div>
          <button @click="closePackDetails" class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6 flex-1 overflow-y-auto">
          <!-- Pack Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <!-- Basic Info -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Basic Information</h3>
              
              <!-- Pack Names -->
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">English Name</label>
                  <input v-model="editingPack.name_en" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Arabic Name</label>
                  <input v-model="editingPack.name_ar" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">French Name</label>
                  <input v-model="editingPack.name_fr" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
              </div>

            </div>

            <!-- Pricing & Limits -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Pricing & Limits</h3>
              
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Price (DZD)</label>
                  <input v-model.number="editingPack.price" type="number" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Max Announcements</label>
                  <input v-model.number="editingPack.max_announcements" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Max Images</label>
                  <input v-model.number="editingPack.max_images" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div class="flex items-center space-x-3">
                  <label class="flex items-center">
                    <input v-model="editingPack.is_active" type="checkbox" class="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span class="ml-2 text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Pack Descriptions - Full Width 3 Columns -->
          <div class="space-y-4 mb-8">
            <h3 class="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Pack Descriptions</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">English Description</label>
                <textarea v-model="editingPack.description_en" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" placeholder="Enter English description..."></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Arabic Description</label>
                <textarea v-model="editingPack.description_ar" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" placeholder="Enter Arabic description..."></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">French Description</label>
                <textarea v-model="editingPack.description_fr" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" placeholder="Enter French description..."></textarea>
              </div>
            </div>
            
            <!-- Pack Info Save Button -->
            <div class="flex justify-end pt-4 border-t border-gray-200">
              <button @click="savePackInfo" :disabled="savingPackInfo" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                <i v-if="savingPackInfo" class="fas fa-spinner fa-spin mr-2"></i>
                <i v-else class="fas fa-save mr-2"></i>
                {{ savingPackInfo ? 'Saving...' : 'Save Pack Information' }}
              </button>
            </div>
          </div>

          <!-- Features Management -->
          <div class="border-t border-gray-200 pt-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-800">Pack Features</h3>
              <button @click="addFeatureToPack" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                <i class="fas fa-plus mr-2"></i>Add Feature
              </button>
            </div>

            <!-- Pack's Current Features -->
            <div v-if="selectedPack?.features && selectedPack.features.en && selectedPack.features.en.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="(featureName, index) in selectedPack.features.en" :key="`feature-${index}`" class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-medium text-gray-800">{{ featureName }}</h4>
                  <div class="flex items-center space-x-2">
                    <button 
                      @click="editFeature(index)"
                      class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                      title="Edit feature"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      @click="removeFeatureFromPack(index)"
                      class="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                      title="Remove feature"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div class="text-xs text-gray-500">
                  <div v-if="selectedPack.features.ar && selectedPack.features.ar[index]">AR: {{ selectedPack.features.ar[index] }}</div>
                  <div v-if="selectedPack.features.fr && selectedPack.features.fr[index]">FR: {{ selectedPack.features.fr[index] }}</div>
                </div>
              </div>
            </div>

            <!-- No Features Message -->
            <div v-else class="text-center py-8 text-gray-500">
              <i class="fas fa-list-ul text-4xl mb-4"></i>
              <p class="text-lg font-medium">No features assigned to this pack</p>
              <p class="text-sm">Click "Add Feature" to assign features to this pack</p>
            </div>
          </div>
        </div>


        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button @click="deletePack" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <i class="fas fa-trash mr-2"></i>Delete Pack
            </button>
          </div>
          <div class="flex items-center space-x-3">
            <button @click="closePackDetails" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Feature Edit Modal -->
    <div v-if="editingFeature" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <i class="fas fa-edit text-blue-600"></i>
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-800">Edit Feature</h2>
              <p class="text-sm text-gray-500">Update feature information in all languages</p>
            </div>
          </div>
          <button @click="closeFeatureEdit" class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6 flex-1 overflow-y-auto">
          <form @submit.prevent="saveFeatureChanges">
            <!-- Feature Names -->
            <div class="space-y-4 mb-6">
              <h3 class="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2">Feature Names</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">English Name</label>
                  <input v-model="featureEditForm.name_en" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Enter English name" required />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Arabic Name</label>
                  <input v-model="featureEditForm.name_ar" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Enter Arabic name" required />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">French Name</label>
                  <input v-model="featureEditForm.name_fr" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Enter French name" required />
                </div>
              </div>
            </div>

            <!-- Feature Descriptions -->
            <div class="space-y-4">
              <h3 class="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2">Feature Descriptions</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">English Description</label>
                  <textarea v-model="featureEditForm.description_en" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" placeholder="Enter English description"></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Arabic Description</label>
                  <textarea v-model="featureEditForm.description_ar" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" placeholder="Enter Arabic description"></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">French Description</label>
                  <textarea v-model="featureEditForm.description_fr" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" placeholder="Enter French description"></textarea>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button @click="closeFeatureEdit" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
            Cancel
          </button>
          <button @click="saveFeatureChanges" :disabled="saving" class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
            <i v-if="saving" class="fas fa-spinner fa-spin mr-2"></i>
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Add Feature Modal -->
    <div v-if="addingFeature" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <i class="fas fa-plus text-green-600"></i>
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-800">Add New Feature</h2>
              <p class="text-sm text-gray-500">Create a new feature and add it to this pack</p>
            </div>
          </div>
          <button @click="closeAddFeature" class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6 flex-1 overflow-y-auto">
          <form @submit.prevent="saveNewFeature">
            <!-- Feature Names -->
            <div class="space-y-4 mb-6">
              <h3 class="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2">Feature Names</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">English Name</label>
                  <input v-model="featureAddForm.name_en" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Enter English name" required />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Arabic Name</label>
                  <input v-model="featureAddForm.name_ar" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Enter Arabic name" required />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">French Name</label>
                  <input v-model="featureAddForm.name_fr" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Enter French name" required />
                </div>
              </div>
            </div>

            <!-- Feature Descriptions -->
            <div class="space-y-4">
              <h3 class="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2">Feature Descriptions <span class="text-sm font-normal text-gray-500">(Optional)</span></h3>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">English Description <span class="text-gray-500 font-normal">(Optional)</span></label>
                  <textarea v-model="featureAddForm.description_en" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" placeholder="Enter English description (optional)"></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Arabic Description <span class="text-gray-500 font-normal">(Optional)</span></label>
                  <textarea v-model="featureAddForm.description_ar" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" placeholder="Enter Arabic description (optional)"></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">French Description <span class="text-gray-500 font-normal">(Optional)</span></label>
                  <textarea v-model="featureAddForm.description_fr" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" placeholder="Enter French description (optional)"></textarea>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button @click="closeAddFeature" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
            Cancel
          </button>
          <button type="button" @click="saveNewFeature" :disabled="saving" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
            <i v-if="saving" class="fas fa-spinner fa-spin mr-2"></i>
            {{ saving ? 'Creating...' : 'Create Feature' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/useAuthStore'

const { t, locale } = useI18n()

// Auth store
const authStore = useAuthStore()

// Role checking
const isAdmin = ref(false)
const roleLoaded = ref(false)

// Fetch admin role (same pattern as AdminSidebar.vue)
const fetchAdminRoleOnce = async () => {
  if (roleLoaded.value) return // Only fetch once
  
  try {
    const hasSession = await authStore.checkAuthStatus()
    if (!hasSession) {
      isAdmin.value = false
      roleLoaded.value = true
      return
    }

    // Get fresh role from database
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      // Fetch user roles directly from database
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
      
      if (error) {
        console.error('Error fetching user roles:', error)
        isAdmin.value = false
      } else {
        const roles = userRoles?.map(ur => ur.role) || []
        isAdmin.value = roles.includes('admin')
        console.log('🔍 ManagePacks: Direct role fetch result:', roles, 'isAdmin:', isAdmin.value)
      }
    } else {
      isAdmin.value = false
    }
    
    roleLoaded.value = true
  } catch (err) {
    console.error('❌ ManagePacks: Error fetching admin role:', err)
    isAdmin.value = false
    roleLoaded.value = true
  }
}

// Reactive data
const packs = ref([])
const loading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const statusFilter = ref('')

// Modal and editing state
const selectedPack = ref(null)
const editingPack = ref({})
const saving = ref(false)
const savingPackInfo = ref(false)

// Feature editing state
const editingFeature = ref(null)
const editingFeatureIndex = ref(-1)
const featureEditForm = ref({
  name_en: '',
  name_ar: '',
  name_fr: '',
  description_en: '',
  description_ar: '',
  description_fr: ''
})

// Temporary feature changes storage
const tempFeatureChanges = ref({})

// Feature adding state
const addingFeature = ref(false)
const featureAddForm = ref({
  name_en: '',
  name_ar: '',
  name_fr: '',
  description_en: '',
  description_ar: '',
  description_fr: ''
})

// Computed properties
const filteredPacks = computed(() => {
  let filtered = packs.value

  // Filter by search query (pack names only)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(pack => {
      const name = getLocalizedPackName(pack).toLowerCase()
      return name.includes(query)
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

    // Fetch packs with their features using the RPC function
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

// Modal functions
const openPackDetails = async (pack) => {
  selectedPack.value = pack
  // Map the pack fields correctly for editing
  editingPack.value = {
    id: pack.pack_id, // Map pack_id to id for database operations
    name_en: pack.name_en,
    name_ar: pack.name_ar,
    name_fr: pack.name_fr,
    description_en: pack.description_en,
    description_ar: pack.description_ar,
    description_fr: pack.description_fr,
    price: pack.price,
    max_announcements: pack.max_announcements,
    max_images: pack.max_images,
    is_active: pack.is_active
  }
}

const closePackDetails = () => {
  // Clear all data and close modal
  selectedPack.value = null
  editingPack.value = {}
  // Clear temporary feature changes when closing without saving
  tempFeatureChanges.value = {}
  
  // Also close any open feature modals
  editingFeature.value = null
  editingFeatureIndex.value = -1
  addingFeature.value = false
}

// Computed property to get pack features from RPC data
const packFeaturesDetails = computed(() => {
  if (!selectedPack.value?.features) return []
  
  const features = selectedPack.value.features
  const maxLength = Math.max(
    features.en?.length || 0,
    features.ar?.length || 0,
    features.fr?.length || 0
  )
  
  return Array.from({ length: maxLength }, (_, index) => ({
    id: `feature-${index}`,
    name_en: features.en?.[index] || '',
    name_ar: features.ar?.[index] || '',
    name_fr: features.fr?.[index] || '',
    description_en: '', // RPC doesn't include descriptions
    description_ar: '',
    description_fr: ''
  }))
})

// Helper function to refresh selected pack after database operations
const refreshSelectedPack = async () => {
  if (!selectedPack.value?.pack_id) return
  
  try {
    console.log('🔍 refreshSelectedPack - Looking for pack:', selectedPack.value.pack_id)
    
    // Find the updated pack from the refreshed packs list
    const updatedPack = packs.value.find(p => p.pack_id === selectedPack.value.pack_id)
    
    if (updatedPack) {
      console.log('✅ refreshSelectedPack - Found updated pack, updating selectedPack')
      // Create a new object to trigger reactivity
      selectedPack.value = { ...updatedPack }
      
      // Also update editingPack to keep them in sync
      editingPack.value = {
        id: updatedPack.pack_id,
        name_en: updatedPack.name_en,
        name_ar: updatedPack.name_ar,
        name_fr: updatedPack.name_fr,
        description_en: updatedPack.description_en,
        description_ar: updatedPack.description_ar,
        description_fr: updatedPack.description_fr,
        price: updatedPack.price,
        max_announcements: updatedPack.max_announcements,
        max_images: updatedPack.max_images,
        is_active: updatedPack.is_active
      }
      
      console.log('✅ refreshSelectedPack - Selected pack updated with features:', updatedPack.features)
    } else {
      console.warn('⚠️ refreshSelectedPack - Pack not found in packs list, fetching directly...')
      // If pack not found, fetch it directly using RPC
      const { data: packsData, error } = await supabase.rpc('get_all_packs_with_features')
      if (!error && packsData) {
        const foundPack = packsData.find(p => p.pack_id === selectedPack.value.pack_id)
        if (foundPack) {
          selectedPack.value = { ...foundPack }
          editingPack.value = {
            id: foundPack.pack_id,
            name_en: foundPack.name_en,
            name_ar: foundPack.name_ar,
            name_fr: foundPack.name_fr,
            description_en: foundPack.description_en,
            description_ar: foundPack.description_ar,
            description_fr: foundPack.description_fr,
            price: foundPack.price,
            max_announcements: foundPack.max_announcements,
            max_images: foundPack.max_images,
            is_active: foundPack.is_active
          }
          console.log('✅ refreshSelectedPack - Pack fetched directly and updated')
        }
      }
    }
  } catch (err) {
    console.error('❌ refreshSelectedPack - Error refreshing pack:', err)
  }
}

const removeFeatureFromPack = async (featureIndex) => {
  try {
    // Check admin role before proceeding
    if (!isAdmin.value) {
      alert('You do not have permission to perform this action.')
      return
    }
    
    if (!selectedPack.value?.pack_id) {
      alert('No pack selected.')
      return
    }
    
    // Get the feature name to find the actual feature ID
    const featureName = selectedPack.value.features?.en?.[featureIndex]
    if (!featureName) {
      alert('Feature not found.')
      return
    }
    
    console.log('🔍 removeFeatureFromPack - Removing feature:', featureName, 'from pack:', selectedPack.value.pack_id)
    
    // First get the feature ID from the features table
    const { data: featureData, error: featureError } = await supabase
      .from('features')
      .select('id')
      .eq('name_en', featureName)
      .single()
    
    if (featureError) {
      console.error('❌ removeFeatureFromPack - Error finding feature:', featureError)
      throw featureError
    }
    
    console.log('🔍 removeFeatureFromPack - Feature ID found:', featureData.id)
    
    // Remove the feature from pack_features
    const { error } = await supabase
      .from('pack_features')
      .delete()
      .eq('pack_id', selectedPack.value.pack_id)
      .eq('feature_id', featureData.id)
    
    if (error) {
      console.error('❌ removeFeatureFromPack - Error deleting pack_feature:', error)
      throw error
    }
    
    console.log('✅ removeFeatureFromPack - Feature removed from pack_features')
    
    // Refresh the packs list to get updated data from database
    console.log('🔍 removeFeatureFromPack - Refreshing packs list...')
    await fetchPacks()
    
    // Refresh the selected pack with the new data (await to ensure it completes)
    console.log('🔍 removeFeatureFromPack - Refreshing selected pack...')
    await refreshSelectedPack()
    
    // Show success message
    alert('Feature removed from pack successfully!')
  } catch (err) {
    console.error('❌ removeFeatureFromPack - Error removing feature from pack:', err)
    alert(`Error: ${err.message || 'Failed to remove feature from pack'}`)
  }
}

const editFeature = async (featureIndex) => {
  try {
    // Get the feature name to find the actual feature ID
    const featureName = selectedPack.value.features.en[featureIndex]
    
    // Find the feature ID from the features table
    const { data: featureData, error: featureError } = await supabase
      .from('features')
      .select('*')
      .eq('name_en', featureName)
      .single()
    
    if (featureError) throw featureError
    
    // Set up the editing state
    editingFeature.value = featureData
    editingFeatureIndex.value = featureIndex
    
    // Populate the form with current feature data
    featureEditForm.value = {
      name_en: featureData.name_en || '',
      name_ar: featureData.name_ar || '',
      name_fr: featureData.name_fr || '',
      description_en: featureData.description_en || '',
      description_ar: featureData.description_ar || '',
      description_fr: featureData.description_fr || ''
    }
  } catch (err) {
    console.error('Error loading feature for editing:', err)
  }
}

const closeFeatureEdit = () => {
  editingFeature.value = null
  editingFeatureIndex.value = -1
  featureEditForm.value = {
    name_en: '',
    name_ar: '',
    name_fr: '',
    description_en: '',
    description_ar: '',
    description_fr: ''
  }
}

const saveFeatureChanges = async () => {
  try {
    // Check admin role before proceeding
    if (!isAdmin.value) {
      alert('You do not have permission to perform this action.')
      return
    }

    // Update the feature in the database
    const { error } = await supabase
      .from('features')
      .update({
        name_en: featureEditForm.value.name_en,
        name_ar: featureEditForm.value.name_ar,
        name_fr: featureEditForm.value.name_fr,
        description_en: featureEditForm.value.description_en,
        description_ar: featureEditForm.value.description_ar,
        description_fr: featureEditForm.value.description_fr
      })
      .eq('id', editingFeature.value.id)
    
    if (error) throw error
    
    // Refresh the packs list to get updated data from database
    await fetchPacks()
    
    // Refresh the selected pack with the new data (await to ensure it completes)
    await refreshSelectedPack()
    
    // Close the edit modal
    closeFeatureEdit()
    
    // Show success message
    alert('Feature updated successfully!')
  } catch (err) {
    console.error('Error updating feature:', err)
    alert(`Error: ${err.message}`)
  }
}

const addFeatureToPack = () => {
  // Reset the form
  featureAddForm.value = {
    name_en: '',
    name_ar: '',
    name_fr: '',
    description_en: '',
    description_ar: '',
    description_fr: ''
  }
  
  // Open the add feature modal
  addingFeature.value = true
}

const closeAddFeature = () => {
  addingFeature.value = false
  featureAddForm.value = {
    name_en: '',
    name_ar: '',
    name_fr: '',
    description_en: '',
    description_ar: '',
    description_fr: ''
  }
}

const saveNewFeature = async () => {
  try {
    // Check admin role before proceeding
    if (!isAdmin.value) {
      alert('You do not have permission to perform this action.')
      return
    }
    
    // Validate required fields
    if (!featureAddForm.value.name_en || !featureAddForm.value.name_ar || !featureAddForm.value.name_fr) {
      alert('Please fill in all feature names (English, Arabic, and French)')
      return
    }
    
    // Check if pack is selected
    if (!selectedPack.value?.pack_id) {
      alert('No pack selected. Please select a pack first.')
      return
    }
    
    saving.value = true
    console.log('🔍 saveNewFeature - Starting feature creation...')
    console.log('🔍 saveNewFeature - Form data:', featureAddForm.value)
    console.log('🔍 saveNewFeature - Selected pack ID:', selectedPack.value.pack_id)
    
    // Create timeout promise (15 seconds) - applies to entire operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout after 15 seconds. The database operation is taking too long.')), 15000)
    })
    
    // Verify session before proceeding (with timeout)
    console.log('🔍 saveNewFeature - Checking session...')
    const sessionPromise = supabase.auth.getSession()
    const { data: { session }, error: sessionError } = await Promise.race([
      sessionPromise,
      timeoutPromise
    ])
    
    if (sessionError) {
      console.error('❌ saveNewFeature - Session error:', sessionError)
      throw new Error(`Authentication error: ${sessionError.message}`)
    }
    
    if (!session?.user) {
      console.error('❌ saveNewFeature - No active session')
      throw new Error('You must be logged in to perform this action')
    }
    
    console.log('✅ saveNewFeature - Session valid, user ID:', session.user.id)
    console.log('🔍 saveNewFeature - Session details:', { 
      user_id: session.user.id, 
      email: session.user.email,
      expires_at: session.expires_at 
    })
    
    // Prepare feature data
    const featureData = {
      name_en: featureAddForm.value.name_en.trim(),
      name_ar: featureAddForm.value.name_ar.trim(),
      name_fr: featureAddForm.value.name_fr.trim(),
      description_en: featureAddForm.value.description_en?.trim() || null,
      description_ar: featureAddForm.value.description_ar?.trim() || null,
      description_fr: featureAddForm.value.description_fr?.trim() || null
    }
    
    console.log('🔍 saveNewFeature - Prepared feature data:', featureData)
    console.log('🔍 saveNewFeature - About to insert into features table...')
    
    // Create the new feature in the database with timeout
    const insertPromise = supabase
      .from('features')
      .insert(featureData)
      .select()
      .single()
    
    console.log('🔍 saveNewFeature - Insert promise created, awaiting response...')
    
    const { data: newFeature, error: featureError } = await Promise.race([
      insertPromise,
      timeoutPromise
    ])
    
    if (featureError) {
      console.error('❌ saveNewFeature - Feature insert error:', featureError)
      console.error('❌ saveNewFeature - Error details:', {
        message: featureError.message,
        code: featureError.code,
        details: featureError.details,
        hint: featureError.hint
      })
      throw featureError
    }
    
    if (!newFeature) {
      throw new Error('Feature was created but no data was returned')
    }
    
    console.log('✅ saveNewFeature - Feature created:', newFeature)
    console.log('🔍 saveNewFeature - New feature ID:', newFeature.id)
    
    // Add the feature to the current pack
    console.log('🔍 saveNewFeature - About to insert into pack_features table...')
    const packFeatureData = {
      pack_id: selectedPack.value.pack_id,
      feature_id: newFeature.id,
      is_enabled: true
    }
    
    console.log('🔍 saveNewFeature - Pack feature data:', packFeatureData)
    
    const packFeaturePromise = supabase
      .from('pack_features')
      .insert(packFeatureData)
    
    const { error: packFeatureError } = await Promise.race([
      packFeaturePromise,
      timeoutPromise
    ])
    
    if (packFeatureError) {
      console.error('❌ saveNewFeature - Pack feature insert error:', packFeatureError)
      console.error('❌ saveNewFeature - Error details:', {
        message: packFeatureError.message,
        code: packFeatureError.code,
        details: packFeatureError.details,
        hint: packFeatureError.hint
      })
      throw packFeatureError
    }
    
    console.log('✅ saveNewFeature - Feature added to pack successfully')
    
    // Refresh the packs list to get updated data from database
    console.log('🔍 saveNewFeature - Refreshing packs list...')
    await fetchPacks()
    
    // Refresh the selected pack with the new data (await to ensure it completes)
    console.log('🔍 saveNewFeature - Refreshing selected pack...')
    await refreshSelectedPack()
    
    // Close the add feature modal
    closeAddFeature()
    
    // Show success message
    alert('Feature created and added to pack successfully!')
  } catch (err) {
    console.error('❌ saveNewFeature - Error creating new feature:', err)
    console.error('❌ saveNewFeature - Full error object:', JSON.stringify(err, null, 2))
    
    let errorMessage = 'Failed to create feature.'
    
    if (err.message) {
      errorMessage = err.message
    } else if (err.error?.message) {
      errorMessage = err.error.message
    } else if (typeof err === 'string') {
      errorMessage = err
    }
    
    // Check for specific error types
    if (err.code === 'PGRST301' || err.code === '42501') {
      errorMessage = 'Permission denied. You may not have admin access or the necessary database permissions.'
    } else if (err.code === '23505') {
      errorMessage = 'A feature with this name already exists.'
    } else if (err.code === '23503') {
      errorMessage = 'Invalid pack ID. The selected pack may not exist.'
    } else if (err.message?.includes('timeout')) {
      errorMessage = 'Request timed out. Please check your network connection and try again.'
    } else if (err.message?.includes('revoked') || err.message?.includes('session')) {
      errorMessage = 'Your session has expired. Please refresh the page and try again.'
    }
    
    alert(`Error: ${errorMessage}`)
  } finally {
    saving.value = false
    console.log('🔍 saveNewFeature - Function completed, saving state reset')
  }
}

// Save only pack information (names, descriptions, price, limits, status)
const savePackInfo = async () => {
  try {
    // Check admin role before proceeding
    if (!isAdmin.value) {
      alert('You do not have permission to perform this action.')
      return
    }
    
    savingPackInfo.value = true
    error.value = null
    
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
      throw new Error('Admin access required to manage packs')
    }
    
    // Update only pack information
    const updateData = {
      name_en: editingPack.value.name_en,
      name_ar: editingPack.value.name_ar,
      name_fr: editingPack.value.name_fr,
      description_en: editingPack.value.description_en,
      description_ar: editingPack.value.description_ar,
      description_fr: editingPack.value.description_fr,
      price: editingPack.value.price,
      max_announcements: editingPack.value.max_announcements,
      max_images: editingPack.value.max_images,
      is_active: editingPack.value.is_active
    }
    
    const { data, error: operationError } = await supabase
      .from('packs')
      .update(updateData)
      .eq('id', editingPack.value.id)
      .select()
    
    if (operationError) {
      console.error('Database operation error:', operationError)
      throw new Error(operationError.message || 'Failed to update pack information')
    }
    
    // Update local state
    const index = packs.value.findIndex(p => p.pack_id === selectedPack.value.pack_id)
    if (index !== -1) {
      packs.value[index] = { ...packs.value[index], ...updateData }
    }
    
    // Refresh the selected pack to ensure data consistency
    refreshSelectedPack()
    
    // Show success message
    alert('Pack information updated successfully!')
  } catch (err) {
    console.error('Error saving pack info:', err)
    alert(`Error: ${err.message}`)
  } finally {
    savingPackInfo.value = false
  }
}


const savePackChanges = async (retryCount = 0) => {
  try {
    // Check admin role before proceeding
    if (!isAdmin.value) {
      alert('You do not have permission to perform this action.')
      return
    }
    
    saving.value = true
    error.value = null // Clear any previous errors
    
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
      throw new Error('Admin access required to manage packs')
    }
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout - please try again')), 15000)
    })
    
    // Update existing pack - only update changed fields
    const updateData = {
      name_en: editingPack.value.name_en,
      name_ar: editingPack.value.name_ar,
      name_fr: editingPack.value.name_fr,
      description_en: editingPack.value.description_en,
      description_ar: editingPack.value.description_ar,
      description_fr: editingPack.value.description_fr,
      price: editingPack.value.price,
      max_announcements: editingPack.value.max_announcements,
      max_images: editingPack.value.max_images,
      status: editingPack.value.status
    }
    
    const operationPromise = supabase
      .from('packs')
      .update(updateData)
      .eq('id', editingPack.value.id)
      .select()
    
    // Race between operation and timeout
    const { data, error: operationError } = await Promise.race([
      operationPromise,
      timeoutPromise
    ])
    
    if (operationError) {
      console.error('Database operation error:', operationError)
      
      // Handle specific error types
      if (operationError.code === 'PGRST301') {
        throw new Error('Permission denied - you may not have admin access')
      } else if (operationError.code === '23505') {
        throw new Error('A pack with this name already exists')
      } else if (operationError.code === '23514') {
        throw new Error('Invalid data provided - please check all fields')
      } else if (operationError.code === 'PGRST116') {
        // Retry on connection issues
        if (retryCount < 2) {
          console.log(`Retrying operation (attempt ${retryCount + 1})`)
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
          return savePackChanges(retryCount + 1)
        }
        throw new Error('Connection issue - please try again')
      } else {
        throw new Error(operationError.message || 'Database operation failed')
      }
    }
    
    // Save temporary feature changes to database
    for (const [featureId, changes] of Object.entries(tempFeatureChanges.value)) {
      const { error: featureError } = await supabase
        .from('features')
        .update(changes)
        .eq('id', featureId)
      
      if (featureError) {
        console.error('Error updating feature:', featureId, featureError)
        throw featureError
      }
    }
    
    // Clear temporary changes
    tempFeatureChanges.value = {}
    
    // Update local state
    const index = packs.value.findIndex(p => p.pack_id === selectedPack.value.pack_id)
    if (index !== -1) {
      packs.value[index] = { ...packs.value[index], ...updateData }
    }
    
    // Refresh the selected pack to ensure data consistency
    refreshSelectedPack()
    
    // Close the modal after successful save
    closePackDetails()
    
    // Show success message
    alert('Pack and features updated successfully!')
  } catch (err) {
    console.error('Error saving pack changes:', err)
    alert(`Error: ${err.message}`)
  } finally {
    saving.value = false
  }
}

const deletePack = async () => {
  // Check admin role before proceeding
  if (!isAdmin.value) {
    alert('You do not have permission to perform this action.')
    return
  }
  
  if (!confirm('Are you sure you want to delete this pack? This action cannot be undone.')) {
    return
  }
  
  try {
    saving.value = true
    
    // First delete pack features
    const { error: featuresError } = await supabase
      .from('pack_features')
      .delete()
      .eq('pack_id', selectedPack.value.pack_id)
    
    if (featuresError) throw featuresError
    
    // Then delete the pack
    const { error: packError } = await supabase
      .from('packs')
      .delete()
      .eq('id', selectedPack.value.pack_id)
    
    if (packError) throw packError
    
    // Refresh packs list
    await fetchPacks()
    closePackDetails()
  } catch (err) {
    console.error('Error deleting pack:', err)
  } finally {
    saving.value = false
  }
}

// Action handlers (legacy)
const editPack = (pack) => {
  openPackDetails(pack)
}

const deletePackLegacy = (pack) => {
  selectedPack.value = pack
  editingPack.value = { ...pack }
  deletePack()
}

// Lifecycle
onMounted(async () => {
  // Fetch admin role first
  await fetchAdminRoleOnce()
  // Then fetch packs
  fetchPacks()
})
</script>

<style scoped>
/* Custom styles if needed */
</style>