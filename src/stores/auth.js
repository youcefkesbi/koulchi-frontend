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

      console.log('Starting signup process for:', email)

      // Try to sign up with just email and password - no metadata
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password
      })

      console.log('Supabase signup response:', { data, error: authError })

      if (authError) {
        console.error('Supabase auth error:', authError)
        
        // Handle specific error cases
        if (authError.message.includes('User already registered')) {
          error.value = 'An account with this email already exists. Please try logging in instead.'
        } else if (authError.message.includes('Database error saving new user')) {
          error.value = 'Unable to create account due to server error. Please try again in a few moments.'
        } else if (authError.message.includes('Invalid email')) {
          error.value = 'Please enter a valid email address.'
        } else if (authError.message.includes('Password')) {
          error.value = 'Password must be at least 6 characters long.'
        } else {
          error.value = `Signup failed: ${authError.message}`
        }
        throw authError
      }

      console.log('Signup successful, user data:', data.user)

      // Check if we have a user and session (email confirmation disabled)
      if (data.user && data.session) {
        console.log('User authenticated immediately, setting up profile...')
        
        // Set the authenticated user
        user.value = data.user
        
        // Try to create profile after successful auth
        try {
          const profile = await createProfileIfNotExists(userData)
          console.log('Profile created/loaded:', profile)
        } catch (profileError) {
          console.warn('Profile creation failed, but user signup succeeded:', profileError)
          // Don't fail the entire signup process for profile issues
        }
        
        return { 
          user: data.user, 
          session: data.session,
          success: true,
          message: 'Account created successfully! You are now logged in.'
        }
      } else if (data.user && !data.session) {
        // Email confirmation is required
        console.log('User created but email confirmation required')
        return {
          user: data.user,
          success: true,
          emailConfirmationRequired: true,
          message: 'Account created! Please check your email to confirm your account.'
        }
      } else {
        // Unexpected response
        console.error('Unexpected signup response:', data)
        error.value = 'Signup completed but authentication failed. Please try logging in.'
        throw new Error('Unexpected signup response')
      }
    } catch (err) {
      console.error('Signup process error:', err)
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
