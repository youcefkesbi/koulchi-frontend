<template>
  <div class="category-featured-products-container">
    <!-- Loading State -->
    <div v-if="loading" class="products-loading">
      <div class="loading-header">
        <div class="skeleton-title"></div>
        <div class="skeleton-subtitle"></div>
      </div>
      <div class="loading-grid">
        <div 
          v-for="i in 8" 
          :key="i" 
          class="skeleton-product"
        >
          <div class="skeleton-image"></div>
          <div class="skeleton-content">
            <div class="skeleton-name"></div>
            <div class="skeleton-price"></div>
            <div class="skeleton-button"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="products-error">
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="$emit('retry')" class="retry-btn">
          <i class="fas fa-redo"></i>
          {{ $t('common.retry') }}
        </button>
      </div>
    </div>

    <!-- Products Content -->
    <div v-else-if="featuredProductAds.length > 0" class="products-wrapper">
      <div class="section-header">
        <h2 class="section-title">{{ title }}</h2>
        <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
      </div>
      
      <div class="carousel-container">
        <button
          v-if="canScroll"
          type="button"
          class="carousel-nav prev-btn"
          :aria-label="$t('common.back')"
          @click="scrollCarousel(-1)"
        >
          <i class="fas fa-chevron-right"></i>
        </button>

        <div ref="carouselTrack" class="carousel-track">
          <div
            v-for="ad in featuredProductAds"
            :key="ad.id"
            class="carousel-item"
          >
            <ProductCard :product="ad.product" layout="carousel" />
          </div>
        </div>

        <button
          v-if="canScroll"
          type="button"
          class="carousel-nav next-btn"
          :aria-label="$t('common.next')"
          @click="scrollCarousel(1)"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="products-empty">
      <div class="empty-message">
        <i class="fas fa-star"></i>
        <p>{{ $t('ads.noCategoryFeaturedProducts') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAdsStore } from '../../stores/useAdsStore'
import ProductCard from '../ProductCard.vue'

const props = defineProps({
  categoryId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'Featured Products'
  },
  subtitle: {
    type: String,
    default: null
  },
  maxProducts: {
    type: Number,
    default: 8
  }
})

const emit = defineEmits(['retry'])

const adsStore = useAdsStore()
const carouselTrack = ref(null)

// Product ads with joined product; dedupe by product_id; cap at maxProducts
const featuredProductAds = computed(() => {
  const categoryFeaturedAds = (adsStore.categoryFeaturedProducts || []).filter(
    ad => ad.category_id === props.categoryId
  )
  const browseByCategoryAds = (adsStore.homepageBrowseByCategoryProducts || []).filter(
    ad => ad.category_id === props.categoryId
  )
  const allAds = [...categoryFeaturedAds, ...browseByCategoryAds]
  const uniqueAds = allAds.filter(
    (ad, index, self) => index === self.findIndex(a => a.product_id === ad.product_id)
  )
  return uniqueAds
    .filter(ad => ad.item_type === 'product' && ad.product?.id)
    .slice(0, props.maxProducts)
})

const loading = computed(() => adsStore.loading)
const error = computed(() => adsStore.error)
const canScroll = computed(() => featuredProductAds.value.length > 1)

const scrollCarousel = (direction = 1) => {
  const track = carouselTrack.value
  if (!track) return

  const card = track.querySelector('.carousel-item')
  const cardWidth = card?.getBoundingClientRect().width || 320
  const gap = 24
  const amount = cardWidth + gap
  track.scrollBy({ left: amount * direction, behavior: 'smooth' })
}
</script>

<style scoped>
.category-featured-products-container {
  width: 100%;
  margin-bottom: 3rem;
}

/* Loading State */
.products-loading {
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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
  margin-bottom: 1rem;
  width: 60%;
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
.products-error {
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

/* Products Wrapper */
.products-wrapper {
  width: 100%;
}

.carousel-container {
  position: relative;
}

.carousel-track {
  display: flex;
  align-items: stretch;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding: 0.5rem 0.25rem 1rem;
}

.carousel-track::-webkit-scrollbar {
  height: 0.5rem;
}

.carousel-track::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 9999px;
}

.carousel-track::-webkit-scrollbar-track {
  background: transparent;
}

.carousel-item {
  flex: 0 0 100%;
  min-width: 0;
  display: flex;
  scroll-snap-align: start;
}

.carousel-nav {
  position: absolute;
  top: 45%;
  transform: translateY(-50%);
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  color: #111827;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 20;
  transition: all 0.2s ease;
}

.carousel-nav:hover {
  background: #111827;
  color: #ffffff;
}

.prev-btn {
  right: -0.5rem;
}

.next-btn {
  left: -0.5rem;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
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

  .carousel-track {
    gap: 1rem;
    padding-bottom: 0.75rem;
  }

  .carousel-nav {
    width: 2.25rem;
    height: 2.25rem;
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

  .carousel-nav {
    display: none;
  }
}

@media (min-width: 640px) {
  .carousel-item {
    flex-basis: 100%;
  }
}

@media (min-width: 1024px) {
  .carousel-item {
    flex-basis: 100%;
  }
}

@media (min-width: 1280px) {
  .carousel-item {
    flex-basis: calc((100% - 1.5rem) / 2);
  }
}
</style>
