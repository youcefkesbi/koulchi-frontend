import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { oauthConfig } from '../config/oauth'
import { getPasswordResetRedirectUrl } from '../config/environment.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const authSubscription = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userDisplayName = computed(() => user.value?.full_name || user.value?.email || 'User')
  const userEmail = computed(() => user.value?.email || '')
  const userPhotoURL = computed(() => '/user-avatar.png') // Always use default avatar
  const userRole = computed(() => user.value?.role || 'user')

  // Check if user is actually authenticated with Supabase
  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        // No valid session, clear local user state
        user.value = null
        return false
      }
      return true
    } catch (err) {
      console.error('Error checking auth status:', err)
      user.value = null
      return false
    }
  }

  const refreshAuth = async () => {
    try {
      // Force refresh the session
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error
      
      if (data.session?.user) {
        await loadUserWithProfile(data.session.user)
        return true
      } else {
        user.value = null
        return false
      }
    } catch (err) {
      console.error('Error refreshing auth:', err)
      user.value = null
      return false
    }
  }

  // Actions
  const login = async (email, password) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        // Handle specific error cases
        if (authError.message.includes('Invalid login credentials')) {
          error.value = 'Invalid email or password'
        } else if (authError.message.includes('Email not confirmed')) {
          error.value = 'Please check your email and click the confirmation link to verify your account before logging in.'
        } else {
          error.value = authError.message
        }
        throw authError
      }

      // Check if we have a valid session
      if (data.user && data.session) {
        await loadUserWithProfile(data.user)
      }

      return data
    } catch (err) {
      if (!error.value) {
        error.value = err.message
      }
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
        email: email.trim(),
        password: password,
        options: {
          data: userData // Pass user data to be stored in user_metadata
        }
      })

      if (authError) {
        if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
          error.value = 'An account with this email already exists. Please try logging in instead.'
        } else if (authError.message.includes('Invalid email')) {
          error.value = 'Please enter a valid email address.'
        } else if (authError.message.includes('Password') && authError.message.includes('short')) {
          error.value = 'Password must be at least 6 characters long.'
        } else {
          error.value = authError.message
        }
        throw authError
      }

      if (data.user) {
        // Don't set user.value yet - wait for email confirmation
        // user.value = data.user

        if (data.session) {
          // This shouldn't happen with email confirmation enabled
          // But handle it just in case
          await loadUserWithProfile(data.user)
          return { 
            user: data.user, 
            session: data.session,
            success: true,
            message: 'Account created successfully! You are now logged in.'
          }
        } else {
          // Email confirmation required
          return {
            user: data.user,
            success: true,
            emailConfirmationRequired: true,
            message: 'Account created! Please check your email to confirm your account before logging in.'
          }
        }
      } else {
        error.value = 'Failed to create user account.'
        throw new Error('No user data returned from signup')
      }
    } catch (err) {
      if (!error.value) {
        error.value = err.message || 'Failed to create account. Please try again.'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  const handleSuccessfulSignup = async (data, userData) => {
    // If signup successful and we have user data, insert into profiles table
    if (data.user && Object.keys(userData).length > 0) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: userData.full_name || 'User',
            role: 'user',
            city: userData.city || null
          })

        if (profileError) {
          // Profile creation failed silently
        }
      } catch (profileInsertError) {
        // Profile creation failed silently
      }
    }

    // With email confirmation disabled, user should be immediately authenticated
    if (data.user && data.session) {
      await loadUserWithProfile(data.user)
      return {
        ...data,
        success: true,
        message: 'Account created successfully! You are now logged in.'
      }
    }
    
    // If no session, something went wrong
    throw new Error('Account created but login failed. Please try logging in manually.')
  }

  const loginWithGoogle = async () => {
    try {
      loading.value = true
      error.value = null
      
      // Note: Supabase handles OAuth redirects internally
      // The redirectTo URL is for Supabase's internal routing, not user-facing
      // Users will see a clean OAuth flow without exposure to backend URLs
      const { data, error: authError } = await supabase.auth.signInWithOAuth(oauthConfig.google)

      if (authError) {
        error.value = authError.message
        throw authError
      }

      return data
    } catch (err) {
      // If error wasn't set above, set a generic OAuth error
      if (!error.value) {
        error.value = err.message || 'Google OAuth failed'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  const loginWithFacebook = async () => {
    try {
      loading.value = true
      error.value = null

      // Note: Supabase handles OAuth redirects internally
      // The redirectTo URL is for Supabase's internal routing, not user-facing
      // Users will see a clean OAuth flow without exposure to backend URLs
      const { data, error: authError } = await supabase.auth.signInWithOAuth(oauthConfig.facebook)

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

      // Clear the auth subscription
      if (authSubscription.value) {
        authSubscription.value.unsubscribe()
        authSubscription.value = null
      }

      // Sign out from Supabase
      const { error: authError } = await supabase.auth.signOut()
      if (authError) throw authError

      // Clear local user state
      user.value = null
      
      console.log('User logged out successfully')
    } catch (err) {
      console.error('Logout error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const cleanup = () => {
    // Clean up auth subscription when store is destroyed
    if (authSubscription.value) {
      authSubscription.value.unsubscribe()
      authSubscription.value = null
    }
  }

  const clearError = () => {
    error.value = null
  }

  const createProfileIfNotExists = async (userData = {}) => {
    if (!user.value?.id) return null

    try {
      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .maybeSingle()

      if (checkError) return null

      // Create profile if it doesn't exist
      if (!existingProfile) {
        const profileData = {
          user_id: user.value.id,
          full_name: userData.full_name || null,
          role: 'user',
          city: userData.city || null
        }

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single()

        if (createError) throw createError

        if (newProfile) {
          user.value = { ...user.value, ...newProfile }
        }
        return newProfile
      } else {
        user.value = { ...user.value, ...existingProfile }
        return existingProfile
      }
    } catch (err) {
      return null
    }
  }

  const updateProfile = async (profileData) => {
    try {
      loading.value = true
      error.value = null

      if (!user.value?.id) {
        throw new Error('No authenticated user')
      }

      const { data, error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.value.id,
          full_name: profileData.full_name,
          city: profileData.city
        })
        .select()
        .single()

      if (updateError) {
        error.value = updateError.message
        return { error: updateError.message }
      }

      // Update local user data
      if (data) {
        user.value = { ...user.value, ...data }
      }

      return { success: true, data }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update profile'
      error.value = errorMessage
      return { error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const resetPasswordForEmail = async (email) => {
    try {
      loading.value = true
      error.value = null

      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getPasswordResetRedirectUrl()
      })

      if (authError) throw authError

      return { success: true }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const resetPasswordForCurrentUser = async () => {
    try {
      loading.value = true
      error.value = null

      if (!user.value?.email) {
        throw new Error('No authenticated user email found')
      }

      const { error: authError } = await supabase.auth.resetPasswordForEmail(user.value.email, {
        redirectTo: getPasswordResetRedirectUrl()
      })

      if (authError) throw authError

      return { success: true }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePassword = async (newPassword) => {
    try {
      loading.value = true
      error.value = null

      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (authError) throw authError

      return { success: true }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const resendEmailConfirmation = async (email) => {
    try {
      loading.value = true
      error.value = null

      const { error: authError } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (authError) throw authError

      return { success: true }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Helper function to load user with profile data
  const loadUserWithProfile = async (authUser) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        user.value = authUser
        return
      }

      if (profile) {
        user.value = { ...authUser, ...profile, email: authUser.email }
      } else {
        user.value = authUser
      }
    } catch (err) {
      // Profile doesn't exist or error fetching, just use auth user
      user.value = authUser
    }
  }

  // Initialize auth state
  const initAuth = async () => {
    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        await loadUserWithProfile(session.user)
      } else {
        // No valid session, ensure user state is cleared
        user.value = null
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state change:', event, session?.user?.email)
          if (session?.user) {
            await loadUserWithProfile(session.user)
            
            // Sync local cart and wishlist to Supabase after login
            if (event === 'SIGNED_IN') {
              try {
                const { cartService } = await import('../../database/cartService.js')
                const { wishlistService } = await import('../../database/wishlistService.js')
                
                await cartService.syncLocalToSupabase()
                await wishlistService.syncLocalToSupabase()
              } catch (err) {
                console.error('Error syncing local data to Supabase:', err)
              }
            }
          } else {
            user.value = null
          }
        }
      )

      // Store the subscription for cleanup
      authSubscription.value = subscription

      return subscription
    } catch (err) {
      console.error('Auth initialization failed:', err)
      // Ensure user state is cleared on error
      user.value = null
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
    userRole,
    
    // Actions
    login,
    signUp,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    updateProfile,
    clearError,
    createProfileIfNotExists,
    resetPasswordForEmail,
    resetPasswordForCurrentUser,
    updatePassword,
    resendEmailConfirmation,
    initAuth,
    cleanup,
    checkAuthStatus,
    refreshAuth
  }
})
