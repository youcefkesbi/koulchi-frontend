import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const error = ref(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  // Initialize session on app load
  const initAuth = async () => {
    const { data, error: sessionError } = await supabase.auth.getSession()
    if (data.session) {
      user.value = data.session.user
    }
    if (sessionError) {
      error.value = sessionError.message
    }
  }

  const loginWithGoogle = async () => {
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    })
    if (signInError) error.value = signInError.message
  }

  const loginWithFacebook = async () => {
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'facebook'
    })
    if (signInError) error.value = signInError.message
  }

  const loginWithEmail = async (email, password) => {
    loading.value = true
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) {
      error.value = loginError.message
    } else {
      user.value = data.user
    }
    loading.value = false
  }

  const signupWithEmail = async (email, password) => {
    loading.value = true
    const { data, error: signupError } = await supabase.auth.signUp({ email, password })
    if (signupError) {
      error.value = signupError.message
    } else {
      user.value = data.user
    }
    loading.value = false
  }

  const logout = async () => {
    await supabase.auth.signOut()
    user.value = null
  }

  return {
    user,
    isAuthenticated,
    error,
    loading,
    initAuth,
    loginWithGoogle,
    loginWithFacebook,
    loginWithEmail,
    signupWithEmail,
    logout
  }
})
