<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Page Header -->
      <div class="mb-8 text-center">
        <h1 class="text-4xl font-bold text-dark mb-4">{{ $t('profile.title') }}</h1>
        <p class="text-gray-600 text-lg">{{ $t('profile.subtitle') }}</p>
      </div>

      <!-- Profile Form -->
      <div class="bg-white rounded-3xl shadow-soft p-8">
        <form @submit.prevent="handleUpdateProfile" class="space-y-6">
          <!-- Personal Information Section -->
          <div class="border-b border-gray-200 pb-6">
            <h2 class="text-2xl font-bold text-dark mb-6">{{ $t('profile.personalInfo') }}</h2>
            
            <div class="grid grid-cols-1 gap-6">
              <!-- Full Name -->
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('profile.fullName') }}</label>
                <input
                  v-model="profileForm.fullName"
                  type="text"
                  required
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300"
                  :placeholder="$t('profile.fullNamePlaceholder')"
                />
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 pt-6">
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

        <!-- Success/Error Messages -->
        <div v-if="successMessage" class="mt-6 p-4 bg-green-100 text-green-700 rounded-xl text-center">
          {{ successMessage }}
        </div>
        
        <div v-if="errorMessage" class="mt-6 p-4 bg-red-100 text-red-700 rounded-xl text-center">
          {{ errorMessage }}
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="mt-6 p-4 bg-blue-100 text-blue-700 rounded-xl text-center">
          <i class="fas fa-spinner fa-spin mr-2"></i>
          Updating profile...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useProfile } from '../composables/useProfile'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const { getProfile, updateProfile, loading, error, success, clearStates } = useProfile()

const successMessage = ref('')
const errorMessage = ref('')

const profileForm = reactive({
  fullName: ''
})

// Load user profile data
const loadProfile = async () => {
  try {
    clearStates()
    
    if (authStore.user) {
      // Try to get profile from database first
      const profile = await getProfile()
      
      if (profile) {
        profileForm.fullName = profile.full_name || ''
      } else {
        // Fallback to auth store data
        profileForm.fullName = authStore.user.full_name || ''
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error)
    errorMessage.value = 'Error loading profile data'
  }
}

// Update profile
const handleUpdateProfile = async () => {
  try {
    clearStates()
    successMessage.value = ''
    errorMessage.value = ''

    const result = await updateProfile({
      full_name: profileForm.fullName
    })

    if (result) {
      successMessage.value = 'Profile updated successfully!'
      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    errorMessage.value = error.message || 'Error updating profile'
    // Ensure loading state is reset on error
    clearStates()
  }
}

// Watch for errors from the composable
watch(error, (newError) => {
  if (newError) {
    errorMessage.value = newError
  }
})

// Watch for success from the composable
watch(success, (newSuccess) => {
  if (newSuccess) {
    successMessage.value = 'Profile updated successfully!'
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  }
})

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/')
    return
  }
  loadProfile()
})
</script>

