<template>
  <div class="ad-grid-container">
    <!-- Loading State -->
    <div v-if="loading" class="grid-loading">
      <div 
        v-for="i in skeletonCount" 
        :key="i" 
        class="skeleton-item"
        :class="itemType"
      >
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-subtitle"></div>
          <div class="skeleton-action"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="grid-error">
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="$emit('retry')" class="retry-btn">
          <i class="fas fa-redo"></i>
          {{ $t('common.retry') }}
        </button>
      </div>
    </div>

    <!-- Grid Content -->
    <div v-else-if="gridItems.length > 0" class="ad-grid">
      <div 
        v-for="(item, index) in gridItems" 
        :key="`${item.type}-${item.id}-${index}`"
        class="grid-item"
        :class="[itemType, { 'featured': item.priority > 0 }]"
      >
        <!-- Product Item -->
        <div v-if="item.type === 'product'" class="product-item">
          <div class="item-image-container">
            <img 
              v-if="item.data.image" 
              :src="item.data.image" 
              :alt="item.data.name"
              class="item-image"
              @error="handleImageError"
            />
            <div v-else class="item-image-placeholder">
              <i class="fas fa-image"></i>
            </div>
            
            <!-- Product Badges -->
            <div class="item-badges">
              <span v-if="item.data.is_new" class="badge badge-new">
                {{ $t('product.new') }}
              </span>
              <span v-if="item.data.is_on_sale" class="badge badge-sale">
                {{ $t('product.sale') }}
              </span>
            </div>
            
            <!-- Stock Status -->
            <div class="stock-status" :class="{ 'out-of-stock': (item.data.stock_quantity || 0) <= 0 }">
              <i class="fas fa-box"></i>
              <span>{{ (item.data.stock_quantity || 0) <= 0 ? $t('product.outOfStock') : item.data.stock_quantity }}</span>
            </div>
          </div>
          
          <div class="item-content">
            <h3 class="item-title">{{ item.data.name }}</h3>
            <div class="item-price">
              {{ formatPrice(item.data.price) }} {{ $t('common.currencyShort') }}
            </div>
            <div class="item-actions">
              <button 
                @click="navigateToProduct(item.data.id)"
                class="action-btn primary"
                :disabled="(item.data.stock_quantity || 0) <= 0"
              >
                <i class="fas fa-eye"></i>
                {{ $t('product.viewProduct') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Store Item -->
        <div v-else-if="item.type === 'store'" class="store-item">
          <div class="item-image-container">
            <img 
              v-if="item.data.image" 
              :src="item.data.image" 
              :alt="item.data.name || 'Store'"
              class="item-image"
              @error="handleImageError"
            />
            <div v-else class="item-image-placeholder">
              <i class="fas fa-store"></i>
            </div>
          </div>
          
          <div class="item-content">
            <h3 class="item-title">
              {{ item.data.name || `Store #${item.data.id?.slice(-8)}` }}
            </h3>
            <div class="item-location">
              <i class="fas fa-map-marker-alt"></i>
              {{ item.data.location }}
            </div>
            <div class="item-actions">
              <button 
                @click="navigateToStore(item.data.id)"
                class="action-btn primary"
              >
                <i class="fas fa-store"></i>
                {{ $t('store.visitStore') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="grid-empty">
      <div class="empty-message">
        <i class="fas fa-search"></i>
        <p>{{ $t('ads.noAdsFound') }}</p>
        <button @click="$emit('retry')" class="retry-btn">
          <i class="fas fa-redo"></i>
          {{ $t('common.retry') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocaleRouter } from '../composables/useLocaleRouter'

const props = defineProps({
  ads: {
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
  columns: {
    type: Number,
    default: 4
  },
  maxItems: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['retry'])

const { t } = useI18n()
const router = useRouter()
const { navigateToPath } = useLocaleRouter()

// Computed properties
const gridItems = computed(() => {
  let items = props.ads || []
  
  // Limit items if maxItems is specified
  if (props.maxItems && items.length > props.maxItems) {
    items = items.slice(0, props.maxItems)
  }
  
  return items
})

const itemType = computed(() => {
  if (gridItems.value.length === 0) return 'product'
  return gridItems.value[0]?.type || 'product'
})

const skeletonCount = computed(() => {
  return Math.min(props.columns * 2, 8) // Show 2 rows of skeleton items
})

// Methods
const formatPrice = (price) => {
  if (!price) return '0'
  return price.toLocaleString('ar-DZ')
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

const navigateToProduct = (productId) => {
  navigateToPath(`/product/${productId}`)
}

const navigateToStore = (storeId) => {
  navigateToPath(`/store/${storeId}`)
}
</script>

<style scoped>
.ad-grid-container {
  width: 100%;
  min-width: 0;
  overflow: hidden;
}

/* Loading State */
.grid-loading {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.skeleton-item {
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

.skeleton-subtitle {
  height: 1rem;
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
.grid-error {
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

/* Grid Layout */
.ad-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}
@media (max-width: 639px) {
  .ad-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
@media (min-width: 640px) and (max-width: 1023px) {
  .ad-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.25rem;
  }
}

/* Grid Items */
.grid-item {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  max-width: 100%;
  width: 100%;
}

.grid-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.grid-item.featured {
  border: 2px solid #059669;
  box-shadow: 0 4px 6px rgba(5, 150, 105, 0.2);
}

.grid-item.featured::before {
  content: 'Featured';
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #059669;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 1;
}

/* Product Item */
.product-item .item-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f3f4f6;
}

.product-item .item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-item:hover .item-image {
  transform: scale(1.05);
}

/* Store Item */
.store-item .item-image-container {
  position: relative;
  width: 100%;
  height: 150px;
  overflow: hidden;
  background: #f3f4f6;
}

.store-item .item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.store-item:hover .item-image {
  transform: scale(1.05);
}

/* Image Placeholder */
.item-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 2rem;
}

/* Badges */
.item-badges {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.badge-new {
  background: #059669;
}

.badge-sale {
  background: #dc2626;
}

/* Stock Status */
.stock-status {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stock-status.out-of-stock {
  background: rgba(220, 38, 38, 0.8);
}

/* Item Content */
.item-content {
  padding: 1rem;
}

.item-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 1rem;
}

.item-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  min-height: 44px;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.action-btn.primary {
  background: #059669;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.action-btn:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Empty State */
.grid-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
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
@media (max-width: 1200px) {
  .ad-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  
  .grid-loading {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .ad-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .grid-loading {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .item-content {
    padding: 0.75rem;
  }
  
  .item-title {
    font-size: 1rem;
  }
  
  .item-price {
    font-size: 1.125rem;
  }
  
  .action-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .ad-grid {
    grid-template-columns: 1fr;
  }
  
  .product-item .item-image-container,
  .store-item .item-image-container {
    height: 150px;
  }
}
</style>
