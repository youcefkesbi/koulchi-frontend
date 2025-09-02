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
                <div class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <span class="text-sm font-medium text-gray-600">{{ $t('stores.basicInfo') }}</span>
              </div>
              <div class="w-16 h-0.5 bg-gray-200"></div>
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <span class="text-sm font-medium text-gray-400">{{ $t('stores.images') }}</span>
              </div>
              <div class="w-16 h-0.5 bg-gray-200"></div>
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <span class="text-sm font-medium text-gray-400">{{ $t('stores.review') }}</span>
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
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  :placeholder="$t('stores.storeNamePlaceholder')"
                />
              </div>

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
                  :disabled="!canProceed"
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
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStoreStore } from '../stores/store'

const router = useRouter()
const { t: $t } = useI18n()
const storeStore = useStoreStore()

const currentStep = ref(1)
const logoPreview = ref('')
const bannerPreview = ref('')

const formData = reactive({
  name: '',
  description: '',
  logo_url: '',
  banner_url: ''
})

const canProceed = computed(() => {
  if (currentStep.value === 1) {
    return formData.name.trim().length > 0
  }
  return true
})

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
}

const removeBanner = () => {
  bannerPreview.value = ''
  formData.banner_url = ''
}

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const handleSubmit = async () => {
  try {
    loading.value = true
    successMessage.value = ''
    errorMessage.value = ''

    let logoUrl = null
    let bannerUrl = null

    // Upload logo if provided
    if (formData.logo_url instanceof File) {
      try {
        const fileName = `logo-${Date.now()}-${formData.logo_url.name}`
        logoUrl = await storeStore.uploadStoreImage(formData.logo_url, 'stores-logos', fileName)
      } catch (uploadError) {
        console.error('Logo upload failed:', uploadError)
        errorMessage.value = `Logo upload failed: ${uploadError.message}`
        return
      }
    }

    // Upload banner if provided
    if (formData.banner_url instanceof File) {
      try {
        const fileName = `banner-${Date.now()}-${formData.banner_url.name}`
        bannerUrl = await storeStore.uploadStoreImage(formData.banner_url, 'stores-banners', fileName)
      } catch (uploadError) {
        console.error('Banner upload failed:', uploadError)
        errorMessage.value = `Banner upload failed: ${uploadError.message}`
        return
      }
    }

    // Prepare store data with proper null handling for optional fields
    const storeData = {
      name: formData.name.trim(), // Required field
      description: formData.description?.trim() || null, // Optional field
      logo_url: logoUrl, // Optional field - will be null if no upload
      banner_url: bannerUrl // Optional field - will be null if no upload
    }

    const newStore = await storeStore.createStore(storeData)

    // Show success message
    successMessage.value = $t('stores.storeCreatedSuccessfully')
    
    // Redirect to store dashboard after a short delay
    setTimeout(() => {
      router.push(`/dashboard/store/${newStore.id}`)
    }, 1500)

  } catch (error) {
    console.error('Error creating store:', error)
    errorMessage.value = error.message || $t('stores.storeCreationError')
  } finally {
    loading.value = false
  }
}
</script>
