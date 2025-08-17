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
        } else if (authError.message.includes('Invalid login credentials')) {
          error.value = 'Invalid email or password'
        } else {
          error.value = authError.message
        }
        throw authError
      }

      // Check if we have a valid session
      if (data.user && data.session) {
        user.value = data.user
        console.log('User logged in successfully:', data.user.id)
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

      console.log('Starting signup process for email:', email)
      console.log('Supabase client config:', {
        url: supabase.supabaseUrl,
        hasKey: !!supabase.supabaseKey
      })

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password
      })

      console.log('Signup response:', { data, error: authError })
      console.log('Response data structure:', {
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        userData: data?.user,
        sessionData: data?.session
      })

      if (authError) {
        console.error('Signup auth error:', authError)
        console.error('Error details:', authError.message, authError.status, authError.name)
        
        // Handle specific error cases
        if (authError.message.includes('User already registered')) {
          error.value = 'User already registered'
          throw authError
        } else if (authError.message.includes('Database error saving new user')) {
          // This error often occurs when email confirmation is required
          // Check if we actually have a user object despite the error
          if (data?.user) {
            console.log('User created but email confirmation required')
            console.log('Continuing with profile creation despite error')
            // Don't set error, allow the process to continue
          } else {
            console.error('Database error and no user data - signup failed completely')
            error.value = 'Signup failed. Please try again or contact support.'
            throw authError
          }
        } else if (authError.message.includes('Email not confirmed')) {
          // This is expected when email confirmation is required
          console.log('Email confirmation required - this is expected behavior')
          // Don't set error, allow the process to continue
        } else {
          error.value = authError.message
          throw authError
        }
      }

      // If signup successful and we have user data, insert into profiles table
      if (data.user && Object.keys(userData).length > 0) {
        try {
          console.log('Attempting to create profile for user:', data.user.id)
          console.log('Profile data to insert:', {
            id: data.user.id,
            full_name: userData.full_name || null,
            avatar_url: userData.avatar_url || null,
            role: 'user',
            city: userData.city || null
          })
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              full_name: userData.full_name || null,
              avatar_url: userData.avatar_url || null,
              role: 'user',
              city: userData.city || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (profileError) {
            console.error('Error creating profile:', profileError)
            console.error('Profile error details:', profileError.message, profileError.details, profileError.hint)
            console.warn('Profile creation failed, but user account was created successfully')
            console.warn('Profile will be created when user first accesses their profile')
          } else {
            console.log('Profile created successfully for user:', data.user.id)
          }
        } catch (profileInsertError) {
          console.error('Exception during profile creation:', profileInsertError)
          console.error('Profile insert exception details:', profileInsertError.message, profileInsertError.stack)
          console.warn('Profile creation failed due to exception, but user account was created successfully')
        }
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        console.log('Email confirmation required for user:', data.user.id)
        console.log('User account created successfully, waiting for email confirmation')
        // Don't set user.value yet since they need to confirm email
        // But we can still create their profile
        // Return success with email confirmation status
        return {
          ...data,
          emailConfirmationRequired: true,
          message: 'Account created successfully! Please check your email and click the confirmation link.'
        }
      } else if (data.user && data.session) {
        console.log('User signed up and confirmed, setting user session')
        user.value = data.user
        return {
          ...data,
          emailConfirmationRequired: false,
          message: 'Account created and confirmed successfully!'
        }
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
        let profile = null
        let profileError = null
        
        try {
          const result = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single()
          
          profile = result.data
          profileError = result.error
        } catch (tableError) {
          console.warn('Profiles table not accessible:', tableError.message)
          console.warn('Profile data will not be loaded until table is available')
        }

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error fetching profile:', profileError)
        }

        // Merge profile data with user data, but keep email from auth session
        if (profile) {
          user.value = { 
            ...currentUser, 
            ...profile,
            email: currentUser.email // Always use email from auth session
          }
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

  const checkEmailConfirmation = async (email) => {
    try {
      loading.value = true
      error.value = null

      // Try to sign in to check if email is confirmed
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: 'dummy-password-to-check-status'
      })

      if (authError) {
        if (authError.message.includes('Email not confirmed')) {
          return { confirmed: false, message: 'Email not confirmed' }
        } else if (authError.message.includes('Invalid login credentials')) {
          // This means the email exists but password is wrong
          // We can't determine confirmation status without the correct password
          return { confirmed: null, message: 'Cannot determine confirmation status' }
        }
        throw authError
      }

      return { confirmed: true, message: 'Email confirmed' }
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

      console.log('Resending email confirmation to:', email)
      
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (resendError) {
        console.error('Error resending confirmation email:', resendError)
        throw resendError
      }

      console.log('Email confirmation resent successfully')
      return { success: true, message: 'Confirmation email sent! Please check your inbox.' }
    } catch (err) {
      console.error('Failed to resend confirmation email:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const diagnoseSupabaseIssues = async () => {
    try {
      console.log('🔍 Starting Supabase diagnostics...')
      
      // Test 1: Basic connection
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      console.log('Session test:', { hasSession: !!sessionData?.session, error: sessionError })
      
      // Test 2: Database access
      const { data: dbData, error: dbError } = await supabase.from('profiles').select('count').limit(1)
      console.log('Database test:', { hasData: !!dbData, error: dbError })
      
      // Test 3: Auth configuration
      const { data: authData, error: authError } = await supabase.auth.getUser()
      console.log('Auth test:', { hasUser: !!authData?.user, error: authError })
      
      // Test 4: Try a simple signup test (this will help identify the exact issue)
      console.log('🔍 Testing signup process...')
      try {
        const testEmail = `test-${Date.now()}@example.com`
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: testEmail,
          password: 'testpassword123'
        })
        console.log('Signup test result:', { 
          hasUser: !!signupData?.user, 
          hasSession: !!signupData?.session, 
          error: signupError 
        })
        
        // If signup succeeded, clean up the test user
        if (signupData?.user) {
          console.log('Cleaning up test user...')
          // Note: We can't delete the user directly, but this helps identify if the issue is with profile creation
        }
      } catch (signupTestError) {
        console.error('Signup test failed:', signupTestError)
      }
      
      return {
        connection: !sessionError,
        database: !dbError,
        auth: !authError,
        issues: [sessionError, dbError, authError].filter(Boolean)
      }
    } catch (err) {
      console.error('Diagnostic error:', err)
      return { error: err.message }
    }
  }

  const testSignupProcess = async (email, password) => {
    try {
      console.log('🧪 Testing signup process with:', { email, password })
      
      // Test 1: Basic signup without any additional data
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      
      console.log('🧪 Signup test result:', {
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        userData: data?.user,
        error: error
      })
      
      if (error) {
        console.error('🧪 Signup test failed:', error)
        return { success: false, error: error.message, data: null }
      }
      
      if (data?.user) {
        console.log('🧪 Signup test successful, user created:', data.user.id)
        return { success: true, error: null, data: data }
      }
      
      return { success: false, error: 'No user data returned', data: data }
    } catch (err) {
      console.error('🧪 Signup test exception:', err)
      return { success: false, error: err.message, data: null }
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
          .eq('id', user.value.id)
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
          id: user.value.id,
          full_name: oauthData.full_name || null,
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
        if (oauthData.full_name || oauthData.avatar_url || oauthData.city) {
          const updateData = {}
          if (oauthData.full_name && !existingProfile.full_name) {
            updateData.full_name = oauthData.full_name
          }
          if (oauthData.avatar_url && !existingProfile.avatar_url) {
            updateData.avatar_url = oauthData.avatar_url
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
      
      // Run diagnostics first
      console.log('Running Supabase diagnostics...')
      const diagnostics = await diagnoseSupabaseIssues()
      console.log('Diagnostics result:', diagnostics)
      
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

            // Merge profile data with user data, but keep email from auth session
            if (profile) {
              user.value = { 
                ...session.user, 
                ...profile,
                email: session.user.email // Always use email from auth session
              }
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
                  user.value = { 
                    ...currentUser, 
                    ...profile,
                    email: currentUser.email // Always use email from auth session
                  }
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
    checkEmailConfirmation,
    resendEmailConfirmation,
    diagnoseSupabaseIssues,
    testSignupProcess,
    createProfileIfNotExists,
    resetPasswordForEmail,
    initAuth
  }
})
