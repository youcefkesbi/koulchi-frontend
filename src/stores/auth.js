import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const userDisplayName = computed(() => user.value?.user_metadata?.full_name || user.value?.email || '')
  const userEmail = computed(() => user.value?.email || '')
  const userPhotoURL = computed(() => user.value?.user_metadata?.avatar_url || '')

  // Initialize auth state listener
  const initAuth = () => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      user.value = session?.user ?? null
      loading.value = false
    })

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user ?? null
      loading.value = false
    })
  }

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      loading.value = true
      error.value = null
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      
      if (authError) throw authError
    } catch (err) {
      error.value = err.message
      console.error('Google login error:', err)
    } finally {
      loading.value = false
    }
  }

  // Login with Facebook
  const loginWithFacebook = async () => {
    try {
      loading.value = true
      error.value = null
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: window.location.origin
        }
      })
      
      if (authError) throw authError
    } catch (err) {
      error.value = err.message
      console.error('Facebook login error:', err)
    } finally {
      loading.value = false
    }
  }

  // Logout
  const logout = async () => {
    try {
      loading.value = true
      error.value = null
      const { error: authError } = await supabase.auth.signOut()
      
      if (authError) throw authError
    } catch (err) {
      error.value = err.message
      console.error('Logout error:', err)
    } finally {
      loading.value = false
    }
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    userDisplayName,
    userEmail,
    userPhotoURL,
    initAuth,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    clearError
  }
}) 