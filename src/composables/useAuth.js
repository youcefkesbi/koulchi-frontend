import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useRouter } from 'vue-router'

/**
 * Enhanced authentication composable
 * Handles JWT expiration, session refresh, and auth state management
 * Follows Supabase best practices for session handling
 */
export function useAuth() {
  const router = useRouter()
  
  // State
  const user = ref(null)
  const session = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!session.value)
  const userDisplayName = computed(() => user.value?.full_name || user.value?.email || 'User')
  const userEmail = computed(() => user.value?.email || '')
  const userRole = computed(() => user.value?.role || 'user')

  /**
   * Get current session with automatic refresh handling
   * This is the core function that handles JWT expiration gracefully
   */
  const getCurrentSession = async () => {
    try {
      // Get current session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        throw new Error('Authentication failed. Please log in again.')
      }
      
      // Check if session exists
      if (!currentSession || !currentSession.user) {
        console.log('No valid session found')
        return null
      }
      
      // Check if token is expired (optional - Supabase handles this automatically)
      const now = Math.floor(Date.now() / 1000)
      if (currentSession.expires_at && currentSession.expires_at < now) {
        console.log('Token expired, attempting refresh...')
        
        // Attempt to refresh the session
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
        
        if (refreshError || !refreshData.session) {
          console.log('Session refresh failed:', refreshError)
          return null
        }
        
        console.log('Session refreshed successfully')
        session.value = refreshData.session
        user.value = refreshData.session.user
        return refreshData.session
      }
      
      // Session is valid
      session.value = currentSession
      user.value = currentSession.user
      
      console.log('Valid session found', { 
        userId: currentSession.user.id, 
        email: currentSession.user.email,
        expiresAt: new Date(currentSession.expires_at * 1000).toISOString()
      })
      
      return currentSession
    } catch (err) {
      console.error('Session validation error:', err)
      session.value = null
      user.value = null
      return null
    }
  }

  /**
   * Validate session and handle authentication errors
   * Returns session if valid, throws error if not
   */
  const requireAuth = async () => {
    const currentSession = await getCurrentSession()
    
    if (!currentSession) {
      const error = new Error('User not authenticated')
      error.code = 'AUTH_REQUIRED'
      throw error
    }
    
    return currentSession
  }

  /**
   * Handle authentication errors consistently
   * Redirects to login and clears local state
   */
  const handleAuthError = (error) => {
    console.error('Authentication error:', error)
    
    // Clear local state
    user.value = null
    session.value = null
    
    // Redirect to login
    const currentLocale = router.currentRoute.value.meta?.locale || 'en'
    router.push(`/${currentLocale}/login`)
    
    throw new Error('Please log in to continue')
  }

  /**
   * Initialize authentication state
   * Sets up auth state change listener
   */
  const initAuth = async () => {
    try {
      loading.value = true
      
      // Get initial session
      await getCurrentSession()
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log('Auth state change:', event, newSession?.user?.email)
          
          if (newSession?.user) {
            session.value = newSession
            user.value = newSession.user
            
            // Handle sign in
            if (event === 'SIGNED_IN') {
              console.log('User signed in:', newSession.user.email)
              
              // Sync local data to Supabase after login
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
            // User signed out or session expired
            console.log('User signed out or session expired')
            session.value = null
            user.value = null
          }
        }
      )
      
      return subscription
    } catch (err) {
      console.error('Auth initialization failed:', err)
      error.value = err.message
      session.value = null
      user.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * Login with email and password
   */
  const login = async (email, password) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (loginError) throw loginError

      // Session and user will be set by the auth state change listener
      return data
    } catch (err) {
      error.value = err.message
      console.error('Login error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Sign up with email and password
   */
  const signUp = async (email, password, metadata = {}) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (signUpError) throw signUpError

      return data
    } catch (err) {
      error.value = err.message
      console.error('Sign up error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout
   */
  const logout = async () => {
    try {
      loading.value = true
      error.value = null

      const { error: logoutError } = await supabase.auth.signOut()

      if (logoutError) throw logoutError

      // State will be cleared by the auth state change listener
    } catch (err) {
      error.value = err.message
      console.error('Logout error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Reset password
   */
  const resetPassword = async (email) => {
    try {
      loading.value = true
      error.value = null

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (resetError) throw resetError
    } catch (err) {
      error.value = err.message
      console.error('Password reset error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update password
   */
  const updatePassword = async (newPassword) => {
    try {
      loading.value = true
      error.value = null

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) throw updateError
    } catch (err) {
      error.value = err.message
      console.error('Password update error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user,
    session,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    userDisplayName,
    userEmail,
    userRole,
    
    // Actions
    getCurrentSession,
    requireAuth,
    handleAuthError,
    initAuth,
    login,
    signUp,
    logout,
    resetPassword,
    updatePassword,
    clearError
  }
}
