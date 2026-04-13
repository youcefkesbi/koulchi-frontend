<template>
  <div class="category-banner-container">
    <!-- Loading State -->
    <div v-if="loading" class="banner-loading">
      <div class="skeleton-banner"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="banner-error">
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="$emit('retry')" class="retry-btn">
          <i class="fas fa-redo"></i>
          {{ $t('common.retry') }}
        </button>
      </div>
    </div>

    <!-- Banner Content -->
    <div v-else-if="bannerAds.length > 0" class="banner-wrapper">
      <AdCarousel
        :ads="bannerAds"
        :loading="false"
        :error="null"
        :show-main-banner="showMainBanner"
        :main-banner-title="mainBannerTitle"
        :main-banner-subtitle="mainBannerSubtitle"
        :auto-play="autoPlay"
        :auto-play-interval="autoPlayInterval"
        @retry="$emit('retry')"
        @scroll-to-content="$emit('scroll-to-content')"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="banner-empty">
      <div class="empty-message">
        <i class="fas fa-image"></i>
        <p>{{ $t('ads.noCategoryBannerAds') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAdsStore } from '../../stores/useAdsStore'
import AdCarousel from '../AdCarousel.vue'

const props = defineProps({
  categoryId: {
    type: String,
    required: true
  },
  showMainBanner: {
    type: Boolean,
    default: true
  },
  mainBannerTitle: {
    type: String,
    default: 'Category'
  },
  mainBannerSubtitle: {
    type: String,
    default: 'Explore products in this category'
  },
  autoPlay: {
    type: Boolean,
    default: true
  },
  autoPlayInterval: {
    type: Number,
    default: 5000
  }
})

const emit = defineEmits(['retry', 'scroll-to-content'])

const adsStore = useAdsStore()

// Raw ads for AdCarousel (expects item_type, product, store — see useAdsStore)
const bannerAds = computed(() =>
  (adsStore.categoryBannerAds || []).filter(ad => ad.category_id === props.categoryId)
)

const loading = computed(() => adsStore.loading)
const error = computed(() => adsStore.error)
</script>

<style scoped>
.category-banner-container {
  width: 100%;
  margin-bottom: 2rem;
}

/* Loading State */
.banner-loading {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  border-radius: 1.5rem;
}

.skeleton-banner {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 1.5rem;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Error State */
.banner-error {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border-radius: 1.5rem;
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

/* Banner Wrapper */
.banner-wrapper {
  width: 100%;
}

/* Empty State */
.banner-empty {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f9fafb, #f3f4f6);
  border-radius: 1.5rem;
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
  .banner-loading,
  .banner-error,
  .banner-empty {
    height: 300px;
  }
}

@media (max-width: 480px) {
  .banner-loading,
  .banner-error,
  .banner-empty {
    height: 250px;
  }
}
</style>
