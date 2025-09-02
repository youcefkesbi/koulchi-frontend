<template>
  <div class="space-y-6">
    <!-- Store Management Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
      <div>
        <h2 class="text-2xl font-bold text-dark mb-2">
          {{ $t('stores.manageStores') }}
        </h2>
        <p class="text-gray-600">{{ $t('stores.manageStoresDescription') }}</p>
      </div>
      
      <button
        @click="showCreateModal = true"
        class="btn-primary inline-flex items-center no-underline"
      >
        <i class="fas fa-plus ml-2"></i>
        {{ $t('stores.createStore') }}
      </button>
    </div>

    <!-- User Stores List -->
    <div v-if="storeStore.userStores.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="store in storeStore.userStores" 
        :key="store.id"
        class="bg-white rounded-2xl shadow-soft p-6 hover:shadow-glow transition-all duration-300"
      >
        <!-- Store Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-3 space-x-reverse">
            <div class="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <img 
                v-if="store.logo_url" 
                :src="store.logo_url" 
                :alt="store.name"
                class="w-full h-full object-cover rounded-xl"
              />
              <i v-else class="fas fa-store text-white text-xl"></i>
            </div>
            <div>
              <h3 class="font-bold text-gray-800">{{ store.name }}</h3>
              <p class="text-sm text-gray-500">{{ formatDate(store.created_at) }}</p>
            </div>
          </div>
          
          <!-- Store Actions -->
          <div class="flex items-center space-x-2 space-x-reverse">
            <button
              @click="editStore(store)"
              class="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
              :title="$t('stores.editStore')"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              @click="deleteStore(store.id)"
              class="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              :title="$t('stores.deleteStore')"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <!-- Store Description -->
        <p v-if="store.description" class="text-gray-600 mb-4 line-clamp-2">
          {{ store.description }}
        </p>
        <p v-else class="text-gray-500 mb-4 italic text-sm">
          {{ $t('stores.noDescription') }}
        </p>

        <!-- Store Images -->
        <div class="space-y-3">
          <div v-if="store.banner_url" class="relative">
            <img 
              :src="store.banner_url" 
              :alt="store.name"
              class="w-full h-24 object-cover rounded-lg"
            />
            <span class="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {{ $t('stores.banner') }}
            </span>
          </div>
          
          <div v-if="store.logo_url" class="flex items-center space-x-2 space-x-reverse">
            <img 
              :src="store.logo_url" 
              :alt="store.name"
              class="w-12 h-12 object-cover rounded-lg"
            />
            <span class="text-xs text-gray-500">{{ $t('stores.logo') }}</span>
          </div>
        </div>

        <!-- Store Stats -->
        <div class="mt-4 pt-4 border-t border-gray-100">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500">{{ $t('stores.products') }}</span>
            <span class="font-medium text-primary">{{ getStoreProductCount(store.id) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- No Stores State -->
    <div v-else class="text-center py-12 bg-white rounded-2xl shadow-soft">
      <div class="text-gray-400 text-5xl mb-4">
        <i class="fas fa-store"></i>
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ $t('stores.noStoresYet') }}</h3>
      <p class="text-gray-600 mb-6">{{ $t('stores.noStoresYetMessage') }}</p>
      <button
        @click="showCreateModal = true"
        class="btn-primary"
      >
        <i class="fas fa-plus ml-2"></i>
        {{ $t('stores.createFirstStore') }}
      </button>
    </div>

    <!-- Create/Edit Store Modal -->
    <div v-if="showCreateModal || editingStore" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-soft max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-800">
              {{ editingStore ? $t('stores.editStore') : $t('stores.createStore') }}
            </h3>
            <button
              @click="closeModal"
              class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Store Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('stores.storeName') }} *
              </label>
              <input
                v-model="formData.name"
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
                v-model="formData.description"
                rows="4"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-none"
                :placeholder="$t('stores.storeDescriptionPlaceholder')"
              ></textarea>
            </div>

            <!-- Store Logo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('stores.storeLogo') }}
              </label>
              <div class="space-y-3">
                <div v-if="logoPreview" class="relative">
                  <img 
                    :src="logoPreview" 
                    :alt="$t('stores.logoPreview')"
                    class="w-24 h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    @click="removeLogo"
                    class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <input
                  ref="logoInput"
                  type="file"
                  accept="image/*"
                  @change="handleLogoChange"
                  class="hidden"
                />
                <button
                  type="button"
                  @click="$refs.logoInput.click()"
                  class="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary hover:text-primary transition-colors text-center"
                >
                  <i class="fas fa-upload mr-2"></i>
                  {{ logoPreview ? $t('stores.changeLogo') : $t('stores.uploadLogo') }}
                </button>
              </div>
            </div>

            <!-- Store Banner -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('stores.storeBanner') }}
              </label>
              <div class="space-y-3">
                <div v-if="bannerPreview" class="relative">
                  <img 
                    :src="bannerPreview" 
                    :alt="$t('stores.bannerPreview')"
                    class="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    @click="removeBanner"
                    class="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <input
                  ref="bannerInput"
                  type="file"
                  accept="image/*"
                  @change="handleBannerChange"
                  class="hidden"
                />
                <button
                  type="button"
                  @click="$refs.bannerInput.click()"
                  class="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary hover:text-primary transition-colors text-center"
                >
                  <i class="fas fa-upload mr-2"></i>
                  {{ bannerPreview ? $t('stores.changeBanner') : $t('stores.uploadBanner') }}
                </button>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex items-center justify-end space-x-3 space-x-reverse pt-4 border-t border-gray-200">
              <button
                type="button"
                @click="closeModal"
                class="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="storeStore.loading"
                class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div v-if="storeStore.loading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {{ editingStore ? $t('stores.updateStore') : $t('stores.createStore') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStoreStore } from '../stores/store'
import { useProductStore } from '../stores/product'

const $router = useRouter()
const { t: $t } = useI18n()
const storeStore = useStoreStore()
const productStore = useProductStore()

const showCreateModal = ref(false)
const editingStore = ref(null)
const logoPreview = ref('')
const bannerPreview = ref('')

const formData = reactive({
  name: '',
  description: '',
  logo_url: '',
  banner_url: ''
})

const getStoreProductCount = (storeId) => {
  return productStore.products.filter(p => p.store_id === storeId).length
}

const handleLogoChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    logoPreview.value = URL.createObjectURL(file)
    formData.logo_url = file
  }
}

const handleBannerChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    bannerPreview.value = URL.createObjectURL(file)
    formData.banner_url = file
  }
}

const removeLogo = () => {
  logoPreview.value = ''
  formData.logo_url = ''
  if (editingStore.value?.logo_url) {
    formData.logo_url = editingStore.value.logo_url
  }
}

const removeBanner = () => {
  bannerPreview.value = ''
  formData.banner_url = ''
  if (editingStore.value?.banner_url) {
    formData.banner_url = editingStore.value.banner_url
  }
}

const editStore = (store) => {
  editingStore.value = store
  formData.name = store.name
  formData.description = store.description || ''
  formData.logo_url = store.logo_url || ''
  formData.banner_url = store.banner_url || ''
  logoPreview.value = store.logo_url || ''
  bannerPreview.value = store.banner_url || ''
  showCreateModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  editingStore.value = null
  resetForm()
}

const resetForm = () => {
  formData.name = ''
  formData.description = ''
  formData.logo_url = ''
  formData.banner_url = ''
  logoPreview.value = ''
  bannerPreview.value = ''
}

const handleSubmit = async () => {
  try {
    let logoFile = null
    let bannerFile = null

    // Check if new files were uploaded
    if (formData.logo_url instanceof File) {
      logoFile = formData.logo_url
    }

    if (formData.banner_url instanceof File) {
      bannerFile = formData.banner_url
    }

    if (editingStore.value) {
      // Update existing store
      await storeStore.updateStoreWithImages(
        editingStore.value.id,
        {
          name: formData.name.trim(),
          description: formData.description?.trim() || null
        },
        logoFile,
        bannerFile
      )
    } else {
      // Create new store
      const storeData = {
        name: formData.name.trim(), // Required field
        description: formData.description?.trim() || null, // Optional field
        logo_url: null, // Will be set by createStore method
        banner_url: null // Will be set by createStore method
      }

      const newStore = await storeStore.createStore(storeData)
      
      // Redirect to store dashboard for new stores
      $router.push(`/dashboard/store/${newStore.id}`)
    }

    closeModal()
  } catch (error) {
    console.error('Error saving store:', error)
    // Show error to user - could be improved with toast notifications
    alert(error.message || $t('stores.storeCreationError'))
  }
}

const deleteStore = async (storeId) => {
  if (confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
    try {
      await storeStore.deleteStore(storeId)
    } catch (error) {
      console.error('Error deleting store:', error)
    }
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(async () => {
  await storeStore.fetchUserStores()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-primary {
  @apply px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors;
}
</style>
