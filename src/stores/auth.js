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
  
  // Role-based access helpers
  const isAdmin = computed(() => userRole.value === 'admin')
  const isEmployee = computed(() => userRole.value === 'employee')
  const isUser = computed(() => userRole.value === 'user')
  const hasAdminAccess = computed(() => isAdmin.value)
  const hasEmployeeAccess = computed(() => isEmployee.value || isAdmin.value)

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
            role: 'user'
          })

        if (profileError) {
          console.error('Profile creation failed during signup:', profileError)
          // Profile creation failed, but don't fail the entire signup
        }
      } catch (profileInsertError) {
        console.error('Profile creation error during signup:', profileInsertError)
        // Profile creation failed, but don't fail the entire signup
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
          role: 'user'
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

  // Note: Profile updates are now handled by the useProfile composable
  // This method is kept for backward compatibility but should not be used
  const updateProfile = async (profileData) => {
    console.warn('updateProfile in auth store is deprecated. Use useProfile composable instead.')
    throw new Error('Profile updates should use the useProfile composable')
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
  // Simplified to avoid recursion - only loads basic profile info
  const loadUserWithProfile = async (authUser) => {
    try {
      console.log('Loading user profile for:', authUser.email)
      
      // Add timeout to prevent hanging
      const profilePromise = supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', authUser.id)
        .single()
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile loading timeout')), 10000)
      )
      
      const { data: profile, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ])

      console.log('Profile data:', profile, 'Error:', profileError)

      if (profileError) {
        // No profile found or error, just use auth user
        console.log('No profile found, using auth user. Error:', profileError)
        
        // If it's a "not found" error, try to create the profile
        if (profileError.code === 'PGRST116' || profileError.message?.includes('No rows found')) {
          console.log('Profile not found, attempting to create one...')
          try {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: authUser.id,
                full_name: authUser.user_metadata?.full_name || '',
                role: 'user'
              })
            
            if (insertError) {
              console.error('Failed to create profile:', insertError)
            } else {
              console.log('Profile created successfully')
              // Retry loading the profile
              const { data: newProfile } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .eq('id', authUser.id)
                .single()
              
              if (newProfile) {
                user.value = { 
                  ...authUser, 
                  full_name: newProfile.full_name,
                  role: newProfile.role
                }
                return
              }
            }
          } catch (createError) {
            console.error('Error creating profile:', createError)
          }
        }
        
        user.value = authUser
        return
      }

      if (profile) {
        // Merge profile data with auth user, keeping email from auth
        user.value = { 
          ...authUser, 
          full_name: profile.full_name,
          role: profile.role
        }
        console.log('User loaded with role:', profile.role)
      } else {
        user.value = authUser
        console.log('No profile data, using auth user')
      }
    } catch (err) {
      // Error fetching profile, just use auth user
      console.warn('Could not load profile data:', err)
      if (err.message === 'Profile loading timeout') {
        console.warn('Profile loading timed out, using auth user without profile')
      }
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
    isAdmin,
    isEmployee,
    isUser,
    hasAdminAccess,
    hasEmployeeAccess,
    
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
