<template>
  <div class="min-h-screen bg-gradient-to-br from-light-gray to-white py-8 animate-fade-in">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-3xl md:text-4xl font-bold text-dark mb-4">
          {{ $t('announcement.postAnnouncement') }}
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          {{ $t('announcement.description') }}
        </p>
      </div>

      <!-- Success Message -->
      <div v-if="showSuccess" class="mb-8 p-6 bg-success text-white rounded-2xl shadow-soft animate-slide-up">
        <div class="flex items-center space-x-3 space-x-reverse">
          <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <i class="fas fa-check text-2xl"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold">{{ $t('announcement.success') }}</h3>
            <p>{{ $t('announcement.successMessage') }}</p>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-8 p-6 bg-error text-white rounded-2xl shadow-soft animate-slide-up">
        <div class="flex items-center space-x-3 space-x-reverse">
          <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <i class="fas fa-exclamation-triangle text-2xl"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold">{{ $t('announcement.error') }}</h3>
            <p>{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Form Card -->
      <div class="card animate-slide-up">
        <form @submit.prevent="submitForm" class="space-y-8">
          <!-- Product Information Section -->
          <div class="space-y-6">
            <div class="flex items-center space-x-3 space-x-reverse mb-6">
              <div class="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-soft">
                <i class="fas fa-box text-white text-lg"></i>
              </div>
              <h2 class="text-2xl font-bold text-dark">{{ $t('announcement.productInfo') }}</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  {{ $t('announcement.productName') }} (English) *
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="input-field"
                  :placeholder="$t('announcement.productNamePlaceholder')"
                />
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  {{ $t('announcement.productName') }} (Arabic) *
                </label>
                <input
                  v-model="form.nameAr"
                  type="text"
                  required
                  class="input-field"
                  :placeholder="$t('announcement.productNameArPlaceholder')"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  {{ $t('announcement.category') }} *
                </label>
                <select
                  v-model="form.category"
                  required
                  class="input-field"
                >
                  <option value="">{{ $t('announcement.selectCategory') }}</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  {{ $t('announcement.price') }} (DZD) *
                </label>
                <div class="relative">
                  <input
                    v-model="form.price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    class="input-field pr-12"
                    :placeholder="$t('announcement.pricePlaceholder')"
                  />
                  <span class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                    د.ج
                  </span>
                </div>
              </div>
            </div>

            <div class="group">
              <label class="block text-sm font-semibold text-gray-700 mb-4 group-hover:text-primary transition-colors duration-300">
                {{ $t('announcement.image') }}
              </label>
              <input
                v-model="form.image"
                type="url"
                class="input-field"
                :placeholder="$t('announcement.imageUrlPlaceholder')"
              />
              <p class="text-sm text-gray-500 mt-2">
                {{ $t('announcement.imageHelp') }}
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  {{ $t('announcement.description') }} (English)
                </label>
                <textarea
                  v-model="form.description"
                  rows="4"
                  class="input-field resize-none"
                  :placeholder="$t('announcement.descriptionPlaceholder')"
                ></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  {{ $t('announcement.description') }} (Arabic)
                </label>
                <textarea
                  v-model="form.descriptionAr"
                  rows="4"
                  class="input-field resize-none"
                  :placeholder="$t('announcement.descriptionArPlaceholder')"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Additional Options Section -->
          <div class="space-y-6">
            <div class="flex items-center space-x-3 space-x-reverse mb-6">
              <div class="w-10 h-10 bg-secondary rounded-2xl flex items-center justify-center shadow-soft">
                <i class="fas fa-cog text-white text-lg"></i>
              </div>
              <h2 class="text-2xl font-bold text-dark">{{ $t('announcement.additionalOptions') }}</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex items-center space-x-3 space-x-reverse group">
                <input
                  v-model="form.isNew"
                  type="checkbox"
                  id="isNew"
                  class="w-6 h-6 text-primary border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-primary/20 focus:ring-offset-0 group-hover:border-primary/30 group-hover:shadow-glow transition-all duration-300"
                />
                <label for="isNew" class="text-lg font-medium text-gray-700 group-hover:text-primary transition-colors duration-300">
                  {{ $t('announcement.markAsNew') }}
                </label>
              </div>
              
              <div class="flex items-center space-x-3 space-x-reverse group">
                <input
                  v-model="form.isOnSale"
                  type="checkbox"
                  id="isOnSale"
                  class="w-6 h-6 text-secondary border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-secondary/20 focus:ring-offset-0 group-hover:border-secondary/30 group-hover:shadow-glow transition-all duration-300"
                />
                <label for="isOnSale" class="text-lg font-medium text-gray-700 group-hover:text-secondary transition-colors duration-300">
                  {{ $t('announcement.markAsSale') }}
                </label>
              </div>
            </div>
          </div>

          <!-- Submit Buttons -->
          <div class="flex flex-col sm:flex-row gap-6 justify-end pt-8 border-t border-gray-200">
            <router-link
              to="/dashboard"
              class="btn-outline text-center group-hover:bg-gray-100 transition-colors duration-300"
            >
              <i class="fas fa-arrow-left mr-3 group-hover:text-primary transition-colors duration-300"></i>
              {{ $t('common.back') }}
            </router-link>
            <button
              type="submit"
              :disabled="loading"
              class="btn-primary text-center group-hover:bg-primary/90 transition-colors duration-300"
            >
              <span v-if="loading">
                <i class="fas fa-spinner fa-spin mr-3 group-hover:text-white transition-colors duration-300"></i>
                {{ $t('announcement.submitting') }}
              </span>
              <span v-else>
                <i class="fas fa-paper-plane mr-3 group-hover:text-white transition-colors duration-300"></i>
                {{ $t('announcement.submit') }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useProductStore } from '../stores/product'

export default {
  name: 'NewAnnouncement',
  setup() {
    const router = useRouter()
    const productStore = useProductStore()
    
    const loading = ref(false)
    const error = ref('')
    const showSuccess = ref(false)
    const categories = ref([])
    
    const form = reactive({
      name: '',
      nameAr: '',
      category: '',
      price: '',
      image: '',
      description: '',
      descriptionAr: '',
      isNew: true,
      isOnSale: false
    })

    // Fetch categories on component mount
    onMounted(async () => {
      try {
              await productStore.fetchCategories()
      categories.value = productStore.categories
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    })

    const submitForm = async () => {
      try {
        loading.value = true
        error.value = ''

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data, error: createError } = await supabase
          .from('products')
          .insert({
            seller_id: user.id,
            name: form.name,
            name_ar: form.nameAr,
            price: parseFloat(form.price),
            image: form.image || null,
            category_id: form.category,
            description: form.description || null,
            description_ar: form.descriptionAr || null,
            is_active: true,
            is_new: form.isNew,
            is_on_sale: form.isOnSale,
            rating: 0,
            reviews: 0
          })
          .select()
          .single()

        if (createError) throw createError

        showSuccess.value = true
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } catch (err) {
        error.value = err.message || 'Error creating product'
        console.error('Error creating product:', err)
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      error,
      showSuccess,
      categories,
      submitForm
    }
  }
}
</script>
