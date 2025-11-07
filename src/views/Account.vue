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
              <a href="/reset-password" class="text-xs text-primary hover:underline mt-1 inline-block">
                {{ $t('errors.forgotPassword') }}
              </a>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

// State
const fullName = ref('')
const email = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const message = ref('')
const loading = ref(false)
const isError = ref(false)

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
      .select('full_name')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      isError.value = true
      message.value = 'Error loading profile'
      return
    }

    // Prefill the full name input
    fullName.value = profile.full_name || ''
  } catch (error) {
    console.error('Error in fetchProfile:', error)
    isError.value = true
    message.value = 'Error loading profile'
  }
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

    // Update profile - full_name field
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        full_name: fullName.value 
      })
      .eq('id', user.id)

    if (updateError) {
      throw updateError
    }

    // Success message
    const successMsg = updatingPassword 
      ? 'Profile and password updated successfully!' 
      : 'Profile updated successfully!'
    message.value = successMsg
    
    // Clear message after 3 seconds
    setTimeout(() => {
      message.value = ''
    }, 3000)

  } catch (error) {
    console.error('Error updating profile:', error)
    isError.value = true
    message.value = error.message || 'Error updating profile'
  } finally {
    loading.value = false
  }
}

// Initialize on mount
onMounted(() => {
  fetchProfile()
})
</script>

