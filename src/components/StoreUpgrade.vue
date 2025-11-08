<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-soft border-b border-gray-100">
      <div class="container mx-auto px-4 py-6 flex items-center space-x-4">
        <router-link :to="getLocalizedPath('/subscription')" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <i class="fas fa-arrow-left text-xl"></i>
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-800">{{ $t('stores.upgradeToPro') || 'Upgrade to Pro Pack' }}</h1>
          <p class="text-gray-600">{{ $t('stores.upgradeDescription') || 'Upgrade your store to Pro Pack to unlock advanced features' }}</p>
        </div>
      </div>
    </div>

    <!-- Main Form -->
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-soft p-8">
        <form @submit.prevent="handleSubmit">
          <!-- Stepper -->
          <div class="mb-8">
            <div class="flex items-center justify-center space-x-8">
              <div v-for="n in totalSteps" :key="n" class="flex items-center space-x-3">
                <div
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    currentStep >= n ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
                  ]"
                >{{ n }}</div>
                <span class="text-sm font-medium"
                  :class="currentStep >= n ? 'text-gray-600' : 'text-gray-400'">
                  {{
                    n === 1 ? ($t('stores.uploadDocs') || 'Upload Documents') :
                    n === 2 ? ($t('stores.brandingInfo') || 'Branding') :
                    ($t('stores.review') || 'Review')
                  }}
                </span>
                <div v-if="n < totalSteps" :class="['w-16 h-0.5', currentStep > n ? 'bg-primary' : 'bg-gray-200']"></div>
              </div>
            </div>
          </div>

          <!-- Step 1: Upload Documents (Commerce Register + Payment Receipt) -->
          <div v-if="currentStep === 1" class="space-y-6">
            <h2 class="text-xl font-bold text-gray-800 mb-6">
              {{ $t('stores.uploadDocs') || 'Upload Documents' }}
            </h2>
            <p class="text-gray-600 mb-4">
              {{ $t('stores.upgradeDocsNote') || 'Please upload the required documents for Pro Pack upgrade. Your ID document is already on file.' }}
            </p>

            <!-- Commerce Register -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('stores.businessRegister') || 'Commercial Register' }} *
              </label>
              <label
                class="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
              >
                <i class="fas fa-briefcase text-2xl text-primary mb-2"></i>
                <span class="text-sm text-gray-600">
                  {{ formData.businessRegister ? formData.businessRegister.name : $t('stores.personalDocuments') }}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                  @change="e => handleFileChange(e, 'businessRegister', 'businessRegisterPreview')"
                  class="hidden"
                />
              </label>
              <img
                v-if="formData.businessRegisterPreview"
                :src="formData.businessRegisterPreview"
                alt="Business Register"
                class="h-16 mt-3 rounded border"
              />
            </div>

            <!-- Payment Receipt -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('stores.paymentReceipt') || 'Payment Receipt' }} *
              </label>
              <label
                class="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
              >
                <i class="fas fa-receipt text-2xl text-primary mb-2"></i>
                <span class="text-sm text-gray-600">
                  {{ formData.paymentReceipt ? formData.paymentReceipt.name : $t('stores.personalDocuments') }}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                  @change="e => handleFileChange(e, 'paymentReceipt', 'paymentReceiptPreview')"
                  class="hidden"
                />
              </label>
              <img
                v-if="formData.paymentReceiptPreview"
                :src="formData.paymentReceiptPreview"
                alt="Payment Receipt"
                class="h-16 mt-3 rounded border"
              />
            </div>
          </div>

          <!-- Step 2: Branding Info (Store Name, Logo, Banner, Description) -->
          <div v-if="currentStep === 2" class="space-y-6">
            <h2 class="text-xl font-bold text-gray-800 mb-6">
              {{ $t('stores.brandingInfo') || 'Branding Information' }}
            </h2>

            <!-- Store Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('stores.storeName') }} *
              </label>
              <input
                v-model="formData.name"
                type="text"
                required
                maxlength="100"
                class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
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
                rows="3"
                maxlength="500"
                class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-none"
                :placeholder="$t('stores.storeDescriptionPlaceholder')"
              ></textarea>
            </div>

            <!-- Logo Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('stores.storeLogo') }} *
              </label>
              <label
                class="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
              >
                <i class="fas fa-image text-2xl text-primary mb-2"></i>
                <span class="text-sm text-gray-600">
                  {{ formData.logo ? formData.logo.name : $t('stores.uploadImg') }}
                </span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  required
                  @change="e => handleFileChange(e, 'logo', 'logoPreview')"
                  class="hidden"
                />
              </label>
              <img
                v-if="formData.logoPreview"
                :src="formData.logoPreview"
                alt="Logo Preview"
                class="h-16 mt-3 rounded border"
              />
            </div>

            <!-- Banner Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('stores.storeBanner') }} *
              </label>
              <label
                class="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
              >
                <i class="fas fa-image text-2xl text-primary mb-2"></i>
                <span class="text-sm text-gray-600">
                  {{ formData.banner ? formData.banner.name : $t('stores.uploadImg') }}
                </span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  required
                  @change="e => handleFileChange(e, 'banner', 'bannerPreview')"
                  class="hidden"
                />
              </label>
              <img
                v-if="formData.bannerPreview"
                :src="formData.bannerPreview"
                alt="Banner Preview"
                class="h-16 mt-3 rounded border"
              />
            </div>
          </div>

          <!-- Step 3: Review -->
          <div v-if="currentStep === 3" class="space-y-6">
            <h2 class="text-2xl font-bold text-gray-800">{{ $t('stores.review') }}</h2>

            <!-- Pack Info -->
            <div class="bg-white shadow rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-700 mb-2">{{ $t('stores.selectedPlan') }}</h3>
              <p class="text-gray-600">{{ proPackData?.title || 'Pro Pack' }}</p>
            </div>

            <!-- Store Info -->
            <div class="bg-white shadow rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-700 mb-2">{{ $t('stores.storeInfo') }}</h3>
              <p><span class="font-medium">{{ $t('stores.storeName') }}:</span> {{ formData.name }}</p>
              <p><span class="font-medium">{{ $t('stores.storeDescription') }}:</span> {{ formData.description || $t('stores.noDescription') }}</p>
            </div>

            <!-- Branding -->
            <div class="bg-white shadow rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-700 mb-2">{{ $t('stores.branding') }}</h3>
              <div class="flex items-center space-x-12">
                <div>
                  <span class="font-medium block">{{ $t('stores.logo') }}</span>
                  <div class="mt-2">
                    <img
                      v-if="formData.logoPreview"
                      :src="formData.logoPreview"
                      alt="Logo"
                      class="h-16 rounded border mb-2"
                    />
                  </div>
                </div>
                <div>
                  <span class="font-medium block">{{ $t('stores.banner') }}</span>
                  <div class="mt-2">
                    <img
                      v-if="formData.bannerPreview"
                      :src="formData.bannerPreview"
                      alt="Banner"
                      class="h-16 rounded border mb-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Uploaded Documents -->
            <div class="bg-white shadow rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-700 mb-2">{{ $t('stores.documents') }}</h3>
              <div class="flex items-center space-x-4">
                <div v-if="formData.businessRegisterPreview">
                  <img
                    :src="formData.businessRegisterPreview"
                    alt="Business Register"
                    class="h-16 rounded border"
                  />
                </div>
                <div v-if="formData.paymentReceiptPreview">
                  <img
                    :src="formData.paymentReceiptPreview"
                    alt="Payment Receipt"
                    class="h-16 rounded border"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 mt-8">
            <button
              v-if="currentStep > 1"
              @click="previousStep"
              type="button"
              class="px-6 py-3 bg-gray-300 rounded-lg text-white"
            >
              {{ $t('common.back') }}
            </button>
            <button
              v-if="currentStep < totalSteps"
              @click="nextStep"
              type="button"
              :disabled="!isStepValid"
              class="px-6 py-3 bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ $t('common.next') }} ({{ currentStep }}/{{ totalSteps }})
            </button>
            <button
              v-if="currentStep === totalSteps"
              type="submit"
              :disabled="loading"
              :class="[
                'px-6 py-3 rounded-lg transition-colors',
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              ]"
            >
              <span v-if="loading" class="flex items-center">
                <i class="fas fa-spinner fa-spin mr-2"></i>
                {{ $t('stores.upgrading') || 'Upgrading...' }}
              </span>
              <span v-else>
                {{ $t('stores.upgradeToPro') || 'Upgrade to Pro' }}
              </span>
            </button>
          </div>

          <!-- Error and Success Messages -->
          <div v-if="errorMessage || successMessage" class="mt-4 text-center">
            <p v-if="errorMessage" class="text-red-600 text-sm">
              {{ errorMessage }}
            </p>
            <p v-if="successMessage" class="text-green-600 text-sm">
              {{ successMessage }}
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/useAuthStore'
import { useLocaleRouter } from '../composables/useLocaleRouter'
import { supabase } from '../lib/supabase'

const router = useRouter()
const { t, locale } = useI18n()
const authStore = useAuthStore()
const { navigateToPath, getLocalizedPath } = useLocaleRouter()

// Props
const props = defineProps({
  storeId: {
    type: String,
    required: true
  }
})

// State
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const currentStep = ref(1)
const totalSteps = 3
const proPackData = ref(null)
const currentStore = ref(null)

// Form data
const formData = reactive({
  name: '',
  description: '',
  logo: null,
  logoPreview: null,
  banner: null,
  bannerPreview: null,
  businessRegister: null,
  businessRegisterPreview: null,
  paymentReceipt: null,
  paymentReceiptPreview: null
})

// Step validation
const isStepValid = computed(() => {
  switch (currentStep.value) {
    case 1:
      return !!formData.businessRegister && !!formData.paymentReceipt
    case 2:
      return formData.name?.trim() && formData.logo && formData.banner
    case 3:
      return true
    default:
      return false
  }
})

// Navigation
const nextStep = () => {
  if (isStepValid.value && currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) currentStep.value--
}

// Handle file change
function handleFileChange(e, key, previewKey) {
  const file = e.target.files[0]
  if (!file) return

  formData[key] = file
  if (file.type.startsWith('image/')) {
    formData[previewKey] = URL.createObjectURL(file)
  } else {
    formData[previewKey] = null
  }
}

// Upload helper
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

  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName)

  return publicUrl
}

// Fetch current store and Pro pack
const fetchStoreAndPack = async () => {
  try {
    // Fetch current store
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('*, packs(*)')
      .eq('id', props.storeId)
      .single()

    if (storeError) throw storeError
    currentStore.value = storeData

    // Pre-fill store name and description if they exist
    if (storeData.name) formData.name = storeData.name
    if (storeData.description) formData.description = storeData.description

    // Fetch Pro pack
    const { data: packsData, error: packsError } = await supabase
      .from('packs')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })

    if (packsError) throw packsError

    // Find Pro pack (price > 0)
    const proPack = packsData.find(p => Number(p.price) > 0)
    if (!proPack) throw new Error('Pro pack not found')

    // Localize pack name
    const currentLocale = locale.value
    proPackData.value = {
      id: proPack.id,
      title: currentLocale === 'fr'
        ? proPack.name_fr || proPack.name_en
        : currentLocale === 'ar'
        ? proPack.name_ar || proPack.name_en
        : proPack.name_en
    }
  } catch (err) {
    console.error('Error fetching store and pack:', err)
    errorMessage.value = err?.message || 'Failed to load store information'
  }
}

// Submit handler
const handleSubmit = async () => {
  try {
    loading.value = true
    successMessage.value = ''
    errorMessage.value = ''

    if (!authStore.isAuthenticated || !authStore.user?.id) {
      throw new Error('Not authenticated')
    }

    // Upload verification documents
    let commerceRegisterUrl = null
    let paymentReceiptUrl = null

    if (formData.businessRegister instanceof File) {
      commerceRegisterUrl = await uploadFile(formData.businessRegister, 'verification-documents')
    }

    if (formData.paymentReceipt instanceof File) {
      paymentReceiptUrl = await uploadFile(formData.paymentReceipt, 'verification-documents')
    }

    // Upload store files
    let logoUrl = null
    let bannerUrl = null

    if (formData.logo instanceof File) {
      logoUrl = await uploadFile(formData.logo, 'verification-documents')
    }

    if (formData.banner instanceof File) {
      bannerUrl = await uploadFile(formData.banner, 'verification-documents')
    }

    const upgradeData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || null,
      logo: logoUrl,
      banner: bannerUrl,
      pack_id: proPackData.value.id,
      commerce_register_url: commerceRegisterUrl,
      payment_receipt_url: paymentReceiptUrl
    }

    console.log('🔄 Upgrading store...')
    
    // Call RPC function
    const { data, error: rpcError } = await supabase
      .rpc('upgrade_store_to_pro', {
        p_store_id: props.storeId,
        p_banner_url: upgradeData.banner,
        p_commerce_register_url: upgradeData.commerce_register_url,
        p_description: upgradeData.description,
        p_logo_url: upgradeData.logo,
        p_name: upgradeData.name,
        p_owner_id: authStore.user.id,
        p_pack_id: upgradeData.pack_id,
        p_payment_receipt_url: upgradeData.payment_receipt_url
      })

    if (rpcError) {
      throw new Error(`Failed to upgrade store: ${rpcError.message}`)
    }

    console.log('✅ Store upgraded successfully')
    successMessage.value = t('stores.upgradeSuccess') || 'Store upgraded successfully! Your Pro Pack features are now active.'

    // Redirect to subscription page after 2 seconds
    setTimeout(() => {
      navigateToPath('/subscription')
    }, 2000)

    loading.value = false
  } catch (error) {
    console.error('Error upgrading store:', error)
    errorMessage.value = error?.message || 'Failed to upgrade store'
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await fetchStoreAndPack()
})
</script>
