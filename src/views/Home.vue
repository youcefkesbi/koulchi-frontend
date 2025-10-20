<template>
  <div class="container-lg space-y-12 sm:space-y-16 lg:space-y-20 my-fade-in section-padding">
    <!-- Banner Carousel Section -->
    <section class="my-slide-up">
      <HomepageBanner
        :show-main-banner="true"
        :main-banner-title="t('hero.title')"
        :main-banner-subtitle="t('hero.subtitle')"
        @retry="loadAds"
        @scroll-to-content="scrollToFeaturedProducts"
      />
    </section>

    <!-- Featured Products Section -->
    <section id="featured-products" class="my-slide-up">
      <HomepageFeaturedProducts
        :title="t('sections.featuredProducts')"
        :show-view-all="true"
        view-all-link="/products"
        :max-products="8"
        @retry="loadAds"
      />
    </section>

    <!-- Featured Stores Section -->
    <section class="my-slide-up">
      <HomepageFeaturedStores
        :title="t('sections.featuredStores')"
        :show-view-all="true"
        view-all-link="/stores"
        :max-stores="6"
        @retry="loadAds"
      />
    </section>

    <!-- Browse by Category Section -->
    <section class="my-slide-up">
      <BrowseByCategoryProducts
        :title="t('sections.browseByCategory')"
        :max-products-per-category="8"
        @retry="loadAds"
      />
    </section>

    <!-- Features Section -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-6 my-slide-up">
      <div class="card text-center group hover:shadow-glow transform hover:scale-105 transition-all duration-300 bg-white border-2 border-neutral-100 hover:border-primary/20">
        <div class="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 shadow-md">
          <i class="fas fa-truck text-white text-2xl"></i>
        </div>
        <h3 class="text-xl font-bold mb-3 text-neutral-900">{{ t('features.fastDelivery') }}</h3>
        <p class="text-neutral-700 leading-relaxed text-sm">{{ t('features.fastDeliveryDesc') }}</p>
      </div>
      
      <div class="card text-center group hover:shadow-glow transform hover:scale-105 transition-all duration-300 bg-white border-2 border-neutral-100 hover:border-accent/20">
        <div class="w-16 h-16 bg-gradient-to-br from-accent to-accent-dark rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 shadow-md">
          <i class="fas fa-money-bill-wave text-white text-2xl"></i>
        </div>
        <h3 class="text-xl font-bold mb-3 text-neutral-900">{{ t('features.cod') }}</h3>
        <p class="text-neutral-700 leading-relaxed text-sm">{{ t('features.codDesc') }}</p>
      </div>
      
      <div class="card text-center group hover:shadow-glow transform hover:scale-105 transition-all duration-300 bg-white border-2 border-neutral-100 hover:border-accent/20">
        <div class="w-16 h-16 bg-gradient-to-br from-accent to-accent-dark rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 shadow-md">
          <i class="fas fa-shield-alt text-white text-2xl"></i>
        </div>
        <h3 class="text-xl font-bold mb-3 text-neutral-900">{{ t('features.qualityGuarantee') }}</h3>
        <p class="text-neutral-700 leading-relaxed text-sm">{{ t('features.qualityGuaranteeDesc') }}</p>
      </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="bg-white rounded-3xl p-8 sm:p-12 shadow-soft my-slide-up border border-neutral-100">
      <h2 class="text-3xl sm:text-4xl font-bold text-neutral-900 mb-8 sm:mb-12 text-center">{{ t('sections.whyChooseUs') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
        <div class="space-y-8">
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 shadow-md">
              <i class="fas fa-shield-alt text-white text-lg"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-neutral-900 mb-3">{{ t('benefits.securePayment') }}</h4>
              <p class="text-neutral-800 leading-relaxed text-base">{{ t('benefits.securePaymentDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 shadow-md">
              <i class="fas fa-truck text-white text-lg"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-neutral-900 mb-3">{{ t('benefits.fastDeliveryAlgeria') }}</h4>
              <p class="text-neutral-800 leading-relaxed text-base">{{ t('benefits.fastDeliveryAlgeriaDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 shadow-md">
              <i class="fas fa-certificate text-white text-lg"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-neutral-900 mb-3">{{ t('benefits.originalProducts') }}</h4>
              <p class="text-neutral-800 leading-relaxed text-base">{{ t('benefits.originalProductsDesc') }}</p>
            </div>
          </div>
        </div>
        
        <div class="space-y-8">
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-12 h-12 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-lg transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-neutral-900 mb-3">{{ t('benefits.competitivePrices') }}</h4>
              <p class="text-neutral-800 leading-relaxed text-base">{{ t('benefits.competitivePricesDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-12 h-12 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-lg transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-neutral-900 mb-3">{{ t('benefits.customerService') }}</h4>
              <p class="text-neutral-800 leading-relaxed text-base">{{ t('benefits.customerServiceDesc') }}</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4 space-x-reverse group">
            <div class="w-12 h-12 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-lg transition-all duration-300">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <h4 class="font-bold text-xl text-neutral-900 mb-3">{{ t('benefits.easyOrdering') }}</h4>
              <p class="text-neutral-800 leading-relaxed text-base">{{ t('benefits.easyOrderingDesc') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProductStore } from '../stores/useProductStore'
import { useAdsStore } from '../stores/useAdsStore'
import HomepageBanner from '../components/ads/HomepageBanner.vue'
import HomepageFeaturedProducts from '../components/ads/HomepageFeaturedProducts.vue'
import HomepageFeaturedStores from '../components/ads/HomepageFeaturedStores.vue'
import BrowseByCategoryProducts from '../components/ads/BrowseByCategoryProducts.vue'
import FeaturedProducts from '../components/FeaturedProducts.vue'
import FeaturedStores from '../components/FeaturedStores.vue'
import ProductCard from '../components/ProductCard.vue'

const { t, locale } = useI18n()
const productStore = useProductStore()
const adsStore = useAdsStore()

const isProd = import.meta.env.PROD
const isDev = import.meta.env.DEV

// Load all ads data
const loadAds = async () => {
  try {
    await adsStore.fetchAds()
  } catch (err) {
    console.error('Error loading ads:', err)
  }
}

const scrollToFeaturedProducts = () => {
  const featuredSection = document.getElementById('featured-products')
  if (featuredSection) {
    featuredSection.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(async () => {
  try {
    // Load categories if not already loaded
    if (productStore.categories.length === 0) {
      try {
        await productStore.fetchCategories()
      } catch (categoryError) {
        console.error('Failed to load categories:', categoryError)
        
        // Use fallback categories in production
        if (import.meta.env.PROD) {
          productStore.categories = [
            { id: 'electronics', name_en: 'Electronics', name_ar: 'إلكترونيات', name_fr: 'Électronique', is_active: true },
            { id: 'fashion', name_en: 'Fashion', name_ar: 'أزياء', name_fr: 'Mode', is_active: true },
            { id: 'home', name_en: 'Home & Garden', name_ar: 'المنزل والحديقة', name_fr: 'Maison et Jardin', is_active: true },
            { id: 'sports', name_en: 'Sports', name_ar: 'رياضة', name_fr: 'Sport', is_active: true },
            { id: 'books', name_en: 'Books', name_ar: 'كتب', name_fr: 'Livres', is_active: true }
          ]
        }
      }
    }
    
    // Load all ads data
    await loadAds()
  } catch (error) {
    console.error('Error loading homepage data:', error)
  }
})
</script>

<style scoped>
/* Ensure sections are always visible */
section {
  min-height: 200px;
  margin-bottom: 2rem;
}

/* Custom animations */
.my-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.my-slide-up {
  animation: slideUp 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Grid cards layout */
.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

/* Card styles */
.card {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Shadow utilities */
.shadow-soft {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.shadow-glow {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

/* Section padding */
.section-padding {
  padding: 2rem 1rem;
}

@media (min-width: 640px) {
  .section-padding {
    padding: 3rem 1.5rem;
  }
}

@media (min-width: 1024px) {
  .section-padding {
    padding: 4rem 2rem;
  }
}

/* Container responsive */
.container-lg {
  max-width: 1200px;
  margin: 0 auto;
}

/* RTL support */
[dir="rtl"] .space-x-reverse > :not([hidden]) ~ :not([hidden]) {
  --tw-space-x-reverse: 1;
}
</style>
