<template>
  <div
    class="ad-carousel-container"
    @mouseenter="stopAutoPlay"
    @mouseleave="startAutoPlay"
  >
    <!-- Loading State -->
    <div v-if="loading" class="carousel-loading">
      <div class="skeleton-banner"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="carousel-error">
      <div class="error-message">
        <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
        <p>{{ error }}</p>
        <button @click="$emit('retry')" class="retry-btn" type="button">
          <i class="fas fa-redo" aria-hidden="true"></i>
          {{ $t('common.retry') }}
        </button>
      </div>
    </div>

    <!-- Carousel Content -->
    <div v-else-if="carouselItems.length > 0" class="carousel-wrapper">
      <div class="carousel-viewport" ref="carouselContainer">
        <div
          class="carousel-track"
          :style="trackStyle"
        >
          <div
            v-for="(item, index) in carouselItems"
            :key="`${item.type}-${item.id}-${index}`"
            class="carousel-slide"
          >
            <!-- Main Banner (Static) -->
            <div v-if="index === 0 && showMainBanner" class="main-banner">
              <div class="main-banner-bg"></div>
              <div class="banner-content">
                <h1 class="banner-title">{{ mainBannerTitle }}</h1>
                <p class="banner-subtitle">{{ mainBannerSubtitle }}</p>
                <div class="banner-actions">
                  <button @click="scrollToContent" class="carousel-cta carousel-cta--primary" type="button">
                    <i class="fas fa-shopping-bag" aria-hidden="true"></i>
                    {{ $t('hero.shopNow') }}
                  </button>
                  <button class="carousel-cta carousel-cta--secondary" type="button">
                    <i class="fas fa-info-circle" aria-hidden="true"></i>
                    {{ $t('hero.learnMore') }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Ad Items: raw ads with ad.product / ad.store from Supabase -->
            <div v-else class="ad-slide" :class="{ 'ad-slide--product': item.type === 'product' }">
              <!-- Product Ad → full ProductCard (same role/actions as rest of site) -->
              <ProductCard
                v-if="item.type === 'product'"
                :product="item.product"
                class="carousel-product-card"
              />

              <!-- Store Ad -->
              <div v-else-if="item.type === 'store'" class="ad-card ad-card--store">
                <div class="ad-card-media">
                  <img
                    v-if="item.data.image"
                    :src="item.data.image"
                    :alt="item.data.name || 'Store'"
                    class="ad-card-img"
                    @error="handleImageError"
                  />
                  <div v-else class="ad-card-placeholder">
                    <i class="fas fa-store" aria-hidden="true"></i>
                  </div>
                </div>
                <div class="ad-card-body">
                  <h3 class="ad-card-title">{{ item.data.name || `Store #${item.data.id?.slice(-8)}` }}</h3>
                  <p class="ad-card-meta ad-card-location">
                    <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                    {{ item.data.location }}
                  </p>
                  <button
                    @click="navigateToStore(item.data.id)"
                    class="ad-card-btn"
                    type="button"
                  >
                    <i class="fas fa-store" aria-hidden="true"></i>
                    {{ $t('store.visitStore') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Arrow navigation (sides) -->
      <template v-if="carouselItems.length > 1">
        <button
          type="button"
          class="carousel-arrow carousel-arrow--prev"
          :disabled="!loop && currentIndex === 0"
          :aria-label="$t('carousel.prevSlide')"
          @click="prevSlide"
        >
          <i class="fas fa-chevron-left" aria-hidden="true"></i>
        </button>
        <button
          type="button"
          class="carousel-arrow carousel-arrow--next"
          :disabled="!loop && currentIndex === carouselItems.length - 1"
          :aria-label="$t('carousel.nextSlide')"
          @click="nextSlide"
        >
          <i class="fas fa-chevron-right" aria-hidden="true"></i>
        </button>

        <!-- Dots (bottom center) -->
        <div class="carousel-dots" role="tablist" :aria-label="$t('carousel.slideIndicators')">
          <button
            v-for="(item, index) in carouselItems"
            :key="index"
            type="button"
            role="tab"
            :aria-selected="currentIndex === index"
            :aria-label="$t('carousel.goToSlide', { index: index + 1 })"
            class="carousel-dot"
            :class="{ 'carousel-dot--active': currentIndex === index }"
            @click="goToSlide(index)"
          />
        </div>
      </template>
    </div>

    <!-- Empty State -->
    <div v-else class="carousel-empty">
      <div class="empty-message">
        <i class="fas fa-image" aria-hidden="true"></i>
        <p>{{ $t('ads.noAdsAvailable') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useLocaleRouter } from '../composables/useLocaleRouter'
import ProductCard from './ProductCard.vue'

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
  showMainBanner: {
    type: Boolean,
    default: true
  },
  mainBannerTitle: {
    type: String,
    default: 'Welcome to Koulchi'
  },
  mainBannerSubtitle: {
    type: String,
    default: 'Discover amazing products and stores'
  },
  autoPlay: {
    type: Boolean,
    default: true
  },
  autoPlayInterval: {
    type: Number,
    default: 5000
  },
  loop: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['retry', 'scroll-to-content'])

const { navigateToPath } = useLocaleRouter()

const carouselContainer = ref(null)
const currentIndex = ref(0)
const autoPlayTimer = ref(null)

// Raw ads from store: each has item_type, product, store (see useAdsStore.fetchAds)
const carouselItems = computed(() => {
  const items = []
  if (props.showMainBanner) {
    items.push({ type: 'banner', id: 'main-banner' })
  }
  for (const ad of props.ads || []) {
    if (ad.item_type === 'product' && ad.product?.id) {
      items.push({ type: 'product', id: ad.id, product: ad.product })
    } else if (ad.item_type === 'store' && ad.store?.id) {
      items.push({
        type: 'store',
        id: ad.id,
        data: {
          ...ad.store,
          image: ad.store.logo_url
        }
      })
    }
  }
  return items
})

const trackStyle = computed(() => ({
  transform: `translate3d(-${currentIndex.value * 100}%, 0, 0)`
}))

// Methods
const handleImageError = (event) => {
  event.target.style.display = 'none'
}

const navigateToStore = (storeId) => {
  navigateToPath(`/store/${storeId}`)
}

const scrollToContent = () => {
  emit('scroll-to-content')
}

// Carousel navigation
const nextSlide = () => {
  if (currentIndex.value < carouselItems.value.length - 1) {
    currentIndex.value++
  } else {
    currentIndex.value = 0 // Loop back to start
  }
}

const prevSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    currentIndex.value = carouselItems.value.length - 1 // Loop to end
  }
}

const goToSlide = (index) => {
  currentIndex.value = index
}

// Auto-play functionality
const startAutoPlay = () => {
  if (props.autoPlay && carouselItems.value.length > 1) {
    autoPlayTimer.value = setInterval(() => {
      nextSlide()
    }, props.autoPlayInterval)
  }
}

const stopAutoPlay = () => {
  if (autoPlayTimer.value) {
    clearInterval(autoPlayTimer.value)
    autoPlayTimer.value = null
  }
}

// Watch for changes in autoPlay prop
watch(() => props.autoPlay, (newValue) => {
  if (newValue) {
    startAutoPlay()
  } else {
    stopAutoPlay()
  }
})

// Lifecycle
onMounted(() => {
  startAutoPlay()
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<style scoped>
/* ---- Container: aspect-ratio + responsive height ---- */
.ad-carousel-container {
  position: relative;
  width: 100%;
  min-width: 0;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  aspect-ratio: 32 / 10;
  min-height: 280px;
  max-height: 420px;
}
@media (max-width: 1024px) {
  .ad-carousel-container {
    aspect-ratio: 3 / 1;
    min-height: 220px;
    max-height: 320px;
  }
}
@media (max-width: 640px) {
  .ad-carousel-container {
    aspect-ratio: 4 / 3;
    min-height: 240px;
    max-height: 320px;
    border-radius: 1rem;
  }
}

/* ---- Loading ---- */
.carousel-loading {
  width: 100%;
  height: 100%;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border-radius: inherit;
}
.skeleton-banner {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: carouselShimmer 1.4s ease-in-out infinite;
  border-radius: inherit;
}
@keyframes carouselShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ---- Error ---- */
.carousel-error {
  width: 100%;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border-radius: inherit;
}
.error-message {
  text-align: center;
  color: #b91c1c;
  padding: 1rem;
}
.error-message i {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  display: block;
}
.retry-btn {
  margin-top: 1rem;
  padding: 0.625rem 1.25rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}
.retry-btn:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

/* ---- Wrapper + viewport + track ---- */
.carousel-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: inherit;
}
.carousel-viewport {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: inherit;
}
.carousel-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
}
.carousel-slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  position: relative;
}

/* ---- Main hero banner ---- */
.main-banner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.main-banner-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #047857 0%, #059669 40%, #10b981 100%);
}
.main-banner-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 50% at 70% 50%, rgba(255,255,255,0.12) 0%, transparent 50%),
    linear-gradient(180deg, rgba(0,0,0,0.08) 0%, transparent 40%);
  pointer-events: none;
}
.banner-content {
  text-align: center;
  color: white;
  z-index: 1;
  position: relative;
  max-width: 560px;
  padding: 1.5rem 1.25rem 2rem;
}
.banner-title {
  font-size: clamp(1.5rem, 4vw + 1rem, 2.75rem);
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 0.5rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  letter-spacing: -0.02em;
}
.banner-subtitle {
  font-size: clamp(0.9375rem, 2vw + 0.5rem, 1.25rem);
  margin: 0 0 1.5rem;
  opacity: 0.95;
  line-height: 1.5;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}
.banner-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}
.carousel-cta {
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.9375rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
}
.carousel-cta--primary {
  background: white;
  color: #047857;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.carousel-cta--primary:hover {
  background: #f0fdf4;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}
.carousel-cta--secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
}
.carousel-cta--secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.7);
  transform: translateY(-2px);
}

/* ---- Ad slides (product / store cards) ---- */
.ad-slide {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #f8fafc, #f1f5f9);
  padding: 1rem;
}
.ad-slide--product {
  overflow: auto;
  align-items: stretch;
}
.carousel-product-card {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}
@media (min-width: 640px) {
  .ad-slide {
    padding: 1.5rem;
  }
}
.ad-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  max-width: 720px;
  width: 100%;
  padding: 1.25rem;
  background: white;
  border-radius: 1.25rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}
.ad-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}
@media (max-width: 640px) {
  .ad-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
    padding: 1rem;
  }
}
.ad-card-media {
  flex-shrink: 0;
  width: 140px;
  height: 140px;
  border-radius: 1rem;
  overflow: hidden;
  background: #f1f5f9;
}
@media (min-width: 640px) {
  .ad-card-media {
    width: 180px;
    height: 180px;
  }
}
.ad-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.ad-card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 2.5rem;
}
.ad-card-body {
  flex: 1;
  min-width: 0;
}
.ad-card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.375rem;
  line-height: 1.3;
}
@media (min-width: 640px) {
  .ad-card-title {
    font-size: 1.375rem;
  }
}
.ad-card-meta {
  margin: 0 0 0.75rem;
  font-size: 0.9375rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
}
.ad-card-price {
  font-weight: 700;
  color: #059669;
  font-size: 1.125rem;
}
.ad-card-btn {
  padding: 0.625rem 1.125rem;
  background: #059669;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s, box-shadow 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
}
.ad-card-btn:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35);
}

/* ---- Arrows (left/right) ---- */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  color: #0f766e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  transition: background-color 0.2s, transform 0.2s, box-shadow 0.2s;
}
.carousel-arrow:hover:not(:disabled) {
  background: white;
  transform: translateY(-50%) scale(1.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18);
}
.carousel-arrow:active:not(:disabled) {
  transform: translateY(-50%) scale(0.98);
}
.carousel-arrow:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.carousel-arrow:focus-visible {
  outline: 2px solid #059669;
  outline-offset: 2px;
}
.carousel-arrow--prev {
  left: 1rem;
}
.carousel-arrow--next {
  right: 1rem;
}
@media (max-width: 640px) {
  .carousel-arrow {
    width: 2.25rem;
    height: 2.25rem;
    font-size: 0.75rem;
  }
  .carousel-arrow--prev {
    left: 0.5rem;
  }
  .carousel-arrow--next {
    right: 0.5rem;
  }
}

/* ---- Dots ---- */
.carousel-dots {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 9999px;
  backdrop-filter: blur(8px);
}
.carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: background-color 0.25s ease, transform 0.25s ease;
  padding: 0;
}
.carousel-dot:hover {
  background: rgba(255, 255, 255, 0.85);
  transform: scale(1.15);
}
.carousel-dot--active {
  background: white;
  transform: scale(1.25);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2);
}
.carousel-dot:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
}
@media (max-width: 640px) {
  .carousel-dots {
    bottom: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
  .carousel-dot {
    width: 6px;
    height: 6px;
  }
  .carousel-dot--active {
    transform: scale(1.2);
  }
}

/* ---- Empty ---- */
.carousel-empty {
  width: 100%;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: inherit;
}
.empty-message {
  text-align: center;
  color: #64748b;
  padding: 1rem;
}
.empty-message i {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  opacity: 0.6;
  display: block;
}
</style>
