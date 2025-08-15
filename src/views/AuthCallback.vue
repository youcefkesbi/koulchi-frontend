<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div v-if="loading" class="space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h2 class="text-xl font-semibold text-gray-900">{{ $t('completing_login') }}</h2>
          <p class="text-gray-600">{{ $t('please_wait') }}</p>
        </div>
        
        <div v-else-if="error" class="space-y-4">
          <div class="text-red-500">
            <i class="fas fa-exclamation-triangle text-4xl"></i>
          </div>
          <h2 class="text-xl font-semibold text-gray-900">{{ $t('login_failed') }}</h2>
          <p class="text-red-600">{{ error }}</p>
          <button 
            @click="goHome"
            class="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            {{ $t('go_home') }}
          </button>
        </div>
        
        <div v-else class="space-y-4">
          <div class="text-green-500">
            <i class="fas fa-check-circle text-4xl"></i>
          </div>
          <h2 class="text-xl font-semibold text-gray-900">{{ $t('login_successful') }}</h2>
          <p class="text-gray-600">{{ $t('redirecting') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../lib/supabase'

export default {
  name: 'AuthCallback',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const loading = ref(true)
    const error = ref(null)

    const goHome = () => {
      router.push('/')
    }

    const handleAuthCallback = async () => {
      try {
        // Wait for Supabase to process the OAuth callback
        // Check for session multiple times with increasing delays
        let session = null
        let attempts = 0
        const maxAttempts = 10
        
        while (attempts < maxAttempts && !session) {
          await new Promise(resolve => setTimeout(resolve, 500))
          const { data } = await supabase.auth.getSession()
          session = data.session
          attempts++
          console.log(`Attempt ${attempts}: Session found:`, !!session)
        }
        
        if (session?.user) {
          console.log('OAuth login successful:', session.user.email)
          // Force refresh the auth store
          await authStore.getCurrentUser()
          // Redirect to main page after successful login
          setTimeout(() => {
            router.push('/')
          }, 1000)
        } else {
          throw new Error('No session found after OAuth callback')
        }
      } catch (err) {
        console.error('OAuth callback error:', err)
        error.value = err.message || 'Authentication failed'
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      handleAuthCallback()
    })

    return {
      loading,
      error,
      goHome
    }
  }
}
</script>
