<template>
  <section class="featured-products-section">
    <!-- Section Header -->
    <div class="section-header">
      <h2 class="section-title">{{ title }}</h2>
      <div class="section-actions">
        <button
          @click="refreshProducts"
          :disabled="loading"
          class="refresh-btn"
        >
          <i class="fas fa-sync-alt" :class="{ 'animate-spin': loading }"></i>
          {{ $t('sections.refresh') }}
        </button>
        <router-link 
          v-if="showViewAll && viewAllLink" 
          :to="viewAllLink" 
          class="view-all-btn"
        >
          {{ $t('sections.viewAll') }}
          <i class="fas fa-arrow-left"></i>
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="products-loading">
      <div 
        v-for="i in skeletonCount" 
        :key="i" 
        class="product-skeleton"
      >
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-price"></div>
          <div class="skeleton-action"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="products-error">
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="refreshProducts" class="retry-btn">
          <i class="fas fa-redo"></i>
          {{ $t('common.retry') }}
        </button>
      </div>
    </div>

    <!-- Products Grid -->
    <div v-else-if="products.length > 0" class="products-grid">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="products-empty">
      <div class="empty-message">
        <i class="fas fa-star"></i>
        <h3>{{ $t('sections.noFeaturedProducts') }}</h3>
        <p>{{ $t('sections.noFeaturedProductsDesc') }}</p>
        <button @click="refreshProducts" class="retry-btn">
          <i class="fas fa-redo"></i>
          {{ $t('common.retry') }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ProductCard from './ProductCard.vue'

const props = defineProps({
  products: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  title: {
    type: String,
    default: 'Featured Products'
  },
  showViewAll: {
    type: Boolean,
    default: true
  },
  viewAllLink: {
    type: String,
    default: '/products'
  },
  maxProducts: {
    type: Number,
    default: 8
  }
})

const emit = defineEmits(['refresh'])

const { t } = useI18n()

// Computed properties
const skeletonCount = computed(() => {
  return Math.min(props.maxProducts, 8)
})

// Methods
const refreshProducts = () => {
  emit('refresh')
}
</script>

<style scoped>
.featured-products-section {
  margin-bottom: 3rem;
}

/* Section Header */
.section-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (min-width: 640px) {
  .section-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.section-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

@media (min-width: 640px) {
  .section-title {
    font-size: 2.25rem;
  }
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  color: #059669;
  border: 1px solid #059669;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: #059669;
  color: white;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #059669;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

/* Loading State */
.products-loading {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.product-skeleton {
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

.skeleton-title {
  height: 1.25rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}

.skeleton-price {
  height: 1.5rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  width: 60%;
}

.skeleton-action {
  height: 2.5rem;
  background: #e5e7eb;
  border-radius: 0.5rem;
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
.products-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
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

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* Ensure grid items don't exceed their column width */
.products-grid > * {
  max-width: 100%;
}

/* Empty State */
.products-empty {
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
  max-width: 400px;
}

.empty-message i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-message h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.empty-message p {
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  
  .products-loading {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .products-loading {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .section-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .refresh-btn,
  .view-all-btn {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    text-align: center;
  }
}
</style>
