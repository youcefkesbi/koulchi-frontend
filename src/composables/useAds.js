import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export function useAds() {
  const ads = ref([])
  const loading = ref(false)
  const error = ref(null)

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

      if (supabaseError) throw supabaseError

      ads.value = data || []
      return data
    } catch (err) {
      error.value = err.message || 'Failed to fetch ads'
      console.error('Error fetching ads:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch homepage banner ads
  const fetchHomepageBannerAds = async () => {
    return await fetchAds({ slot_type: 'homepage_banner' })
  }

  // Fetch homepage featured products
  const fetchHomepageFeaturedProducts = async () => {
    return await fetchAds({ 
      slot_type: 'homepage_featured_products',
      item_type: 'product'
    })
  }

  // Fetch homepage featured stores
  const fetchHomepageFeaturedStores = async () => {
    return await fetchAds({ 
      slot_type: 'homepage_featured_stores',
      item_type: 'store'
    })
  }

  // Fetch browse by category products
  const fetchBrowseByCategoryProducts = async (categoryId) => {
    return await fetchAds({ 
      slot_type: 'browse_by_category_products',
      item_type: 'product',
      category_id: categoryId
    })
  }

  // Fetch category banner ads
  const fetchCategoryBannerAds = async (categoryId) => {
    return await fetchAds({ 
      slot_type: 'category_banner',
      category_id: categoryId
    })
  }

  // Fetch category featured products
  const fetchCategoryFeaturedProducts = async (categoryId) => {
    return await fetchAds({ 
      slot_type: 'category_featured_products',
      item_type: 'product',
      category_id: categoryId
    })
  }

  // Computed properties for different ad types
  const productAds = computed(() => {
    return ads.value.filter(ad => ad.item_type === 'product' && ad.products)
  })

  const storeAds = computed(() => {
    return ads.value.filter(ad => ad.item_type === 'store' && ad.stores)
  })

  // Get ads by slot type
  const getAdsBySlotType = (slotType) => {
    return ads.value.filter(ad => ad.slot_type === slotType)
  }

  // Get ads by category
  const getAdsByCategory = (categoryId) => {
    return ads.value.filter(ad => ad.category_id === categoryId)
  }

  // Transform ads data for components
  const transformAdsForDisplay = (adsList) => {
    return adsList.map(ad => {
      if (ad.item_type === 'product' && ad.products) {
        return {
          id: ad.id,
          type: 'product',
          priority: ad.priority,
          data: {
            ...ad.products,
            // Ensure we have the first image
            image: ad.products.image_urls?.[0] || null
          }
        }
      } else if (ad.item_type === 'store' && ad.stores) {
        return {
          id: ad.id,
          type: 'store',
          priority: ad.priority,
          data: {
            ...ad.stores,
            // Use logo as main image
            image: ad.stores.logo_url
          }
        }
      }
      return null
    }).filter(Boolean)
  }

  // Clear ads data
  const clearAds = () => {
    ads.value = []
    error.value = null
  }

  return {
    // State
    ads,
    loading,
    error,
    
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
