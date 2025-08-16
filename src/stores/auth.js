import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userDisplayName = computed(() => user.value?.user_metadata?.full_name || user.value?.email || 'User')
  const userEmail = computed(() => user.value?.email || '')
  const userPhotoURL = computed(() => user.value?.user_metadata?.avatar_url || null)

  // Actions
  const login = async (email, password) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError

      user.value = data.user
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const signUp = async (email, password, userData = {}) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (authError) throw authError

      user.value = data.user
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const loginWithGoogle = async () => {
    try {
      console.log('=== GOOGLE OAUTH START ===')
      console.log('Starting Google OAuth login...')
      console.log('Method called at:', new Date().toISOString())
      loading.value = true
      error.value = null

      console.log('About to call supabase.auth.signInWithOAuth...')
      console.log('Supabase client:', supabase)
      console.log('Supabase URL:', supabase.supabaseUrl)
      console.log('Current window location:', window.location.href)
      
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000', // or your prod domain later
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      console.log('supabase.auth.signInWithOAuth completed')

      console.log('Google OAuth response:', { data, error: authError })

      if (authError) throw authError

      return data
    } catch (err) {
      console.error('Google OAuth error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const loginWithFacebook = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: 'http://localhost:3000', // or your prod domain later
          queryParams: {
            scope: 'email,public_profile'
          }
        }
      })

      if (authError) throw authError

      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      loading.value = true
      error.value = null

      const { error: authError } = await supabase.auth.signOut()
      if (authError) throw authError

      user.value = null
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getCurrentUser = async () => {
    try {
      loading.value = true
      error.value = null

      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError

      user.value = currentUser
      return currentUser
    } catch (err) {
      error.value = err.message
      user.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (profileData) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase.auth.updateUser({
        data: profileData
      })

      if (updateError) throw updateError

      // Update local user data
      if (data.user) {
        user.value = data.user
      }

      return { data, error: null }
    } catch (err) {
      error.value = err.message
      return { data: null, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Initialize auth state
  const initAuth = async () => {
    try {
      console.log('Initializing auth store...')
      
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Initial session check:', session)
      
      if (session?.user) {
        user.value = session.user
        console.log('Initial session found:', session.user.email)
        console.log('User value set to:', user.value?.email)
      } else {
        console.log('No initial session found')
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state change:', event, session?.user?.email)
          console.log('Session data:', session)
          console.log('Current user.value before update:', user.value?.email)
          
          user.value = session?.user || null
          console.log('Current user.value after update:', user.value?.email)
          console.log('isAuthenticated computed value:', !!user.value)
          
          // If we get a SIGNED_IN event, also try to get the current user
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('User signed in, updating local state')
            try {
              const { data: { user: currentUser } } = await supabase.auth.getUser()
              if (currentUser) {
                user.value = currentUser
                console.log('Local user state updated:', currentUser.email)
              }
            } catch (err) {
              console.error('Error getting current user:', err)
            }
          }
        }
      )

      console.log('Auth store initialization complete')
      return subscription
    } catch (err) {
      console.error('Error initializing auth:', err)
    }
  }

  return {
    // State
    user,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    userDisplayName,
    userEmail,
    userPhotoURL,
    
    // Actions
    login,
    signUp,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    getCurrentUser,
    updateProfile,
    clearError,
    initAuth
  }
})
