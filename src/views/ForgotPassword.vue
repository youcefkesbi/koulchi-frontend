<template>
  <div class="min-h-screen bg-linear-to-br from-light-gray to-white flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
          <i class="fas fa-unlock-alt text-white text-2xl"></i>
        </div>
        <h1 class="text-3xl font-bold text-dark mb-2">{{ t('resetPassword') }}</h1>
        <p class="text-gray-600">{{ t('enterEmailForReset') }}</p>
      </div>

      <div class="bg-white rounded-2xl shadow-soft p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6" novalidate>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">{{ t('email') }}</label>
            <input
              v-model.trim="email"
              type="email"
              required
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300"
              :placeholder="t('emailPlaceholder')"
            />
          </div>

          <div v-if="error" class="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            <div class="flex items-start space-x-3 space-x-reverse">
              <i class="fas fa-exclamation-triangle text-red-600 mt-0.5 shrink-0"></i>
              <p class="text-red-700 text-sm">{{ error }}</p>
            </div>
          </div>

          <div v-if="successMessage" class="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
            <div class="flex items-start space-x-3 space-x-reverse">
              <i class="fas fa-check-circle text-green-600 mt-0.5 shrink-0"></i>
              <p class="text-green-700 text-sm">{{ successMessage }}</p>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading || !email"
            class="w-full bg-primary text-white py-3 rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
            {{ loading ? t('common.loading') : t('resetPassword') }}
          </button>

          <div class="text-center">
            <router-link to="/login" class="text-primary hover:text-primary-dark underline text-sm transition-colors">
              {{ t('login') }}
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/useAuthStore'

const { t } = useI18n()
const authStore = useAuthStore()

const email = ref('')
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''
    successMessage.value = ''

    if (!email.value) {
      error.value = t('emailRequired')
      return
    }

    await authStore.resetPasswordForEmail(email.value)
    successMessage.value = t('resetPasswordSent')
  } catch (err) {
    error.value = err?.message || t('passwordUpdateFailed')
  } finally {
    loading.value = false
  }
}
</script>
