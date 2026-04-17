<template>
  <div class="min-h-screen bg-linear-to-br from-light-gray to-white flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
          <i class="fas fa-lock text-white text-2xl"></i>
        </div>
        <h1 class="text-3xl font-bold text-dark mb-2">{{ t('resetPassword') }}</h1>
        <p class="text-gray-600">{{ t('enterNewPassword') }}</p>
      </div>

      <!-- Reset Password Form -->
      <div class="bg-white rounded-2xl shadow-soft p-8">
        <!-- Session Check Loading -->
        <div v-if="checkingSession" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-primary text-2xl mb-3"></i>
          <p class="text-gray-600">{{ t('please_wait') }}</p>
        </div>

        <!-- Invalid/Expired Link -->
        <div v-else-if="sessionError" class="space-y-4">
          <div class="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            <div class="flex items-start space-x-3 space-x-reverse">
              <i class="fas fa-exclamation-triangle text-red-600 mt-0.5 shrink-0"></i>
              <div class="flex-1">
                <p class="text-red-700 text-sm">{{ sessionError }}</p>
              </div>
            </div>
          </div>
          <router-link
            to="/forgot-password"
            class="block w-full text-center bg-primary text-white py-3 rounded-xl hover:bg-primary-dark transition-all duration-300 font-semibold"
          >
            {{ t('errors.forgotPassword') }}
          </router-link>
        </div>

        <!-- Active Recovery Session -->
        <form v-else @submit.prevent="handleResetPassword" class="space-y-6" novalidate>
          <!-- New Password -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">{{ t('newPassword') }}</label>
            <div class="relative">
              <input 
                v-model="form.newPassword" 
                :type="showNewPassword ? 'text' : 'password'" 
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300" 
                :placeholder="t('newPasswordPlaceholder')"
              />
              <button
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">{{ t('confirmPassword') }}</label>
            <div class="relative">
              <input 
                v-model="form.confirmPassword" 
                :type="showConfirmPassword ? 'text' : 'password'" 
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300" 
                :placeholder="t('confirmPasswordPlaceholder')"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            <div class="flex items-start space-x-3 space-x-reverse">
              <i class="fas fa-exclamation-triangle text-red-600 mt-0.5 shrink-0"></i>
              <div class="flex-1">
                <p class="text-red-700 text-sm">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
            <div class="flex items-start space-x-3 space-x-reverse">
              <i class="fas fa-check-circle text-green-600 mt-0.5 shrink-0"></i>
              <div class="flex-1">
                <p class="text-green-700 text-sm">{{ successMessage }}</p>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            :disabled="loading || !isFormValid"
            class="w-full bg-primary text-white py-3 rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
            {{ loading ? t('updating') : t('updatePassword') }}
          </button>

          <!-- Back to Login -->
          <div class="text-center">
            <router-link to="/" class="text-primary hover:text-primary-dark underline text-sm transition-colors">
              {{ t('backToHome') }}
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleRouter } from '../composables/useLocaleRouter'
import { supabase } from '../lib/supabase'

const { t } = useI18n()
const { navigateToPath } = useLocaleRouter()

const loading = ref(false)
const error = ref('')
const successMessage = ref('')
const checkingSession = ref(true)
const sessionError = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  newPassword: '',
  confirmPassword: ''
})

const invalidLinkMessage = () => {
  const translated = t('resetLinkInvalid')
  return translated === 'resetLinkInvalid'
    ? 'Reset link is invalid or expired.'
    : translated
}

// Form validation
const isFormValid = computed(() => {
  return form.newPassword &&
         form.confirmPassword &&
         form.newPassword === form.confirmPassword &&
         form.newPassword.length >= 6
})

const ensureRecoverySession = async () => {
  checkingSession.value = true
  sessionError.value = ''

  try {
    let session = null

    // Supabase may need a brief time to hydrate the recovery session from URL hash.
    for (let i = 0; i < 12; i++) {
      const { data, error: sessionFetchError } = await supabase.auth.getSession()
      if (sessionFetchError) throw sessionFetchError
      if (data?.session?.user) {
        session = data.session
        break
      }
      await new Promise(resolve => setTimeout(resolve, 250))
    }

    if (!session?.user) {
      sessionError.value = invalidLinkMessage()
    }
  } catch (err) {
    console.error('Reset password session error:', err)
    sessionError.value = invalidLinkMessage()
  } finally {
    checkingSession.value = false
  }
}

const handleResetPassword = async () => {
  try {
    loading.value = true
    error.value = ''
    successMessage.value = ''

    if (checkingSession.value || sessionError.value) {
      error.value = invalidLinkMessage()
      return
    }

    // Validate passwords match
    if (form.newPassword !== form.confirmPassword) {
      error.value = t('passwordsDoNotMatch')
      return
    }

    // Validate password length
    if (form.newPassword.length < 6) {
      error.value = t('passwordTooShort')
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: form.newPassword
    })

    if (updateError) throw updateError

    successMessage.value = t('passwordUpdatedSuccessfully')

    setTimeout(() => {
      navigateToPath('/login')
    }, 1500)
  } catch (err) {
    error.value = err.message || t('passwordUpdateFailed')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  ensureRecoverySession()
})
</script>

<style scoped>
/* Custom styles for the reset password page */
</style>
