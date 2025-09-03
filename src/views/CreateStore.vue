<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-soft border-b border-gray-100">
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
              <h1 class="text-2xl font-bold text-gray-800">{{ $t('stores.createStore') }}</h1>
              <p class="text-gray-600">{{ $t('stores.createStoreDescription') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Store Creation Form -->
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-2xl shadow-soft p-8">
          <!-- Progress Steps -->
          <div class="mb-8">
            <div class="flex items-center justify-center space-x-8">
              <div class="flex items-center space-x-3">
                <div 
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
                  ]"
                >1</div>
                <span 
                  :class="[
                    'text-sm font-medium',
                    currentStep >= 1 ? 'text-gray-600' : 'text-gray-400'
                  ]"
                >{{ $t('stores.basicInfo') }}</span>
              </div>
              <div 
                :class="[
                  'w-16 h-0.5',
                  currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'
                ]"
              ></div>
              <div class="flex items-center space-x-3">
                <div 
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
                  ]"
                >2</div>
                <span 
                  :class="[
                    'text-sm font-medium',
                    currentStep >= 2 ? 'text-gray-600' : 'text-gray-400'
                  ]"
                >{{ $t('stores.images') }}</span>
              </div>
              <div 
                :class="[
                  'w-16 h-0.5',
                  currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'
                ]"
              ></div>
              <div class="flex items-center space-x-3">
                <div 
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
                  ]"
                >3</div>
                <span 
                  :class="[
                    'text-sm font-medium',
                    currentStep >= 3 ? 'text-gray-600' : 'text-gray-400'
                  ]"
                >{{ $t('stores.review') }}</span>
              </div>
            </div>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-8">
            <!-- Success Message -->
            <div v-if="successMessage" class="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
              <div class="flex items-center space-x-3 space-x-reverse">
                <i class="fas fa-check-circle text-green-600 flex-shrink-0"></i>
                <div class="flex-1">
                  <h4 class="font-semibold text-green-800 mb-1">{{ $t('common.success') }}</h4>
                  <p class="text-green-700 text-sm">{{ successMessage }}</p>
                  <p class="text-green-600 text-xs mt-2">{{ $t('stores.redirectingToStore') }}</p>
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
              <div class="flex items-center space-x-3 space-x-reverse">
                <i class="fas fa-exclamation-circle text-red-600 flex-shrink-0"></i>
                <div class="flex-1">
                  <h4 class="font-semibold text-red-800 mb-1">{{ $t('common.error') }}</h4>
                  <p class="text-red-700 text-sm">{{ errorMessage }}</p>
                </div>
                <button @click="errorMessage = ''" class="text-red-400 hover:text-red-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <!-- Step 1: Basic Information -->
            <div v-if="currentStep === 1" class="space-y-6">
              <h2 class="text-xl font-bold text-gray-800 mb-6">{{ $t('stores.basicInfo') }}</h2>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('stores.storeName') }} *
                </label>
                <input
                  v-model="formData.name"
                  type="text"
                  required
                  :class="[
                    'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors',
                    validationErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
                  ]"
                  :placeholder="$t('stores.storeNamePlaceholder')"
                />
                <p v-if="validationErrors.name" class="text-red-600 text-sm mt-1">{{ validationErrors.name }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('stores.storeDescription') }}
                </label>
                <textarea
                  v-model="formData.description"
                  rows="4"
                  :class="[
                    'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-none',
                    validationErrors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
                  ]"
                  :placeholder="$t('stores.storeDescriptionPlaceholder')"
                ></textarea>
                <p v-if="validationErrors.description" class="text-red-600 text-sm mt-1">{{ validationErrors.description }}</p>
                <p class="text-sm text-gray-500 mt-1">{{ $t('stores.descriptionHelp') }}</p>
              </div>
            </div>

            <!-- Step 2: Images -->
            <div v-if="currentStep === 2" class="space-y-6">
              <h2 class="text-xl font-bold text-gray-800 mb-6">{{ $t('stores.images') }}</h2>
              
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
                      class="w-32 h-32 object-cover rounded-xl border border-gray-200"
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
                  <p class="text-sm text-gray-500">{{ $t('stores.logoHelp') }}</p>
                  <p v-if="validationErrors.logo" class="text-red-600 text-sm mt-1">{{ validationErrors.logo }}</p>
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
                      class="w-full h-48 object-cover rounded-xl border border-gray-200"
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
                  <p class="text-sm text-gray-500">{{ $t('stores.bannerHelp') }}</p>
                  <p v-if="validationErrors.banner" class="text-red-600 text-sm mt-1">{{ validationErrors.banner }}</p>
                </div>
              </div>
            </div>

            <!-- Step 3: Review -->
            <div v-if="currentStep === 3" class="space-y-6">
              <h2 class="text-xl font-bold text-gray-800 mb-6">{{ $t('stores.review') }}</h2>
              
              <div class="bg-gray-50 rounded-xl p-6 space-y-4">
                <div class="flex items-center space-x-4 space-x-reverse">
                  <div class="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                    <img 
                      v-if="logoPreview" 
                      :src="logoPreview" 
                      :alt="formData.name"
                      class="w-full h-full object-cover rounded-xl"
                    />
                    <i v-else class="fas fa-store text-white text-2xl"></i>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-800">{{ formData.name }}</h3>
                    <p class="text-gray-600">{{ formData.description || $t('stores.noDescription') }}</p>
                  </div>
                </div>
                
                <div v-if="bannerPreview" class="w-full h-32 bg-gray-200 rounded-lg overflow-hidden">
                  <img 
                    :src="bannerPreview" 
                    :alt="formData.name"
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                v-if="currentStep > 1"
                type="button"
                @click="previousStep"
                class="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <i class="fas fa-arrow-left mr-2"></i>
                {{ $t('common.back') }}
              </button>
              <div v-else></div>

              <div class="flex space-x-3 space-x-reverse">
                <button
                  v-if="currentStep < 3"
                  type="button"
                  @click="nextStep"
                  :disabled="!isStepValid"
                  class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {{ $t('common.next') }}
                  <i class="fas fa-arrow-right ml-2"></i>
                </button>
                
                <button
                  v-if="currentStep === 3"
                  type="submit"
                  :disabled="loading"
                  class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <div v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {{ loading ? $t('stores.creatingStore') : $t('stores.createStore') }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStoreStore } from '../stores/store'

const router = useRouter()
const { t: $t } = useI18n()
const storeStore = useStoreStore()

// Step management
const currentStep = ref(1)
const stepLoading = ref(false)

// Form data
const formData = reactive({
  name: '',
  description: '',
  logo_url: '',
  banner_url: ''
})

// Image previews
const logoPreview = ref('')
const bannerPreview = ref('')

// UI state
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Validation
const validationErrors = reactive({
  name: '',
  description: '',
  logo: '',
  banner: ''
})

// Computed properties
const canProceed = computed(() => {
  if (currentStep.value === 1) {
    return formData.name.trim().length > 0 && !validationErrors.name
  }
  return true
})

const isStepValid = computed(() => {
  switch (currentStep.value) {
    case 1:
      return formData.name.trim().length > 0 && !validationErrors.name
    case 2:
      return true // Images are optional
    case 3:
      return canProceed.value
    default:
      return false
  }
})

// Watch for form changes to clear errors
watch(() => formData.name, () => {
  if (validationErrors.name) {
    validationErrors.name = ''
  }
})

watch(() => formData.description, () => {
  if (validationErrors.description) {
    validationErrors.description = ''
  }
})

// Validation functions
const validateForm = () => {
  const errors = { name: '', description: '', logo: '', banner: '' }
  
  // Validate store name
  const name = formData.name?.trim()
  if (!name) {
    errors.name = $t('stores.storeNameRequired') || 'Store name is required'
  } else if (name.length > 100) {
    errors.name = $t('stores.storeNameTooLong') || 'Store name must be less than 100 characters'
  }
  
  // Validate description
  const description = formData.description?.trim()
  if (description && description.length > 500) {
    errors.description = $t('stores.storeDescriptionTooLong') || 'Store description must be less than 500 characters'
  }
  
  // Validate logo file
  if (formData.logo_url instanceof File) {
    if (formData.logo_url.size > 5 * 1024 * 1024) {
      errors.logo = $t('stores.fileTooLarge') || 'Logo file is too large. Maximum size is 5MB.'
    } else if (!formData.logo_url.type.startsWith('image/')) {
      errors.logo = $t('stores.invalidFileType') || 'Invalid logo file type. Only images are allowed.'
    }
  }
  
  // Validate banner file
  if (formData.banner_url instanceof File) {
    if (formData.banner_url.size > 5 * 1024 * 1024) {
      errors.banner = $t('stores.fileTooLarge') || 'Banner file is too large. Maximum size is 5MB.'
    } else if (!formData.banner_url.type.startsWith('image/')) {
      errors.banner = $t('stores.invalidFileType') || 'Invalid banner file type. Only images are allowed.'
    }
  }
  
  Object.assign(validationErrors, errors)
  return !Object.values(errors).some(error => error !== '')
}

// Image handling functions
const handleLogoChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Clear previous validation error
    validationErrors.logo = ''
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      validationErrors.logo = $t('stores.invalidFileType') || 'Invalid file type. Only images are allowed.'
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      validationErrors.logo = $t('stores.fileTooLarge') || 'File is too large. Maximum size is 5MB.'
      return
    }
    
    logoPreview.value = URL.createObjectURL(file)
    formData.logo_url = file
  }
}

const handleBannerChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Clear previous validation error
    validationErrors.banner = ''
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      validationErrors.banner = $t('stores.invalidFileType') || 'Invalid file type. Only images are allowed.'
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      validationErrors.banner = $t('stores.fileTooLarge') || 'File is too large. Maximum size is 5MB.'
      return
    }
    
    bannerPreview.value = URL.createObjectURL(file)
    formData.banner_url = file
  }
}

const removeLogo = () => {
  if (logoPreview.value) {
    URL.revokeObjectURL(logoPreview.value)
  }
  logoPreview.value = ''
  formData.logo_url = ''
  validationErrors.logo = ''
}

const removeBanner = () => {
  if (bannerPreview.value) {
    URL.revokeObjectURL(bannerPreview.value)
  }
  bannerPreview.value = ''
  formData.banner_url = ''
  validationErrors.banner = ''
}

// Step navigation
const nextStep = () => {
  if (currentStep.value < 3 && isStepValid.value) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Cleanup function
const cleanup = () => {
  if (logoPreview.value) {
    URL.revokeObjectURL(logoPreview.value)
  }
  if (bannerPreview.value) {
    URL.revokeObjectURL(bannerPreview.value)
  }
}

// Main store creation function
const handleSubmit = async () => {
  try {
    loading.value = true
    successMessage.value = ''
    errorMessage.value = ''

    // 1. Validate form data
    if (!validateForm()) {
      errorMessage.value = $t('stores.validationError') || 'Please fix the validation errors before proceeding.'
      return
    }

    // 2. Prepare store data
    const storeData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || null
    }

    console.log('Creating store with data:', {
      name: storeData.name,
      description: storeData.description ? 'Present' : 'Null',
      logo: formData.logo_url instanceof File ? 'File provided' : 'No file',
      banner: formData.banner_url instanceof File ? 'File provided' : 'No file'
    })

    // 3. Create store with images using optimized function
    const newStore = await storeStore.createStoreWithImages(
      storeData,
      formData.logo_url instanceof File ? formData.logo_url : null,
      formData.banner_url instanceof File ? formData.banner_url : null
    )

    if (!newStore?.id) {
      throw new Error('Store creation failed: No store data returned')
    }

    console.log('Store created successfully:', newStore.id)

    // 4. Success handling
    successMessage.value = $t('stores.storeCreatedSuccessfully') || 'Your store has been created successfully!'
    
    // Clean up and reset form
    cleanup()
    resetForm()
    
    // Redirect to store dashboard
    setTimeout(() => {
      router.push(`/dashboard/store/${newStore.id}`)
    }, 1500)

  } catch (error) {
    console.error('Error creating store:', error)
    errorMessage.value = getErrorMessage(error)
  } finally {
    loading.value = false
  }
}

// Error message helper
const getErrorMessage = (error) => {
  const message = error.message || ''
  
  if (message.includes('User not authenticated')) {
    return $t('stores.authenticationError') || 'Please log in to create a store'
  } else if (message.includes('permission denied')) {
    return $t('stores.permissionError') || 'Permission denied. Please check your account permissions.'
  } else if (message.includes('already have a store')) {
    return $t('stores.storeAlreadyExists') || 'You already have a store. Each user can only create one store.'
  } else if (message.includes('network') || message.includes('fetch')) {
    return $t('stores.networkError') || 'Network error. Please check your internet connection and try again.'
  } else if (message.includes('upload')) {
    return $t('stores.uploadError') || 'Failed to upload images. Please try again.'
  } else {
    return message || $t('stores.storeCreationError') || 'Could not create your store, please try again.'
  }
}

// Form reset helper
const resetForm = () => {
  formData.name = ''
  formData.description = ''
  formData.logo_url = ''
  formData.banner_url = ''
  logoPreview.value = ''
  bannerPreview.value = ''
  currentStep.value = 1
  
  // Clear validation errors
  Object.keys(validationErrors).forEach(key => {
    validationErrors[key] = ''
  })
}
</script>
