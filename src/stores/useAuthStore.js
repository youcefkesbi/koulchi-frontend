import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, verifySupabaseAuth } from '../lib/supabase'
import { oauthConfig } from '../config/oauth'
import { getPasswordResetRedirectUrl } from '../config/environment.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const profileLoading = ref(false)
  const error = ref(null)
  const authSubscription = ref(null)

  // Persistence configuration - enhanced for better session management
  const persist = {
    paths: ['user'], // Only persist the user object
    storage: localStorage, // Use localStorage for persistence
    beforeRestore: (context) => {
      // Restoring auth state from localStorage
    },
    afterRestore: (context) => {
      // Auth state restored from localStorage
    }
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
    // Handle both single role (string) and multiple roles (array)
    if (Array.isArray(role)) {
      return role.map(r => r?.toLowerCase() || 'customer')
    }
    // Normalize role to lowercase for case-insensitive comparison
    return role?.toLowerCase() || 'customer'
  })
  
  // Role-based access helpers
  const isAdmin = computed(() => {
    const roles = Array.isArray(userRole.value) ? userRole.value : [userRole.value]
    return roles.includes('admin')
  })
  const isEmployee = computed(() => {
    const roles = Array.isArray(userRole.value) ? userRole.value : [userRole.value]
    return roles.includes('employee')
  })
  const isCustomer = computed(() => {
    const roles = Array.isArray(userRole.value) ? userRole.value : [userRole.value]
    return roles.includes('customer')
  })
  const isVendor = computed(() => {
    const roles = Array.isArray(userRole.value) ? userRole.value : [userRole.value]
    return roles.includes('vendor')
  })
  const hasAdminAccess = computed(() => isAdmin.value)
  const hasEmployeeAccess = computed(() => isEmployee.value || isAdmin.value)
  const hasVendorAccess = computed(() => isVendor.value || isAdmin.value)

  // Check if user is actually authenticated with Supabase
  // Enhanced for new Supabase publishable key system
  const checkAuthStatus = async () => {
    try {
      // Get current session with automatic refresh handling
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Session error:', error)
        user.value = null
        return false
      }
      
      if (!session?.user) {
        // No valid session, clear local user state
        user.value = null
        return false
      }
      
      // Verify session is still valid (not expired)
      const now = Math.floor(Date.now() / 1000)
      if (session.expires_at && session.expires_at < now) {
        // Session expired, attempting refresh
        const refreshed = await refreshAuth()
        return refreshed
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
      await loadUserWithProfile(user.value)
      return true
    } catch (err) {
      console.error('Error refreshing profile:', err)
      return false
    }
  }

  // Force role refresh from Supabase (consistent with loadUserWithProfile)
  const forceRoleRefresh = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        console.warn('No active session for role refresh')
        return false
      }

      // Query profile with roles relation
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          city,
          user_roles(role)
        `)
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        console.error('Error fetching fresh profile with roles:', profileError)
        return false
      }

      if (profile) {
        // Collect all roles from user_roles relation
        const roles = profile.user_roles?.map(ur => ur.role?.toLowerCase()) || ['customer']
        const userRoles = roles.length > 0 ? roles : ['customer']
        
        user.value = {
          ...user.value,
          full_name: profile.full_name || user.value?.full_name,
          city: profile.city,
          role: userRoles
        }
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

    // Timeout promise (5s safeguard)
    const timeoutPromise = new Promise((resolve) =>
  setTimeout(() => resolve({ data: null, error: new Error('Profile loading timeout after 5 seconds') }), 5000)
)

    // Profile + role query
    const profilePromise = supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        city,
        user_roles(role)
      `)
      .eq('id', authUser.id)
      .single()

    // Race query vs timeout
    const { data: profile, error: profileError } = await Promise.race([
  profilePromise,
  timeoutPromise
])


    if (profileError) {
      user.value = authUser
      return
    }

    if (profile) {
      // Collect all roles from user_roles relation
      const roles = profile.user_roles?.map(ur => ur.role?.toLowerCase()) || ['customer']
      // If no roles found, default to customer
      const userRoles = roles.length > 0 ? roles : ['customer']

      user.value = {
        ...authUser,
        full_name:
          profile.full_name ||
          authUser.user_metadata?.full_name ||
          authUser.raw_user_meta_data?.full_name,
        city: profile.city,
        role: userRoles
      }
    } else {
      // No profile found
      user.value = {
        ...authUser,
        full_name:
          authUser.user_metadata?.full_name ||
          authUser.raw_user_meta_data?.full_name,
        role: ['customer']
      }
    }
  } catch (err) {
    console.warn('Could not load profile data:', err)
    if (err.message.includes('timeout')) {
      console.warn('Profile loading timed out, using auth user without profile')
    }
    user.value = {
      ...authUser,
      full_name:
        authUser.user_metadata?.full_name || authUser.raw_user_meta_data?.full_name,
      role: ['customer']
    }
  } finally {
    profileLoading.value = false
  }
}

  // Initialize auth state with enhanced session persistence
  // Compatible with new Supabase publishable key system
  const initAuth = async () => {
    try {
      // Initializing authentication system
      
      // Verify Supabase client is properly initialized with auth
      const isAuthReady = await verifySupabaseAuth()
      if (!isAuthReady) {
        console.warn('⚠️ Supabase auth not ready, some features may not work')
      }

      // Get initial session with enhanced error handling
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('❌ Session error during initialization:', sessionError)
        user.value = null
        return null
      }
      
      if (session?.user) {
        // Found existing session, loading user profile
        await loadUserWithProfile(session.user)

        // Double-check role after a short delay for reliability
        setTimeout(async () => {
          if (user.value && (!user.value.role || user.value.role === 'customer')) {
            // Re-validating user role
            await loadUserWithProfile(session.user)
          }
        }, 1000)
      } else {
        // No existing session found
        user.value = null
      }

      // Set up auth state change listener with enhanced handling
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          // Auth state change: ${event}
          
          if (newSession?.user) {
            await loadUserWithProfile(newSession.user)

            if (event === 'SIGNED_IN') {
              // User signed in, initializing user data
              try {
                // Initialize cart and wishlist stores after login
                const { useCartStore } = await import('./useCartStore.js')
                const { useWishlistStore } = await import('./useWishlistStore.js')
                
                const cartStore = useCartStore()
                const wishlistStore = useWishlistStore()
                
                // Fetch user's cart and wishlist data
                // After login
                await cartStore.fetchCart() // ensures the cart exists

                await Promise.all([
                  cartStore.fetchCartItems(), // fetch items for that cart
                  wishlistStore.fetchWishlist() // independent call
                ])
                // User data initialized successfully
              } catch (err) {
                console.error('❌ Error initializing stores after login:', err)
              }
            } else if (event === 'TOKEN_REFRESHED') {
              // Token refreshed successfully
            }
          } else {
            // User signed out or session expired
            user.value = null
          }
        }
      )

      // Save subscription for cleanup
      authSubscription.value = subscription
      // Authentication system initialized successfully
      return subscription
    } catch (err) {
      console.error('❌ Auth initialization failed:', err)
      user.value = null
      return null
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
    forceRoleRefresh,
    loadUserWithProfile
  }
})
