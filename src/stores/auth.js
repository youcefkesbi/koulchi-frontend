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
        if (authError.message.includes('Email not confirmed')) {
          error.value = 'Email not confirmed'
        } else if (authError.message.includes('Invalid login credentials')) {
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

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: userData.full_name ? { data: userData } : undefined
      })

      if (authError) {
        if (authError.message.includes('User already registered')) {
          error.value = 'User already registered'
        } else {
          error.value = authError.message
        }
        throw authError
      }

      return await handleSuccessfulSignup(data, userData)
    } catch (err) {
      console.error('Signup error:', err)
      if (!error.value) {
        error.value = err.message
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

    // Check if email confirmation is required
    if (data.user && !data.session) {
      // Don't set user.value yet since they need to confirm email
      // But we can still create their profile
      // Return success with email confirmation status
      return {
        ...data,
        emailConfirmationRequired: true,
        message: 'Account created successfully! Please check your email and click the confirmation link.'
      }
    } else if (data.user && data.session) {
      user.value = data.user
      return {
        ...data,
        emailConfirmationRequired: false,
        message: 'Account created and confirmed successfully!'
      }
    }
    
    return data
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

  const resendEmailConfirmation = async (email) => {
    try {
      loading.value = true
      error.value = null

      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (resendError) {
        console.error('Error resending confirmation email:', resendError)
        throw resendError
      }

      return { success: true, message: 'Confirmation email sent! Please check your inbox.' }
    } catch (err) {
      console.error('Failed to resend confirmation email:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }











  const createProfileIfNotExists = async (oauthData = {}) => {
    try {
      if (!user.value?.id) {
        throw new Error('No authenticated user')
      }

      // Check if profile already exists
      let existingProfile = null
      let checkError = null
      
      try {
        const result = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.value.id)
          .single()
        
        existingProfile = result.data
        checkError = result.error
      } catch (tableError) {
        console.warn('Profiles table not accessible:', tableError.message)
        console.warn('Profile creation will be skipped until table is available')
        return null
      }

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      // If profile doesn't exist, create one
      if (!existingProfile) {
        const profileData = {
          user_id: user.value.id,
          full_name: oauthData.full_name || 'User',
          role: 'user',
          city: oauthData.city || null
        }

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single()

        if (createError) throw createError

        // Update local user data
        if (newProfile) {
          user.value = { ...user.value, ...newProfile }
        }

        return newProfile
      } else {
        // If profile exists but we have OAuth data, update it
        if (oauthData.full_name || oauthData.city) {
          const updateData = {}
          if (oauthData.full_name && !existingProfile.full_name) {
            updateData.full_name = oauthData.full_name
          }
          if (oauthData.city && !existingProfile.city) {
            updateData.city = oauthData.city
          }

          if (Object.keys(updateData).length > 0) {
                      const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('user_id', user.value.id)
            .select()
            .single()

            if (updateError) throw updateError

            // Update local user data
            if (updatedProfile) {
              user.value = { ...user.value, ...updatedProfile }
            }

            return updatedProfile
          }
        }

        return existingProfile
      }
    } catch (err) {
      console.error('Error creating profile:', err)
      throw err
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
    resendEmailConfirmation,
    createProfileIfNotExists,
    resetPasswordForEmail,
    initAuth
  }
})
