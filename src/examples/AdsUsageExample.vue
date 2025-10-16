<template>
  <div class="ads-usage-example">
    <h1 class="text-3xl font-bold mb-8">Ads System Usage Example</h1>
    
    <!-- Example 1: Homepage Banner -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">1. Homepage Banner</h2>
      <p class="text-gray-600 mb-4">Displays banner ads with slot_type: 'homepage_banner'</p>
      <HomepageBanner
        :show-main-banner="true"
        main-banner-title="Welcome to Our Store"
        main-banner-subtitle="Discover amazing products"
        @retry="handleRetry"
        @scroll-to-content="handleScrollToContent"
      />
    </section>

    <!-- Example 2: Homepage Featured Products -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">2. Homepage Featured Products</h2>
      <p class="text-gray-600 mb-4">Displays product ads with slot_type: 'homepage_featured_products'</p>
      <HomepageFeaturedProducts
        title="Featured Products"
        subtitle="Handpicked products just for you"
        :show-view-all="true"
        view-all-link="/products"
        :max-products="6"
        @retry="handleRetry"
      />
    </section>

    <!-- Example 3: Homepage Featured Stores -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">3. Homepage Featured Stores</h2>
      <p class="text-gray-600 mb-4">Displays store ads with slot_type: 'homepage_featured_stores'</p>
      <HomepageFeaturedStores
        title="Featured Stores"
        subtitle="Top-rated stores in our marketplace"
        :show-view-all="true"
        view-all-link="/stores"
        :max-stores="4"
        @retry="handleRetry"
      />
    </section>

    <!-- Example 4: Browse by Category Products -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">4. Browse by Category Products</h2>
      <p class="text-gray-600 mb-4">Displays product ads with slot_type: 'homepage_browse_by_category_products' grouped by category</p>
      <BrowseByCategoryProducts
        title="Browse by Category"
        subtitle="Products organized by category"
        :max-products-per-category="4"
        @retry="handleRetry"
      />
    </section>

    <!-- Example 5: Category Banner -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">5. Category Banner</h2>
      <p class="text-gray-600 mb-4">Displays banner ads with slot_type: 'category_banner' for a specific category</p>
      <CategoryBanner
        category-id="electronics"
        :show-main-banner="true"
        main-banner-title="Electronics"
        main-banner-subtitle="Latest gadgets and devices"
        @retry="handleRetry"
        @scroll-to-content="handleScrollToContent"
      />
    </section>

    <!-- Example 6: Category Featured Products -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">6. Category Featured Products</h2>
      <p class="text-gray-600 mb-4">Displays product ads with slot_type: 'category_featured_products' for a specific category. Also includes products from 'homepage_browse_by_category_products' for consistency.</p>
      <CategoryFeaturedProducts
        category-id="electronics"
        title="Featured Electronics"
        subtitle="Top electronics in this category"
        :max-products="6"
        @retry="handleRetry"
      />
    </section>

    <!-- Example 7: Direct Store Usage -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">7. Direct Store Usage</h2>
      <p class="text-gray-600 mb-4">Using the ads store directly in a component</p>
      <div class="bg-gray-100 p-6 rounded-lg">
        <h3 class="text-lg font-semibold mb-4">All Ads by Slot Type:</h3>
        <div v-for="(ads, slotType) in adsBySlotType" :key="slotType" class="mb-4">
          <h4 class="font-medium">{{ slotType }}: {{ ads.length }} ads</h4>
          <div class="text-sm text-gray-600">
            <div v-for="ad in ads.slice(0, 2)" :key="ad.id" class="ml-4">
              - {{ ad.item_type }}: {{ ad.products?.name || ad.stores?.name || 'Unknown' }}
            </div>
            <div v-if="ads.length > 2" class="ml-4 text-gray-500">... and {{ ads.length - 2 }} more</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Example 8: Manual Ad Fetching -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">8. Manual Ad Fetching</h2>
      <p class="text-gray-600 mb-4">Manually fetching and displaying ads</p>
      <div class="bg-gray-100 p-6 rounded-lg">
        <button 
          @click="fetchAdsManually" 
          :disabled="loading"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {{ loading ? 'Loading...' : 'Fetch Ads' }}
        </button>
        <div v-if="error" class="text-red-600 mt-2">{{ error }}</div>
        <div v-if="manualAds.length > 0" class="mt-4">
          <h4 class="font-medium">Fetched {{ manualAds.length }} ads:</h4>
          <div class="text-sm text-gray-600">
            <div v-for="ad in manualAds.slice(0, 5)" :key="ad.id" class="ml-4">
              - {{ ad.slot_type }}: {{ ad.item_type }} - {{ ad.products?.name || ad.stores?.name || 'Unknown' }}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdsStore } from '../stores/useAdsStore'
import HomepageBanner from '../components/ads/HomepageBanner.vue'
import HomepageFeaturedProducts from '../components/ads/HomepageFeaturedProducts.vue'
import HomepageFeaturedStores from '../components/ads/HomepageFeaturedStores.vue'
import BrowseByCategoryProducts from '../components/ads/BrowseByCategoryProducts.vue'
import CategoryBanner from '../components/ads/CategoryBanner.vue'
import CategoryFeaturedProducts from '../components/ads/CategoryFeaturedProducts.vue'

const adsStore = useAdsStore()

// State for manual fetching example
const manualAds = ref([])
const loading = ref(false)
const error = ref(null)

// Computed properties
const adsBySlotType = computed(() => adsStore.adsBySlotType)

// Methods
const handleRetry = () => {
  console.log('Retry requested')
  adsStore.refreshAds()
}

const handleScrollToContent = () => {
  console.log('Scroll to content requested')
  // Implement scroll logic here
}

const fetchAdsManually = async () => {
  loading.value = true
  error.value = null
  
  try {
    const ads = await adsStore.fetchAds()
    manualAds.value = ads
  } catch (err) {
    error.value = err.message
    console.error('Error fetching ads:', err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // Load ads when component mounts
  await adsStore.fetchAds()
})
</script>

<style scoped>
.ads-usage-example {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

section {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  background: white;
}
</style>
