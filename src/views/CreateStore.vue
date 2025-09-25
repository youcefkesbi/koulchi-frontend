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
                  (formData.selectedPack === 'pro'
                    ? (n === 3 ? $t('stores.brandingInfo') : $t('stores.review'))
                    : $t('stores.review'))
                }}
              </span>
              <div v-if="n < totalSteps" :class="['w-16 h-0.5', currentStep > n ? 'bg-primary' : 'bg-gray-200']"></div>
            </div>
          </div>
        </div>

        <!-- Pack Selection Grid -->
<div  v-if="currentStep === 1">
  <h3 class="text-lg font-semibold text-gray-800 mb-4">
    {{ $t('stores.choosePlan') }}
  </h3>

  <!-- 2-column grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div
      v-for="(plan, key) in $tm('pack')" 
      :key="key"
      @click="formData.selectedPack = key"
      :class="[
        'cursor-pointer p-6 rounded-2xl border shadow-soft transition-all',
        formData.selectedPack === key
          ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
          : 'border-gray-200 hover:border-primary/40 hover:shadow-md'
      ]"
    >
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-xl font-bold text-gray-800">{{ plan.title }}</h4>
        <p class="text-primary font-semibold">{{ plan.price }}</p>
      </div>

      <ul class="space-y-2 text-sm text-gray-600">
        <li
          v-for="(feature, i) in plan.features"
          :key="i"
          class="flex items-start space-x-3"
        >
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
    {{ formData.selectedPack === 'pro' ? $tm('pack.pro.title') : $tm('pack.basic.title') }}
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
        @change="e => {
          const file = e.target.files[0]
          if (file) {
            formData.identityDoc = file
            if (file.type.startsWith('image/')) {
              formData.identityDocPreview = URL.createObjectURL(file)
            }
          }
        }"
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
  <div v-if="formData.selectedPack === 'pro'">
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
        @change="e => {
          const file = e.target.files[0]
          if (file) {
            formData.businessRegister = file
            if (file.type.startsWith('image/')) {
              formData.businessRegisterPreview = URL.createObjectURL(file)
            }
          }
        }"
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
  <div class="mt-6" v-if="formData.selectedPack === 'pro'">
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
        @change="e => {
          const file = e.target.files[0]
          if (file) {
            formData.paymentReceipt = file
            if (file.type.startsWith('image/')) {
              formData.paymentReceiptPreview = URL.createObjectURL(file)
            }
          }
        }"
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
<div v-if="currentStep === 3 && formData.selectedPack === 'pro'">
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
      @change="e => {
        const file = e.target.files[0]
        if (file) {
          formData.logo = file
          formData.logoPreview = URL.createObjectURL(file)
        }
      }"
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
      @change="e => {
        const file = e.target.files[0]
        if (file) {
          formData.banner = file
          formData.bannerPreview = URL.createObjectURL(file)
        }
      }"
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
  v-if="(currentStep === 3 && formData.selectedPack === 'basic') || (currentStep === 4 && formData.selectedPack === 'pro')"
  class="space-y-6"
>
  <h2 class="text-2xl font-bold text-gray-800">{{ $t('stores.review') }}</h2>

  <!-- Pack Selection -->
  <div class="bg-white shadow rounded-lg p-6">
    <h3 class="text-lg font-semibold text-gray-700 mb-2">{{ $t('stores.selectedPlan') }}</h3>
    <p class="text-gray-600">
      {{ formData.selectedPack === 'pro' ? $t('pack.pro.title') : $t('pack.basic.title') }}
    </p>
  </div>

  <!-- Store Info -->
  <div class="bg-white shadow rounded-lg p-6">
    <h3 class="text-lg font-semibold text-gray-700 mb-2">{{ $t('stores.storeInfo') }}</h3>
    <p><span class="font-medium">{{ $t('stores.storeName') }}:</span> {{ formData.name }}</p>
    <p><span class="font-medium">{{ $t('stores.storeDescription') }}:</span> {{ formData.description || $t('stores.noDescription') }}</p>
  </div>

  <!-- Branding (Pro only) -->
<!-- Branding (Pro only) -->
<div v-if="formData.selectedPack === 'pro'" class="bg-white shadow rounded-lg p-6">
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
    <ul class="space-y-2 text-gray-600">
      <li>
        <span class="font-medium">{{ $t('stores.identityDoc') }}:</span>
        {{ formData.identityDoc ? formData.identityDoc.name : $t('common.notProvided') }}
      </li>
      <li v-if="formData.selectedPack === 'pro'">
        <span class="font-medium">{{ $t('stores.businessRegister') }}:</span>
        {{ formData.businessRegister ? formData.businessRegister.name : $t('common.notProvided') }}
      </li>
    </ul>
  </div>
</div>


        <!-- Navigation Buttons -->
        <div class="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
          <button v-if="currentStep > 1" @click="previousStep" type="button" class="px-6 py-3 bg-gray-100 rounded-lg">
            {{ $t('common.back') }}
          </button>
          <button v-if="currentStep < totalSteps" @click="nextStep" type="button" class="px-6 py-3 bg-primary text-white rounded-lg">
            {{ $t('common.next') }}
          </button>
          <button v-if="currentStep === totalSteps" type="submit" class="px-6 py-3 bg-green-600 text-white rounded-lg">
            {{ $t('stores.createStore') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { supabase } from '../lib/supabase'

const router = useRouter()
const { t: $t } = useI18n()

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
  description: ''
})

// ---- Dynamic step count ----
const totalSteps = computed(() => {
  return formData.selectedPack === 'pro' ? 4 : 3
})

// ---- Validation ----
const validatePackSelection = () => !!formData.selectedPack

const validateBasicOrProForm = () => {
  const errors = { name: '', description: '' }
  if (!formData.name.trim()) {
    errors.name = $t('stores.storeNameRequired') || 'Store name is required'
  }
  if (formData.description && formData.description.length > 500) {
    errors.description = $t('stores.storeDescriptionTooLong') || 'Description too long'
  }
  Object.assign(validationErrors, errors)
  return !Object.values(errors).some(e => e !== '')
}

const validateBasicInfo = () => {
  if (formData.selectedPack === 'pro') {
    // Example validation for branding step
    return !!formData.logo || !!formData.banner || !!formData.color
  }
  return true
}

// ---- Step Validation ----
const isStepValid = computed(() => {
  switch (currentStep.value) {
    case 1:
      // Pack selection is mandatory
      return !!formData.selectedPack

    case 2:
      if (formData.selectedPack === 'basic') {
        return !!formData.identityDoc
      }
      if (formData.selectedPack === 'pro') {
        return !!formData.identityDoc && !!formData.businessRegister
      }
      return false

   case 3:
  if (formData.selectedPack === 'pro') {
    return (
      formData.name &&
      formData.name.trim() !== '' &&
      formData.logo &&
      formData.banner
    )
  }

  return true


    case 4:
      // Review step is always valid
      return true

    default:
      return false
  }
})
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

// Upload helper
const uploadFile = async (file, pathPrefix) => {
  if (!file) return null

  const ext = file.name.split('.').pop()
  const fileName = `${pathPrefix}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('stores') // bucket name
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) {
    console.error('File upload error:', uploadError)
    throw new Error(`Failed to upload ${pathPrefix}`)
  }

  // Build public URL
  const { data: { publicUrl } } = supabase.storage
    .from('stores')
    .getPublicUrl(fileName)

  return publicUrl
}


// Store creation function using RPC
const createStore = async (storeData) => {
  try {
    const currentSession = await requireAuth()

    // Prepare payload for SQL function
    const payload = {
      p_owner_id: currentSession.user.id,
      p_name: storeData.name,
      p_description: storeData.description,
      p_logo_url: storeData.logo || null,
      p_banner_url: storeData.banner || null,
      p_pack_id: storeData.pack_id || null
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


// Submit handler
const handleSubmit = async () => {
  try {
    loading.value = true
    successMessage.value = ''
    errorMessage.value = ''

    if (!validateForm()) {
      errorMessage.value = $t('stores.validationError') || 'Please fix the validation errors before proceeding.'
      return
    }

    // Upload logo + banner
    let logoUrl = null
    let bannerUrl = null

    if (formData.logo instanceof File) {
      logoUrl = await uploadFile(formData.logo, 'logos')
    }
    if (formData.banner instanceof File) {
      bannerUrl = await uploadFile(formData.banner, 'banners')
    }

    const storeData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || null,
      logo: logoUrl,
      banner: bannerUrl,
      pack_id: formData.selectedPack || null
    }

    const newStore = await createStore(storeData)

    if (!newStore?.id) {
      throw new Error('Store creation failed: No ID returned')
    }

    successMessage.value = $t('stores.storeCreatedSuccessfully') || 'Your store has been created successfully!'
    resetForm()

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
  currentStep.value = 1
  
  // Clear validation errors
  Object.keys(validationErrors).forEach(key => {
    validationErrors[key] = ''
  })
}

// Initialize authentication and set up auth state listener
const initAuth = async () => {
  try {
    // Get initial session
    await validateSession()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change:', event, newSession?.user?.email)
        
        if (newSession?.user) {
          session.value = newSession
          user.value = newSession.user
          isAuthenticated.value = true
          
          // Handle sign in
          if (event === 'SIGNED_IN') {
            console.log('User signed in:', newSession.user.email)
          }
        } else {
          // User signed out or session expired
          console.log('User signed out or session expired')
          session.value = null
          user.value = null
          isAuthenticated.value = false
          
          // Redirect to login if user is not authenticated
          const currentLocale = router.currentRoute.value.meta?.locale || 'en'
          router.push(`/${currentLocale}/login`)
        }
      }
    )
    
    // Store the subscription for cleanup
    authSubscription.value = subscription
    
    return subscription
  } catch (err) {
    console.error('Auth initialization failed:', err)
    session.value = null
    user.value = null
    isAuthenticated.value = false
  }
}

// Lifecycle hooks
onMounted(async () => {
  // Initialize authentication
  await initAuth()
  
  // Check if user is authenticated, if not redirect to login
  if (!isAuthenticated.value) {
    const currentLocale = router.currentRoute.value.meta?.locale || 'en'
    router.push(`/${currentLocale}/login`)
  }
})

onUnmounted(() => {
  // Clean up auth subscription
  if (authSubscription.value) {
    authSubscription.value.unsubscribe()
  }
})
</script>
