<template>
  <div class="min-h-screen bg-gray-50 ">
    <!-- Header -->
    <div class="bg-white shadow-soft border-b border-gray-100">
      <div class="container mx-auto px-4 py-6 flex items-center space-x-4">
        <router-link to="/dashboard" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <i class="fas fa-arrow-left text-xl"></i>
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-800">{{ $t('stores.createStore') }}</h1>
          <p class="text-gray-600">{{ $t('stores.createStoreDescription') }}</p>
        </div>
      </div>
    </div>

    <!-- Main Form -->
    <div class="container mx-auto px-4 py-8 ">
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
                  n === 1 ? $t('stores.choosePlan') :
                  n === 2 ? $t('stores.uploadDocs')  :
                  (isProPack
                    ? (n === 3 ? $t('stores.brandingInfo') : $t('stores.review'))
                    : $t('stores.review'))
                }}
              </span>
              <div v-if="n < totalSteps" :class="['w-16 h-0.5', currentStep > n ? 'bg-primary' : 'bg-gray-200']"></div>
            </div>
          </div>
        </div>

<!-- Pack Selection Grid -->
<div v-if="currentStep === 1">
  <h3 class="text-lg font-semibold text-gray-800 mb-4">
    {{ $t('stores.choosePlan') }}
  </h3>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div
      v-for="pack in localizedPacks"
      :key="pack.id"
      @click="formData.selectedPack = pack.id"
      :class="[
        'cursor-pointer p-6 rounded-2xl border shadow-soft transition-all',
        formData.selectedPack === pack.id
          ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
          : 'border-gray-200 hover:border-primary/40 hover:shadow-md'
      ]"
    >
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-xl font-bold text-gray-800">{{ pack.title }}</h4>
        <div class="text-right">
          <p class="text-primary font-semibold text-lg">{{ pack.price }}</p>
          <p class="text-xs text-gray-500">{{ pack.maxAnnouncements }} {{ $t('stores.announcements') }}</p>
        </div>
      </div>

      <ul class="space-y-2 text-sm text-gray-600">
        <li v-for="(feature, i) in pack.features" :key="i" class="flex items-start space-x-3">
          <i class="fas fa-check text-green-500 mt-1"></i>
          <span class="leading-tight">{{ feature }}</span>
        </li>
      </ul>
    </div>
  </div>
</div>



<!-- Step 2: Basic / Pro Form -->
<div v-if="currentStep === 2">
  <h2 class="text-xl font-bold text-gray-800 mb-6">
    {{ selectedPackData?.title || $t('stores.uploadDocs') }}
  </h2>

  <div class="space-y-6">
  <!-- Identity Document -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      {{ $t('stores.identityDoc') }}
    </label>
    <label
      class="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
    >
      <i class="fas fa-file-upload text-2xl text-primary mb-2"></i>
      <span class="text-sm text-gray-600">
        {{ formData.identityDoc ? formData.identityDoc.name : $t('stores.personalDocuments') }}
      </span>
      <input
  type="file"
  accept=".pdf,.jpg,.jpeg,.png"
  @change="e => handleFileChange(e, 'identityDoc', 'identityDocPreview')"
  class="hidden"
/>

    </label>
    <!-- Image preview if it's a picture -->
    <img
      v-if="formData.identityDocPreview"
      :src="formData.identityDocPreview"
      alt="Identity Document"
      class="h-16 mt-3 rounded border"
    />
  </div>

      <!-- Pro only: Business Register -->
  <div v-if="isProPack">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      {{ $t('stores.businessRegister') }}
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

      <!-- Pro only: Payment Receipt -->
  <div class="mt-6" v-if="isProPack">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      {{ $t('stores.paymentReceipt') }}
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
</div>
   <!-- Step 3: Branding Info (Pro only) -->
<div v-if="currentStep === 3 && isProPack">
  <h2 class="text-xl font-bold text-gray-800 mb-6">{{ $t('stores.brandingInfo') }}</h2>

  <div class="space-y-6">
    <!-- Store Name (required, max 100 chars) -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {{ $t('stores.storeName') }} *
      </label>
      <input
        v-model="formData.name"
        type="text"
        maxlength="100"
        required
        class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
        :placeholder="$t('stores.storeNamePlaceholder')"
      />
      <p class="text-xs text-gray-500 mt-1">{{ $t('stores.storeNameTooLong') }}</p>
    </div>

    <!-- Store Description (optional, max 500 chars) -->
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
      <p class="text-xs text-gray-500 mt-1">{{ $t('stores.storeDescriptionTooLong') }}</p>
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
  <p class="text-xs text-gray-500 mt-1">{{ $t('stores.logoHelp') }}</p>

  <!-- Preview -->
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
  <p class="text-xs text-gray-500 mt-1">{{ $t('stores.bannerHelp') }}</p>

  <!-- Preview -->
  <img
    v-if="formData.bannerPreview"
    :src="formData.bannerPreview"
    alt="Banner Preview"
    class="h-16 mt-3 rounded border"
  />
</div>

  </div>
</div>


        <!-- Review Step -->
<div
  v-if="(currentStep === 3 && !isProPack) || (currentStep === 4 && isProPack)"
  class="space-y-6"
>
  <h2 class="text-2xl font-bold text-gray-800">{{ $t('stores.review') }}</h2>

  <!-- Pack Selection -->
  <div class="bg-white shadow rounded-lg p-6">
    <h3 class="text-lg font-semibold text-gray-700 mb-2">{{ $t('stores.selectedPlan') }}</h3>
    <p class="text-gray-600">
      {{ selectedPackData?.title || 'No pack selected' }}
    </p>
    <p class="text-sm text-gray-500">
      {{ selectedPackData?.price || 'Free' }}
    </p>
  </div>

  <!-- Store Info -->
  <div v-if="isProPack" class="bg-white shadow rounded-lg p-6">
    <h3 class="text-lg font-semibold text-gray-700 mb-2">{{ $t('stores.storeInfo') }}</h3>
    <p><span class="font-medium">{{ $t('stores.storeName') }}:</span> {{ formData.name }}</p>
    <p><span class="font-medium">{{ $t('stores.storeDescription') }}:</span> {{ formData.description || $t('stores.noDescription') }}</p>
  </div>

  <!-- Branding (Pro only) -->
<!-- Branding (Pro only) -->
<div v-if="isProPack" class="bg-white shadow rounded-lg p-6">
  <h3 class="text-lg font-semibold text-gray-700 mb-2">{{ $t('stores.branding') }}</h3>
  <div class="flex items-center space-x-12">
    <!-- Logo -->
    <div>
      <span class="font-medium block">{{ $t('stores.logo') }}</span>
      <div class="mt-2">
        <img
          v-if="formData.logoPreview"
          :src="formData.logoPreview"
          alt="Logo"
          class="h-16 rounded border mb-2"
        />
        <span v-if="formData.logo" class="text-sm text-gray-600 block">
          {{ formData.logo.name }}
        </span>
        <span v-else class="text-gray-400 text-sm">{{ $t('common.notProvided') }}</span>
      </div>
    </div>

    <!-- Banner -->
    <div>
      <span class="font-medium block">{{ $t('stores.banner') }}</span>
      <div class="mt-2">
        <img
          v-if="formData.bannerPreview"
          :src="formData.bannerPreview"
          alt="Banner"
          class="h-16 rounded border mb-2"
        />
        <span v-if="formData.banner" class="text-sm text-gray-600 block">
          {{ formData.banner.name }}
        </span>
        <span v-else class="text-gray-400 text-sm">{{ $t('common.notProvided') }}</span>
      </div>
    </div>
  </div>
</div>



  <!-- Uploaded Documents -->
  <div class="bg-white shadow rounded-lg p-6">
    <h3 class="text-lg font-semibold text-gray-700 mb-2">{{ $t('stores.documents') }}</h3>
    <div class="flex items-center space-x-4">
      <!-- Identity Document -->
      <div v-if="formData.identityDocPreview">
        <img
          :src="formData.identityDocPreview"
          alt="Identity Document"
          class="h-16 rounded border"
        />
      </div>

      <!-- Business Register (Pro only) -->
      <div v-if="isProPack && formData.businessRegisterPreview">
        <img
          :src="formData.businessRegisterPreview"
          alt="Business Register"
          class="h-16 rounded border"
        />
      </div>

      <!-- Payment Receipt (Pro only) -->
      <div v-if="isProPack && formData.paymentReceiptPreview">
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
        <div 
        class="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 mt-8">
          <button v-if="currentStep > 1" 
          @click="previousStep" 
          type="button" 
          class=" px-6 py-3 bg-gray-300 rounded-lg text-white">
            {{ $t('common.back') }}
          </button>
          <button 
          v-if="currentStep < totalSteps" 
          @click="nextStep" type="button" 
          class="px-6 py-3 bg-green-600 text-white rounded-lg">
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
    {{ $t('stores.creating') || 'Creating...' }}
  </span>
  <span v-else>
    {{ $t('stores.createStore') }}
  </span>
</button>

        </div>
        
        <!-- Verification Error Message -->
        <div v-if="validationErrors.verification" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-start">
            <i class="fas fa-exclamation-triangle text-red-500 mt-1 mr-3"></i>
            <div>
              <h4 class="text-red-800 font-medium mb-2">{{ $t('stores.verificationRequired') }}</h4>
              <p class="text-red-700 text-sm mb-3">{{ $t('stores.verificationRequiredMessage') }}</p>
              <router-link 
                :to="`/${$i18n.locale}/dashboard`"
                class="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                <i class="fas fa-upload mr-2"></i>
                {{ $t('stores.uploadVerification') }}
              </router-link>
            </div>
          </div>
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
import { ref, reactive, computed, onMounted , onUnmounted  } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/useAuthStore'
import { supabase } from '../lib/supabase'

const router = useRouter()
const { t, locale } = useI18n() // locale reactive
const authStore = useAuthStore()
const rawPacks = ref([]) // raw fetched packs from DB
const loadingPacks = ref(false)
const fetchError = ref(null)

const fetchPacks = async () => {
  try {
    loadingPacks.value = true
    fetchError.value = null

    // Fetch packs with their features using the new relational structure
    const { data, error } = await supabase
      .from('packs')
      .select(`
        *,
        pack_features!inner(
          is_enabled,
          features(
            name_en,
            name_ar,
            name_fr,
            description_en,
            description_ar,
            description_fr
          )
        )
      `)
      .eq('is_active', true)
      .order('price', { ascending: true })

    if (error) throw error

    // Transform the data to match the expected structure
    const transformedPacks = (data || []).map(pack => {
      // Extract enabled features and organize by language
      const features = {
        en: [],
        ar: [],
        fr: []
      }

      pack.pack_features?.forEach(pf => {
        if (pf.is_enabled && pf.features) {
          const feature = pf.features
          features.en.push(feature.name_en)
          features.ar.push(feature.name_ar)
          features.fr.push(feature.name_fr)
        }
      })

      return {
        ...pack,
        features: features
      }
    })

    // Keep raw data and localize via computed for reactive locale updates
    rawPacks.value = transformedPacks
  } catch (err) {
    console.error('Failed to fetch packs:', err)
    fetchError.value = err.message || 'Failed to load packs'
  } finally {
    loadingPacks.value = false
  }
}


// Computed packs localized by current locale
const localizedPacks = computed(() => {
  return (rawPacks.value || []).map(pack => {
    const features = pack.features || {}
    const currentLocale = locale.value

    return {
      id: pack.id,
      title:
        currentLocale === 'fr'
          ? pack.name_fr || pack.name_en
          : currentLocale === 'ar'
          ? pack.name_ar || pack.name_en
          : pack.name_en,
      description:
        currentLocale === 'fr'
          ? pack.description_fr || pack.description_en
          : currentLocale === 'ar'
          ? pack.description_ar || pack.description_en
          : pack.description_en,
      price: Number(pack.price) === 0 ? t('stores.free') : `${pack.price} ${t('stores.currency')}`,
      maxAnnouncements: pack.max_announcements,
      maxImages: pack.max_images,
      features: features[currentLocale] || features['en'] || [],
      rawPrice: Number(pack.price)
    }
  })
})

// Computed properties for selected pack
const selectedPackData = computed(() => {
  if (!formData.selectedPack) return null
  return localizedPacks.value.find(p => p.id === formData.selectedPack)
})

const isProPack = computed(() => {
  if (!selectedPackData.value) return false
  return selectedPackData.value.rawPrice > 0
})


// Step management
const currentStep = ref(1)

// Form data
const formData = reactive({
  selectedPack: '',
  name: '',
  description: '',
  logo: null,
  logoPreview: null,
  banner: null,
  bannerPreview: null,
  identityDoc: null,
  identityDocPreview: null,
  businessRegister: null,
  businessRegisterPreview: null,
  paymentReceipt: null,
  paymentReceiptPreview: null
})




// UI state
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Validation
const validationErrors = reactive({
  name: '',
  description: '',
  pack: '',
  verification: ''
})

// ---- Dynamic step count ----
const totalSteps = computed(() => {
  if (!formData.selectedPack) return 3;
  return isProPack.value ? 4 : 3;
})


// ---- Step Validation ----
const isStepValid = computed(() => {
  if (!formData.selectedPack) return false;

  switch (currentStep.value) {
    case 1:
      return !!formData.selectedPack; // pack selection step

    case 2:
      return !!formData.identityDoc && (isProPack.value ? !!formData.businessRegister && !!formData.paymentReceipt : true);

    case 3:
      if (isProPack.value) {
        return formData.name?.trim() && formData.logo && formData.banner;
      }
      return true; // For basic pack, step 3 is review

    case 4:
      return true; // review step for pro pack

    default:
      return false;
  }
});


// ---- Navigation ----
const nextStep = () => {
  if (isStepValid.value && currentStep.value < totalSteps.value) {
    currentStep.value++
  } else {
    console.warn('Step not valid, cannot proceed')
  }
}




const previousStep = () => {
  if (currentStep.value > 1) currentStep.value--
}

// Handle filechange
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

  // Build public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName)

  return publicUrl
}




// Store creation function using RPC
const createStore = async (storeData) => {
  try {
    // Ensure we have the latest user data and role
    if (!authStore.isAuthenticated) {
      throw new Error('Not authenticated')
    }

    // Force refresh the user role to ensure we have the latest data
    await authStore.forceRoleRefresh()
    
    // Double-check authentication after role refresh
    if (!authStore.user?.id) {
      throw new Error('Not authenticated')
    }

    // Log current user role for debugging
    console.log('Creating store with user role:', authStore.userRole)
    console.log('User ID:', authStore.user.id)

    // Prepare payload for SQL function
    const payload = {
      p_owner_id: authStore.user.id,  
      p_name: storeData.name,
      p_description: storeData.description,
      p_logo_url: storeData.logo || null,
      p_banner_url: storeData.banner || null,
      p_pack_id: storeData.pack_id || null,
      p_id_document_url: storeData.id_document_url || null,
      p_commerce_register_url: storeData.commerce_register_url || null,
      p_payment_receipt_url: storeData.payment_receipt_url || null
    }

    const { data, error: rpcError } = await supabase
      .rpc('create_store', payload)

    if (rpcError) {
      if (rpcError.message.includes('already has a store')) {
        throw new Error('You already have a store. Each user can only create one store.')
      }
      throw new Error(`Failed to create store: ${rpcError.message}`)
    }

    return { id: data }
  } catch (err) {
    throw err
  }
}

// Verification presence check (no approval gate)
// Basic: require identityDoc uploaded in this form
// Pro: require identityDoc + businessRegister + paymentReceipt uploaded in this form
const checkUserVerifications = async () => {
  const basicOk = !!formData.identityDoc
  const proOk = !!formData.identityDoc && !!formData.businessRegister && !!formData.paymentReceipt
  if (isProPack.value) {
    return { canCreate: proOk, missingTypes: proOk ? [] : ['identityDoc', 'businessRegister', 'paymentReceipt'] }
  }
  return { canCreate: basicOk, missingTypes: basicOk ? [] : ['identityDoc'] }
}

// Data validation function
const validateForm = async () => {
  // Validate pack selection
  if (!formData.selectedPack) {
    validationErrors.pack = t('stores.packRequired') || 'Please select a plan';
    return false;
  } else {
    validationErrors.pack = '';
  }

  // Find selected pack from the fetched packs
  if (!selectedPackData.value) {
    validationErrors.pack = t('stores.invalidPack') || 'Selected plan is invalid';
    return false;
  }

  // Check verification requirements (uploads presence only)
  const verificationCheck = await checkUserVerifications()
  if (!verificationCheck.canCreate) {
    validationErrors.verification = t('stores.verificationRequired') || 'Verification documents required';
    return false;
  }
  validationErrors.verification = '';

  // Check if it's Pro plan (price > 0)
  if (isProPack.value) {
    // Validate store name for Pro plan
    if (!formData.name || formData.name.trim().length === 0) {
      validationErrors.name = t('stores.storeNameRequired') || 'Store name is required';
      return false;
    } else {
      validationErrors.name = '';
    }

    if (!formData.logo || !formData.banner) {
      validationErrors.logo = t('stores.logoRequired') || 'Logo is required for Pro plan';
      validationErrors.banner = t('stores.bannerRequired') || 'Banner is required for Pro plan';
      return false;
    } else {
      validationErrors.logo = '';
      validationErrors.banner = '';
    }
  } else {
    // For basic plan, store name is optional, use pack name as default
    if (!formData.name || formData.name.trim().length === 0) {
      formData.name = selectedPackData.value.title + ' Store';
    }
  }

  return true;
};



// Submit handler
const handleSubmit = async () => {
  try {
    loading.value = true;
    successMessage.value = '';
    errorMessage.value = '';

    if (!(await validateForm())) {
      errorMessage.value = t('stores.validationError') || 'Please fix the validation errors before proceeding.';
      return;
    }

    // Upload verification documents first
    let idDocumentUrl = null;
    let commerceRegisterUrl = null;
    let paymentReceiptUrl = null;

    if (formData.identityDoc instanceof File) {
      idDocumentUrl = await uploadFile(formData.identityDoc, 'verification-documents');
    }
    
    if (isProPack.value) {
      if (formData.businessRegister instanceof File) {
        commerceRegisterUrl = await uploadFile(formData.businessRegister, 'verification-documents');
      }
      if (formData.paymentReceipt instanceof File) {
        paymentReceiptUrl = await uploadFile(formData.paymentReceipt, 'verification-documents');
      }
    }

    // Upload store files
    let logoUrl = null;
    let bannerUrl = null;

    if (formData.logo instanceof File) {
      logoUrl = await uploadFile(formData.logo, 'verification-documents');
    }
    if (formData.banner instanceof File) {
      bannerUrl = await uploadFile(formData.banner, 'verification-documents');
    }

    const storeData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || null,
      logo: logoUrl,
      banner: bannerUrl,
      pack_id: formData.selectedPack,
      id_document_url: idDocumentUrl,
      commerce_register_url: commerceRegisterUrl,
      payment_receipt_url: paymentReceiptUrl
    };

    const newStore = await createStore(storeData);

    if (!newStore?.id) {
      throw new Error('Store creation failed: No ID returned');
    }

    successMessage.value = t('stores.storeCreatedSuccessfully') || 'Your store has been created successfully!';
    resetForm();

    // Increased delay to see any error messages
    setTimeout(async () => {
      const currentLocale = router.currentRoute.value.meta?.locale || 'en'
      try {
        await router.push(`/${currentLocale}/dashboard/store/${newStore.id}`)
      } catch (redirectError) {
        console.error('Redirect error:', redirectError);
        errorMessage.value = `Redirect failed: ${redirectError.message}`;
      } finally {
        // Force a refresh so header/state updates and the Create button disappears immediately
        window.location.reload()
      }
    }, 5000); // Increased from 1500ms to 5000ms
  } catch (error) {
    console.error('Error creating store:', error);
    errorMessage.value = getErrorMessage(error);
  } finally {
    loading.value = false;
  }
};


// Error message helper
const getErrorMessage = (error) => {
  const message = error.message || ''
  
  if (message.includes('User not authenticated')) {
    return t('stores.authenticationError') || 'Please log in to create a store'
  } else if (message.includes('permission denied')) {
    return t('stores.permissionError') || 'Permission denied. Please check your account permissions.'
  } else if (message.includes('already have a store')) {
    return t('stores.storeAlreadyExists') || 'You already have a store. Each user can only create one store.'
  } else if (message.includes('network') || message.includes('fetch')) {
    return t('stores.networkError') || 'Network error. Please check your internet connection and try again.'
  } else if (message.includes('upload')) {
    return t('stores.uploadError') || 'Failed to upload images. Please try again.'
  } else {
    return message || t('stores.storeCreationError') || 'Could not create your store, please try again.'
  }
}

// Form reset helper
const resetForm = () => {
  formData.name = ''
  formData.description = ''
  currentStep.value = 1
  
  // Clear validation errors
  Object.keys(validationErrors).forEach(key => {
    validationErrors[key] = ''
  })
}

// Check authentication status using auth store
const checkAuth = () => {
  if (!authStore.isAuthenticated) {
    const currentLocale = router.currentRoute.value.meta?.locale || 'en'
    router.push(`/${currentLocale}/login`)
    return false
  }
  return true
}

// Debug function to refresh user role
const refreshUserRole = async () => {
  try {
    console.log('Refreshing user role...')
    const success = await authStore.forceRoleRefresh()
    if (success) {
      console.log('Role refreshed successfully:', authStore.userRole)
    } else {
      console.log('Failed to refresh role')
    }
  } catch (error) {
    console.error('Error refreshing role:', error)
  }
}

// Lifecycle hooks
onMounted(async () => {
  // Check if user is authenticated, if not redirect to login
  if (!checkAuth()) {
    return
  }
  
  // Debug: Log current user role
  console.log('CreateStore mounted - User role:', authStore.userRole)
  console.log('User object:', authStore.user)
  
  // Fetch packs
  fetchPacks()
})

onUnmounted(() => {
  // No cleanup needed since we're using the auth store
})
</script>
