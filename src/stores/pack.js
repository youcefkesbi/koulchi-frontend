import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const usePackStore = defineStore('pack', () => {
  const packs = ref([])
  const features = ref([])
  const packFeatures = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const basicPack = computed(() => packs.value.find(p => p.name === 'Basic Pack'))
  const proPack = computed(() => packs.value.find(p => p.name === 'Pro Pack'))
  const activePacks = computed(() => packs.value.filter(p => p.is_active))

  // Actions
  const fetchPacks = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('packs')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true })

      if (fetchError) throw fetchError

      packs.value = data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching packs:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchFeatures = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('features')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (fetchError) throw fetchError

      features.value = data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching features:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchPackFeatures = async (packId) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('pack_features')
        .select(`
          *,
          features(*)
        `)
        .eq('pack_id', packId)
        .eq('is_enabled', true)

      if (fetchError) throw fetchError

      packFeatures.value = data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching pack features:', err)
    } finally {
      loading.value = false
    }
  }

  const getPackFeatures = (packId) => {
    return packFeatures.value.filter(pf => pf.pack_id === packId)
  }

  const hasFeature = (packId, featureName) => {
    const packFeature = packFeatures.value.find(
      pf => pf.pack_id === packId && pf.features?.name === featureName && pf.is_enabled
    )
    return !!packFeature
  }

  const checkPackLimits = async (packId, announcementCount = 0, imageCount = 0) => {
    try {
      const { data, error } = await supabase.rpc('check_pack_limits', {
        p_store_id: null, // For new stores
        p_pack_id: packId,
        p_announcement_count: announcementCount,
        p_image_count: imageCount
      })

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error checking pack limits:', err)
      return false
    }
  }

  const getStoreCreationRequirements = async (packName) => {
    try {
      const { data, error } = await supabase.rpc('get_store_creation_requirements', {
        p_pack_name: packName
      })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching store creation requirements:', err)
      return []
    }
  }

  const canUserCreateStore = async (userId, packName) => {
    try {
      const { data, error } = await supabase.rpc('can_user_create_store', {
        p_user_id: userId,
        p_pack_name: packName
      })

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error checking user store creation eligibility:', err)
      return false
    }
  }

  const createPack = async (packData) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: createError } = await supabase
        .from('packs')
        .insert(packData)
        .select()
        .single()

      if (createError) throw createError

      packs.value.push(data)
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error creating pack:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePack = async (packId, updates) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('packs')
        .update(updates)
        .eq('id', packId)
        .select()
        .single()

      if (updateError) throw updateError

      const index = packs.value.findIndex(p => p.id === packId)
      if (index !== -1) {
        packs.value[index] = data
      }

      return data
    } catch (err) {
      error.value = err.message
      console.error('Error updating pack:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePack = async (packId) => {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('packs')
        .delete()
        .eq('id', packId)

      if (deleteError) throw deleteError

      packs.value = packs.value.filter(p => p.id !== packId)
    } catch (err) {
      error.value = err.message
      console.error('Error deleting pack:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createFeature = async (featureData) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: createError } = await supabase
        .from('features')
        .insert(featureData)
        .select()
        .single()

      if (createError) throw createError

      features.value.push(data)
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error creating feature:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateFeature = async (featureId, updates) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('features')
        .update(updates)
        .eq('id', featureId)
        .select()
        .single()

      if (updateError) throw updateError

      const index = features.value.findIndex(f => f.id === featureId)
      if (index !== -1) {
        features.value[index] = data
      }

      return data
    } catch (err) {
      error.value = err.message
      console.error('Error updating feature:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteFeature = async (featureId) => {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('features')
        .delete()
        .eq('id', featureId)

      if (deleteError) throw deleteError

      features.value = features.value.filter(f => f.id !== featureId)
    } catch (err) {
      error.value = err.message
      console.error('Error deleting feature:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePackFeatures = async (packId, featureIds) => {
    try {
      loading.value = true
      error.value = null

      // Delete existing pack features
      await supabase
        .from('pack_features')
        .delete()
        .eq('pack_id', packId)

      // Insert new pack features
      if (featureIds.length > 0) {
        const packFeatureData = featureIds.map(featureId => ({
          pack_id: packId,
          feature_id: featureId,
          is_enabled: true
        }))

        const { data, error: insertError } = await supabase
          .from('pack_features')
          .insert(packFeatureData)
          .select()

        if (insertError) throw insertError

        packFeatures.value = packFeatures.value.filter(pf => pf.pack_id !== packId)
        packFeatures.value.push(...data)
      }

    } catch (err) {
      error.value = err.message
      console.error('Error updating pack features:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    packs,
    features,
    packFeatures,
    loading,
    error,
    
    // Getters
    basicPack,
    proPack,
    activePacks,
    
    // Actions
    fetchPacks,
    fetchFeatures,
    fetchPackFeatures,
    getPackFeatures,
    hasFeature,
    checkPackLimits,
    getStoreCreationRequirements,
    canUserCreateStore,
    createPack,
    updatePack,
    deletePack,
    createFeature,
    updateFeature,
    deleteFeature,
    updatePackFeatures,
    clearError
  }
})
