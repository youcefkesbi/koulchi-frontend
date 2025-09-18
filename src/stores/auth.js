import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { oauthConfig } from '../config/oauth'
import { getPasswordResetRedirectUrl } from '../config/environment.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const profileLoading = ref(false)
  const error = ref(null)
  const authSubscription = ref(null)

  // Persistence configuration
  const persist = {
    paths: ['user'] // Only persist the user object
  }

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userDisplayName = computed(() => {
    if (!user.value) return 'User'
    
    // Try different sources for the full name
    const fullName = user.value?.full_name || 
                    user.value?.user_metadata?.full_name || 
                    user.value?.raw_user_meta_data?.full_name
    
    return fullName || user.value?.email || 'User'
  })
  const userEmail = computed(() => user.value?.email || '')
  const userPhotoURL = computed(() => '/user-avatar.png') // Always use default avatar
  const userRole = computed(() => {
    const role = user.value?.role || 'customer'
    // Normalize role to lowercase for case-insensitive comparison
    return role?.toLowerCase() || 'customer'
  })
  
  // Role-based access helpers
  const isAdmin = computed(() => userRole.value === 'admin')
  const isEmployee = computed(() => userRole.value === 'employee')
  const isCustomer = computed(() => userRole.value === 'customer')
  const isVendor = computed(() => userRole.value === 'vendor')
  const hasAdminAccess = computed(() => isAdmin.value)
  const hasEmployeeAccess = computed(() => isEmployee.value || isAdmin.value)
  const hasVendorAccess = computed(() => isVendor.value || isAdmin.value)

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

  // Manual profile refresh for debugging
  const refreshProfile = async () => {
    if (!user.value?.id) {
      console.warn('No user ID available for profile refresh')
      return false
    }
    
    try {
      console.log('🔄 Manually refreshing profile for user:', user.value.id)
      await loadUserWithProfile(user.value)
      return true
    } catch (err) {
      console.error('Error refreshing profile:', err)
      return false
    }
  }

  // Force role refresh from Supabase
  const forceRoleRefresh = async () => {
    try {
      console.log('🔄 Force refreshing role from Supabase...')
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        console.warn('No active session for role refresh')
        return false
      }

      // Force fresh profile query
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, role, city')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        console.error('Error fetching fresh profile:', profileError)
        return false
      }

      if (profile) {
        // Update user with fresh role data
        user.value = {
          ...user.value,
          role: profile.role?.toLowerCase() || 'customer'
        }
        console.log('✅ Role refreshed from Supabase:', profile.role)
        return true
      }

      return false
    } catch (err) {
      console.error('Error force refreshing role:', err)
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
            role: 'customer'
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
          role: 'customer'
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
      profileLoading.value = true
      console.log('Loading user profile for:', authUser.email)
      console.log('User ID:', authUser.id)
      
      // Try to load profile with timeout
      console.log('Starting profile query...')
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile loading timeout after 5 seconds')), 5000)
      )
      
      // Create the profile query promise
      const profilePromise = supabase
        .from('profiles')
        .select('id, full_name, role, city')
        .eq('id', authUser.id)
        .single()
      
      // Race between the query and timeout
      const { data: profile, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ])

      console.log('Profile query completed. Data:', profile, 'Error:', profileError)

      if (profileError) {
        // No profile found or error, just use auth user
        console.log('Profile error:', profileError)
        console.log('Using auth user without profile data')
        user.value = authUser
        return
      }

      if (profile) {
        // Merge profile data with auth user, keeping email from auth
        user.value = { 
          ...authUser, 
          full_name: profile.full_name || authUser.user_metadata?.full_name || authUser.raw_user_meta_data?.full_name,
          role: profile.role?.toLowerCase() || 'customer' // Normalize role to lowercase
        }
        console.log('✅ User loaded with role:', profile.role, '-> normalized to:', user.value.role, 'and full_name:', user.value.full_name)
      } else {
        // No profile found, use auth user with full name from metadata
        user.value = {
          ...authUser,
          full_name: authUser.user_metadata?.full_name || authUser.raw_user_meta_data?.full_name,
          role: 'customer' // Default role when no profile found
        }
        console.log('⚠️ No profile data, using auth user with default role "customer" and full_name:', user.value.full_name)
      }
    } catch (err) {
      // Error fetching profile, just use auth user
      console.warn('Could not load profile data:', err)
      if (err.message.includes('timeout')) {
        console.warn('Profile loading timed out, using auth user without profile')
      }
      console.log('Setting user to auth user due to error')
      user.value = {
        ...authUser,
        full_name: authUser.user_metadata?.full_name || authUser.raw_user_meta_data?.full_name,
        role: 'customer' // Default role when profile loading fails
      }
    } finally {
      profileLoading.value = false
    }
  }

  // Initialize auth state
  const initAuth = async () => {
    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Always reload profile from Supabase to ensure fresh role data
        console.log('🔄 Initializing auth with fresh profile data...')
        await loadUserWithProfile(session.user)
        
        // Double-check role loading after a short delay
        setTimeout(async () => {
          if (user.value && (!user.value.role || user.value.role === 'customer')) {
            console.log('🔄 Double-checking role loading...')
            await loadUserWithProfile(session.user)
          }
        }, 1000)
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
    profileLoading,
    error,
    persist,
    
    // Getters
    isAuthenticated,
    userDisplayName,
    userEmail,
    userPhotoURL,
    userRole,
    isAdmin,
    isEmployee,
    isCustomer,
    isVendor,
    hasAdminAccess,
    hasEmployeeAccess,
    hasVendorAccess,
    
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
    refreshAuth,
    refreshProfile,
    forceRoleRefresh
  }
})
