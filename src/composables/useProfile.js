import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/useAuthStore'

export function useProfile() {
  const authStore = useAuthStore()
  const loading = ref(false)
  const error = ref(null)
  const success = ref(false)

  // Get current user's profile safely
  const getProfile = async () => {
    try {
      if (!authStore.user?.id) {
        throw new Error('No authenticated user')
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, role, updated_at')
        .eq('id', authStore.user.id)
        .single()

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // No profile found, create one
          return await createProfile()
        }
        throw profileError
      }

      return data
    } catch (err) {
      console.error('Error fetching profile:', err)
      error.value = err.message
      throw err
    }
  }

  // Create a new profile for the user
  const createProfile = async () => {
    try {
      if (!authStore.user?.id) {
        throw new Error('No authenticated user')
      }

      const { data, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: authStore.user.id,
          full_name: authStore.user.email?.split('@')[0] || 'User',
          role: 'user'
        })
        .select('id, full_name, role, updated_at')
        .single()

      if (createError) {
        console.error('Profile creation error:', createError)
        throw new Error(createError.message || 'Failed to create profile')
      }

      return data
    } catch (err) {
      console.error('Error creating profile:', err)
      error.value = err.message
      throw err
    }
  }

  // Update profile safely
  const updateProfile = async (updates) => {
    try {
      loading.value = true
      error.value = null
      success.value = false

      if (!authStore.user?.id) {
        throw new Error('No authenticated user')
      }

      // Validate updates - only allow full_name field
      const allowedUpdates = {}
      if (updates.full_name !== undefined) {
        allowedUpdates.full_name = updates.full_name
      }

      if (Object.keys(allowedUpdates).length === 0) {
        throw new Error('No valid fields to update')
      }

      // Add updated_at timestamp
      allowedUpdates.updated_at = new Date().toISOString()

      // Always include the user ID in the where clause for RLS policies
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(allowedUpdates)
        .eq('id', authStore.user.id)
        .select('id, full_name, role, updated_at')
        .single()

      if (updateError) {
        console.error('Profile update error:', updateError)
        throw new Error(updateError.message || 'Failed to update profile')
      }

      // Update local auth store user data
      if (data && authStore.user) {
        authStore.user = { ...authStore.user, ...data }
      }

      success.value = true
      return data
    } catch (err) {
      console.error('Error updating profile:', err)
      error.value = err.message
      // Ensure loading state is reset on error
      loading.value = false
      throw err
    }
  }

  // Refresh profile data
  const refreshProfile = async () => {
    try {
      const profile = await getProfile()
      
      // Update local auth store if we have a profile
      if (profile && authStore.user) {
        authStore.user = { ...authStore.user, ...profile }
      }
      
      return profile
    } catch (err) {
      console.error('Error refreshing profile:', err)
      error.value = err.message
      throw err
    }
  }

  // Create profile during signup (for use in auth store)
  const createProfileOnSignup = async (userId, userData = {}) => {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }

      const { data, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: userData.full_name || userData.email?.split('@')[0] || 'User',
          role: 'user'
        })
        .select('id, full_name, role, updated_at')
        .single()

      if (createError) {
        console.error('Signup profile creation error:', createError)
        throw new Error(createError.message || 'Failed to create profile during signup')
      }

      return data
    } catch (err) {
      console.error('Error creating profile during signup:', err)
      error.value = err.message
      throw err
    }
  }

  // Clear error and success states
  const clearStates = () => {
    error.value = null
    success.value = false
  }

  return {
    // State
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    success: computed(() => success.value),
    
    // Actions
    getProfile,
    createProfile,
    createProfileOnSignup,
    updateProfile,
    refreshProfile,
    clearStates
  }
}
