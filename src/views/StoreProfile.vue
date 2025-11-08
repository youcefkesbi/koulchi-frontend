<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Store Header Section -->
    <div v-if="store" class="relative">
      <!-- Store Banner -->
      <div class="h-64 md:h-96 relative overflow-hidden">
        <img 
          v-if="store.banner_url" 
          :src="store.banner_url" 
          :alt="store.name"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
          <i class="fas fa-store text-6xl text-white opacity-50"></i>
        </div>
        
        <!-- Store Logo Overlay -->
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-6 md:p-8">
          <div class="container mx-auto">
            <div class="flex flex-col md:flex-row items-start md:items-end gap-6">
              <!-- Logo -->
              <div class="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl shadow-2xl p-3 flex-shrink-0">
                <img 
                  v-if="store.logo_url" 
                  :src="store.logo_url" 
                  :alt="store.name"
                  class="w-full h-full object-cover rounded-xl"
                />
                <div v-else class="w-full h-full bg-primary rounded-xl flex items-center justify-center">
                  <i class="fas fa-store text-white text-3xl md:text-4xl"></i>
                </div>
              </div>
              
              <!-- Store Info -->
              <div class="flex-1 text-white">
                <div class="flex items-center gap-3 mb-2">
                  <h1 class="text-3xl md:text-5xl font-bold">
                    {{ store.name }}
                  </h1>
                  <!-- Verified Badge for Pro Stores -->
                  <span 
                    v-if="isProStore" 
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-full text-sm md:text-base font-semibold shadow-lg"
                  >
                    <i class="fas fa-check-circle"></i>
                    <span>{{ $t('storeProfile.verified') }}</span>
                  </span>
                </div>
                <p v-if="store.description" class="text-lg md:text-xl text-white/90 mb-4 max-w-3xl line-clamp-2">
                  {{ store.description }}
                </p>
                <div class="flex flex-wrap items-center gap-4 text-sm md:text-base">
                  <div v-if="store.location" class="flex items-center gap-2">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>{{ store.location }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="fas fa-calendar-alt"></i>
                    <span>{{ $t('storeProfile.memberSince') }} {{ formatDate(store.created_at) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="fas fa-box"></i>
                    <span>{{ totalProducts }} {{ $t('storeProfile.products') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Store Content -->
    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p class="mt-4 text-gray-600">{{ $t('storeProfile.loading') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-16">
        <div class="text-red-500 text-6xl mb-4">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ $t('storeProfile.errorTitle') }}</h3>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <button 
          @click="fetchStoreData" 
          class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          {{ $t('storeProfile.retry') }}
        </button>
      </div>

      <!-- Store Content -->
      <div v-else-if="store" class="space-y-8">
        <!-- Store Stats & Social Links -->
        <div class="bg-white rounded-2xl shadow-soft p-6 md:p-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Store Statistics -->
            <div>
              <h3 class="text-xl font-bold text-gray-800 mb-4">{{ $t('storeProfile.storeStats') }}</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-50 rounded-xl p-4 text-center">
                  <div class="text-3xl font-bold text-primary mb-1">{{ totalProducts }}</div>
                  <div class="text-sm text-gray-600">{{ $t('storeProfile.totalProducts') }}</div>
                </div>
                <div class="bg-gray-50 rounded-xl p-4 text-center">
                  <div class="text-3xl font-bold text-primary mb-1">{{ approvedProducts }}</div>
                  <div class="text-sm text-gray-600">{{ $t('storeProfile.activeProducts') }}</div>
                </div>
                <div class="bg-gray-50 rounded-xl p-4 text-center">
                  <div class="text-3xl font-bold text-primary mb-1">{{ totalSold }}</div>
                  <div class="text-sm text-gray-600">{{ $t('storeProfile.itemsSold') }}</div>
                </div>
                <div class="bg-gray-50 rounded-xl p-4 text-center">
                  <div class="text-3xl font-bold text-primary mb-1">{{ newProducts }}</div>
                  <div class="text-sm text-gray-600">{{ $t('storeProfile.newProducts') }}</div>
                </div>
              </div>
            </div>

            <!-- Social Links -->
            <div v-if="externalButtons && externalButtons.length > 0">
              <h3 class="text-xl font-bold text-gray-800 mb-4">{{ $t('storeProfile.followUs') }}</h3>
              <div class="flex flex-wrap gap-3">
                <a
                  v-for="(button, index) in externalButtons"
                  :key="index"
                  :href="button.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-primary hover:text-white rounded-lg transition-colors"
                >
                  <i :class="getButtonIcon(button.type || 'link')"></i>
                  <span>{{ button.label || button.type || 'Link' }}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Products Section -->
        <div class="bg-white rounded-2xl shadow-soft p-6 md:p-8">
          <!-- Products Header with Filters -->
          <div class="mb-6">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  {{ $t('storeProfile.storeProducts') }}
                </h2>
                <p class="text-gray-600">
                  {{ $t('storeProfile.showingProducts', { count: filteredProducts.length, total: totalProducts }) }}
                </p>
              </div>
            </div>

            <!-- Search and Filter Controls -->
            <div class="flex flex-col sm:flex-row gap-4 mb-6">
              <!-- Search -->
              <div class="relative flex-1">
                <input
                  v-model="searchQuery"
                  type="text"
                  :placeholder="$t('storeProfile.searchPlaceholder')"
                  class="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <i class="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>

              <!-- Sort -->
              <select
                v-model="sortBy"
                class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="newest">{{ $t('storeProfile.sortNewest') }}</option>
                <option value="oldest">{{ $t('storeProfile.sortOldest') }}</option>
                <option value="price-low">{{ $t('storeProfile.sortPriceLow') }}</option>
                <option value="price-high">{{ $t('storeProfile.sortPriceHigh') }}</option>
                <option value="name-asc">{{ $t('storeProfile.sortNameAsc') }}</option>
                <option value="name-desc">{{ $t('storeProfile.sortNameDesc') }}</option>
              </select>
            </div>

            <!-- Category Filter -->
            <div v-if="availableCategories.length > 0" class="mb-6">
              <div class="flex flex-wrap gap-2">
                <button
                  @click="selectedCategory = 'all'"
                  :class="[
                    'px-4 py-2 rounded-lg transition-colors text-sm',
                    selectedCategory === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  {{ $t('storeProfile.allCategories') }}
                </button>
                <button
                  v-for="category in availableCategories"
                  :key="category.id"
                  @click="selectedCategory = category.id"
                  :class="[
                    'px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2',
                    selectedCategory === category.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  <img 
                    v-if="category.icon_url" 
                    :src="category.icon_url" 
                    :alt="getCategoryName(category)"
                    class="w-4 h-4 object-contain"
                  />
                  <i v-else class="fas fa-box text-xs"></i>
                  {{ getCategoryName(category) }}
                </button>
              </div>
            </div>
          </div>

          <!-- Products Grid -->
          <div v-if="filteredProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <ProductCard 
              v-for="product in filteredProducts" 
              :key="product.id" 
              :product="product"
              class="h-full"
            />
          </div>

          <!-- No Products State -->
          <div v-else class="text-center py-16">
            <div class="text-gray-400 text-6xl mb-4">
              <i class="fas fa-box-open"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ $t('storeProfile.noProductsTitle') }}</h3>
            <p class="text-gray-600">{{ $t('storeProfile.noProductsMessage') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/ProductCard.vue'

const route = useRoute()
const { t, locale } = useI18n()

const store = ref(null)
const packType = ref(null)
const products = ref([])
const categories = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const sortBy = ref('newest')
const selectedCategory = ref('all')

// Computed properties
const totalProducts = computed(() => products.value.length)
const approvedProducts = computed(() => products.value.filter(p => p.status === 'approved').length)
const totalSold = computed(() => products.value.reduce((sum, p) => sum + (p.sold_count || 0), 0))
const newProducts = computed(() => products.value.filter(p => p.is_new).length)

const isProStore = computed(() => packType.value === 'pro')

const externalButtons = computed(() => {
  if (!store.value?.external_buttons) return []
  try {
    return Array.isArray(store.value.external_buttons) 
      ? store.value.external_buttons 
      : JSON.parse(store.value.external_buttons)
  } catch {
    return []
  }
})

const availableCategories = computed(() => {
  const categoryMap = new Map()
  products.value.forEach(product => {
    if (product.category_id && product.categories) {
      const cat = product.categories
      if (!categoryMap.has(cat.id)) {
        categoryMap.set(cat.id, cat)
      }
    }
  })
  return Array.from(categoryMap.values())
})

const filteredProducts = computed(() => {
  let filtered = [...products.value]

  // Filter by category
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(p => p.category_id === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.name?.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    )
  }

  // Sort
  switch (sortBy.value) {
    case 'newest':
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      break
    case 'oldest':
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      break
    case 'price-low':
      filtered.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0))
      break
    case 'price-high':
      filtered.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0))
      break
    case 'name-asc':
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      break
    case 'name-desc':
      filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
      break
  }

  return filtered
})

// Methods
const fetchStoreData = async () => {
  try {
    loading.value = true
    error.value = null

    const storeId = route.params.id

    // Fetch store with pack information including type
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select(`
        *,
        packs (
          id,
          type,
          name_en,
          name_ar,
          name_fr
        )
      `)
      .eq('id', storeId)
      .eq('status', 'approved')
      .single()

    if (storeError) throw storeError
    store.value = storeData
    
    // Extract pack type
    if (storeData.packs && storeData.packs.type) {
      packType.value = storeData.packs.type
    } else {
      // Fallback: Use RPC function to get pack type
      try {
        const { data: proStores, error: rpcError } = await supabase
          .rpc('get_stores_by_pack_type', { pack_type: 'pro' })
        
        if (!rpcError && proStores) {
          const foundStore = proStores.find(s => s.id === storeId)
          if (foundStore) {
            packType.value = 'pro'
          } else {
            // Check if it's a basic store
            const { data: basicStores } = await supabase
              .rpc('get_stores_by_pack_type', { pack_type: 'basic' })
            
            if (basicStores && basicStores.find(s => s.id === storeId)) {
              packType.value = 'basic'
            }
          }
        }
      } catch (rpcErr) {
        console.warn('Could not fetch pack type via RPC:', rpcErr)
        // If pack_id exists, fetch pack directly
        if (storeData.pack_id) {
          const { data: packData } = await supabase
            .from('packs')
            .select('type')
            .eq('id', storeData.pack_id)
            .single()
          
          if (packData) {
            packType.value = packData.type
          }
        }
      }
    }

    // Fetch products
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*, categories(id, name_en, name_ar, name_fr, description, icon_url, is_active)')
      .eq('store_id', storeId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (productsError) throw productsError
    products.value = productsData || []

  } catch (err) {
    console.error('Error fetching store data:', err)
    error.value = err.message || t('storeProfile.errorMessage')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value || 'en', {
    year: 'numeric',
    month: 'long'
  })
}

const getCategoryName = (category) => {
  if (!category) return ''
  const currentLocale = locale.value
  if (currentLocale === 'ar' && category.name_ar) return category.name_ar
  if (currentLocale === 'fr' && category.name_fr) return category.name_fr
  return category.name_en || ''
}

const getButtonIcon = (type) => {
  const icons = {
    facebook: 'fab fa-facebook',
    instagram: 'fab fa-instagram',
    twitter: 'fab fa-twitter',
    youtube: 'fab fa-youtube',
    linkedin: 'fab fa-linkedin',
    website: 'fas fa-globe',
    email: 'fas fa-envelope',
    phone: 'fas fa-phone',
    link: 'fas fa-link'
  }
  return icons[type?.toLowerCase()] || icons.link
}

onMounted(() => {
  fetchStoreData()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
