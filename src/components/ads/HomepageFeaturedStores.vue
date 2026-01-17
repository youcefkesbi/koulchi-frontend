<template>
  <div class="homepage-featured-stores-container">
    <!-- Loading State -->
    <div v-if="loading" class="stores-loading">
      <div class="loading-header">
        <div class="skeleton-title"></div>
        <div class="skeleton-subtitle"></div>
      </div>
      <div class="loading-grid">
        <div 
          v-for="i in 6" 
          :key="i" 
          class="skeleton-store"
        >
          <div class="skeleton-image"></div>
          <div class="skeleton-content">
            <div class="skeleton-name"></div>
            <div class="skeleton-location"></div>
            <div class="skeleton-button"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="stores-error">
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="$emit('retry')" class="retry-btn">
          <i class="fas fa-redo"></i>
          {{ $t('common.retry') }}
        </button>
      </div>
    </div>

    <!-- Stores Content -->
    <div v-else-if="featuredStores.length > 0" class="stores-wrapper">
      <div class="section-header">
        <h2 class="section-title">{{ title }}</h2>
        <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
        <router-link 
          v-if="showViewAll" 
          :to="viewAllLink" 
          class="view-all-link"
        >
          {{ $t('sections.viewAll') }}
          <i class="fas fa-arrow-left"></i>
        </router-link>
      </div>
      
      <AdGrid
        :ads="featuredStores"
        :loading="false"
        :error="null"
        :columns="3"
        :max-items="maxStores"
        @retry="$emit('retry')"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="stores-empty">
      <div class="empty-message">
        <i class="fas fa-store"></i>
        <p>{{ $t('ads.noFeaturedStores') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdsStore } from '../../stores/useAdsStore'
import AdGrid from '../AdGrid.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Featured Stores'
  },
  subtitle: {
    type: String,
    default: null
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

const emit = defineEmits(['retry'])

const { t } = useI18n()
const adsStore = useAdsStore()

// Computed properties
const featuredStores = computed(() => {
  const rawAds = adsStore.homepageFeaturedStores
  return adsStore.transformAdsForDisplay(rawAds)
})

const loading = computed(() => adsStore.loading)
const error = computed(() => adsStore.error)
</script>

<style scoped>
.homepage-featured-stores-container {
  width: 100%;
  margin-bottom: 3rem;
}

/* Loading State */
.stores-loading {
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

.loading-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.skeleton-store {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: pulse 2s infinite;
}

.skeleton-image {
  width: 100%;
  height: 150px;
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

.skeleton-location {
  height: 1rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  width: 70%;
}

.skeleton-button {
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

/* Stores Wrapper */
.stores-wrapper {
  width: 100%;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
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
  margin-bottom: 1rem;
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
  
  .loading-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
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
  
  .loading-grid {
    grid-template-columns: 1fr;
  }
  
  .skeleton-title {
    width: 200px;
  }
}
</style>
