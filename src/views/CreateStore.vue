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


            <!-- Step 2: Review -->
            <div v-if="currentStep === 2" class="space-y-6">
              <h2 class="text-xl font-bold text-gray-800 mb-6">{{ $t('stores.review') }}</h2>
              
              <div class="bg-gray-50 rounded-xl p-6 space-y-4">
                <div class="flex items-center space-x-4 space-x-reverse">
                  <div class="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                    <i class="fas fa-store text-white text-2xl"></i>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-800">{{ formData.name }}</h3>
                    <p class="text-gray-600">{{ formData.description || $t('stores.noDescription') }}</p>
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
                  v-if="currentStep < 2"
                  type="button"
                  @click="nextStep"
                  :disabled="!isStepValid"
                  class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {{ $t('common.next') }}
                  <i class="fas fa-arrow-right ml-2"></i>
                </button>
                
                <button
                  v-if="currentStep === 2"
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
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { supabase } from '../lib/supabase'

const router = useRouter()
const { t: $t } = useI18n()

// Step management
const currentStep = ref(1)
const stepLoading = ref(false)

// Form data
const formData = reactive({
  name: '',
  description: ''
})

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
  description: ''
})

// Authentication functions
const validateSession = async () => {
  try {
    // Get current session
    const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      throw new Error('Authentication failed. Please log in again.')
    }
    
    // Check if session exists
    if (!currentSession || !currentSession.user) {
      console.log('No valid session found')
      return null
    }
    
    // Check if token is expired and refresh if needed
    const now = Math.floor(Date.now() / 1000)
    if (currentSession.expires_at && currentSession.expires_at < now) {
      console.log('Token expired, attempting refresh...')
      
      // Attempt to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError || !refreshData.session) {
        console.log('Session refresh failed:', refreshError)
        return null
      }
      
      console.log('Session refreshed successfully')
      session.value = refreshData.session
      user.value = refreshData.session.user
      isAuthenticated.value = true
      return refreshData.session
    }
    
    // Session is valid
    session.value = currentSession
    user.value = currentSession.user
    isAuthenticated.value = true
    
    console.log('Valid session found', { 
      userId: currentSession.user.id, 
      email: currentSession.user.email,
      expiresAt: new Date(currentSession.expires_at * 1000).toISOString()
    })
    
    return currentSession
  } catch (err) {
    console.error('Session validation error:', err)
    session.value = null
    user.value = null
    isAuthenticated.value = false
    return null
  }
}

const requireAuth = async () => {
  const currentSession = await validateSession()
  
  if (!currentSession) {
    const error = new Error('User not authenticated')
    error.code = 'AUTH_REQUIRED'
    throw error
  }
  
  return currentSession
}

const handleAuthError = (error) => {
  console.error('Authentication error:', error)
  
  // Clear local state
  user.value = null
  session.value = null
  isAuthenticated.value = false
  
  // Redirect to login
  const currentLocale = router.currentRoute.value.meta?.locale || 'en'
  router.push(`/${currentLocale}/login`)
  
  throw new Error('Please log in to continue')
}

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
  const errors = { name: '', description: '' }
  
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
  
  Object.assign(validationErrors, errors)
  return !Object.values(errors).some(error => error !== '')
}


// Step navigation
const nextStep = () => {
  if (currentStep.value < 2 && isStepValid.value) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}


// Store creation functions with proper authentication

const createStore = async (storeData) => {
  try {
    // Validate session first
    const currentSession = await requireAuth()

    // Input validation
    if (!storeData || typeof storeData !== 'object') {
      throw new Error('Invalid store data provided')
    }

    const storeName = storeData.name?.trim()
    if (!storeName || storeName.length === 0) {
      throw new Error('Store name is required')
    }

    if (storeName.length > 100) {
      throw new Error('Store name must be less than 100 characters')
    }

    const storeDescription = storeData.description?.trim() || null
    if (storeDescription && storeDescription.length > 500) {
      throw new Error('Store description must be less than 500 characters')
    }

    // Prepare store data
    const storeInsertData = {
      owner_id: currentSession.user.id, // Uses authenticated user's ID
      name: storeName,
      description: storeDescription
    }

    console.log('Creating store with data:', { 
      ...storeInsertData, 
      owner_id: '***' // Hide user ID in logs for security
    })

    // Database insert using Supabase client (JWT automatically attached)
    const { data, error: createError } = await supabase
      .from('stores')
      .insert(storeInsertData)
      .select()
      .single()

    if (createError) {
      console.error('Database insert error:', createError)
      
      // Handle specific error types
      if (createError.code === '23505') {
        if (createError.message.includes('unique_owner')) {
          throw new Error('You already have a store. Each user can only create one store.')
        }
        throw new Error('This store name is already taken. Please choose a different name.')
      } else if (createError.code === '23503') {
        throw new Error('Invalid user account. Please log out and log in again.')
      } else if (createError.code === '42501') {
        throw new Error('Permission denied. Please ensure you have the necessary permissions to create a store.')
      } else {
        throw new Error(`Failed to create store: ${createError.message}`)
      }
    }

    if (!data) {
      throw new Error('Store was created but no data was returned. Please refresh the page.')
    }

    console.log('Store created successfully:', data.id)
    return data
  } catch (err) {
    const errorMessage = err.message || 'An unexpected error occurred while creating the store'
    console.error('Error creating store:', {
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint
    })
    
    // Handle auth errors
    if (err.message.includes('not authenticated') || err.message.includes('Authentication failed')) {
      handleAuthError(err)
    }
    
    throw new Error(errorMessage)
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
      description: storeData.description ? 'Present' : 'Null'
    })

    // 3. Create store
    const newStore = await createStore(storeData)

    if (!newStore?.id) {
      throw new Error('Store creation failed: No store data returned')
    }

    console.log('Store created successfully:', newStore.id)

    // 4. Success handling
    successMessage.value = $t('stores.storeCreatedSuccessfully') || 'Your store has been created successfully!'
    
    // Reset form
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
