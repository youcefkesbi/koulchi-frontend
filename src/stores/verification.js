import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useVerificationStore = defineStore('verification', () => {
  const verifications = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const pendingVerifications = computed(() => 
    verifications.value.filter(v => v.status === 'pending')
  )
  const approvedVerifications = computed(() => 
    verifications.value.filter(v => v.status === 'approved')
  )
  const rejectedVerifications = computed(() => 
    verifications.value.filter(v => v.status === 'rejected')
  )

  // Actions
  const fetchUserVerifications = async () => {
    try {
      loading.value = true
      error.value = null

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      const { data, error: fetchError } = await supabase
        .from('verifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      verifications.value = data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching user verifications:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchAllVerifications = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('verifications')
        .select(`
          *,
          profiles!verifications_user_id_fkey(email as user_email)
        `)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      verifications.value = data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching all verifications:', err)
    } finally {
      loading.value = false
    }
  }

  const uploadVerification = async (verificationType, file) => {
    try {
      loading.value = true
      error.value = null

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      // Upload file to Supabase storage
      const fileName = `verification-${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('verification-documents')
        .getPublicUrl(fileName)

      // Create verification record
      const { data, error: verificationError } = await supabase
        .from('verifications')
        .upsert({
          user_id: session.user.id,
          verification_type: verificationType,
          document_url: publicUrl,
          status: 'pending'
        })
        .select()
        .single()

      if (verificationError) throw verificationError

      // Update local state
      const index = verifications.value.findIndex(v => 
        v.user_id === session.user.id && v.verification_type === verificationType
      )
      if (index !== -1) {
        verifications.value[index] = data
      } else {
        verifications.value.unshift(data)
      }

      return data
    } catch (err) {
      error.value = err.message
      console.error('Error uploading verification:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateVerificationStatus = async (verificationId, status, rejectionReason = null) => {
    try {
      loading.value = true
      error.value = null

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      const updateData = {
        status,
        reviewed_by: session.user.id,
        reviewed_at: new Date().toISOString()
      }

      if (rejectionReason) {
        updateData.rejection_reason = rejectionReason
      }

      const { data, error: updateError } = await supabase
        .from('verifications')
        .update(updateData)
        .eq('id', verificationId)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state
      const index = verifications.value.findIndex(v => v.id === verificationId)
      if (index !== -1) {
        verifications.value[index] = data
      }

      return data
    } catch (err) {
      error.value = err.message
      console.error('Error updating verification status:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const approveVerification = async (verificationId) => {
    return await updateVerificationStatus(verificationId, 'approved')
  }

  const rejectVerification = async (verificationId, rejectionReason) => {
    return await updateVerificationStatus(verificationId, 'rejected', rejectionReason)
  }

  const deleteVerification = async (verificationId) => {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('verifications')
        .delete()
        .eq('id', verificationId)

      if (deleteError) throw deleteError

      // Update local state
      verifications.value = verifications.value.filter(v => v.id !== verificationId)
    } catch (err) {
      error.value = err.message
      console.error('Error deleting verification:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getUserVerificationStatus = async (userId) => {
    try {
      const { data, error } = await supabase.rpc('get_user_verification_status', {
        p_user_id: userId
      })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching user verification status:', err)
      return []
    }
  }

  const hasRequiredVerifications = async (userId, packName) => {
    try {
      const { data, error } = await supabase.rpc('can_user_create_store', {
        p_user_id: userId,
        p_pack_name: packName
      })

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error checking required verifications:', err)
      return false
    }
  }

  const getVerificationRequirements = async (packName) => {
    try {
      const { data, error } = await supabase.rpc('get_store_creation_requirements', {
        p_pack_name: packName
      })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching verification requirements:', err)
      return []
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    verifications,
    loading,
    error,
    
    // Getters
    pendingVerifications,
    approvedVerifications,
    rejectedVerifications,
    
    // Actions
    fetchUserVerifications,
    fetchAllVerifications,
    uploadVerification,
    updateVerificationStatus,
    approveVerification,
    rejectVerification,
    deleteVerification,
    getUserVerificationStatus,
    hasRequiredVerifications,
    getVerificationRequirements,
    clearError
  }
})
