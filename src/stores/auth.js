import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const sellerProfile = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const userDisplayName = computed(() => user.value?.user_metadata?.full_name || user.value?.email || '')
  const userEmail = computed(() => user.value?.email || '')
  const userPhotoURL = computed(() => user.value?.user_metadata?.avatar_url || '')
  const isSeller = computed(() => !!sellerProfile.value)

  // Initialize auth state listener
  const initAuth = () => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      user.value = session?.user ?? null
      loading.value = false
      if (session?.user) {
        fetchSellerProfile()
      }
    })

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user ?? null
      loading.value = false
      if (session?.user) {
        fetchSellerProfile()
      } else {
        sellerProfile.value = null
      }
    })
  }

  // Fetch seller profile
  const fetchSellerProfile = async () => {
    if (!user.value) return

    try {
      const { data, error: fetchError } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('user_id', user.value.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching seller profile:', fetchError)
      } else {
        sellerProfile.value = data
      }
    } catch (err) {
      console.error('Error fetching seller profile:', err)
    }
  }

  // Create seller profile
  const createSellerProfile = async (sellerData) => {
    if (!user.value) throw new Error('User not authenticated')

    try {
      loading.value = true
      error.value = null

      const { data, error: createError } = await supabase
        .from('seller_profiles')
        .insert({
          user_id: user.value.id,
          business_name: sellerData.businessName,
          phone: sellerData.phone,
          city: sellerData.city,
          status: 'active' // Set to active immediately, no confirmation needed
        })
        .select()
        .single()

      if (createError) throw createError

      sellerProfile.value = data
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error creating seller profile:', err)
      throw err
    } finally {
      loading.value = false
    }
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

  // Signup
  const signup = async ({ username, email, password, confirmPassword }) => {
    if (password !== confirmPassword) {
      error.value = "Passwords do not match."
      return
    }
    try {
      loading.value = true
      error.value = null
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: username
          }
        }
      })
      if (signUpError) throw signUpError
      user.value = data.user
      // Optionally, you can send a confirmation email or handle post-signup logic here
      return data
    } catch (err) {
      error.value = err.message
      console.error('Signup error:', err)
      throw err
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
    sellerProfile,
    isAuthenticated,
    userDisplayName,
    userEmail,
    userPhotoURL,
    isSeller,
    initAuth,
    fetchSellerProfile,
    createSellerProfile,
    loginWithGoogle,
    loginWithFacebook,
    signup,
    logout,
    clearError
  }
}) 