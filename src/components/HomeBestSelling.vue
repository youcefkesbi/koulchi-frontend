<template>
  <section id="best-selling-products" class="my-slide-up">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-2 sm:space-y-0">
      <h2 class="text-2xl sm:text-3xl font-bold text-dark">{{ t('sections.bestSellingProducts') }}</h2>
      <div class="flex items-center space-x-4 space-x-reverse">
        <router-link to="/best-selling" class="text-primary hover:text-primary-dark text-sm sm:text-base font-semibold hover:underline transition-colors">
          {{ t('sections.viewAll') }} <i class="fas fa-arrow-left mr-1 sm:mr-2"></i>
        </router-link>
        <button
          @click="refreshProducts"
          :disabled="loading"
          class="text-primary hover:text-primary-dark text-sm sm:text-base font-semibold hover:underline transition-colors disabled:opacity-50"
        >
          <i class="fas fa-sync-alt mr-1" :class="{ 'animate-spin': loading }"></i>
          {{ t('bestSelling.refresh') }}
        </button>
      </div>
    </div>
    
    <!-- Best Selling Products Component -->
    <BestSellingProducts
      :limit="10"
      :show-category-filter="false"
    />
  </section>
</template>

<script setup>
import { useProducts } from '../composables/useProducts'
import BestSellingProducts from './BestSellingProducts.vue'
import { useI18n } from 'vue-i18n'

// Composables
const { t } = useI18n()
const { refreshBestSellingProducts, loading } = useProducts()

// Methods
const refreshProducts = async () => {
  await refreshBestSellingProducts()
}
</script>
