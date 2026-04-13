import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useAdsStore = defineStore('ads', () => {
  // State
  const ads = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastFetch = ref(null)
  const cacheExpiry = 5 * 60 * 1000 // 5 minutes

  // Computed properties for different slot types
  const adsBySlotType = computed(() => {
    const grouped = {}
    ads.value.forEach(ad => {
      if (!grouped[ad.slot_type]) {
        grouped[ad.slot_type] = []
      }
      grouped[ad.slot_type].push(ad)
    })
    return grouped
  })

  const homepageBannerAds = computed(() => 
    adsBySlotType.value['homepage_banner'] || []
  )

  const homepageFeaturedProducts = computed(() => 
    adsBySlotType.value['homepage_featured_products'] || []
  )

  const homepageFeaturedStores = computed(() => 
    adsBySlotType.value['homepage_featured_stores'] || []
  )

  const homepageBrowseByCategoryProducts = computed(() => 
    adsBySlotType.value['homepage_browse_by_category_products'] || []
  )

  const categoryBannerAds = computed(() => 
    adsBySlotType.value['category_banner'] || []
  )

  const categoryFeaturedProducts = computed(() => 
    adsBySlotType.value['category_featured_products'] || []
  )

  // Actions
  const fetchAds = async (forceRefresh = false) => {
    // Check if we need to refresh
    if (!forceRefresh && lastFetch.value && (Date.now() - lastFetch.value) < cacheExpiry) {
      return ads.value
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('ads')
        .select(`
          *,
          product:products(*),
          store:stores(*)
        `)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

      if (supabaseError) throw supabaseError

      // Filter by date range (only show active ads)
      const now = new Date().toISOString()
      const activeAds = (data || []).filter(ad => {
        const startDate = new Date(ad.start_date)
        const endDate = ad.end_date ? new Date(ad.end_date) : null
        const nowDate = new Date(now)
        
        return startDate <= nowDate && (!endDate || endDate >= nowDate)
      })

      ads.value = activeAds.map(ad => {
        const product = ad.product || ad.products || null
        const normalizedProduct = product
          ? {
              ...product,
              owner_id: product.owner_id || product.seller_id || null
            }
          : null

        return {
          ...ad,
          product: normalizedProduct,
          store: ad.store || ad.stores || null
        }
      })
      lastFetch.value = Date.now()
      return ads.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch ads'
      console.error('Error fetching ads:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getAdsBySlotType = (slotType) => {
    return adsBySlotType.value[slotType] || []
  }

  const getAdsByCategory = (categoryId) => {
    return ads.value.filter(ad => ad.category_id === categoryId)
  }

  const getCategoryProducts = (categoryId) => {
    // Get products from both homepage_browse_by_category_products and category_featured_products
    const browseByCategoryAds = homepageBrowseByCategoryProducts.value.filter(ad => ad.category_id === categoryId)
    const categoryFeaturedAds = categoryFeaturedProducts.value.filter(ad => ad.category_id === categoryId)
    
    // Combine and deduplicate by product_id
    const allAds = [...browseByCategoryAds, ...categoryFeaturedAds]
    const uniqueAds = allAds.filter((ad, index, self) => 
      index === self.findIndex(a => a.product_id === ad.product_id)
    )
    
    return uniqueAds
  }

  const transformAdsForDisplay = (adsList) => {
    return adsList.map(ad => {
      if (ad.item_type === 'product' && ad.product) {
        return {
          id: ad.id,
          type: 'product',
          priority: ad.priority,
          slotType: ad.slot_type,
          categoryId: ad.category_id,
          data: {
            ...ad.product,
            // Use thumbnail_url if available, otherwise first image from image_urls array
            image: ad.product.thumbnail_url || (Array.isArray(ad.product.image_urls) && ad.product.image_urls.length > 0 ? ad.product.image_urls[0] : null)
          }
        }
      } else if (ad.item_type === 'store' && ad.store) {
        return {
          id: ad.id,
          type: 'store',
          priority: ad.priority,
          slotType: ad.slot_type,
          categoryId: ad.category_id,
          data: {
            ...ad.store,
            // Use logo as main image
            image: ad.store.logo_url
          }
        }
      }
      return null
    }).filter(Boolean)
  }

  const clearCache = () => {
    ads.value = []
    lastFetch.value = null
    error.value = null
  }

  const refreshAds = async () => {
    return await fetchAds(true)
  }

  return {
    // State
    ads,
    loading,
    error,
    
    // Computed
    adsBySlotType,
    homepageBannerAds,
    homepageFeaturedProducts,
    homepageFeaturedStores,
    homepageBrowseByCategoryProducts,
    categoryBannerAds,
    categoryFeaturedProducts,
    
    // Actions
    fetchAds,
    getAdsBySlotType,
    getAdsByCategory,
    getCategoryProducts,
    transformAdsForDisplay,
    clearCache,
    refreshAds
  }
})
