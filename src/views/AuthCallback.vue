<template>
  <div class="min-h-screen bg-gradient-to-br from-light-gray to-white flex items-center justify-center">
    <div class="max-w-md w-full mx-auto">
      <div class="bg-white rounded-3xl shadow-soft p-8 text-center">
        <!-- Loading State -->
        <div v-if="loading" class="space-y-4">
          <div class="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-spinner fa-spin text-white text-2xl"></i>
          </div>
          <h2 class="text-2xl font-bold text-dark">{{ $t('completing_login') }}</h2>
          <p class="text-gray-600">{{ $t('please_wait') }}</p>
          <!-- Additional user-friendly message -->
          <p class="text-sm text-gray-500 mt-2">
            Completing your login with {{ oauthProvider }}
          </p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="space-y-4">
          <div class="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-exclamation-triangle text-white text-2xl"></i>
          </div>
          <h2 class="text-2xl font-bold text-red-600">{{ $t('login_failed') }}</h2>
          <p class="text-gray-600">{{ getUserFriendlyErrorMessage(error) }}</p>
          <router-link 
            to="/" 
            class="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all duration-300"
          >
            <i class="fas fa-home mr-2"></i>
            {{ $t('common.goHome') }}
          </router-link>
        </div>

        <!-- Success State -->
        <div v-else class="space-y-4">
          <div class="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-check text-white text-2xl"></i>
          </div>
          <h2 class="text-2xl font-bold text-green-600">{{ $t('login_successful') }}</h2>
          <p class="text-gray-600">{{ $t('redirecting') }}</p>
          <!-- Additional user-friendly message -->
          <p class="text-sm text-gray-500 mt-2">
            Welcome to Koulchi! Redirecting you to your dashboard...
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../lib/supabase'
import { oauthProviderNames, oauthErrorMessages } from '../config/oauth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const loading = ref(true)
const error = ref(null)
const oauthProvider = ref('your account')

onMounted(async () => {
  try {
    // Get the current session after OAuth redirect
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      throw sessionError
    }

    if (session?.user) {
      // User is authenticated, the auth store will handle loading profile data automatically
      
      // Determine OAuth provider for user-friendly messaging
      const provider = session.user.app_metadata?.provider || 'your account'
      oauthProvider.value = oauthProviderNames[provider] || 'your account'
      
      // Create profile if it doesn't exist (for new OAuth users)
      const oauthData = session.user.user_metadata || {}
      await authStore.createProfileIfNotExists(oauthData)
      
      loading.value = false
      
      // Redirect to home page after successful authentication
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else {
      throw new Error('No session found after OAuth callback')
    }
  } catch (err) {
    console.error('OAuth callback error:', err)
    error.value = err.message || 'Authentication failed'
    loading.value = false
  }
})

// Convert technical error messages to user-friendly ones
const getUserFriendlyErrorMessage = (errorMessage) => {
  if (!errorMessage) return 'An unexpected error occurred'
  
  const message = errorMessage.toLowerCase()
  
  if (message.includes('network') || message.includes('fetch')) {
    return oauthErrorMessages.network
  }
  
  if (message.includes('timeout')) {
    return oauthErrorMessages.timeout
  }
  
  if (message.includes('cancelled')) {
    return oauthErrorMessages.cancelled
  }
  
  if (message.includes('oauth')) {
    return oauthErrorMessages.oauth
  }
  
  // Return a generic but friendly message for technical errors
  return oauthErrorMessages.default
}
</script>
