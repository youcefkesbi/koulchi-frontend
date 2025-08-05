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
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/supabase'

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
        // Get the session from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }

        if (session && session.user) {
          // Update auth store with Supabase user data
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
            avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
            provider: session.user.app_metadata?.provider
          }
          
          // Update auth store with Supabase user data using reactive properties
          authStore.$patch({
            user: userData,
            token: session.access_token,
            isAuthenticated: true,
            error: null,
            returnUrl: null
          });
          
          // Store in localStorage for persistence
          localStorage.setItem('supabase.auth.token', session.access_token)
          localStorage.setItem('token', session.access_token)
          
          // Get return URL before clearing it
          const returnUrl = authStore.returnUrl || '/'
          
          setTimeout(() => {
            router.push(returnUrl)
          }, 1500)
          
        } else {
          throw new Error('No session found')
        }
        
      } catch (err) {
        console.error('OAuth callback error:', err)
        error.value = err.message || 'Authentication failed'
        authStore.$patch({ error: error.value })
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
