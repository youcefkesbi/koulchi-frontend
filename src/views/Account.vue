<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <!-- Page Header -->
      <div class="mb-8 text-center">
        <h1 class="text-4xl font-bold text-dark mb-4">{{ $t('profile.title') }}</h1>
        <p class="text-gray-600 text-lg">{{ $t('profile.subtitle') }}</p>
      </div>

      <!-- Profile Form -->
      <div class="bg-white rounded-3xl shadow-soft p-8">
        <form @submit.prevent="updateProfile" class="space-y-6">
          <!-- Email Field (Read-only) -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('profile.email') }}</label>
            <input
              v-model="email"
              type="email"
              disabled
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
            />
            <p class="text-xs text-gray-500 mt-1">{{ $t('profile.emailNote') }}</p>
          </div>

          <!-- Full Name Field -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('profile.fullName') }}</label>
            <input
              v-model="fullName"
              type="text"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300"
              :placeholder="$t('profile.fullNamePlaceholder')"
            />
            <p class="text-xs text-gray-500 mt-1">{{ $t('profile.fullNameNote') }}</p>
          </div>

          <!-- Phone Number Field -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('profile.phone') }}</label>
            <input
              v-model="phoneNumber"
              type="tel"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300"
              :placeholder="$t('profile.phonePlaceholder')"
            />
            <p class="text-xs text-gray-500 mt-1">{{ $t('profile.phoneNote') }}</p>
          </div>

          <!-- Shipping Address -->
          <div class="md:col-span-2 bg-gray-50 rounded-xl p-4">
            <div class="flex justify-between items-center mb-4">
              <label class="block text-sm font-medium text-gray-500">
                {{ $t('profile.shippingAddress') }}
              </label>
              <button
                v-if="!isEditingAddress"
                @click="isEditingAddress = true"
                class="text-primary hover:text-primary-dark text-sm font-medium"
              >
                <i class="fas fa-edit mr-1"></i>
                {{ addressData ? $t('profile.editAddress') : $t('profile.addAddress') }}
              </button>
            </div>

            <!-- Display Address -->
            <div v-if="!isEditingAddress && addressData" class="space-y-2">
              <p class="text-lg font-semibold text-gray-900">
                {{ formatAddress(addressData) }}
              </p>
            </div>
            <p v-else-if="!isEditingAddress" class="text-gray-500 italic">
              {{ $t('profile.notProvided') }}
            </p>

            <!-- Address Form -->
            <div v-if="isEditingAddress" class="space-y-4 mt-4">
              <!-- Wilaya -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('profile.wilaya') }} *
                </label>
                <select
                  v-model="addressForm.wilaya_id"
                  @change="onWilayaChange"
                  :disabled="loadingWilayas"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="">{{ $t('profile.selectWilaya') }}</option>
                  <option
                    v-for="wilaya in wilayas"
                    :key="wilaya.id || wilaya.display_id"
                    :value="wilaya.id || wilaya.display_id"
                  >
                    {{ getLocalizedName(wilaya) }}
                  </option>
                </select>
                <p v-if="loadingWilayas" class="text-sm text-gray-500 mt-1">
                  {{ $t('common.loading') }}...
                </p>
              </div>

              <!-- Commune -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('profile.commune') }} *
                </label>
                <select
                  v-model="addressForm.commune_id"
                  :disabled="!addressForm.wilaya_id || loadingCommunes"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="">{{ $t('profile.selectCommune') }}</option>
                  <option
                    v-for="commune in communes"
                    :key="commune.id || commune.display_id"
                    :value="commune.id || commune.display_id"
                  >
                    {{ getLocalizedName(commune) }}
                  </option>
                </select>
                <p v-if="loadingCommunes" class="text-sm text-gray-500 mt-1">
                  {{ $t('common.loading') }}...
                </p>
                <p v-else-if="!addressForm.wilaya_id" class="text-sm text-gray-500 mt-1">
                  {{ $t('profile.selectWilayaFirst') }}
                </p>
              </div>

              <!-- Street -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('profile.street') }} *
                </label>
                <input
                  v-model="addressForm.street"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  :placeholder="$t('profile.streetPlaceholder')"
                  required
                />
              </div>

              <!-- Postal Code -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('profile.postalCode') }}
                </label>
                <input
                  v-model="addressForm.postal_code"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  :placeholder="$t('profile.postalCodePlaceholder')"
                />
              </div>

              <!-- Floor (Optional) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('profile.floor') }}
                </label>
                <input
                  v-model="addressForm.floor"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  :placeholder="$t('profile.floorPlaceholder')"
                />
              </div>

            </div>
          </div>

          <!-- Password Update Section -->
          <div class="border-t-2 border-gray-200 pt-6 mt-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('profile.changePassword') }}</h3>
            <p class="text-sm text-gray-600 mb-4">{{ $t('profile.passwordInfo') }}</p>
            
            <!-- Current Password -->
            <div class="mb-4">
              <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('profile.currentPassword') }}</label>
              <input
                v-model="currentPassword"
                type="password"
                autocomplete="off"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300"
                :placeholder="$t('profile.currentPasswordPlaceholder')"
              />
              <router-link to="/forgot-password" class="text-xs text-primary hover:underline mt-1 inline-block">
                {{ $t('errors.forgotPassword') }}
              </router-link>
            </div>

            <!-- New Password -->
            <div class="mb-4">
              <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('profile.newPassword') }}</label>
              <input
                v-model="newPassword"
                type="password"
                autocomplete="new-password"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300"
                :placeholder="$t('profile.newPasswordPlaceholder')"
              />
              <p class="text-xs text-gray-500 mt-1">{{ $t('profile.passwordHelp') }}</p>
            </div>

            <!-- Confirm New Password -->
            <div class="mb-4">
              <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('profile.confirmNewPassword') }}</label>
              <input
                v-model="confirmNewPassword"
                type="password"
                autocomplete="new-password"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300"
                :placeholder="$t('profile.confirmNewPasswordPlaceholder')"
              />
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-gray-200 mt-6">
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 bg-primary text-white py-3 px-6 rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              {{ loading ? $t('profile.updating') : $t('profile.updateProfile') }}
            </button>
            
            <router-link
              to="/dashboard"
              class="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-300 font-semibold text-center"
            >
              {{ $t('common.cancel') }}
            </router-link>
          </div>
        </form>

        <!-- Message Display -->
        <div v-if="message" class="mt-6 p-4 rounded-xl text-center" :class="messageClass">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { supabase } from '../lib/supabase'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

// State
const fullName = ref('')
const email = ref('')
const phoneNumber = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const message = ref('')
const loading = ref(false)
const isError = ref(false)

// Address form state
const isEditingAddress = ref(false)
const addressData = ref(null)
const addressForm = ref({
  wilaya_id: '',
  wilaya_name: '',
  commune_id: '',
  commune_name: '',
  street: '',
  postal_code: '',
  floor: ''
})

// Maystro data
const wilayas = ref([])
const communes = ref([])
const loadingWilayas = ref(false)
const loadingCommunes = ref(false)
const storeInfo = ref({
  id: null
})

// Get current locale
const currentLocale = computed(() => route.meta?.locale || 'en')

// Helper function to get localized name for wilaya/commune
const getLocalizedName = (item) => {
  if (!item) return ''
  const locale = currentLocale.value
  if (locale === 'ar') {
    return item.name_ar || item.name_lt || item.name || ''
  } else {
    // For English or French, use name_lt
    return item.name_lt || item.name || ''
  }
}

// Computed properties
const messageClass = computed(() => {
  return isError.value 
    ? 'bg-red-100 text-red-700' 
    : 'bg-green-100 text-green-700'
})

// Fetch current profile on mount
const fetchProfile = async () => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      router.push('/')
      return
    }

    // Set email from auth user
    email.value = user.email || ''

    // Fetch existing profile from database (should exist since auto-created on signup)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, phone_num, shipping_address')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      isError.value = true
      message.value = 'Error loading profile'
      return
    }

    // Prefill the full name and phone number inputs
    fullName.value = profile.full_name || ''
    phoneNumber.value = profile.phone_num || ''
    
    // Parse shipping address if it exists
    if (profile.shipping_address) {
      try {
        addressData.value = typeof profile.shipping_address === 'string' 
          ? JSON.parse(profile.shipping_address)
          : profile.shipping_address
        
        // Pre-fill form with existing address
        addressForm.value = {
          wilaya_id: addressData.value.wilaya_id || '',
          wilaya_name: addressData.value.wilaya_name || '',
          commune_id: addressData.value.commune_id || '',
          commune_name: addressData.value.commune_name || '',
          street: addressData.value.street || '',
          postal_code: addressData.value.postal_code || '',
          floor: addressData.value.floor || ''
        }
      } catch (e) {
        console.error('Error parsing shipping address:', e)
        addressData.value = null
      }
    } else {
      addressData.value = null
    }

    // Fetch store information for wilayas/communes
    const { data: storeData } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', user.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (storeData) {
      storeInfo.value = {
        id: storeData.id
      }
    }
    
    // Clear any previous error messages
    isError.value = false
    message.value = ''
  } catch (error) {
    console.error('Error in fetchProfile:', error)
    isError.value = true
    message.value = 'Error loading profile'
  }
}

// Fetch wilayas from Maystro via backend
const fetchWilayas = async () => {
  try {
    loadingWilayas.value = true
    
    // Get current locale for language parameter
    const locale = route.meta?.locale || 'en'
    // Map locale to Maystro language codes: 'ar', 'en', 'fr'
    const language = locale === 'ar' ? 'ar' : locale === 'fr' ? 'fr' : 'en'
    
    // Get store ID from storeInfo
    const storeId = storeInfo.value?.id
    
    // Call backend endpoint
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    
    if (!token) {
      throw new Error('Not authenticated')
    }
    
    const url = new URL(`${apiUrl}/api/maystro/wilayas`)
    url.searchParams.append('language', language)
    if (storeId) {
      url.searchParams.append('storeId', storeId)
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch wilayas')
    }
    
    const result = await response.json()
    console.log('=== WILAYAS REQUEST RESPONSE ===')
    console.log('Response status:', response.status)
    console.log('Response OK:', response.ok)
    console.log('Full response:', result)
    console.log('Wilayas data:', result.data)
    console.log('Wilayas array length:', result.data?.length || 0)
    console.log('================================')
    wilayas.value = result.data || []
  } catch (err) {
    console.error('Error fetching wilayas:', err)
    wilayas.value = []
  } finally {
    loadingWilayas.value = false
  }
}

// Fetch communes when wilaya is selected via backend
const onWilayaChange = async () => {
  if (!addressForm.value.wilaya_id) {
    communes.value = []
    addressForm.value.commune_id = ''
    return
  }

  try {
    loadingCommunes.value = true
    
    const selectedWilaya = wilayas.value.find(w => (w.id || w.display_id) === parseInt(addressForm.value.wilaya_id))
    if (selectedWilaya) {
      addressForm.value.wilaya_name = getLocalizedName(selectedWilaya)
    }

    // Get current locale for language parameter
    const locale = route.meta?.locale || 'en'
    // Map locale to Maystro language codes: 'ar', 'en', 'fr'
    const language = locale === 'ar' ? 'ar' : locale === 'fr' ? 'fr' : 'en'
    
    // Get store ID from storeInfo
    const storeId = storeInfo.value?.id
    
    // Call backend endpoint
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    
    if (!token) {
      throw new Error('Not authenticated')
    }
    
    const url = new URL(`${apiUrl}/api/maystro/communes`)
    url.searchParams.append('wilayaId', addressForm.value.wilaya_id.toString())
    url.searchParams.append('language', language)
    if (storeId) {
      url.searchParams.append('storeId', storeId)
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch communes')
    }
    
    const result = await response.json()
    console.log('=== COMMUNES REQUEST RESPONSE ===')
    console.log('Response status:', response.status)
    console.log('Response OK:', response.ok)
    console.log('Full response:', result)
    console.log('Communes data:', result.data)
    console.log('Communes array length:', result.data?.length || 0)
    console.log('=================================')
    communes.value = result.data || []
    console.log('Fetched communes:', communes.value)
    addressForm.value.commune_id = '' // Reset commune selection
  } catch (err) {
    console.error('Error fetching communes:', err)
    communes.value = []
  } finally {
    loadingCommunes.value = false
  }
}

// Watch commune selection to update commune name
watch(() => addressForm.value.commune_id, (newCommuneId) => {
  if (newCommuneId) {
    const selectedCommune = communes.value.find(c => (c.id || c.display_id) === parseInt(newCommuneId))
    if (selectedCommune) {
      addressForm.value.commune_name = getLocalizedName(selectedCommune)
    }
  }
})

// Validate address form
const isAddressFormValid = computed(() => {
  return !!(
    addressForm.value.wilaya_id &&
    addressForm.value.commune_id &&
    addressForm.value.street?.trim()
  )
})

// Format address for display
const formatAddress = (address) => {
  if (!address) return ''
  const parts = []
  if (address.street) parts.push(address.street)
  if (address.commune_name) parts.push(address.commune_name)
  if (address.wilaya_name) parts.push(address.wilaya_name)
  if (address.postal_code) parts.push(address.postal_code)
  if (address.floor) parts.push(`(${address.floor})`)
  return parts.join(', ') || t('profile.notProvided')
}


// Update profile function
const updateProfile = async () => {
  try {
    loading.value = true
    message.value = ''
    isError.value = false

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user || !user.email) {
      throw new Error('Not authenticated')
    }

    // Check if user wants to update password
    const updatingPassword = currentPassword.value || newPassword.value || confirmNewPassword.value
    
    if (updatingPassword) {
      // Validate password fields
      if (!currentPassword.value || !newPassword.value || !confirmNewPassword.value) {
        isError.value = true
        message.value = 'All password fields are required'
        return
      }

      if (newPassword.value !== confirmNewPassword.value) {
        isError.value = true
        message.value = 'New passwords do not match'
        return
      }

      if (newPassword.value.length < 6) {
        isError.value = true
        message.value = 'Password must be at least 6 characters'
        return
      }

      if (currentPassword.value === newPassword.value) {
        isError.value = true
        message.value = 'New password must be different from current password'
        return
      }

      // Verify current password by attempting to sign in with it
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword.value
      })

      if (signInError) {
        isError.value = true
        message.value = 'Current password is incorrect'
        return
      }

      // Update password
      const { error: updatePasswordError } = await supabase.auth.updateUser({
        password: newPassword.value
      })

      if (updatePasswordError) {
        throw updatePasswordError
      }

      // Clear password fields after successful update
      currentPassword.value = ''
      newPassword.value = ''
      confirmNewPassword.value = ''
    }

    // Update profile - full_name, phone_num, and shipping_address fields
    // Prepare update object with only non-empty values
    const updateData = {}
    
    // Always update full_name (can be empty string)
    updateData.full_name = fullName.value || null
    
    // Update phone_num if provided
    if (phoneNumber.value && phoneNumber.value.trim() !== '') {
      updateData.phone_num = phoneNumber.value.trim()
    } else {
      updateData.phone_num = null
    }

    // Update shipping_address if address form is valid and user is editing address
    if (isEditingAddress.value && isAddressFormValid.value) {
      updateData.shipping_address = {
        wilaya_id: parseInt(addressForm.value.wilaya_id),
        wilaya_name: addressForm.value.wilaya_name,
        commune_id: parseInt(addressForm.value.commune_id),
        commune_name: addressForm.value.commune_name,
        street: addressForm.value.street.trim(),
        postal_code: addressForm.value.postal_code?.trim() || null,
        floor: addressForm.value.floor?.trim() || null
      }
      // Update local state and exit edit mode
      addressData.value = updateData.shipping_address
      isEditingAddress.value = false
    } else if (isEditingAddress.value && !isAddressFormValid.value) {
      // If editing address but form is invalid, show error
      isError.value = true
      message.value = 'Please fill in all required address fields (wilaya, commune, street)'
      return
    } else if (!isEditingAddress.value && addressData.value) {
      // If not editing but address exists, keep existing address
      updateData.shipping_address = addressData.value
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)

    if (updateError) {
      throw updateError
    }

    // Success message - ensure it's green
    isError.value = false
    const successMsg = updatingPassword 
      ? 'Profile and password updated successfully!' 
      : 'Profile updated successfully!'
    message.value = successMsg
    
    // Clear message after 5 seconds
    setTimeout(() => {
      message.value = ''
    }, 5000)

  } catch (error) {
    console.error('Error updating profile:', error)
    isError.value = true
    message.value = error.message || 'Error updating profile'
  } finally {
    loading.value = false
  }
}

// Initialize on mount
onMounted(async () => {
  await fetchProfile()
  // Fetch wilayas after profile is loaded so we have storeInfo
  await fetchWilayas()
})
</script>

