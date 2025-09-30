<template>
  <div class="min-h-screen w-[90%] mx-auto ">
    

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
    <div v-else-if="storeStore.currentStore && storeStatus && storeStatus.status === 'approved' && !storeStore.loading" class="min-h-screen pt-5 ">
      
      <!-- Banner -->
      <div class="relative">
        <!-- Banner Section (Pro Pack only) -->
        <div v-if="isProPack" class="relative h-60 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-4 mt-4">
          <!-- Banner Image -->
          <div v-if="storeStore.currentStore?.hasBanner || editForm.banner" class="absolute inset-0 rounded-2xl overflow-hidden">
            <img 
              :src="editForm.banner ? getFilePreview(editForm.banner) : storeStore.currentStore?.banner_url" 
              :alt="storeStore.currentStore?.displayName + ' banner'"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>
          
          <!-- Default Banner for Pro Pack without image -->
          <div v-else class="absolute inset-0 flex items-center justify-center">
            <div class="text-center text-white">
              <i class="fas fa-image text-6xl mb-4 opacity-50"></i>
              <p class="text-xl font-medium">{{ $t('stores.updateBanner') }}</p>
            </div>
          </div>

          <!-- Update Banner Button (Pro Pack only) -->
          <div class="absolute top-4 right-4">
            <button 
              @click="updateBanner"
              :disabled="bannerUploading"
              class="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i v-if="bannerUploading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-camera"></i>
              <span>{{ bannerUploading ? $t('common.uploading') : $t('stores.updateBanner') }}</span>
            </button>
          </div>
          <!-- Banner validation error -->
          <div v-if="validationErrors.banner" class="absolute bottom-4 left-4 right-4">
            <p class="text-red-600 text-sm bg-white bg-opacity-90 px-3 py-2 rounded-lg">{{ validationErrors.banner }}</p>
          </div>
        </div>

        <!-- Store Info Section -->
        <div class="pb-20 bg-white shadow-lg rounded-2xl mx-4 -mt-16 relative">
          <div class="container mx-auto py-6">
            <!-- Logo Section  -->
            <div class="relative flex -mt-20 mb-6">
              <div class="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                  <img 
                    v-if="storeStore.currentStore?.hasLogo || editForm.logo" 
                    :src="editForm.logo ? getFilePreview(editForm.logo) : storeStore.currentStore?.logo_url" 
                    :alt="storeStore.currentStore?.displayName"
                    class="w-full h-full object-cover rounded-full"
                  />
                <i v-else class="fas fa-store text-gray-400 text-4xl"></i>
              </div>
              <!-- Store Stats -->
                <div class="mt-8 ml-8 flex items-center space-x-6 mt-4 text-sm text-gray-500">
              <span>
                <i class="fas fa-calendar-alt mr-1"></i>
                    {{ $t('stores.createdOn') }} {{ storeStore.currentStore?.created_at ? formatDate(storeStore.currentStore.created_at) : '' }}
              </span>
              <span>
                <i class="fas fa-box mr-1"></i>
                {{ storeProducts.length }} {{ $t('stores.products') }}
              </span>
                </div>
              <!-- Update Logo Button -->
              <button 
                @click="updateLogo"
                :disabled="logoUploading"
                class="absolute -bottom-2 -right-2 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i v-if="logoUploading" class="fas fa-spinner fa-spin text-xs"></i>
                <i v-else class="fas fa-camera text-sm"></i>
              </button>
              <!-- Logo validation error -->
              <div v-if="validationErrors.logo" class="absolute -bottom-8 left-0 right-0 text-center">
                <p class="text-red-600 text-xs bg-white px-2 py-1 rounded shadow-lg">{{ validationErrors.logo }}</p>
              </div>
            </div>
             <!-- Store details grid -->
             <div class="grid grid-cols-[0.5fr_1fr] gap-16 items-center text-center relative">
               <!-- Vertical divider line -->
               <div class="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 transform -translate-x-1/2"></div>
             <div>
              <!-- Store Details -->
              <div class="w-full text-left">
                <!-- Store Name/ID Display -->
                <h1 class="text-3xl font-bold text-gray-900 mb-2">
                  <!-- Show Store ID for Basic Pack, Store Name for Pro Pack -->
                  <span v-if="!isProPack">{{ $t('stores.storeIdDisplay', { id: storeStore.currentStore?.id?.slice(-8) }) }}</span>
                  <span v-else>{{ storeStore.currentStore?.name || $t('stores.storeIdDisplay', { id: storeStore.currentStore?.id?.slice(-8) }) }}</span>
                </h1>
                
                <!-- Pack Type Badge -->
                <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4"
                     :class="isProPack ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'">
                  <i :class="isProPack ? 'fas fa-crown mr-1' : 'fas fa-star mr-1'"></i>
                  {{ storeStore.currentStore?.packType || (isProPack ? $t('stores.proPlan') : $t('stores.basicPlan')) }}
                </div>
                <!-- Location Section -->
                <div class="w-full max-w-md text-left">
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('stores.location') }}</label>
                  <div class="relative">
                    <i class="fas fa-map-marker-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input
                      v-model="editForm.location"
                      @blur="updateLocation"
                      @keydown.enter.prevent="updateLocation"
                      type="text"
                      class="w-full pl-10 pr-12 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-center"
                      :class="{ 'border-red-500': validationErrors.location }"
                      :placeholder="$t('stores.location')"
                    />
                     <button 
                       @click="updateLocation"
                       :disabled="updateLoading"
                       class="absolute top-2 right-2 text-primary hover:text-primary-dark text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       <i v-if="updateLoading" class="fas fa-spinner fa-spin"></i>
                       <i v-else class="fas fa-check"></i>
                     </button>
                  </div>
                  <p v-if="validationErrors.location" class="mt-1 text-sm text-red-600">{{ validationErrors.location }}</p>

                <!-- Contact Section (Pro Pack only) -->
                 <div v-if="isProPack" class="w-full mt-6 max-w-md text-left">
                   <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('stores.contact') }}</label>
                   <div class="space-y-3">
                     <div v-for="(link, idx) in editForm.socialLinks" :key="idx" class="relative flex items-center space-x-2">
                       <input
                         v-model="editForm.socialLinks[idx]"
                         type="url"
                         class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                         :placeholder="$t('stores.socialLinkPlaceholder')"
                       />
                       <button @click="removeSocialLink(idx)" class="px-2 py-2 text-red-600 hover:text-red-700" type="button">
                         <i class="fas fa-times"></i>
                       </button>
                     </div>
                     <div class="flex items-center space-x-2">
                       <button @click="addSocialLink" type="button" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
                         <i class="fas fa-plus mr-1"></i>{{ $t('stores.addLink') }}
                       </button>
                       <button @click="updateSocialLinks" :disabled="updateLoading" type="button" class="px-3 py-2 text-white bg-primary hover:bg-primary-dark rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                         <i v-if="updateLoading" class="fas fa-spinner fa-spin mr-1"></i>{{ $t('common.save') || 'Save' }}
                       </button>
                     </div>
                     <p v-if="validationErrors.socialLinks" class="mt-1 text-sm text-red-600">{{ validationErrors.socialLinks }}</p>
                   </div>
                 </div>
              
              </div>
              </div>
              </div>
              <div>
              
               <div class="w-1 h-40 bg-green-600 rounded-md absolute left-[34%]"></div>
                <!-- Description Section -->
                <div class="w-full mt-4 max-w-md text-left">
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('stores.storeDescription') }}</label>
                  <div class="relative">
                    <textarea
                      v-model="editForm.description"
                      @blur="updateDescription"
                      @keydown.enter.prevent="updateDescription"
                      class="text-sm w-full py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-none text-left pl-2"
                      :class="{ 'border-red-500': validationErrors.description }"
                      :placeholder="$t('stores.storeDescriptionPlaceholder')"
                      rows="3"
                    ></textarea>
                     <button 
                       @click="updateDescription"
                       :disabled="updateLoading"
                       class="absolute top-2 right-2 text-primary hover:text-primary-dark text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       <i v-if="updateLoading" class="fas fa-spinner fa-spin"></i>
                       <i v-else class="fas fa-check"></i>
                     </button>
                  </div>
                  <p v-if="validationErrors.description" class="mt-1 text-sm text-red-600">{{ validationErrors.description }}</p>
                </div>

                <!-- Color Picker (Pro Pack only) -->
                <div v-if="isProPack" class="w-full mt-4 max-w-md text-left">
                  <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('stores.selectColor') }}</label>
                  <div class="flex items-center space-x-3">
                    <button
                      type="button"
                      @click="openColorPicker"
                      class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                    >
                      <i class="fas fa-eye-dropper mr-2"></i>{{ $t('stores.selectColor') }}
                    </button>
                    <div
                      class="w-8 h-8 rounded-md border border-gray-300"
                      :style="{ backgroundColor: editForm.themeColor || '#0099ff' }"
                      title="Current color"
                    ></div>
                    <input
                      ref="colorInputRef"
                      type="color"
                      class="hidden"
                      :value="editForm.themeColor || '#0099ff'"
                      @input="onColorChange"
                    />
                  </div>
                </div>


                <!-- Save Button -->
                <div class="w-full mt-6 text-center">
                  <button
                    @click="saveAllChanges"
                    :disabled="updateLoading"
                    class="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                  >
                    <i v-if="updateLoading" class="fas fa-spinner fa-spin mr-2"></i>
                    <i v-else class="fas fa-save mr-2"></i>
                    {{ updateLoading ? ($t('common.saving') || 'Saving...') : ($t('stores.saveChanges') || 'Save Changes') }}
                  </button>
                </div>

                <!-- Update Message -->
                <div v-if="updateMessage" class="w-full mt-4 text-center">
                  <div 
                    class="px-4 py-3 rounded-lg font-medium"
                    :class="{
                      'bg-green-100 text-green-800 border border-green-200': updateMessageType === 'success',
                      'bg-red-100 text-red-800 border border-red-200': updateMessageType === 'error',
                      'bg-blue-100 text-blue-800 border border-blue-200': updateMessageType === 'info'
                    }"
                  >
                    <i 
                      class="fas mr-2"
                      :class="{
                        'fa-check-circle': updateMessageType === 'success',
                        'fa-exclamation-circle': updateMessageType === 'error',
                        'fa-info-circle': updateMessageType === 'info'
                      }"
                    ></i>
                    {{ updateMessage }}
                  </div>
                </div>

                 
                </div>

                
                

              
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="container mx-auto px-4 py-8">
      <div class="bg-white rounded-xl shadow-soft p-6 mb-8">
        <h3 class="text-xl font-bold text-gray-800 mb-6">{{ $t('stores.quickActions') }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <router-link v-if="storeStore.currentStore?.id" :to="`/stores/${storeStore.currentStore.id}`" class="btn-secondary text-center py-4">
            <i class="fas fa-eye text-2xl mb-2 block"></i>
            {{ $t('stores.viewPublicStore') }}
          </router-link>
          <button @click="showAnalytics = !showAnalytics" class="btn-outline text-center py-4">
            <i class="fas fa-chart-bar text-2xl mb-2 block"></i>
            {{ $t('stores.analytics') }}
          </button>
          </div>
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
const { t: $t } = useI18n()
const storeStore = useStoreStore()

const showEditModal = ref(false)
const showAnalytics = ref(false)
const updateLoading = ref(false)
const updateMessage = ref('')
const updateMessageType = ref('') // 'success', 'error', 'info'
const storeProducts = ref([])
const storeStatus = ref(null)
const statusLoading = ref(false)
const logoUploading = ref(false)
const bannerUploading = ref(false)

const editForm = reactive({
  name: '',
  description: '',
  location: '',
  socialLinks: [],
  themeColor: '#0099ff',
  logo: null,
  banner: null
})

// Validation errors
const validationErrors = reactive({
  description: '',
  location: '',
  logo: '',
  banner: '',
  socialLinks: ''
})

// Upload helper (from CreateStore.vue)
const uploadFile = async (file, bucketName) => {
  if (!file) return null

  const ext = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) {
    console.error('File upload error:', uploadError)
    throw new Error(`Failed to upload to bucket ${bucketName}`)
  }

  // Build public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName)

  return publicUrl
}

// Validation function (adapted from CreateStore.vue)
const validateForm = async () => {
  // Clear previous errors
  Object.keys(validationErrors).forEach(key => {
    validationErrors[key] = ''
  })

  let isValid = true

  // Validate description (optional but if provided, check length)
  if (editForm.description && editForm.description.trim().length > 500) {
    validationErrors.description = $t('stores.descriptionTooLong') || 'Description must be less than 500 characters'
    isValid = false
  }

  // Validate location (optional but if provided, check length)
  if (editForm.location && editForm.location.trim().length > 200) {
    validationErrors.location = $t('stores.locationTooLong') || 'Location must be less than 200 characters'
    isValid = false
  }

  // Validate social links (optional but if provided, check URLs)
  if (editForm.socialLinks && editForm.socialLinks.length > 0) {
    const invalidLinks = editForm.socialLinks.filter(link => {
      if (!link || !link.trim()) return false
      try {
        new URL(link.trim())
        return false
      } catch {
        return true
      }
    })
    
    if (invalidLinks.length > 0) {
      validationErrors.socialLinks = $t('stores.invalidLinks') || 'Please enter valid URLs for social links'
      isValid = false
    }
  }

  // Validate logo file if provided
  if (editForm.logo instanceof File) {
    if (!editForm.logo.type.startsWith('image/')) {
      validationErrors.logo = $t('stores.invalidFileType') || 'Logo must be an image file'
      isValid = false
    } else if (editForm.logo.size > 5 * 1024 * 1024) { // 5MB limit
      validationErrors.logo = $t('stores.fileTooLarge') || 'Logo file must be less than 5MB'
      isValid = false
    }
  }

  // Validate banner file if provided
  if (editForm.banner instanceof File) {
    if (!editForm.banner.type.startsWith('image/')) {
      validationErrors.banner = $t('stores.invalidFileType') || 'Banner must be an image file'
      isValid = false
    } else if (editForm.banner.size > 5 * 1024 * 1024) { // 5MB limit
      validationErrors.banner = $t('stores.fileTooLarge') || 'Banner file must be less than 5MB'
      isValid = false
    }
  }

  return isValid
}

// Save all changes at once
const saveAllChanges = async () => {
  try {
    updateLoading.value = true
    
    // Validate form first
    if (!(await validateForm())) {
      updateMessage.value = $t('stores.validationError') || 'Please fix the validation errors before proceeding.'
      updateMessageType.value = 'error'
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        updateMessage.value = ''
        updateMessageType.value = ''
      }, 5000)
      return
    }
    
    // Upload files if present
    let logoUrl = null
    let bannerUrl = null

    if (editForm.logo instanceof File) {
      logoUrl = await uploadFile(editForm.logo, 'stores-logos')
    }
    if (editForm.banner instanceof File) {
      bannerUrl = await uploadFile(editForm.banner, 'stores-banners')
    }
    
    // Prepare update data - include all fields to allow clearing empty values
    const updateData = {}
    
    // Always include description (even if empty to clear it)
    updateData.description = editForm.description?.trim() || null
    
    // Always include location (even if empty to clear it)
    updateData.location = editForm.location?.trim() || null
    
    // Always include social links (even if empty to clear it)
    updateData.external_buttons = editForm.socialLinks && editForm.socialLinks.length > 0 ? editForm.socialLinks : null
    
    // Add customization settings (color picker)
    if (editForm.themeColor) {
      updateData.customization_settings = {
        color: editForm.themeColor
      }
    }
    
    // Add file URLs if uploaded
    if (logoUrl) updateData.logo_url = logoUrl
    if (bannerUrl) updateData.banner_url = bannerUrl
    
    // Check if there are any actual changes (excluding file uploads)
    const hasTextChanges = editForm.description !== (storeStore.currentStore?.description || '') ||
                          editForm.location !== (storeStore.currentStore?.location || '') ||
                          JSON.stringify(editForm.socialLinks || []) !== JSON.stringify(storeStore.currentStore?.external_buttons || []) ||
                          editForm.themeColor !== (storeStore.currentStore?.customization_settings?.color || '#0099ff')
    
    const hasFileChanges = editForm.logo instanceof File || editForm.banner instanceof File
    
    if (!hasTextChanges && !hasFileChanges) {
      updateMessage.value = $t('stores.noChangesToSave') || 'No changes to save'
      updateMessageType.value = 'info'
      return
    }
    
    console.log('Updating store with data:', updateData)
    
    // Update store via Pinia store
    await storeStore.updateStore(route.params.id, updateData)
    
    // Refresh store data to get updated values
    await storeStore.fetchStoreById(route.params.id)
    
    // Clear file inputs
    editForm.logo = null
    editForm.banner = null
    
    // Show success message
    updateMessage.value = $t('stores.updateSuccess') || 'Store updated successfully!'
    updateMessageType.value = 'success'
    
    // Clear message after 3 seconds
    setTimeout(() => {
      updateMessage.value = ''
      updateMessageType.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error updating store:', error)
    updateMessage.value = $t('stores.updateError') || 'Failed to update store'
    updateMessageType.value = 'error'
    
    // Clear error message after 5 seconds
    setTimeout(() => {
      updateMessage.value = ''
      updateMessageType.value = ''
    }, 5000)
  } finally {
    updateLoading.value = false
  }
}

// Computed properties
const isProPack = computed(() => {
  return storeStore.currentStore?.isProPack || false
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
    editForm.name = storeStore.currentStore.name || ''
    editForm.description = storeStore.currentStore.description || ''
    editForm.location = storeStore.currentStore.location || ''
    const existing = storeStore.currentStore.external_buttons
    editForm.socialLinks = Array.isArray(existing) ? [...existing] : []
    editForm.themeColor = storeStore.currentStore.themeColor || '#0099ff'
  }
}

const handleUpdateStore = async () => {
  try {
    updateLoading.value = true
    
    const updateData = {
      name: editForm.name.trim(),
      description: editForm.description?.trim() || null,
      location: editForm.location?.trim() || null,
      external_buttons: editForm.socialLinks && editForm.socialLinks.length > 0 ? editForm.socialLinks : null,
      themeColor: editForm.themeColor || null
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

// File upload handlers (updated to use new validation system)
const updateBanner = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      editForm.banner = file
      // Clear any previous validation errors
      validationErrors.banner = ''
    }
  }
  input.click()
}

const updateLogo = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      editForm.logo = file
      // Clear any previous validation errors
      validationErrors.logo = ''
    }
  }
  input.click()
}

// File preview helpers
const getFilePreview = (file) => {
  if (!file) return null
  return URL.createObjectURL(file)
}

const editDescription = () => {
  // Just update the local form state, save happens via saveAllChanges
  // No need to show modal since we have inline editing
}

const editLocation = () => {
  // Just update the local form state, save happens via saveAllChanges
  // No need to show modal since we have inline editing
}

// Individual update methods (for immediate feedback)
const updateDescription = () => {
  // Just update the form, don't save yet
  // Clear any previous validation errors
  validationErrors.description = ''
}

const updateLocation = () => {
  // Just update the form, don't save yet
  // Clear any previous validation errors
  validationErrors.location = ''
}

// Color picker controls
const colorInputRef = ref(null)
const openColorPicker = () => {
  if (colorInputRef.value) {
    colorInputRef.value.click()
  }
}
const onColorChange = async (e) => {
  // Just update the form, don't save yet
  const value = e.target.value
  editForm.themeColor = value
  console.log('Color updated in form:', value)
}

// Social links controls (Pro Pack only)
const addSocialLink = () => {
  editForm.socialLinks.push('')
}

const removeSocialLink = (idx) => {
  if (idx >= 0 && idx < editForm.socialLinks.length) {
    editForm.socialLinks.splice(idx, 1)
  }
}

const updateSocialLinks = () => {
  // Just update the form, don't save yet
  // Clear any previous validation errors
  validationErrors.socialLinks = ''
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
    editForm.location = storeStore.currentStore.location || ''
    editForm.socialLinks = storeStore.currentStore.external_buttons || []
    editForm.themeColor = storeStore.currentStore.customization_settings?.color || '#0099ff'
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

