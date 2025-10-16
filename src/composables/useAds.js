import { computed } from 'vue'
import { useAdsStore } from '../stores/useAdsStore'

export function useAds() {
  const adsStore = useAdsStore()

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
