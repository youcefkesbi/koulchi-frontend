// stores/auth.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const error = ref(null)
  const loading = ref(false)

  const login = async (email, password) => {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (err) error.value = err.message
    else user.value = data.user
    loading.value = false
  }

  const signUp = async (email, password, metadata = {}) => {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    })
    if (err) error.value = err.message
    else user.value = data.user
    loading.value = false
  }

  const logout = async () => {
    loading.value = true
    error.value = null
    const { error: err } = await supabase.auth.signOut()
    if (err) error.value = err.message
    user.value = null
    loading.value = false
  }

  const loginWithGoogle = async () => {
    loading.value = true
    error.value = null
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    })
    if (err) error.value = err.message
    loading.value = false
  }

  const loginWithFacebook = async () => {
    loading.value = true
    error.value = null
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'facebook'
    })
    if (err) error.value = err.message
    loading.value = false
  }

  const clearError = () => {
    error.value = null
  }

  return {
    user,
    error,
    loading,
    login,
    signUp,
    logout,
    loginWithGoogle,
    loginWithFacebook,
    clearError
  }
})
