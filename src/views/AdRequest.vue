<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-3xl md:text-4xl font-bold text-dark mb-4">
          {{ $t('adRequest.title') }}
        </h1>
        <p class="text-gray-600 text-lg">
          {{ $t('adRequest.subtitle') }}
        </p>
      </div>

      <!-- Success Message -->
      <div v-if="showSuccess" class="mb-8 p-6 bg-green-100 text-green-800 rounded-2xl shadow-soft my-slide-up">
        <div class="flex items-center space-x-3 space-x-reverse">
          <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <i class="fas fa-check text-white text-2xl"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold">{{ $t('adRequest.success') }}</h3>
            <p>{{ $t('adRequest.successMessage') }}</p>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-8 p-6 bg-red-100 text-red-800 rounded-2xl shadow-soft my-slide-up">
        <div class="flex items-center space-x-3 space-x-reverse">
          <div class="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
            <i class="fas fa-exclamation-triangle text-2xl"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold">{{ $t('adRequest.error') }}</h3>
            <p>{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Form Card -->
      <div class="bg-white rounded-3xl shadow-soft p-8 my-slide-up">
        <form @submit.prevent="submitForm" class="space-y-8">
          <!-- Item Selection Section -->
          <div class="space-y-6">
            <div class="flex items-center space-x-3 space-x-reverse mb-6">
              <div class="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-soft">
                <i class="fas fa-bullhorn text-white text-lg"></i>
              </div>
              <h2 class="text-2xl font-bold text-dark">{{ $t('adRequest.itemSelection') }}</h2>
            </div>
            
            <!-- Item Type Selection -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                {{ $t('adRequest.itemType') }} *
              </label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label class="relative cursor-pointer">
                  <input
                    v-model="form.item_type"
                    type="radio"
                    value="product"
                    class="sr-only"
                  />
                  <div class="p-6 border-2 rounded-xl transition-all duration-300"
                       :class="form.item_type === 'product' 
                         ? 'border-primary bg-primary/5' 
                         : 'border-gray-200 hover:border-gray-300'">
                    <div class="flex items-center space-x-3 space-x-reverse">
                      <i class="fas fa-box text-2xl text-primary"></i>
                      <div>
                        <h3 class="font-semibold text-gray-900">{{ $t('adRequest.product') }}</h3>
                        <p class="text-sm text-gray-600">{{ $t('adRequest.productDesc') }}</p>
                      </div>
                    </div>
                  </div>
                </label>
                
                <label class="relative cursor-pointer">
                  <input
                    v-model="form.item_type"
                    type="radio"
                    value="store"
                    class="sr-only"
                  />
                  <div class="p-6 border-2 rounded-xl transition-all duration-300"
                       :class="form.item_type === 'store' 
                         ? 'border-primary bg-primary/5' 
                         : 'border-gray-200 hover:border-gray-300'">
                    <div class="flex items-center space-x-3 space-x-reverse">
                      <i class="fas fa-store text-2xl text-primary"></i>
                      <div>
                        <h3 class="font-semibold text-gray-900">{{ $t('adRequest.store') }}</h3>
                        <p class="text-sm text-gray-600">{{ $t('adRequest.storeDesc') }}</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Item Selection Dropdown -->
            <div v-if="form.item_type">
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                {{ form.item_type === 'product' ? $t('adRequest.selectProduct') : $t('adRequest.selectStore') }} *
              </label>
              <select
                v-model="form.item_id"
                required
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300"
                @change="onItemChange"
              >
                <option value="">{{ $t('adRequest.pleaseSelect') }}</option>
                <option 
                  v-for="item in availableItems" 
                  :key="item.id" 
                  :value="item.id"
                >
                  {{ item.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Ad Configuration Section -->
          <div class="space-y-6">
            <div class="flex items-center space-x-3 space-x-reverse mb-6">
              <div class="w-10 h-10 bg-secondary rounded-2xl flex items-center justify-center shadow-soft">
                <i class="fas fa-cog text-white text-lg"></i>
              </div>
              <h2 class="text-2xl font-bold text-dark">{{ $t('adRequest.adConfiguration') }}</h2>
            </div>
            
            <!-- Slot Type -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                {{ $t('adRequest.slotType') }} *
              </label>
              <select
                v-model="form.slot_type"
                required
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300"
              >
                <option value="">{{ $t('adRequest.selectSlotType') }}</option>
                <option value="homepage_banner">{{ $t('adRequest.homepageBanner') }}</option>
                <option value="homepage_featured_products">{{ $t('adRequest.homepageFeaturedProducts') }}</option>
                <option value="homepage_featured_stores">{{ $t('adRequest.homepageFeaturedStores') }}</option>
                <option value="category_banner">{{ $t('adRequest.categoryBanner') }}</option>
                <option value="category_featured_products">{{ $t('adRequest.categoryFeaturedProducts') }}</option>
                <option value="browse_by_category_products">{{ $t('adRequest.browseByCategoryProducts') }}</option>
              </select>
            </div>

            <!-- Category (if applicable) -->
            <div v-if="showCategoryField">
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                {{ $t('adRequest.category') }}
              </label>
              <select
                v-model="form.category_id"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300"
              >
                <option value="">{{ $t('adRequest.selectCategory') }}</option>
                <option 
                  v-for="category in categories" 
                  :key="category.id" 
                  :value="category.id"
                >
                  {{ getCategoryName(category.id) }}
                </option>
              </select>
            </div>

            <!-- Priority -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                {{ $t('adRequest.priority') }}
              </label>
              <input
                v-model.number="form.priority"
                type="number"
                min="0"
                max="100"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300"
                :placeholder="$t('adRequest.priorityPlaceholder')"
              />
              <p class="text-sm text-gray-500 mt-2">{{ $t('adRequest.priorityHelp') }}</p>
            </div>

            <!-- Date Range -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  {{ $t('adRequest.startDate') }}
                </label>
                <input
                  v-model="form.start_date"
                  type="datetime-local"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300"
                />
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  {{ $t('adRequest.endDate') }}
                </label>
                <input
                  v-model="form.end_date"
                  type="datetime-local"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300"
                />
              </div>
            </div>
          </div>

          <!-- Submit Buttons -->
          <div class="flex flex-col sm:flex-row gap-6 justify-end pt-8 border-t border-gray-200">
            <router-link
              to="/dashboard"
              class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-300 text-center font-semibold"
            >
              <i class="fas fa-arrow-left mr-3"></i>
              {{ $t('common.back') }}
            </router-link>
            <button
              type="submit"
              :disabled="loading"
              class="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading">
                <i class="fas fa-spinner fa-spin mr-3"></i>
                {{ $t('adRequest.submitting') }}
              </span>
              <span v-else>
                <i class="fas fa-paper-plane mr-3"></i>
                {{ $t('adRequest.submit') }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useLocaleRouter } from '../composables/useLocaleRouter'
import { supabase } from '../lib/supabase'
import i18n from '../i18n'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { navigateToPath } = useLocaleRouter()

const loading = ref(false)
const error = ref('')
const showSuccess = ref(false)
const categories = ref([])
const availableItems = ref([])

const form = reactive({
  item_type: '',
  item_id: '',
  slot_type: '',
  category_id: '',
  priority: 0,
  start_date: '',
  end_date: ''
})

// Computed properties
const showCategoryField = computed(() => {
  return form.slot_type && (
    form.slot_type.includes('category') || 
    form.slot_type === 'browse_by_category_products'
  )
})

// Methods
const getCategoryName = (categoryId) => {
  const category = categories.value.find(cat => cat.id === categoryId)
  if (category) {
    const currentLocale = i18n.global.locale.value
    
    if (currentLocale === 'ar' && category.name_ar) {
      return category.name_ar
    }
    
    if (currentLocale === 'fr' && category.name_fr) {
      return category.name_fr
    }
    
    return category.name_en
  }
  return categoryId
}

const fetchCategories = async () => {
  try {
    const { data, error: fetchError } = await supabase
      .from('categories')
      .select('id, name_en, name_ar, name_fr')
      .eq('is_active', true)
      .order('name_en')

    if (fetchError) throw fetchError
    categories.value = data || []
  } catch (err) {
    console.error('Error fetching categories:', err)
  }
}

const fetchAvailableItems = async () => {
  if (!form.item_type) return
  
  try {
    let query
    if (form.item_type === 'product') {
      query = supabase
        .from('products')
        .select('id, name')
        .eq('seller_id', (await supabase.auth.getUser()).data.user.id)
        .eq('is_active', true)
        .order('name')
    } else {
      query = supabase
        .from('stores')
        .select('id, name')
        .eq('owner_id', (await supabase.auth.getUser()).data.user.id)
        .eq('status', 'approved')
        .order('name')
    }
    
    const { data, error: fetchError } = await query
    
    if (fetchError) throw fetchError
    availableItems.value = data || []
  } catch (err) {
    console.error('Error fetching items:', err)
    error.value = err.message || 'Failed to fetch items'
  }
}

const onItemChange = () => {
  // Reset category when item changes
  form.category_id = ''
}

const submitForm = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // Basic validation
    if (!form.item_type) {
      error.value = 'Please select an item type'
      return
    }
    
    if (!form.item_id) {
      error.value = 'Please select an item'
      return
    }
    
    if (!form.slot_type) {
      error.value = 'Please select a slot type'
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Prepare the ad request data
    const adRequestData = {
      requester_id: user.id,
      item_type: form.item_type,
      slot_type: form.slot_type,
      priority: form.priority || 0,
      status: 'pending'
    }

    // Add item-specific ID
    if (form.item_type === 'product') {
      adRequestData.product_id = form.item_id
    } else {
      adRequestData.store_id = form.item_id
    }

    // Add category if provided
    if (form.category_id) {
      adRequestData.category_id = form.category_id
    }

    // Add dates if provided
    if (form.start_date) {
      adRequestData.start_date = new Date(form.start_date).toISOString()
    }
    
    if (form.end_date) {
      adRequestData.end_date = new Date(form.end_date).toISOString()
    }

    // Submit the ad request
    const { error: insertError } = await supabase
      .from('ad_requests')
      .insert(adRequestData)

    if (insertError) throw insertError

    showSuccess.value = true
    
    // Redirect to dashboard after 3 seconds
    setTimeout(() => {
      navigateToPath('/dashboard')
    }, 3000)
    
  } catch (err) {
    error.value = err.message || 'Failed to submit ad request'
    console.error('Error submitting ad request:', err)
  } finally {
    loading.value = false
  }
}

// Watchers
watch(() => form.item_type, () => {
  form.item_id = ''
  availableItems.value = []
  if (form.item_type) {
    fetchAvailableItems()
  }
})

// Initialize form from query parameters
const initializeForm = () => {
  const query = route.query
  
  if (query.type) {
    form.item_type = query.type
  }
  
  if (query.id) {
    form.item_id = query.id
  }
}

// Lifecycle
onMounted(async () => {
  await fetchCategories()
  initializeForm()
  
  // If item type is set from query, fetch available items
  if (form.item_type) {
    await fetchAvailableItems()
  }
})
</script>

<style scoped>
.shadow-soft {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

/* Animation classes */
.my-slide-up {
  animation: slideUp 0.8s ease-out;
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

/* Custom radio button styling */
input[type="radio"]:checked + div {
  border-color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.05);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
