import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userDisplayName = computed(() => user.value?.full_name || user.value?.email || 'User')
  const userEmail = computed(() => user.value?.email || '')
  const userPhotoURL = computed(() => '/src/assets/user-avatar.png') // Always use default avatar
  const userRole = computed(() => user.value?.role || 'user')
  const isAdmin = computed(() => user.value?.role === 'admin')

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
        } else {
          error.value = authError.message
        }
        throw authError
      }

      // Check if we have a valid session
      if (data.user && data.session) {
        await loadUserWithProfile(data.user)
      } else {
        console.warn('Login successful but no session established')
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

      console.log('🔄 Starting minimal signup process for:', email)

      // Try the most basic signup possible - no options, no metadata
      const signupRequest = {
        email: email.trim(),
        password: password
      }

      console.log('📤 Sending request to Supabase:', signupRequest)

      const { data, error: authError } = await supabase.auth.signUp(signupRequest)

      console.log('📥 Raw Supabase response:', { 
        data, 
        error: authError,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        userEmail: data?.user?.email,
        errorMessage: authError?.message,
        errorStatus: authError?.status,
        errorDetails: authError
      })

      if (authError) {
        console.error('❌ Signup failed with error:', {
          message: authError.message,
          status: authError.status,
          details: authError
        })
        
        // More specific error handling
        if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
          error.value = 'An account with this email already exists. Please try logging in instead.'
        } else if (authError.message.includes('Invalid email')) {
          error.value = 'Please enter a valid email address.'
        } else if (authError.message.includes('Password') && authError.message.includes('short')) {
          error.value = 'Password must be at least 6 characters long.'
        } else if (authError.message.includes('Database error')) {
          // This is the problematic error - let's gather more info
          console.error('🚨 DATABASE ERROR DETAILS:')
          console.error('- Error message:', authError.message)
          console.error('- Error status:', authError.status)
          console.error('- Full error object:', authError)
          console.error('- Request payload:', signupRequest)
          error.value = 'Database error during signup. This might be a Supabase configuration issue.'
        } else {
          error.value = `Signup failed: ${authError.message}`
        }
        throw authError
      }

      console.log('✅ Supabase signup successful!')

      // Handle successful signup
      if (data.user) {
        console.log('👤 User created:', {
          id: data.user.id,
          email: data.user.email,
          hasSession: !!data.session
        })

        // Set user immediately
        user.value = data.user

        if (data.session) {
          console.log('🎉 User has immediate session - no email confirmation needed')
          console.log('⏭️ COMPLETELY SKIPPING profile creation - testing basic auth only')
          
          return { 
            user: data.user, 
            session: data.session,
            success: true,
            message: 'Account created successfully! You are now logged in.'
          }
        } else {
          console.log('📧 User created but no session - email confirmation might be required')
          return {
            user: data.user,
            success: true,
            emailConfirmationRequired: true,
            message: 'Account created! Please check your email to confirm your account.'
          }
        }
      } else {
        console.error('❌ No user data in response:', data)
        error.value = 'Failed to create user account.'
        throw new Error('No user data returned from signup')
      }
    } catch (err) {
      console.error('💥 Signup process error:', err)
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
            user_id: data.user.id,
            full_name: userData.full_name || 'User',
            role: 'user',
            city: userData.city || null
          })

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }
      } catch (profileInsertError) {
        console.error('Exception during profile creation:', profileInsertError)
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
      console.error('Google OAuth error:', err)
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

  const updateProfile = async (profileData) => {
    try {
      loading.value = true
      error.value = null

      if (!user.value?.id) {
        throw new Error('No authenticated user')
      }

      // Update profile in profiles table
      const { data, error: updateError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.value.id,
          ...profileData
        })
        .select()
        .single()

      if (updateError) throw updateError

      // Update local user data
      if (data) {
        user.value = { ...user.value, ...data }
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

  // Email confirmation disabled - function removed











  const createProfileIfNotExists = async (userData = {}) => {
    try {
      if (!user.value?.id) {
        console.warn('No authenticated user for profile creation')
        return null
      }

      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.value.id)
        .maybeSingle() // Use maybeSingle instead of single to avoid errors when no row exists

      if (checkError) {
        console.error('Error checking existing profile:', checkError)
        return null
      }

      // If profile doesn't exist, create one
      if (!existingProfile) {
        const profileData = {
          user_id: user.value.id,
          full_name: userData.full_name || 'User',
          role: 'user',
          city: userData.city || null
        }

        console.log('Creating new profile with data:', profileData)

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single()

        if (createError) {
          console.error('Error creating profile:', createError)
          throw createError
        }

        // Update local user data
        if (newProfile) {
          user.value = { ...user.value, ...newProfile }
        }

        console.log('Profile created successfully:', newProfile)
        return newProfile
      } else {
        console.log('Profile already exists:', existingProfile)
        
        // Update local user data with existing profile
        user.value = { ...user.value, ...existingProfile }
        
        return existingProfile
      }
    } catch (err) {
      console.error('Error in createProfileIfNotExists:', err)
      // Don't throw the error, just log it and return null
      return null
    }
  }

  const resetPasswordForEmail = async (email) => {
    try {
      loading.value = true
      error.value = null

      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:3000/reset-password'
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
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single()

      user.value = profile 
        ? { ...authUser, ...profile, email: authUser.email }
        : authUser
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
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            await loadUserWithProfile(session.user)
          } else {
            user.value = null
          }
        }
      )

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
    userRole,
    isAdmin,
    
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
    initAuth
  }
})
