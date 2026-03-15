<template>
  <div class="homepage-container section-padding my-fade-in">
    <div class="homepage-sections">
      <!-- Banner Carousel Section -->
      <section class="homepage-section my-slide-up">
        <HomepageBanner
          :show-main-banner="true"
          :main-banner-title="t('hero.title')"
          :main-banner-subtitle="t('hero.subtitle')"
          @retry="loadAds"
          @scroll-to-content="scrollToFeaturedProducts"
        />
      </section>

      <!-- Featured Products Section (Ads) -->
      <section id="featured-products" class="homepage-section my-slide-up">
        <HomepageFeaturedProducts
          :title="t('sections.featuredProducts')"
          :show-view-all="true"
          view-all-link="/products"
          :max-products="8"
          @retry="loadAds"
        />
      </section>

      <!-- Featured Stores Section -->
      <section class="homepage-section my-slide-up">
        <HomepageFeaturedStores
          :title="t('sections.featuredStores')"
          :show-view-all="true"
          view-all-link="/stores"
          :max-stores="6"
          @retry="loadAds"
        />
      </section>

      <!-- Browse by Category Section -->
      <section class="homepage-section my-slide-up">
        <BrowseByCategoryProducts
          :title="t('sections.browseByCategory')"
          :max-products-per-category="8"
          @retry="loadAds"
        />
      </section>

      <!-- Features Section -->
      <section class="homepage-section my-slide-up features-section">
        <h2 class="homepage-section-title">{{ t('sections.features') }}</h2>
        <p class="homepage-section-subtitle mb-10 sm:mb-12">{{ t('sections.featuresSubtitle') }}</p>
        <div class="features-grid">
          <div class="homepage-card feature-card feature-card--primary">
            <div class="feature-icon feature-icon--primary">
              <i class="fas fa-truck" aria-hidden="true"></i>
            </div>
            <h3 class="feature-title">{{ t('features.fastDelivery') }}</h3>
            <p class="feature-desc">{{ t('features.fastDeliveryDesc') }}</p>
          </div>
          <div class="homepage-card feature-card feature-card--accent">
            <div class="feature-icon feature-icon--accent">
              <i class="fas fa-money-bill-wave" aria-hidden="true"></i>
            </div>
            <h3 class="feature-title">{{ t('features.cod') }}</h3>
            <p class="feature-desc">{{ t('features.codDesc') }}</p>
          </div>
          <div class="homepage-card feature-card feature-card--accent">
            <div class="feature-icon feature-icon--accent">
              <i class="fas fa-shield-alt" aria-hidden="true"></i>
            </div>
            <h3 class="feature-title">{{ t('features.qualityGuarantee') }}</h3>
            <p class="feature-desc">{{ t('features.qualityGuaranteeDesc') }}</p>
          </div>
        </div>
      </section>

      <!-- Why Choose Us Section -->
      <section class="homepage-section my-slide-up why-choose-section">
        <h2 class="homepage-section-title">{{ t('sections.whyChooseUs') }}</h2>
        <p class="homepage-section-subtitle mb-10 sm:mb-12">{{ t('sections.whyChooseUsSubtitle') }}</p>
        <div class="why-choose-box">
          <div class="why-choose-grid">
            <div class="why-choose-list">
              <div class="benefit-item">
                <div class="benefit-icon benefit-icon--primary">
                  <i class="fas fa-shield-alt" aria-hidden="true"></i>
                </div>
                <div class="benefit-content">
                  <h4 class="benefit-title">{{ t('benefits.securePayment') }}</h4>
                  <p class="benefit-desc">{{ t('benefits.securePaymentDesc') }}</p>
                </div>
              </div>
              <div class="benefit-item">
                <div class="benefit-icon benefit-icon--primary">
                  <i class="fas fa-truck" aria-hidden="true"></i>
                </div>
                <div class="benefit-content">
                  <h4 class="benefit-title">{{ t('benefits.fastDeliveryAlgeria') }}</h4>
                  <p class="benefit-desc">{{ t('benefits.fastDeliveryAlgeriaDesc') }}</p>
                </div>
              </div>
              <div class="benefit-item">
                <div class="benefit-icon benefit-icon--primary">
                  <i class="fas fa-certificate" aria-hidden="true"></i>
                </div>
                <div class="benefit-content">
                  <h4 class="benefit-title">{{ t('benefits.originalProducts') }}</h4>
                  <p class="benefit-desc">{{ t('benefits.originalProductsDesc') }}</p>
                </div>
              </div>
            </div>
            <div class="why-choose-list">
              <div class="benefit-item">
                <div class="benefit-icon benefit-icon--secondary">
                  <i class="fas fa-check" aria-hidden="true"></i>
                </div>
                <div class="benefit-content">
                  <h4 class="benefit-title">{{ t('benefits.competitivePrices') }}</h4>
                  <p class="benefit-desc">{{ t('benefits.competitivePricesDesc') }}</p>
                </div>
              </div>
              <div class="benefit-item">
                <div class="benefit-icon benefit-icon--secondary">
                  <i class="fas fa-check" aria-hidden="true"></i>
                </div>
                <div class="benefit-content">
                  <h4 class="benefit-title">{{ t('benefits.customerService') }}</h4>
                  <p class="benefit-desc">{{ t('benefits.customerServiceDesc') }}</p>
                </div>
              </div>
              <div class="benefit-item">
                <div class="benefit-icon benefit-icon--secondary">
                  <i class="fas fa-check" aria-hidden="true"></i>
                </div>
                <div class="benefit-content">
                  <h4 class="benefit-title">{{ t('benefits.easyOrdering') }}</h4>
                  <p class="benefit-desc">{{ t('benefits.easyOrderingDesc') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProductStore } from '../stores/useProductStore'
import { useAdsStore } from '../stores/useAdsStore'
import HomepageBanner from '../components/ads/HomepageBanner.vue'
import HomepageFeaturedProducts from '../components/ads/HomepageFeaturedProducts.vue'
import HomepageFeaturedStores from '../components/ads/HomepageFeaturedStores.vue'
import BrowseByCategoryProducts from '../components/ads/BrowseByCategoryProducts.vue'

const { t } = useI18n()
const productStore = useProductStore()
const adsStore = useAdsStore()

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
    // Load categories if not already loaded (used by Browse by Category for category names)
    if (!productStore.categories || productStore.categories.length === 0) {
      try {
        await productStore.fetchCategories()
      } catch (categoryError) {
        console.error('Failed to load categories:', categoryError)
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
    // Load all ads data (includes featured products and browse-by-category slots)
    await loadAds()
  } catch (error) {
    console.error('Error loading homepage data:', error)
  }
})
</script>

<style scoped>
/* Section spacing: consistent vertical rhythm */
.homepage-sections {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
}
@media (min-width: 640px) {
  .homepage-sections {
    gap: 4.5rem;
  }
}
@media (min-width: 1024px) {
  .homepage-sections {
    gap: 5.5rem;
  }
}

/* Section layout: children (e.g. ad components) can be full width; section itself is centered */
.homepage-section {
  width: 100%;
  min-width: 0;
  overflow: hidden;
}

/* Features section */
.features-section {
  text-align: center;
}
.features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin: 0 auto;
  max-width: 64rem;
}
@media (min-width: 768px) {
  .features-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}
.feature-card {
  text-align: center;
  position: relative;
}
.feature-card:hover {
  transform: translateY(-4px);
}
.feature-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  font-size: 1.5rem;
  color: white;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.feature-card:hover .feature-icon {
  transform: scale(1.08);
}
.feature-icon--primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
}
.feature-icon--accent {
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%);
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
}
.feature-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary, #171717);
  margin-bottom: 0.5rem;
  line-height: 1.3;
}
@media (min-width: 640px) {
  .feature-title {
    font-size: 1.375rem;
  }
}
.feature-desc {
  font-size: 0.9375rem;
  font-weight: 400;
  color: var(--color-text-secondary, #404040);
  line-height: 1.55;
  margin: 0;
}

/* Why Choose Us */
.why-choose-section {
  text-align: center;
}
.why-choose-box {
  background: var(--color-surface, #fff);
  border-radius: 1.5rem;
  padding: 2rem 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-border, #e5e5e5);
  max-width: 64rem;
  margin: 0 auto;
  text-align: left;
}
@media (min-width: 640px) {
  .why-choose-box {
    padding: 2.5rem 2rem;
  }
}
@media (min-width: 1024px) {
  .why-choose-box {
    padding: 3rem 2.5rem;
  }
}
.why-choose-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
}
@media (min-width: 768px) {
  .why-choose-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 3rem;
  }
}
.why-choose-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}
[dir="rtl"] .benefit-item {
  flex-direction: row-reverse;
}
.benefit-icon {
  width: 3rem;
  height: 3rem;
  flex-shrink: 0;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
  transition: transform 0.25s ease;
}
.benefit-item:hover .benefit-icon {
  transform: scale(1.05);
}
.benefit-icon--primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
}
.benefit-icon--secondary {
  background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-dark) 100%);
}
.benefit-content {
  min-width: 0;
}
.benefit-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary, #171717);
  margin: 0 0 0.375rem;
  line-height: 1.3;
}
@media (min-width: 640px) {
  .benefit-title {
    font-size: 1.25rem;
  }
}
.benefit-desc {
  font-size: 0.9375rem;
  font-weight: 400;
  color: var(--color-text-secondary, #404040);
  line-height: 1.55;
  margin: 0;
}

/* Section padding (page-level): mobile 1.5rem, tablet 3rem, desktop 4rem */
.section-padding {
  padding: 1.5rem 0;
}
@media (min-width: 640px) {
  .section-padding {
    padding: 3rem 0;
  }
}
@media (min-width: 1024px) {
  .section-padding {
    padding: 4rem 0;
  }
}

/* Animations */
.my-fade-in {
  animation: homeFadeIn 0.6s ease-out;
}
.my-slide-up {
  animation: homeSlideUp 0.5s ease-out;
}
@keyframes homeFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes homeSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>