import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'

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
        .select('id, full_name, city, role, updated_at')
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
          role: 'user',
          city: ''
        })
        .select('id, full_name, city, role, updated_at')
        .single()

      if (createError) {
        throw createError
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

      // Validate updates - only allow specific fields
      const allowedUpdates = {}
      if (updates.full_name !== undefined) {
        allowedUpdates.full_name = updates.full_name
      }
      if (updates.city !== undefined) {
        allowedUpdates.city = updates.city
      }

      if (Object.keys(allowedUpdates).length === 0) {
        throw new Error('No valid fields to update')
      }

      // Add updated_at timestamp
      allowedUpdates.updated_at = new Date().toISOString()

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(allowedUpdates)
        .eq('id', authStore.user.id)
        .select('id, full_name, city, role, updated_at')
        .single()

      if (updateError) {
        throw updateError
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
      throw err
    } finally {
      loading.value = false
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
    updateProfile,
    refreshProfile,
    clearStates
  }
}
