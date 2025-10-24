import { computed } from 'vue'
import { useAdsStore } from '../stores/useAdsStore'

export function useAds() {
  const adsStore = useAdsStore()

  // Fetch ads with filters
  const fetchAds = async (filters = {}) => {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('ads')
        .select(`
          *,
          products:product_id(
            id,
            name,
            price,
            image_urls,
            stock_quantity,
            status,
            created_at
          ),
          stores:store_id(
            id,
            name,
            logo_url,
            banner_url,
            location,
            status,
            created_at
          )
        `)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.slot_type) {
        query = query.eq('slot_type', filters.slot_type)
      }

      if (filters.item_type) {
        query = query.eq('item_type', filters.item_type)
      }

      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id)
      }

      // Filter by date range (only show active ads)
      const now = new Date().toISOString()
      query = query
        .lte('start_date', now)
        .or(`end_date.is.null,end_date.gte.${now}`)

      const { data, error: supabaseError } = await query
  // Computed properties for different ad types
  const productAds = computed(() => {
    return adsStore.ads.filter(ad => ad.item_type === 'product' && ad.products)
  })

  const storeAds = computed(() => {
    return adsStore.ads.filter(ad => ad.item_type === 'store' && ad.stores)
  })

  // Legacy methods for backward compatibility
  const fetchAds = async (filters = {}) => {
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

  const getAdsBySlotType = (slotType) => {
    return adsStore.getAdsBySlotType(slotType)
  }

  const getAdsByCategory = (categoryId) => {
    return adsStore.getAdsByCategory(categoryId)
  }

  const transformAdsForDisplay = (adsList) => {
    return adsStore.transformAdsForDisplay(adsList)
  }

  const clearAds = () => {
    adsStore.clearCache()
  }

  return {
    // State (from store)
    ads: computed(() => adsStore.ads),
    loading: computed(() => adsStore.loading),
    error: computed(() => adsStore.error),
    
    // Computed
    productAds,
    storeAds,
    
    // Methods
    fetchAds,
    fetchHomepageBannerAds,
    fetchHomepageFeaturedProducts,
    fetchHomepageFeaturedStores,
    fetchBrowseByCategoryProducts,
    fetchCategoryBannerAds,
    fetchCategoryFeaturedProducts,
    getAdsBySlotType,
    getAdsByCategory,
    transformAdsForDisplay,
    clearAds
  }
}
