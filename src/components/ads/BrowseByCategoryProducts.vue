<template>
  <div class="browse-by-category-container">
    <!-- Loading State -->
    <div v-if="loading" class="categories-loading">
      <div class="loading-header">
        <div class="skeleton-title"></div>
        <div class="skeleton-subtitle"></div>
      </div>
      <div class="loading-categories">
        <div 
          v-for="i in 3" 
          :key="i" 
          class="skeleton-category"
        >
          <div class="skeleton-category-header">
            <div class="skeleton-category-name"></div>
            <div class="skeleton-view-all"></div>
          </div>
          <div class="skeleton-products-grid">
            <div 
              v-for="j in 4" 
              :key="j" 
              class="skeleton-product"
            >
              <div class="skeleton-image"></div>
              <div class="skeleton-content">
                <div class="skeleton-name"></div>
                <div class="skeleton-price"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="categories-error">
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="$emit('retry')" class="retry-btn">
          <i class="fas fa-redo"></i>
          {{ $t('common.retry') }}
        </button>
      </div>
    </div>

    <!-- Categories Content -->
    <div v-else-if="categoriesWithProducts.length > 0" class="categories-wrapper">
      <div class="section-header">
        <h2 class="section-title">{{ title }}</h2>
        <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
      </div>
      
      <div class="categories-grid">
        <div 
          v-for="category in categoriesWithProducts" 
          :key="category.id" 
          class="category-section"
        >
          <div class="category-header">
            <h3 class="category-title">{{ getCategoryName(category.id) }}</h3>
            <router-link 
              :to="`/category/${category.id}`" 
              class="view-all-link"
            >
              {{ $t('sections.viewAll') }}
              <i class="fas fa-arrow-left"></i>
            </router-link>
          </div>
          
          <AdGrid
            :ads="category.products"
            :loading="false"
            :error="null"
            :columns="4"
            :max-items="maxProductsPerCategory"
            @retry="$emit('retry')"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="categories-empty">
      <div class="empty-message">
        <i class="fas fa-tags"></i>
        <p>{{ $t('ads.noCategoryProducts') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdsStore } from '../../stores/useAdsStore'
import { useProductStore } from '../../stores/useProductStore'
import AdGrid from '../AdGrid.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Browse by Category'
  },
  subtitle: {
    type: String,
    default: null
  },
  maxProductsPerCategory: {
    type: Number,
    default: 8
  }
})

const emit = defineEmits(['retry'])

const { t, locale } = useI18n()
const adsStore = useAdsStore()
const productStore = useProductStore()

// Computed properties
const categoriesWithProducts = computed(() => {
  const categories = productStore.categories.filter(cat => cat.id !== 'all')
  const browseByCategoryAds = adsStore.homepageBrowseByCategoryProducts
  
  return categories.map(category => {
    const categoryAds = browseByCategoryAds.filter(ad => ad.category_id === category.id)
    const transformedProducts = adsStore.transformAdsForDisplay(categoryAds)
    
    return {
      id: category.id,
      name: category.name_en,
      products: transformedProducts
    }
  }).filter(category => category.products.length > 0)
})

const loading = computed(() => adsStore.loading || productStore.loading)
const error = computed(() => adsStore.error || productStore.error)

// Helper function to get localized category name
const getCategoryName = (categoryId) => {
  const category = productStore.categories.find(cat => cat.id === categoryId)
  if (category) {
    const currentLocale = locale.value
    
    if (currentLocale === 'ar' && category.name_ar) {
      return category.name_ar
    }
    
    if (currentLocale === 'fr' && category.name_fr) {
      return category.name_fr
    }
    
    return category.name_en
  }
  return categoryId
}
</script>

<style scoped>
.browse-by-category-container {
  width: 100%;
  margin-bottom: 3rem;
}

/* Loading State */
.categories-loading {
  width: 100%;
}

.loading-header {
  text-align: center;
  margin-bottom: 2rem;
}

.skeleton-title {
  height: 2rem;
  background: #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  width: 300px;
  margin: 0 auto 0.5rem;
}

.skeleton-subtitle {
  height: 1rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  width: 200px;
  margin: 0 auto;
}

.loading-categories {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.skeleton-category {
  width: 100%;
}

.skeleton-category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.skeleton-category-name {
  height: 1.5rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  width: 200px;
}

.skeleton-view-all {
  height: 1rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  width: 100px;
}

.skeleton-products-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.skeleton-product {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: pulse 2s infinite;
}

.skeleton-image {
  width: 100%;
  height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-content {
  padding: 1rem;
}

.skeleton-name {
  height: 1.25rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}

.skeleton-price {
  height: 1rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  width: 60%;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Error State */
.categories-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border-radius: 1rem;
}

.error-message {
  text-align: center;
  color: #dc2626;
}

.error-message i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem auto 0;
}

.retry-btn:hover {
  background: #b91c1c;
}

/* Categories Wrapper */
.categories-wrapper {
  width: 100%;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
}

.categories-grid {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.category-section {
  width: 100%;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.category-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #059669;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.view-all-link:hover {
  color: #047857;
  text-decoration: underline;
}

/* Empty State */
.categories-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: linear-gradient(135deg, #f9fafb, #f3f4f6);
  border-radius: 1rem;
}

.empty-message {
  text-align: center;
  color: #6b7280;
}

.empty-message i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Responsive Design */
@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
  }
  
  .category-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .skeleton-category-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .skeleton-products-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .skeleton-title {
    width: 250px;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.75rem;
  }
  
  .skeleton-products-grid {
    grid-template-columns: 1fr;
  }
  
  .skeleton-title {
    width: 200px;
  }
}
</style>