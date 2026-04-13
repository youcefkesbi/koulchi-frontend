import { computed, ref } from 'vue'
import { useAdsStore } from '../stores/useAdsStore'
import { supabase } from '../lib/supabase'

export function useAds() {
  const adsStore = useAdsStore()
  const loading = ref(false)
  const error = ref(null)

  const fetchAdsWithFilters = async (filters = {}) => {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('ads')
        .select(`
          *,
          product:products(*),
          store:stores(*)
        `)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

      if (filters.slot_type) query = query.eq('slot_type', filters.slot_type)
      if (filters.item_type) query = query.eq('item_type', filters.item_type)
      if (filters.category_id) query = query.eq('category_id', filters.category_id)

      const now = new Date().toISOString()
      query = query.lte('start_date', now).or(`end_date.is.null,end_date.gte.${now}`)

      const { data, error: supabaseError } = await query
      if (supabaseError) throw supabaseError

      return (data || []).map(ad => ({
        ...ad,
        product: ad.product || ad.products || null,
        store: ad.store || ad.stores || null
      }))
    } catch (err) {
      error.value = err.message
      console.error('Error fetching ads:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const productAds = computed(() => adsStore.ads.filter(ad => ad.item_type === 'product' && ad.product))
  const storeAds = computed(() => adsStore.ads.filter(ad => ad.item_type === 'store' && ad.store))

  const fetchAds = async () => {
    await adsStore.fetchAds()
    return adsStore.ads
  }
  const fetchHomepageBannerAds = async () => {
    await adsStore.fetchAds()
    return adsStore.homepageBannerAds
  }
  const fetchHomepageFeaturedProducts = async () => {
    await adsStore.fetchAds()
    return adsStore.homepageFeaturedProducts
  }
  const fetchHomepageFeaturedStores = async () => {
    await adsStore.fetchAds()
    return adsStore.homepageFeaturedStores
  }
  const fetchBrowseByCategoryProducts = async (categoryId) => {
    await adsStore.fetchAds()
    return adsStore.homepageBrowseByCategoryProducts.filter(ad => ad.category_id === categoryId)
  }
  const fetchCategoryBannerAds = async (categoryId) => {
    await adsStore.fetchAds()
    return adsStore.categoryBannerAds.filter(ad => ad.category_id === categoryId)
  }
  const fetchCategoryFeaturedProducts = async (categoryId) => {
    await adsStore.fetchAds()
    return adsStore.categoryFeaturedProducts.filter(ad => ad.category_id === categoryId)
  }

  return {
    ads: computed(() => adsStore.ads),
    loading: computed(() => adsStore.loading),
    error: computed(() => adsStore.error),
    productAds,
    storeAds,
    fetchAds,
    fetchAdsWithFilters,
    fetchHomepageBannerAds,
    fetchHomepageFeaturedProducts,
    fetchHomepageFeaturedStores,
    fetchBrowseByCategoryProducts,
    fetchCategoryBannerAds,
    fetchCategoryFeaturedProducts,
    getAdsBySlotType: adsStore.getAdsBySlotType,
    getAdsByCategory: adsStore.getAdsByCategory,
    transformAdsForDisplay: adsStore.transformAdsForDisplay,
    clearAds: adsStore.clearCache
  }
}