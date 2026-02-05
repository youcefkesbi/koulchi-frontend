<template>
  <div class="min-h-screen bg-gradient-to-br from-light-gray to-white py-8 my-fade-in">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-3xl md:text-4xl font-bold text-dark mb-4">
          {{ $t('announcement.postAnnouncement') }}
        </h1>
      </div>

      <!-- Success Message -->
                      <div v-if="showSuccess" class="mb-8 p-6 bg-green-100 text-green-800 rounded-2xl shadow-soft my-slide-up">
          <div class="flex items-center space-x-3 space-x-reverse">
                       <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <i class="fas fa-check text-white text-2xl"></i>
            </div>
          <div>
            <h3 class="text-xl font-bold">{{ $t('announcement.success') }}</h3>
            <p>{{ $t('announcement.successMessage') }}</p>
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
            <h3 class="text-xl font-bold">{{ $t('announcement.error') }}</h3>
            <p>{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Form Card -->
      <div class="bg-white rounded-3xl shadow-soft p-8 my-slide-up">
        <form @submit.prevent="submitForm" class="space-y-8">
          <!-- Product Information Section -->
          <div class="space-y-6">
            <div class="flex items-center space-x-3 space-x-reverse mb-6">
              <div class="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-soft">
                <i class="fas fa-box text-white text-lg"></i>
              </div>
              <h2 class="text-2xl font-bold text-dark">{{ $t('announcement.productInfo') }}</h2>
            </div>
            
            <!-- Product Name -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                {{ $t('announcement.productName') }} *
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300"
                :placeholder="$t('announcement.productNamePlaceholder')"
              />
            </div>

            <!-- Category and Price -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  {{ $t('announcement.category') }} *
                </label>
                <select
                  v-model="form.category_id"
                  required
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300"
                >
                  <option value="">{{ $t('announcement.selectCategory') }}</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ getCategoryName(category.id) }}
                  </option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  {{ $t('announcement.price') }} ({{ $t('common.currencyShort') }}) *
                </label>
                <div class="relative">
                  <input
                    v-model="form.price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 pr-12"
                    :placeholder="$t('announcement.pricePlaceholder')"
                  />
                  <span class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                    د.ج
                  </span>
                </div>
              </div>
            </div>

            <!-- Stock Quantity -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                {{ $t('announcement.stockQuantity') }} *
              </label>
              <input
                v-model="form.stock_quantity"
                type="number"
                min="0"
                required
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300"
                :placeholder="$t('announcement.stockQuantityPlaceholder')"
              />
            </div>

            <!-- Product Images -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                {{ $t('announcement.productImages') }}
              </label>
              <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary transition-colors duration-300">
                <input
                  ref="imageInput"
                  type="file"
                  multiple
                  accept="image/*"
                  @change="handleImageUpload"
                  class="hidden"
                />
                <div @click="$refs.imageInput.click()" class="cursor-pointer">
                  <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                  <p class="text-gray-600 mb-2">{{ $t('announcement.clickToUpload') }}</p>
                  <p class="text-sm text-gray-500">{{ $t('announcement.imageFormats') }}</p>
                </div>
              </div>
              
              <!-- Image Preview -->
              <div v-if="imageFiles.length > 0" class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div v-for="(file, index) in imageFiles" :key="index" class="relative">
                  <img :src="file.preview" class="w-full h-24 object-cover rounded-lg" />
                  <button
                    @click="removeImage(index)"
                    type="button"
                    class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              
              <p class="text-sm text-gray-500 mt-2">
                {{ $t('announcement.imagesSelected', { count: imageFiles.length }) }}
                <span class="text-xs text-gray-400 ml-2">({{ $t('announcement.maxImagesAllowed') }})</span>
              </p>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                {{ $t('announcement.description') }}
              </label>
              <textarea
                v-model="form.description"
                rows="4"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 resize-none"
                :placeholder="$t('announcement.descriptionPlaceholder')"
              ></textarea>
            </div>
          </div>

          <!-- Product Options -->
          <div class="space-y-6">
            <div class="flex items-center space-x-3 space-x-reverse mb-6">
              <div class="w-10 h-10 bg-secondary rounded-2xl flex items-center justify-center shadow-soft">
                <i class="fas fa-cog text-white text-lg"></i>
              </div>
              <h2 class="text-2xl font-bold text-dark">{{ $t('announcement.productOptions') }}</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex items-center space-x-3 space-x-reverse">
                <input
                  v-model="form.is_new"
                  type="checkbox"
                  id="isNew"
                  class="w-6 h-6 text-primary border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-primary/20 focus:ring-offset-0"
                />
                <label for="isNew" class="text-lg font-medium text-gray-700">
                  {{ $t('announcement.markAsNew') }}
                </label>
              </div>
              
              <div class="flex items-center space-x-3 space-x-reverse">
                <input
                  v-model="form.status"
                  type="checkbox"
                  id="isActive"
                  class="w-6 h-6 text-primary border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-primary/20 focus:ring-offset-0"
                />
                <label for="isActive" class="text-lg font-medium text-gray-700">
                  {{ $t('announcement.markAsActive') }}
                </label>
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
                {{ uploadProgress || $t('announcement.submitting') }}
              </span>
              <span v-else>
                <i class="fas fa-paper-plane mr-3"></i>
                {{ $t('announcement.submit') }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import i18n from '../i18n'
import { useRouter } from 'vue-router'
import { useLocaleRouter } from '../composables/useLocaleRouter'
import { supabase } from '../lib/supabase'
import { useProductStore } from '../stores/useProductStore'

const { t } = useI18n()
const router = useRouter()
const productStore = useProductStore()
const { navigateToPath } = useLocaleRouter()

const loading = ref(false)
const error = ref('')
const showSuccess = ref(false)
const categories = ref([])
const imageFiles = ref([])
const imageInput = ref(null)
const uploadProgress = ref('')

const getCategoryName = (categoryId) => {
  const category = categories.value.find(cat => cat.id === categoryId)
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

const form = reactive({
  name: '',
  description: '',
  price: '',
  category_id: '',
  stock_quantity: 0,
  is_new: true,
  status: 'approved'
})

// Fetch categories on component mount
onMounted(async () => {
  try {
    await productStore.fetchCategories()
    categories.value = productStore.categories
  } catch (err) {
    // Categories failed to load
  }
})

// Handle image upload
const handleImageUpload = (event) => {
  const files = Array.from(event.target.files)
  
      // Validate file count
    if (imageFiles.value.length + files.length > 10) {
      error.value = $t('announcement.maxImagesAllowed')
      return
    }
  
  // Validate each file
  files.forEach(file => {
    // Check file size (2MB = 2 * 1024 * 1024 bytes)
    if (file.size > 2 * 1024 * 1024) {
      error.value = $t('announcement.fileTooLarge', { fileName: file.name })
      return
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      error.value = $t('announcement.fileNotImage', { fileName: file.name })
      return
    }
    
    // Create preview URL
    const preview = URL.createObjectURL(file)
    imageFiles.value.push({
      file,
      preview,
      name: file.name
    })
  })
  
  // Clear input
  event.target.value = ''
}

// Remove image
const removeImage = (index) => {
  URL.revokeObjectURL(imageFiles.value[index].preview)
  imageFiles.value.splice(index, 1)
}

// Upload images to Supabase Storage
const uploadImages = async (userId) => {
  if (imageFiles.value.length === 0) return []
  
  const imageUrls = []
  
  try {
    for (let i = 0; i < imageFiles.value.length; i++) {
      const imageFile = imageFiles.value[i]
      const fileName = `${userId}/${Date.now()}-${i}-${imageFile.name}`
      
      uploadProgress.value = $t('announcement.uploadingImage', { current: i + 1, total: imageFiles.value.length })
      
      // Add timeout for each upload
      const uploadPromise = supabase.storage
        .from('product-images')
        .upload(fileName, imageFile.file)
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error($t('announcement.validation.uploadTimeoutForFile', { fileName: imageFile.name }))), 30000)
      })
      
      const { data, error: uploadError } = await Promise.race([uploadPromise, timeoutPromise])
      
      if (uploadError) {
        throw new Error($t('announcement.validation.failedToUploadFile', { fileName: imageFile.name, error: uploadError.message }))
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)
      
      imageUrls.push(publicUrl)
    }
    
    uploadProgress.value = ''
    return imageUrls
    
  } catch (error) {
    throw error
  }
}

const submitForm = async (event) => {
  // Prevent default form submission (defensive; @submit.prevent already does this)
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault()
  }

  // Clear any previous errors and success
  error.value = ''
  showSuccess.value = false
  uploadProgress.value = ''

  // Prevent double-submission: set loading immediately
  if (loading.value) return
  loading.value = true

  try {
    // --- Validation (required fields) ---
    if (!form.name || !String(form.name).trim()) {
      error.value = $t('announcement.validation.productNameRequired')
      loading.value = false
      return
    }
    if (!form.category_id) {
      error.value = 'Please select a category'
      loading.value = false
      return
    }
    const priceNum = parseFloat(form.price)
    if (isNaN(priceNum) || priceNum <= 0) {
      error.value = $t('announcement.validation.validPrice')
      loading.value = false
      return
    }
    const stockNum = parseInt(form.stock_quantity, 10)
    if (isNaN(stockNum) || stockNum < 0) {
      error.value = $t('announcement.validation.validStockQuantity')
      loading.value = false
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      error.value = $t('errors.userNotAuthenticated')
      loading.value = false
      return
    }

    // Test storage bucket access when user has images
    if (imageFiles.value.length > 0) {
      try {
        const { error: bucketError } = await supabase.storage
          .from('product-images')
          .list('', { limit: 1 })

        if (bucketError) {
          if (bucketError.message && bucketError.message.includes('does not exist')) {
            error.value = $t('announcement.validation.storageBucketNotExist')
          } else if (bucketError.message && bucketError.message.includes('permission denied')) {
            error.value = $t('announcement.validation.storageBucketNoPermission')
          } else {
            error.value = $t('announcement.validation.storageBucketAccessFailed')
          }
          imageFiles.value = []
          loading.value = false
          return
        }
      } catch (bucketTestError) {
        error.value = $t('announcement.validation.storageBucketNotAccessible')
        imageFiles.value = []
        loading.value = false
        return
      }
    }

    // --- Upload images ---
    let imageUrls = []
    if (imageFiles.value.length > 0) {
      try {
        const uploadTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error($t('announcement.validation.imageUploadTimeout'))), 60000)
        })
        const uploadPromise = uploadImages(user.id)
        imageUrls = await Promise.race([uploadPromise, uploadTimeout])
      } catch (uploadError) {
        error.value = $t('announcement.validation.imagesFailedUpload')
        imageUrls = []
      }
    }

    // --- Map status: checkbox can be true/false or legacy 'approved'; DB needs 'approved'|'pending'|'rejected'|'inactive' ---
    const statusValue = form.status
    const statusForDb = (statusValue === true || statusValue === 'approved')
      ? 'approved'
      : 'pending'

    const productData = {
      name: String(form.name).trim(),
      description: form.description ? String(form.description).trim() || null : null,
      price: priceNum,
      image_urls: Array.isArray(imageUrls) ? imageUrls : [],
      category_id: form.category_id,
      seller_id: user.id,
      stock_quantity: stockNum,
      status: statusForDb,
      is_new: !!form.is_new
    }

    console.log('[NewAnnouncement] Before Supabase insert, productData:', JSON.stringify(productData, null, 2))
    uploadProgress.value = 'Saving...'

    // --- Supabase insert ---
    const { data, error: insertError } = await supabase
      .from('products')
      .insert(productData)

    console.log('[NewAnnouncement] Supabase insert response:', { data, error: insertError ? { message: insertError.message, code: insertError.code, details: insertError.details } : null })

    if (insertError) {
      const errMsg = insertError.message || (insertError.details && String(insertError.details)) || 'Unknown insert error'
      console.error('[NewAnnouncement] Insert failed:', insertError)
      throw new Error(errMsg)
    }

    showSuccess.value = true
    loading.value = false
    uploadProgress.value = ''

    // Redirect to homepage after a short delay
    setTimeout(() => {
      navigateToPath('/')
    }, 2000)
  } catch (err) {
    const msg = err && err.message ? err.message : $t('announcement.validation.errorCreatingProduct')
    error.value = msg
    console.error('[NewAnnouncement] submitForm error:', err)
    loading.value = false
    uploadProgress.value = ''
  }
}
</script>

<style scoped>
.shadow-soft {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

/* Animation classes - using global my-fade-in and my-slide-up classes */

/* Custom file upload styling */
input[type="file"] {
  display: none;
}

/* Image preview grid */
.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
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