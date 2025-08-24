<template>
  <div class="space-y-8">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
      <div>
        <h1 class="text-3xl font-bold text-dark">المنتجات</h1>
        <p class="text-gray-600 mt-2">
          {{ filteredProducts.length }} منتج متوفر
          <span v-if="productStore.selectedCategory !== 'all'">
            في فئة {{ getCurrentCategoryName }}
          </span>
        </p>
      </div>
      
      <!-- Search and Filter Controls -->
      <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        <div class="relative">
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="ابحث في المنتجات..."
            class="input-field pr-10"
          />
          <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
        
        <button
          @click="clearFilters"
          class="btn-outline"
        >
          <i class="fas fa-times ml-2"></i>
          مسح الفلاتر
        </button>
      </div>
    </div>

    <!-- Category Filter -->
    <div class="flex flex-wrap gap-2">
                      <button
          v-for="category in productStore.categories"
          :key="category.id"
          @click="selectCategory(category.id)"
          :class="[
            'px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2',
            productStore.selectedCategory === category.id
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          <img 
            v-if="category.icon_url" 
            :src="category.icon_url" 
            :alt="getCategoryName(category.id)"
            class="w-4 h-4 object-contain"
          />
          <i v-else class="fas fa-box text-sm"></i>
          {{ getCategoryName(category.id) }}
        </button>
    </div>

    <!-- Products Grid -->
    <div v-if="filteredProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
      />
    </div>

    <!-- No Products Found -->
    <div v-else class="text-center py-12">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-search text-gray-400 text-3xl"></i>
      </div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">لم يتم العثور على منتجات</h3>
      <p class="text-gray-500 mb-6">
        جرب تغيير الفلاتر أو البحث بكلمات مختلفة
      </p>
      <button
        @click="clearFilters"
        class="btn-primary"
      >
        <i class="fas fa-refresh ml-2"></i>
        عرض جميع المنتجات
      </button>
    </div>

    <!-- Load More Button (if needed) -->
    <div v-if="filteredProducts.length > 0" class="text-center">
      <button class="btn-outline">
        <i class="fas fa-plus ml-2"></i>
        عرض المزيد
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import i18n from '../i18n'
import { useProductStore } from '../stores/product'
import ProductCard from '../components/ProductCard.vue'

const { t } = useI18n()
const productStore = useProductStore()
const searchQuery = ref('')

const filteredProducts = computed(() => productStore.filteredProducts)

const getCurrentCategoryName = computed(() => {
  const category = productStore.categories.find(cat => cat.id === productStore.selectedCategory)
  return category ? getCategoryName(category.id) : ''
})

const getCategoryName = (categoryId) => {
  const category = productStore.categories.find(cat => cat.id === categoryId)
  if (category) {
    // Check if we have a localized name for the current language
    const currentLocale = i18n.global.locale.value
    
    if (currentLocale === 'ar' && category.name_ar) {
      return category.name_ar
    }
    
    if (currentLocale === 'fr' && category.name_fr) {
      return category.name_fr
    }
    
    // Fall back to the English name field
    return category.name_en
  }
  return categoryId
}

const handleSearch = () => {
  productStore.setSearchQuery(searchQuery.value)
}

const selectCategory = (categoryId) => {
  productStore.setCategory(categoryId)
}

const clearFilters = () => {
  productStore.clearFilters()
  searchQuery.value = ''
}

// Fetch products and categories on component mount
onMounted(async () => {
  await productStore.initializeStore()
})
</script> 