<template>
  <div class="ad-carousel-container">
    <!-- Loading State -->
    <div v-if="loading" class="carousel-loading">
      <div class="skeleton-banner"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="carousel-error">
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="$emit('retry')" class="retry-btn">
          <i class="fas fa-redo"></i>
          {{ $t('common.retry') }}
        </button>
      </div>
    </div>

    <!-- Carousel Content -->
    <div v-else-if="carouselItems.length > 0" class="carousel-wrapper">
      <div class="carousel-container" ref="carouselContainer">
        <div 
          class="carousel-track" 
          :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        >
          <div 
            v-for="(item, index) in carouselItems" 
            :key="`${item.type}-${item.id}-${index}`"
            class="carousel-slide"
          >
            <!-- Main Banner (Static) -->
            <div v-if="index === 0 && showMainBanner" class="main-banner">
              <div class="banner-content">
                <h1 class="banner-title">{{ mainBannerTitle }}</h1>
                <p class="banner-subtitle">{{ mainBannerSubtitle }}</p>
                <div class="banner-actions">
                  <button @click="scrollToContent" class="btn-primary">
                    <i class="fas fa-shopping-bag"></i>
                    {{ $t('hero.shopNow') }}
                  </button>
                  <button class="btn-secondary">
                    <i class="fas fa-info-circle"></i>
                    {{ $t('hero.learnMore') }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Ad Items -->
            <div v-else class="ad-slide">
              <!-- Product Ad -->
              <div v-if="item.type === 'product'" class="product-ad">
                <div class="ad-image-container">
                  <img 
                    v-if="item.data.image" 
                    :src="item.data.image" 
                    :alt="item.data.name"
                    class="ad-image"
                    @error="handleImageError"
                  />
                  <div v-else class="ad-image-placeholder">
                    <i class="fas fa-image"></i>
                  </div>
                </div>
                <div class="ad-content">
                  <h3 class="ad-title">{{ item.data.name }}</h3>
                  <div class="ad-price">
                    {{ formatPrice(item.data.price) }} {{ $t('common.currencyShort') }}
                  </div>
                  <button 
                    @click="navigateToProduct(item.data.id)"
                    class="ad-action-btn"
                  >
                    <i class="fas fa-eye"></i>
                    {{ $t('product.viewProduct') }}
                  </button>
                </div>
              </div>

              <!-- Store Ad -->
              <div v-else-if="item.type === 'store'" class="store-ad">
                <div class="ad-image-container">
                  <img 
                    v-if="item.data.image" 
                    :src="item.data.image" 
                    :alt="item.data.name || 'Store'"
                    class="ad-image"
                    @error="handleImageError"
                  />
                  <div v-else class="ad-image-placeholder">
                    <i class="fas fa-store"></i>
                  </div>
                </div>
                <div class="ad-content">
                  <h3 class="ad-title">{{ item.data.name || `Store #${item.data.id?.slice(-8)}` }}</h3>
                  <div class="ad-location">
                    <i class="fas fa-map-marker-alt"></i>
                    {{ item.data.location }}
                  </div>
                  <button 
                    @click="navigateToStore(item.data.id)"
                    class="ad-action-btn"
                  >
                    <i class="fas fa-store"></i>
                    {{ $t('store.visitStore') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Controls -->
      <div v-if="carouselItems.length > 1" class="carousel-controls">
        <button 
          @click="prevSlide" 
          class="carousel-btn prev-btn"
          :disabled="currentIndex === 0"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <div class="carousel-dots">
          <button 
            v-for="(item, index) in carouselItems" 
            :key="index"
            @click="goToSlide(index)"
            class="carousel-dot"
            :class="{ active: currentIndex === index }"
          ></button>
        </div>
        
        <button 
          @click="nextSlide" 
          class="carousel-btn next-btn"
          :disabled="currentIndex === carouselItems.length - 1"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="carousel-empty">
      <div class="empty-message">
        <i class="fas fa-image"></i>
        <p>{{ $t('ads.noAdsAvailable') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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
  }
})

const emit = defineEmits(['retry', 'scroll-to-content'])

const { t } = useI18n()
const router = useRouter()
const { navigateToPath } = useLocaleRouter()

const carouselContainer = ref(null)
const currentIndex = ref(0)
const autoPlayTimer = ref(null)

// Computed properties
const carouselItems = computed(() => {
  const items = []
  
  // Add main banner as first item if enabled
  if (props.showMainBanner) {
    items.push({ type: 'banner', id: 'main-banner' })
  }
  
  // Add ads
  items.push(...props.ads)
  
  return items
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
.ad-carousel-container {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Loading State */
.carousel-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
}

.skeleton-banner {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Error State */
.carousel-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
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
}

.retry-btn:hover {
  background: #b91c1c;
}

/* Carousel Wrapper */
.carousel-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 1.5rem;
}

.carousel-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease-in-out;
}

.carousel-slide {
  min-width: 100%;
  height: 100%;
  position: relative;
}

/* Main Banner */
.main-banner {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #059669, #047857, #065f46);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.main-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.1) 100%);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.banner-content {
  text-align: center;
  color: white;
  z-index: 1;
  position: relative;
  max-width: 600px;
  padding: 2rem;
}

.banner-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.banner-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.banner-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: white;
  color: #059669;
}

.btn-primary:hover {
  background: #f9fafb;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.btn-secondary {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 2px solid rgba(255,255,255,0.3);
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.3);
  border-color: rgba(255,255,255,0.5);
}

/* Ad Slides */
.ad-slide {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
}

.product-ad, .store-ad {
  display: flex;
  align-items: center;
  gap: 2rem;
  max-width: 800px;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  margin: 1rem;
}

.ad-image-container {
  flex-shrink: 0;
  width: 200px;
  height: 200px;
  border-radius: 1rem;
  overflow: hidden;
  background: #f3f4f6;
}

.ad-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ad-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 3rem;
}

.ad-content {
  flex: 1;
}

.ad-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.ad-price {
  font-size: 1.25rem;
  font-weight: 600;
  color: #059669;
  margin-bottom: 1rem;
}

.ad-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.ad-action-btn {
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

.ad-action-btn:hover {
  background: #047857;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(5, 150, 105, 0.3);
}

/* Carousel Controls */
.carousel-controls {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(0,0,0,0.5);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  backdrop-filter: blur(10px);
}

.carousel-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.2);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-btn:hover:not(:disabled) {
  background: rgba(255,255,255,0.3);
  transform: scale(1.1);
}

.carousel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.carousel-dots {
  display: flex;
  gap: 0.5rem;
}

.carousel-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.carousel-dot.active {
  background: white;
  transform: scale(1.2);
}

.carousel-dot:hover {
  background: rgba(255,255,255,0.6);
}

/* Empty State */
.carousel-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f9fafb, #f3f4f6);
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
  .ad-carousel-container {
    height: 300px;
  }
  
  .banner-title {
    font-size: 2rem;
  }
  
  .banner-subtitle {
    font-size: 1rem;
  }
  
  .banner-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .product-ad, .store-ad {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .ad-image-container {
    width: 150px;
    height: 150px;
  }
  
  .carousel-controls {
    bottom: 0.5rem;
    padding: 0.25rem 0.75rem;
  }
  
  .carousel-btn {
    width: 2rem;
    height: 2rem;
  }
}

@media (max-width: 480px) {
  .ad-carousel-container {
    height: 250px;
  }
  
  .banner-title {
    font-size: 1.5rem;
  }
  
  .banner-subtitle {
    font-size: 0.875rem;
  }
  
  .product-ad, .store-ad {
    padding: 1rem;
    margin: 0.5rem;
  }
  
  .ad-image-container {
    width: 120px;
    height: 120px;
  }
}
</style>
