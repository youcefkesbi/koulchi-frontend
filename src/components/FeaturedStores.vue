<template>
  <section class="featured-stores-section">
    <!-- Section Header -->
    <div class="section-header">
      <h2 class="section-title">{{ title }}</h2>
      <div class="section-actions">
        <button
          @click="refreshStores"
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
    <div v-if="loading" class="stores-loading">
      <div 
        v-for="i in skeletonCount" 
        :key="i" 
        class="store-skeleton"
      >
        <div class="skeleton-logo"></div>
        <div class="skeleton-content">
          <div class="skeleton-name"></div>
          <div class="skeleton-location"></div>
          <div class="skeleton-action"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="stores-error">
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="refreshStores" class="retry-btn">
          <i class="fas fa-redo"></i>
          {{ $t('common.retry') }}
        </button>
      </div>
    </div>

    <!-- Stores Grid -->
    <div v-else-if="stores.length > 0" class="stores-grid">
      <div 
        v-for="store in stores" 
        :key="store.id"
        class="store-card"
        :class="{ 'featured': store.priority > 0 }"
      >
        <!-- Store Logo -->
        <div class="store-logo-container">
          <img 
            v-if="store.data.logo_url" 
            :src="store.data.logo_url" 
            :alt="store.data.name || 'Store'"
            class="store-logo"
            @error="handleImageError"
          />
          <div v-else class="store-logo-placeholder">
            <i class="fas fa-store"></i>
          </div>
          
          <!-- Featured Badge -->
          <div v-if="store.priority > 0" class="featured-badge">
            <i class="fas fa-star"></i>
            {{ $t('store.featured') }}
          </div>
          
          <!-- Store Status -->
          <div class="store-status" :class="store.data.status">
            <i class="fas fa-circle"></i>
            <span>{{ $t(`store.status.${store.data.status}`) }}</span>
          </div>
        </div>

        <!-- Store Info -->
        <div class="store-info">
          <h3 class="store-name">
            {{ store.data.name || `Store #${store.data.id?.slice(-8)}` }}
          </h3>
          
          <div class="store-location">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ store.data.location }}</span>
          </div>
          
          <div v-if="store.data.description" class="store-description">
            <p>{{ truncateText(store.data.description, 100) }}</p>
          </div>
          
          <!-- Store Stats (if available) -->
          <div class="store-stats">
            <div class="stat-item">
              <i class="fas fa-box"></i>
              <span>{{ $t('store.products') }}</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-star"></i>
              <span>{{ $t('store.rating') }}</span>
            </div>
          </div>
        </div>

        <!-- Store Actions -->
        <div class="store-actions">
          <button 
            @click="navigateToStore(store.data.id)"
            class="visit-store-btn"
            :disabled="store.data.status !== 'active'"
          >
            <i class="fas fa-store"></i>
            {{ store.data.status === 'active' ? $t('store.visitStore') : $t('store.comingSoon') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="stores-empty">
      <div class="empty-message">
        <i class="fas fa-store"></i>
        <h3>{{ $t('sections.noFeaturedStores') }}</h3>
        <p>{{ $t('sections.noFeaturedStoresDesc') }}</p>
        <button @click="refreshStores" class="retry-btn">
          <i class="fas fa-redo"></i>
          {{ $t('common.retry') }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  stores: {
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
    default: 'Featured Stores'
  },
  showViewAll: {
    type: Boolean,
    default: true
  },
  viewAllLink: {
    type: String,
    default: '/stores'
  },
  maxStores: {
    type: Number,
    default: 6
  }
})

const emit = defineEmits(['refresh'])

const { t } = useI18n()
const router = useRouter()

// Computed properties
const skeletonCount = computed(() => {
  return Math.min(props.maxStores, 6)
})

// Methods
const refreshStores = () => {
  emit('refresh')
}

const navigateToStore = (storeId) => {
  router.push(`/store/${storeId}`)
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.featured-stores-section {
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
.stores-loading {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.store-skeleton {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: pulse 2s infinite;
}

.skeleton-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  margin: 0 auto 1rem;
}

.skeleton-content {
  text-align: center;
}

.skeleton-name {
  height: 1.25rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}

.skeleton-location {
  height: 1rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  width: 70%;
  margin-left: auto;
  margin-right: auto;
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
.stores-error {
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

/* Stores Grid */
.stores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Store Card */
.store-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  text-align: center;
}

.store-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.store-card.featured {
  border: 2px solid #059669;
  box-shadow: 0 4px 6px rgba(5, 150, 105, 0.2);
}

/* Store Logo */
.store-logo-container {
  position: relative;
  margin-bottom: 1rem;
}

.store-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f3f4f6;
  margin: 0 auto;
  display: block;
}

.store-logo-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 2rem;
  margin: 0 auto;
  border: 3px solid #e5e7eb;
}

/* Featured Badge */
.featured-badge {
  position: absolute;
  top: -0.5rem;
  right: 50%;
  transform: translateX(50%);
  background: #059669;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Store Status */
.store-status {
  position: absolute;
  bottom: -0.5rem;
  right: 50%;
  transform: translateX(50%);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.store-status.active {
  background: #dcfce7;
  color: #166534;
}

.store-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.store-status.rejected {
  background: #fee2e2;
  color: #991b1b;
}

/* Store Info */
.store-info {
  margin-bottom: 1.5rem;
}

.store-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.store-location {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.store-description {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.store-stats {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #6b7280;
  font-size: 0.75rem;
}

/* Store Actions */
.store-actions {
  display: flex;
  justify-content: center;
}

.visit-store-btn {
  padding: 0.75rem 1.5rem;
  background: #059669;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.visit-store-btn:hover:not(:disabled) {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.visit-store-btn:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Empty State */
.stores-empty {
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
  .stores-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .stores-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .stores-loading {
    gap: 1rem;
  }
  
  .store-card {
    padding: 1rem;
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
  .stores-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    text-align: center;
  }
  
  .store-logo,
  .store-logo-placeholder {
    width: 60px;
    height: 60px;
  }
  
  .store-name {
    font-size: 1.125rem;
  }
}
</style>
