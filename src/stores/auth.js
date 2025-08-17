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
  const userPhotoURL = computed(() => user.value?.avatar_url || null)
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
        } else {
          error.value = authError.message
        }
        throw authError
      }

      user.value = data.user
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
        password
      })

      if (authError) {
        // Handle specific error cases
        if (authError.message.includes('User already registered')) {
          error.value = 'User already registered'
        } else {
          error.value = authError.message
        }
        throw authError
      }

      // If signup successful and we have user data, insert into profiles table
      if (data.user && Object.keys(userData).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: userData.full_name || null,
            phone: userData.phone || null,
            avatar_url: userData.avatar_url || null,
            role: 'user',
            city: userData.city || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          console.error('Error creating profile:', profileError)
          // Don't throw here as the user account was created successfully
          // The profile can be created later when they first access their profile
        }
      }

      user.value = data.user
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
        // Handle specific OAuth error cases
        if (authError.message.includes('OAuth error')) {
          error.value = 'OAuth error occurred'
        } else if (authError.message.includes('cancelled')) {
          error.value = 'OAuth cancelled'
        } else if (authError.message.includes('timeout')) {
          error.value = 'OAuth timeout'
        } else if (authError.message.includes('provider error')) {
          error.value = 'OAuth provider error'
        } else {
          error.value = authError.message
        }
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

  const getCurrentUser = async () => {
    try {
      loading.value = true
      error.value = null

      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError

      if (currentUser) {
        // Fetch user profile from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error fetching profile:', profileError)
        }

        // Merge profile data with user data
        if (profile) {
          user.value = { ...currentUser, ...profile }
        } else {
          user.value = currentUser
        }
      } else {
        user.value = null
      }

      return user.value
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

      if (!user.value?.id) {
        throw new Error('No authenticated user')
      }

      // Update profile in profiles table
      const { data, error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.value.id,
          ...profileData,
          updated_at: new Date().toISOString()
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

  const resendConfirmationEmail = async (email) => {
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

  const createProfileIfNotExists = async (oauthData = {}) => {
    try {
      if (!user.value?.id) {
        throw new Error('No authenticated user')
      }

      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      // If profile doesn't exist, create one
      if (!existingProfile) {
        const profileData = {
          id: user.value.id,
          email: user.value.email,
          full_name: oauthData.full_name || null,
          phone: oauthData.phone || null,
          avatar_url: oauthData.avatar_url || null,
          role: 'user',
          city: oauthData.city || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
        if (oauthData.full_name || oauthData.avatar_url || oauthData.phone || oauthData.city) {
          const updateData = {}
          if (oauthData.full_name && !existingProfile.full_name) {
            updateData.full_name = oauthData.full_name
          }
          if (oauthData.avatar_url && !existingProfile.avatar_url) {
            updateData.avatar_url = oauthData.avatar_url
          }
          if (oauthData.phone && !existingProfile.phone) {
            updateData.phone = oauthData.phone
          }
          if (oauthData.city && !existingProfile.city) {
            updateData.city = oauthData.city
          }

          if (Object.keys(updateData).length > 0) {
            const { data: updatedProfile, error: updateError } = await supabase
              .from('profiles')
              .update(updateData)
              .eq('id', user.value.id)
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
        redirectTo: 'http://localhost:3000/reset-password' // or your prod domain later
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
          
          if (session?.user) {
            // Fetch user profile from profiles table
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
              console.error('Error fetching profile:', profileError)
            }

            // Merge profile data with user data
            if (profile) {
              user.value = { ...session.user, ...profile }
            } else {
              user.value = session.user
            }
          } else {
            user.value = null
          }
          
          // If we get a SIGNED_IN event, also try to get the current user
          if (event === 'SIGNED_IN' && session?.user) {
            try {
              const { data: { user: currentUser } } = await supabase.auth.getUser()
              if (currentUser) {
                // Fetch profile data again to ensure we have the latest
                const { data: profile, error: profileError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', currentUser.id)
                  .single()

                if (profileError && profileError.code !== 'PGRST116') {
                  console.error('Error fetching profile:', profileError)
                }

                if (profile) {
                  user.value = { ...currentUser, ...profile }
                } else {
                  user.value = currentUser
                }
              }
            } catch (err) {
              console.error('Error getting current user:', err)
            }
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
    getCurrentUser,
    updateProfile,
    clearError,
    resendConfirmationEmail,
    createProfileIfNotExists,
    resetPasswordForEmail,
    initAuth
  }
})
