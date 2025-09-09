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
        <!-- Authentication Loading State -->
        <div v-if="!isAuthenticated && !user" class="bg-white rounded-2xl shadow-soft p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p class="text-gray-600">{{ $t('common.loading') || 'Loading...' }}</p>
        </div>
        
        <!-- Main Form (only show when authenticated) -->
        <div v-else class="bg-white rounded-2xl shadow-soft p-8">
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
                >{{ $t('stores.choosePack') }}</span>
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
                >{{ $t('stores.uploadDocuments') }}</span>
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
                >{{ $t('stores.storeInfo') }}</span>
              </div>
              <div 
                :class="[
                  'w-16 h-0.5',
                  currentStep >= 4 ? 'bg-primary' : 'bg-gray-200'
                ]"
              ></div>
              <div class="flex items-center space-x-3">
                <div 
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    currentStep >= 4 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
                  ]"
                >4</div>
                <span 
                  :class="[
                    'text-sm font-medium',
                    currentStep >= 4 ? 'text-gray-600' : 'text-gray-400'
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

            <!-- Step 1: Choose Pack -->
            <div v-if="currentStep === 1" class="space-y-6">
              <h2 class="text-xl font-bold text-gray-800 mb-6">{{ $t('stores.choosePack') }}</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Basic Pack -->
                <div 
                  :class="[
                    'border-2 rounded-xl p-6 cursor-pointer transition-all duration-200',
                    selectedPack?.name === 'Basic Pack' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  ]"
                  @click="selectPack(basicPack)"
                >
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">{{ basicPack?.name }}</h3>
                    <div class="text-2xl font-bold text-primary">{{ basicPack?.price }} DZD</div>
                  </div>
                  
                  <p class="text-gray-600 mb-4">{{ basicPack?.description }}</p>
                  
                  <div class="space-y-2">
                    <div class="flex items-center text-sm text-gray-600">
                      <i class="fas fa-check text-green-500 mr-2"></i>
                      {{ basicPack?.max_announcements }} {{ $t('stores.announcements') }}
                    </div>
                    <div class="flex items-center text-sm text-gray-600">
                      <i class="fas fa-check text-green-500 mr-2"></i>
                      {{ basicPack?.max_images }} {{ $t('stores.images') }}
                    </div>
                    <div class="flex items-center text-sm text-gray-600">
                      <i class="fas fa-check text-green-500 mr-2"></i>
                      {{ $t('stores.externalButtons') }}
                    </div>
                    <div class="flex items-center text-sm text-gray-600">
                      <i class="fas fa-check text-green-500 mr-2"></i>
                      {{ $t('stores.locationInput') }}
                    </div>
                  </div>
                </div>

                <!-- Pro Pack -->
                <div 
                  :class="[
                    'border-2 rounded-xl p-6 cursor-pointer transition-all duration-200',
                    selectedPack?.name === 'Pro Pack' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  ]"
                  @click="selectPack(proPack)"
                >
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">{{ proPack?.name }}</h3>
                    <div class="text-2xl font-bold text-primary">{{ proPack?.price }} DZD</div>
                  </div>
                  
                  <p class="text-gray-600 mb-4">{{ proPack?.description }}</p>
                  
                  <div class="space-y-2">
                    <div class="flex items-center text-sm text-gray-600">
                      <i class="fas fa-check text-green-500 mr-2"></i>
                      {{ proPack?.max_announcements }} {{ $t('stores.announcements') }}
                    </div>
                    <div class="flex items-center text-sm text-gray-600">
                      <i class="fas fa-check text-green-500 mr-2"></i>
                      {{ proPack?.max_images }} {{ $t('stores.images') }}
                    </div>
                    <div class="flex items-center text-sm text-gray-600">
                      <i class="fas fa-check text-green-500 mr-2"></i>
                      {{ $t('stores.storeLogo') }}
                    </div>
                    <div class="flex items-center text-sm text-gray-600">
                      <i class="fas fa-check text-green-500 mr-2"></i>
                      {{ $t('stores.storeBanner') }}
                    </div>
                    <div class="flex items-center text-sm text-gray-600">
                      <i class="fas fa-check text-green-500 mr-2"></i>
                      {{ $t('stores.colorCustomization') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Upload Documents -->
            <div v-if="currentStep === 2" class="space-y-6">
              <h2 class="text-xl font-bold text-gray-800 mb-6">{{ $t('stores.uploadDocuments') }}</h2>
              
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div class="flex items-start space-x-3 space-x-reverse">
                  <i class="fas fa-info-circle text-yellow-600 mt-1"></i>
                  <div>
                    <h4 class="font-semibold text-yellow-800 mb-1">{{ $t('stores.verificationRequired') }}</h4>
                    <p class="text-yellow-700 text-sm">{{ $t('stores.verificationDescription') }}</p>
                  </div>
                </div>
              </div>

              <div class="space-y-6">
                <div 
                  v-for="requirement in verificationRequirements" 
                  :key="requirement.verification_type"
                  class="border border-gray-200 rounded-lg p-4"
                >
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="font-medium text-gray-800">{{ requirement.display_name }}</h4>
                    <span 
                      :class="[
                        'px-2 py-1 text-xs rounded-full',
                        uploadedDocuments[requirement.verification_type] 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      ]"
                    >
                      {{ uploadedDocuments[requirement.verification_type] ? $t('common.uploaded') : $t('common.required') }}
                    </span>
                  </div>
                  
                  <p class="text-sm text-gray-600 mb-3">{{ requirement.description }}</p>
                  
                  <div class="flex items-center space-x-3 space-x-reverse">
                    <input
                      :ref="`file-${requirement.verification_type}`"
                      type="file"
                      accept="image/*"
                      @change="handleFileUpload($event, requirement.verification_type)"
                      class="hidden"
                    />
                    <button
                      type="button"
                      @click="triggerFileUpload(requirement.verification_type)"
                      class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <i class="fas fa-upload mr-2"></i>
                      {{ $t('common.upload') }}
                    </button>
                    <button
                      v-if="uploadedDocuments[requirement.verification_type]"
                      type="button"
                      @click="removeDocument(requirement.verification_type)"
                      class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <i class="fas fa-trash mr-2"></i>
                      {{ $t('common.remove') }}
                    </button>
                  </div>
                  
                  <div v-if="uploadedDocuments[requirement.verification_type]" class="mt-3">
                    <img 
                      :src="uploadedDocuments[requirement.verification_type].preview" 
                      :alt="requirement.display_name"
                      class="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Store Information -->
            <div v-if="currentStep === 3" class="space-y-6">
              <h2 class="text-xl font-bold text-gray-800 mb-6">{{ $t('stores.storeInfo') }}</h2>
              
              <!-- Store Name (only for Pro Pack) -->
              <div v-if="selectedPack?.name === 'Pro Pack'">
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

              <!-- Store Description -->
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
              </div>

              <!-- Location Input -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('stores.location') }} *
                </label>
                <textarea
                  v-model="formData.location"
                  rows="3"
                  required
                  :class="[
                    'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-none',
                    validationErrors.location ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
                  ]"
                  :placeholder="$t('stores.locationPlaceholder')"
                ></textarea>
                <p v-if="validationErrors.location" class="text-red-600 text-sm mt-1">{{ validationErrors.location }}</p>
              </div>

              <!-- External Buttons (for both packs) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('stores.externalButtons') }}
                </label>
                <div class="space-y-3">
                  <div 
                    v-for="(button, index) in formData.external_buttons" 
                    :key="index"
                    class="flex items-center space-x-3 space-x-reverse"
                  >
                    <input
                      v-model="button.platform"
                      type="text"
                      :placeholder="$t('stores.platformPlaceholder')"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                    <input
                      v-model="button.url"
                      type="url"
                      :placeholder="$t('stores.urlPlaceholder')"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                    <button
                      type="button"
                      @click="removeExternalButton(index)"
                      class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                  <button
                    type="button"
                    @click="addExternalButton"
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <i class="fas fa-plus mr-2"></i>
                    {{ $t('stores.addButton') }}
                  </button>
                </div>
              </div>

              <!-- Pro Pack Customization -->
              <div v-if="selectedPack?.name === 'Pro Pack'" class="space-y-6">
                <h3 class="text-lg font-semibold text-gray-800">{{ $t('stores.customization') }}</h3>
                
                <!-- Logo Upload -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ $t('stores.storeLogo') }}
                  </label>
                  <div class="flex items-center space-x-4 space-x-reverse">
                    <input
                      ref="logoFile"
                      type="file"
                      accept="image/*"
                      @change="handleLogoUpload"
                      class="hidden"
                    />
                    <button
                      type="button"
                      @click="$refs.logoFile.click()"
                      class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <i class="fas fa-upload mr-2"></i>
                      {{ $t('common.upload') }}
                    </button>
                    <button
                      v-if="formData.logo_file"
                      type="button"
                      @click="removeLogo"
                      class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <i class="fas fa-trash mr-2"></i>
                      {{ $t('common.remove') }}
                    </button>
                  </div>
                  <div v-if="formData.logo_preview" class="mt-3">
                    <img 
                      :src="formData.logo_preview" 
                      alt="Store Logo"
                      class="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                </div>

                <!-- Banner Upload -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ $t('stores.storeBanner') }}
                  </label>
                  <div class="flex items-center space-x-4 space-x-reverse">
                    <input
                      ref="bannerFile"
                      type="file"
                      accept="image/*"
                      @change="handleBannerUpload"
                      class="hidden"
                    />
                    <button
                      type="button"
                      @click="$refs.bannerFile.click()"
                      class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <i class="fas fa-upload mr-2"></i>
                      {{ $t('common.upload') }}
                    </button>
                    <button
                      v-if="formData.banner_file"
                      type="button"
                      @click="removeBanner"
                      class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <i class="fas fa-trash mr-2"></i>
                      {{ $t('common.remove') }}
                    </button>
                  </div>
                  <div v-if="formData.banner_preview" class="mt-3">
                    <img 
                      :src="formData.banner_preview" 
                      alt="Store Banner"
                      class="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                </div>

                <!-- Color Customization -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ $t('stores.primaryColor') }}
                  </label>
                  <div class="flex items-center space-x-3 space-x-reverse">
                    <input
                      v-model="formData.customization_settings.primary_color"
                      type="color"
                      class="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      v-model="formData.customization_settings.primary_color"
                      type="text"
                      placeholder="#3B82F6"
                      class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 4: Review -->
            <div v-if="currentStep === 4" class="space-y-6">
              <h2 class="text-xl font-bold text-gray-800 mb-6">{{ $t('stores.review') }}</h2>
              
              <div class="bg-gray-50 rounded-xl p-6 space-y-4">
                <div class="flex items-center space-x-4 space-x-reverse">
                  <div class="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                    <i class="fas fa-store text-white text-2xl"></i>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-800">{{ formData.name || $t('stores.defaultStoreName') }}</h3>
                    <p class="text-gray-600">{{ formData.description || $t('stores.noDescription') }}</p>
                    <p class="text-sm text-gray-500">{{ selectedPack?.name }} - {{ selectedPack?.price }} DZD</p>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 class="font-semibold text-gray-800 mb-2">{{ $t('stores.location') }}</h4>
                    <p class="text-gray-600">{{ formData.location }}</p>
                  </div>
                  <div v-if="formData.external_buttons.length > 0">
                    <h4 class="font-semibold text-gray-800 mb-2">{{ $t('stores.externalButtons') }}</h4>
                    <div class="space-y-1">
                      <div 
                        v-for="button in formData.external_buttons" 
                        :key="button.platform"
                        class="text-sm text-gray-600"
                      >
                        {{ button.platform }}: {{ button.url }}
                      </div>
                    </div>
                  </div>
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
                  v-if="currentStep < 4"
                  type="button"
                  @click="nextStep"
                  :disabled="!isStepValid"
                  class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {{ $t('common.next') }}
                  <i class="fas fa-arrow-right ml-2"></i>
                </button>
                
                <button
                  v-if="currentStep === 4"
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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { supabase } from '../lib/supabase'

const router = useRouter()
const { t: $t } = useI18n()

// Step management
const currentStep = ref(1)

// Form data
const formData = reactive({
  name: '',
  description: '',
  location: '',
  external_buttons: [],
  logo_file: null,
  logo_preview: null,
  banner_file: null,
  banner_preview: null,
  customization_settings: {
    primary_color: '#3B82F6'
  }
})

// Pack data
const basicPack = ref(null)
const proPack = ref(null)
const selectedPack = ref(null)

// Verification data
const verificationRequirements = ref([])
const uploadedDocuments = ref({})

// UI state
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Authentication state
const user = ref(null)
const session = ref(null)
const isAuthenticated = ref(false)
const authSubscription = ref(null)

// Validation
const validationErrors = reactive({
  name: '',
  description: '',
  location: ''
})

// Computed properties
const isStepValid = computed(() => {
  switch (currentStep.value) {
    case 1:
      return selectedPack.value !== null
    case 2:
      return Object.keys(uploadedDocuments.value).length > 0
    case 3:
      return formData.location.trim().length > 0
    case 4:
      return true
    default:
      return false
  }
})

// Pack selection
const selectPack = (pack) => {
  selectedPack.value = pack
  if (pack.name === 'Basic Pack') {
    formData.name = '' // Basic pack doesn't have store name
  }
}

// File upload handlers
const handleFileUpload = (event, verificationType) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedDocuments.value[verificationType] = {
        file,
        preview: e.target.result
      }
    }
    reader.readAsDataURL(file)
  }
}

const triggerFileUpload = (verificationType) => {
  const input = document.querySelector(`input[ref="file-${verificationType}"]`)
  if (input) {
    input.click()
  }
}

const removeDocument = (verificationType) => {
  delete uploadedDocuments.value[verificationType]
}

// External buttons
const addExternalButton = () => {
  formData.external_buttons.push({ platform: '', url: '' })
}

const removeExternalButton = (index) => {
  formData.external_buttons.splice(index, 1)
}

// Logo and banner uploads
const handleLogoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    formData.logo_file = file
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.logo_preview = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removeLogo = () => {
  formData.logo_file = null
  formData.logo_preview = null
}

const handleBannerUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    formData.banner_file = file
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.banner_preview = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removeBanner = () => {
  formData.banner_file = null
  formData.banner_preview = null
}

// Step navigation
const nextStep = () => {
  if (currentStep.value < 4 && isStepValid.value) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Data fetching
const fetchPacks = async () => {
  try {
    const { data, error } = await supabase
      .from('packs')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })

    if (error) throw error

    basicPack.value = data.find(p => p.name === 'Basic Pack')
    proPack.value = data.find(p => p.name === 'Pro Pack')
  } catch (error) {
    console.error('Error fetching packs:', error)
    errorMessage.value = 'Failed to load pack information'
  }
}

const fetchVerificationRequirements = async () => {
  try {
    const { data, error } = await supabase
      .rpc('get_store_creation_requirements', {
        p_pack_name: selectedPack.value?.name
      })

    if (error) throw error
    verificationRequirements.value = data || []
  } catch (error) {
    console.error('Error fetching verification requirements:', error)
  }
}

// Store creation
const createStore = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    // 1. Upload verification documents
    const verificationIds = []
    for (const [type, doc] of Object.entries(uploadedDocuments.value)) {
      const fileName = `verification-${Date.now()}-${Math.random().toString(36).substring(2)}-${doc.file.name}`
      
      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(fileName, doc.file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('verification-documents')
        .getPublicUrl(fileName)

      // Create verification record
      const { data: verification, error: verificationError } = await supabase
        .from('verifications')
        .insert({
          user_id: user.value.id,
          verification_type: type,
          document_url: publicUrl,
          status: 'pending'
        })
        .select()
        .single()

      if (verificationError) throw verificationError
      verificationIds.push(verification.id)
    }

    // 2. Upload store images (if Pro Pack)
    let logoUrl = null
    let bannerUrl = null

    if (selectedPack.value?.name === 'Pro Pack') {
      if (formData.logo_file) {
        const logoFileName = `logo-${Date.now()}-${Math.random().toString(36).substring(2)}-${formData.logo_file.name}`
        const { data: logoUploadData, error: logoError } = await supabase.storage
          .from('stores-logos')
          .upload(logoFileName, formData.logo_file)

        if (logoError) throw logoError

        const { data: { publicUrl: logoPublicUrl } } = supabase.storage
          .from('stores-logos')
          .getPublicUrl(logoFileName)

        logoUrl = logoPublicUrl
      }

      if (formData.banner_file) {
        const bannerFileName = `banner-${Date.now()}-${Math.random().toString(36).substring(2)}-${formData.banner_file.name}`
        const { data: bannerUploadData, error: bannerError } = await supabase.storage
          .from('stores-banners')
          .upload(bannerFileName, formData.banner_file)

        if (bannerError) throw bannerError

        const { data: { publicUrl: bannerPublicUrl } } = supabase.storage
          .from('stores-banners')
          .getPublicUrl(bannerFileName)

        bannerUrl = bannerPublicUrl
      }
    }

    // 3. Create store
    const storeData = {
      owner_id: user.value.id,
      pack_id: selectedPack.value.id,
      name: selectedPack.value.name === 'Pro Pack' ? formData.name : null,
      description: formData.description || null,
      location: formData.location,
      external_buttons: formData.external_buttons,
      logo_url: logoUrl,
      banner_url: bannerUrl,
      customization_settings: formData.customization_settings,
      status: 'pending'
    }

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert(storeData)
      .select()
      .single()

    if (storeError) throw storeError

    return store
  } catch (error) {
    console.error('Error creating store:', error)
    throw error
  } finally {
    loading.value = false
  }
}

// Main submit handler
const handleSubmit = async () => {
  try {
    const store = await createStore()
    
    successMessage.value = $t('stores.storeCreatedSuccessfully')
    
    // Redirect to store dashboard
    setTimeout(() => {
      router.push(`/dashboard/store/${store.id}`)
    }, 1500)
  } catch (error) {
    errorMessage.value = error.message || 'Failed to create store'
  }
}

// Authentication functions
const validateSession = async () => {
  try {
    const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      throw new Error('Authentication failed. Please log in again.')
    }
    
    if (!currentSession || !currentSession.user) {
      console.log('No valid session found')
      return null
    }
    
    const now = Math.floor(Date.now() / 1000)
    if (currentSession.expires_at && currentSession.expires_at < now) {
      console.log('Token expired, attempting refresh...')
      
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError || !refreshData.session) {
        console.log('Session refresh failed:', refreshError)
        return null
      }
      
      session.value = refreshData.session
      user.value = refreshData.session.user
      isAuthenticated.value = true
      return refreshData.session
    }
    
    session.value = currentSession
    user.value = currentSession.user
    isAuthenticated.value = true
    
    return currentSession
  } catch (err) {
    console.error('Session validation error:', err)
    session.value = null
    user.value = null
    isAuthenticated.value = false
    return null
  }
}

// Lifecycle hooks
onMounted(async () => {
  await validateSession()
  await fetchPacks()
  
  if (!isAuthenticated.value) {
    const currentLocale = router.currentRoute.value.meta?.locale || 'en'
    router.push(`/${currentLocale}/login`)
  }
})

onUnmounted(() => {
  if (authSubscription.value) {
    authSubscription.value.unsubscribe()
  }
})

// Watch for pack changes to fetch verification requirements
watch(() => selectedPack.value, async (newPack) => {
  if (newPack) {
    await fetchVerificationRequirements()
  }
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
