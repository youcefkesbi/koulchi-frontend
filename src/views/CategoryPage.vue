<template>
  <div class="max-w-7xl mx-auto px-4 py-8 my-fade-in">
    <!-- Category Header -->
    <div class="text-center mb-12">
      <div class="flex items-center justify-center space-x-4 space-x-reverse mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300 category-icon">
          <i :class="getCategoryIcon(categoryId)" class="text-white text-2xl"></i>
        </div>
        <h1 class="text-4xl font-bold text-dark bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
          {{ getCategoryName(categoryId) }}
        </h1>
      </div>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
        {{ getCategoryDescription(categoryId) }}
      </p>
    </div>

    <!-- Filters and Sort -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
      <!-- Results Count -->
      <div class="text-gray-600">
        {{ $t('categoryPage.resultsCount', { count: filteredProducts.length, total: products.length }) }}
      </div>

      <!-- Sort Options -->
      <div class="flex items-center space-x-4 space-x-reverse">
        <label class="text-sm font-medium text-gray-700">{{ $t('categoryPage.sortBy') }}:</label>
        <select
          v-model="sortBy"
          class="px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 shadow-soft"
        >
          <option value="newest">{{ $t('categoryPage.sortNewest') }}</option>
          <option value="oldest">{{ $t('categoryPage.sortOldest') }}</option>
          <option value="price-low">{{ $t('categoryPage.sortPriceLow') }}</option>
          <option value="price-high">{{ $t('categoryPage.sortPriceHigh') }}</option>
          <option value="name">{{ $t('categoryPage.sortName') }}</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-16">
      <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-gray-600">{{ $t('categoryPage.loading') }}</p>
    </div>

    <!-- Products Grid -->
    <div v-else-if="filteredProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <i class="fas fa-box text-gray-400 text-3xl"></i>
      </div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">{{ $t('categoryPage.noProducts') }}</h3>
      <p class="text-gray-500 mb-6">{{ $t('categoryPage.noProductsMessage') }}</p>
      <router-link to="/products" class="btn-primary">
        <i class="fas fa-arrow-left mr-2"></i>
        {{ $t('categoryPage.browseAllProducts') }}
      </router-link>
    </div>

    <!-- Back to Categories -->
    <div class="text-center mt-12">
      <router-link to="/" class="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 font-medium rounded-2xl transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105">
        <i class="fas fa-arrow-left mr-2"></i>
        {{ $t('categoryPage.backToCategories') }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import i18n from '../i18n'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '../stores/product'
import ProductCard from '../components/ProductCard.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const sortBy = ref('newest')
const loading = ref(false)
const categoryId = computed(() => route.params.categoryId)

// Get products for this category
const products = computed(() => {
  if (categoryId.value === 'all') {
    return productStore.products
  }
  return productStore.products.filter(product => product.category_id === categoryId.value)
})

// Sort and filter products
const filteredProducts = computed(() => {
  let sorted = [...products.value]
  
  switch (sortBy.value) {
    case 'newest':
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      break
    case 'oldest':
      sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      break
    case 'price-low':
      sorted.sort((a, b) => a.price - b.price)
      break
    case 'price-high':
      sorted.sort((a, b) => b.price - a.price)
      break
    case 'name':
      // Sort by the appropriate localized name field
      const currentLocale = i18n.global.locale.value
      sorted.sort((a, b) => {
        const nameA = currentLocale === 'ar' && a.name_ar ? a.name_ar : 
                     currentLocale === 'fr' && a.name_fr ? a.name_fr : a.name_en
        const nameB = currentLocale === 'ar' && b.name_ar ? b.name_ar : 
                     currentLocale === 'fr' && b.name_fr ? b.name_fr : b.name_en
        return nameA.localeCompare(nameB)
      })
      break
  }
  
  return sorted
})

// Get category icon
const getCategoryIcon = (categoryId) => {
  const iconMap = {
    'cars': 'fas fa-car',
    'realestate': 'fas fa-home',
    'electronics': 'fas fa-laptop',
    'fashion': 'fas fa-tshirt',
    'home': 'fas fa-couch',
    'beauty': 'fas fa-spa',
    'kids': 'fas fa-baby',
    'food': 'fas fa-utensils'
  }
  return iconMap[categoryId] || 'fas fa-tag'
}

// Get category name
const getCategoryName = (categoryId) => {
  const category = productStore.categories.find(cat => cat.id === categoryId)
  if (category) {
    // Check if we have a localized name for the current language
    const currentLocale = i18n.global.locale.value
    
    if (currentLocale === 'ar' && category.name_ar) {
      return category.name_ar
    }
    
    if (currentLocale === 'fr' && category.name_fr) {
      return category.name_fr
    }
    
    // Fall back to the English name field
    return category.name_en
  }
  return categoryId
}

// Get category description
const getCategoryDescription = (categoryId) => {
  const descriptions = {
    'cars': 'Discover a wide selection of vehicles, from compact cars to luxury models',
    'realestate': 'Find your perfect home with our comprehensive real estate listings',
    'electronics': 'Latest gadgets and electronic devices for tech enthusiasts',
    'fashion': 'Trendy clothing and accessories for every style and occasion',
    'home': 'Everything you need to make your home beautiful and comfortable',
    'beauty': 'Premium beauty and personal care products for your daily routine',
    'kids': 'Quality products for children of all ages',
    'food': 'Fresh and delicious food products from trusted suppliers'
  }
  return descriptions[categoryId] || 'Explore our amazing products in this category'
}

// Validate category ID
const validateCategory = () => {
  const validCategories = productStore.categories.map(cat => cat.id)
  if (!validCategories.includes(categoryId.value)) {
    // Use router to go back to home instead of hardcoded 404
    router.push('/')
  }
}

// Watch for route changes
watch(() => route.params.categoryId, async (newCategoryId) => {
  loading.value = true
  try {
    validateCategory()
    // Refetch products for the new category
    if (newCategoryId && newCategoryId !== 'all') {
      await productStore.fetchProducts({ category_id: newCategoryId })
    }
  } catch (error) {
    console.error('Error loading new category:', error)
  } finally {
    loading.value = false
  }
})

onMounted(async () => {
  loading.value = true
  try {
    // Fetch categories if not already loaded
    if (productStore.categories.length === 0) {
      await productStore.fetchCategories()
    }
    
    // Fetch products for this specific category
    await productStore.fetchProducts({ category_id: categoryId.value })
    
    validateCategory()
  } catch (error) {
    console.error('Error loading category page:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.categories-dropdown {
  position: relative;
}

/* Animation classes - using global my-fade-in class */

/* Hover effects for category icon */
.category-icon {
  transition: all 0.3s ease;
}

.category-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}
</style>
