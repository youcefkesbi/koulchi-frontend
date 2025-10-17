<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">{{ $t('storeProducts.title') }}</h1>
        <p class="mt-2 text-gray-600">{{ $t('storeProducts.subtitle') }}</p>
      </div>

      <!-- Products Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="relative px-6 py-4 border-b border-gray-200"> 

      <!-- Manage products -->
      <div class="bg-white rounded-lg  ">
        <div class="flex items-center gap-8">
        <h3 
        class="ml-4 mt-3 text-lg font-semibold text-gray-800 mb-4">{{ $t('storeProducts.storeOrders') }}</h3>
        <!-- Products Filtering tab -->
        <div class="flex justify-center gap-4">
        <!-- Price Sort Button -->
        <button 
          @click="setSortFilter('price')"
          :class="sortFilter === 'price' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'"
          class="h-fit rounded-md px-12 py-2 transition-colors">
           <span>{{ $t('storeProducts.price') }}</span><span class="ml-1">{{ sortOrder === 'desc' ? '↓' : '↑' }}</span>
        </button>

        
        <!-- Category Filter -->
                <select 
          @change="setCategoryFilter($event.target.value)"
          :value="categoryFilter"
         class="h-fit rounded-md pl-2  py-2 transition-colors bg-gray-100 text-gray-700 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none">
          <option value="">{{ $t('dashboard.categories') }}</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ getCategoryDisplayName(category) }}
          </option>
        </select>
        <!-- Stock Filter -->
        <select 
          @change="setStockFilter($event.target.value)"
          :value="stockFilter"
          class="h-fit rounded-md px-4 py-2 transition-colors bg-gray-100 text-gray-700 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none">
          <option value="">{{ $t('storeProducts.allStock') }}</option>
          <option value="in_stock">{{ $t('storeProducts.inStockFilter') }}</option>
          <option value="low_stock">{{ $t('storeProducts.lowStockFilter') }}</option>
          <option value="out_of_stock">{{ $t('storeProducts.outOfStockFilter') }}</option>
        </select>

        <!-- Add product button -->
        <button 
          v-if="hasVendorRole"
          @click="showAddForm = true"
          class="h-fit cursor-pointer text-semibold ml-4 bg-indigo-700 text-white px-10 py-2 rounded-md hover:bg-indigo-800 transition-colors"
        >
          {{ $t('stores.addProduct') }}
        </button>
        </div> 
        </div>
        </div>
        </div>
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <i class="fas fa-spinner fa-spin text-primary text-3xl mb-4"></i>
          <p class="text-gray-600">{{ $t('storeProducts.loadingProducts') }}</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-4"></i>
          <p class="text-red-600">{{ error }}</p>
          <button @click="fetchProducts" class="mt-4 btn-primary">
            {{ $t('storeProducts.tryAgain') }}
          </button>
        </div>
        
        <!-- Access Guard -->
        <div v-else-if="!hasVendorRole" class="text-center py-12">
          <i class="fas fa-lock text-gray-400 text-4xl mb-4"></i>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ $t('storeProducts.vendorAccessRequired') }}</h3>
          <p class="text-gray-600">{{ $t('storeProducts.vendorAccessMessage') }}</p>
        </div>

        <!-- Products Table -->
        <div v-else-if="products.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('storeProducts.product') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('storeProducts.price') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('storeProducts.category') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('storeProducts.stock') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('storeProducts.actions') }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="product in products" :key="product.product_id" class="hover:bg-gray-50">
                <!-- Product Info (Image + Name) -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-12 w-12">
                      <img 
                        v-if="product.product_image" 
                        :src="product.product_image" 
                        :alt="product.product_name" 
                        class="h-12 w-12 rounded-lg object-cover border border-gray-200"
                      >
                      <div v-else class="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center border border-gray-200">
                        <i class="fas fa-image text-gray-400"></i>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ product.product_name }}</div>
                
                    </div>
                  </div>
                </td>
                
                <!-- Price -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ formatCurrency(product.product_price) }}</div>
                  <div v-if="product.sold_count > 0" class="text-sm text-gray-500">
                    {{ product.sold_count }} {{ $t('storeProducts.sold') }}
                  </div>
                </td>
                
                <!-- Category -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {{ getProductCategoryName(product) }}
                  </span>
                </td>
                
                <!-- Stock Quantity -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <span class="text-sm font-medium text-gray-900">{{ product.stock_quantity }}</span>
                    <span 
                      class="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      :class="{
                        'bg-green-100 text-green-800': product.stock_quantity > 10,
                        'bg-yellow-100 text-yellow-800': product.stock_quantity > 0 && product.stock_quantity <= 10,
                        'bg-red-100 text-red-800': product.stock_quantity === 0
                      }"
                    >
                      {{ product.stock_quantity > 10 ? $t('storeProducts.inStock') : product.stock_quantity > 0 ? $t('storeProducts.lowStock') : $t('storeProducts.outOfStock') }}
                    </span>
                  </div>
                </td>
                
                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center space-x-3">
                    <!-- Promote Button -->
                    <button 
                      @click="promoteProduct(product.product_id)"
                      class="text-green-600 hover:text-green-900 transition-colors duration-200"
                      title="Promote Product"
                    >
                      <i class="fas fa-bullhorn text-lg"></i>
                    </button>
                    
                    <!-- Edit Button -->
                    <button 
                      @click="editProduct(product.product_id)"
                      class="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                      title="Edit Product"
                    >
                      <i class="fas fa-edit text-lg"></i>
                    </button>
                    
                    <!-- Delete Button -->
                    <button 
                      @click="confirmDeleteProduct(product.product_id, product.product_name)"
                      class="text-red-600 hover:text-red-900 transition-colors duration-200"
                      title="Delete Product"
                    >
                      <i class="fas fa-trash text-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- No Products State -->
        <div v-else class="text-center py-12">
          <i class="fas fa-box-open text-gray-400 text-4xl mb-4"></i>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ $t('storeProducts.noProductsFound') }}</h3>
          <p class="text-gray-600 mb-6">{{ $t('storeProducts.noProductsMessage') }}</p>
          <button v-if="hasVendorRole" @click="addProduct" class="btn-primary">
            <i class="fas fa-plus mr-2"></i>
            {{ $t('storeProducts.addFirstProduct') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mt-4">{{ $t('storeProducts.deleteProduct') }}</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              {{ $t('storeProducts.deleteConfirm') }} "<strong>{{ productToDelete.name }}</strong>"? 
              {{ $t('storeProducts.deleteConfirmMessage') }}
            </p>
          </div>
          <div class="flex justify-center space-x-4 mt-4">
            <button 
              @click="showDeleteModal = false"
              class="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {{ $t('storeProducts.cancel') }}
            </button>
            <button 
              @click="deleteProduct"
              class="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              :disabled="deleting"
            >
              <i v-if="deleting" class="fas fa-spinner fa-spin mr-2"></i>
              {{ deleting ? $t('storeProducts.deleting') : $t('storeProducts.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Product Form Modal -->
    <div v-if="showAddForm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <!-- Header -->
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-gray-900">
              {{ editing ? $t('storeProducts.editProduct') : $t('storeProducts.addNewProduct') }}
            </h3>
            <button 
              @click="closeAddForm"
              class="text-gray-400 hover:text-gray-600 text-2xl"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

           <!-- Form -->
           <form @submit.prevent="handleFormSubmit" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Product Name -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('storeProducts.productName') }} <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="newProduct.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  :placeholder="$t('storeProducts.productNamePlaceholder')"
                />
              </div>

              <!-- Description -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('storeProducts.description') }} <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="newProduct.description"
                  required
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  :placeholder="$t('storeProducts.descriptionPlaceholder')"
                ></textarea>
              </div>

              <!-- Price -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('storeProducts.priceDZD') }} <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="newProduct.price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  :placeholder="$t('storeProducts.pricePlaceholder')"
                />
              </div>

              <!-- Stock Quantity -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('storeProducts.stockQuantity') }} <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="newProduct.stock_quantity"
                  type="number"
                  min="0"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  :placeholder="$t('storeProducts.stockPlaceholder')"
                />
              </div>

              <!-- Category -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('storeProducts.category') }} <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="newProduct.category_id"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">{{ $t('storeProducts.selectCategory') }}</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ getCategoryDisplayName(category) }}
                  </option>
                </select>
              </div>

              <!-- Is New Product -->
              <div class="flex items-center">
                <input
                  v-model="newProduct.is_new"
                  type="checkbox"
                  id="is_new"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label for="is_new" class="ml-2 block text-sm text-gray-700">
                  {{ $t('storeProducts.markAsNew') }}
                </label>
              </div>
            </div>

            <!-- Thumbnail Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('storeProducts.thumbnailImage') }} <span class="text-red-500">*</span>
              </label>
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div class="space-y-1 text-center">
                  <div v-if="!thumbnailFile" class="mx-auto h-12 w-12 text-gray-400">
                    <i class="fas fa-image text-4xl"></i>
                  </div>
                  <div v-else class="mx-auto h-12 w-12">
                    <img :src="thumbnailPreview" alt="Thumbnail preview" class="h-12 w-12 object-cover rounded">
                  </div>
                  <div class="flex text-sm text-gray-600">
                    <label for="thumbnail-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>{{ $t('storeProducts.uploadThumbnail') }}</span>
                      <input
                        id="thumbnail-upload"
                        type="file"
                        accept="image/*"
                        @change="handleThumbnailUpload"
                        class="sr-only"
                      />
                    </label>
                    <p class="pl-1">{{ $t('storeProducts.dragAndDrop') }}</p>
                  </div>
                  <p class="text-xs text-gray-500">{{ $t('storeProducts.imageFormats') }}</p>
                </div>
              </div>
            </div>

            <!-- Product Images Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('storeProducts.productImages') }}
              </label>
              
              <!-- Upload Area -->
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div class="space-y-1 text-center">
                  <div class="mx-auto h-12 w-12 text-gray-400">
                    <i class="fas fa-images text-4xl"></i>
                  </div>
                  <div class="flex text-sm text-gray-600">
                    <label for="images-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>{{ $t('storeProducts.uploadImages') }}</span>
                      <input
                        id="images-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        @change="handleImagesUpload"
                        class="sr-only"
                      />
                    </label>
                    <p class="pl-1">{{ $t('storeProducts.dragAndDrop') }}</p>
                  </div>
                  <p class="text-xs text-gray-500">{{ $t('storeProducts.maxImages') }}</p>
                  <div v-if="imageFiles.length > 0" class="text-sm text-gray-600">
                    {{ imageFiles.length }} {{ $t('storeProducts.imagesSelected') }}
                  </div>
                </div>
              </div>

              <!-- Image Previews -->
              <div v-if="imagePreviews.length > 0" class="mt-4">
                <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('storeProducts.selectedImages') }}</h4>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <div 
                    v-for="(preview, index) in imagePreviews" 
                    :key="index" 
                    class="relative group"
                  >
                    <img 
                      :src="preview" 
                      :alt="`Product image ${index + 1}`"
                      class="w-full h-24 object-cover rounded-lg border border-gray-200"
                    >
                    <!-- Remove button -->
                    <button
                      @click="removeImage(index)"
                      class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      :title="$t('storeProducts.removeImage')"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                    <!-- Image number -->
                    <div class="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {{ index + 1 }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                @click="closeAddForm"
                class="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                {{ $t('storeProducts.cancel') }}
              </button>
               <button
                 type="button"
                 @click="handleFormSubmit"
                 :disabled="creating"
                 class="px-6 py-2 bg-indigo-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <i v-if="creating" class="fas fa-spinner fa-spin mr-2"></i>
                 {{ editing ? (creating ? $t('storeProducts.updating') : $t('storeProducts.updateProduct')) : (creating ? $t('storeProducts.creating') : $t('storeProducts.createProduct')) }}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocaleRouter } from '../composables/useLocaleRouter'
import { supabase } from '../lib/supabase'

const { t: $t } = useI18n()
const route = useRoute()
const router = useRouter()
const { navigateTo } = useLocaleRouter()

// Reactive data
const products = ref([])
const loading = ref(false)
const error = ref(null)
const showDeleteModal = ref(false)
const productToDelete = ref({ id: null, name: '' })
const deleting = ref(false)

// Filtering state
const sortFilter = ref('created_at')
const sortOrder = ref('desc')
const priceMin = ref('')
const priceMax = ref('')
const categoryFilter = ref('')
const stockFilter = ref('')

// Add product form data
const showAddForm = ref(false)
const creating = ref(false)
const editing = ref(false)
const editingProductId = ref(null)
const categories = ref([])
const newProduct = ref({
  name: '',
  description: '',
  price: '',
  stock_quantity: '',
  category_id: '',
  is_new: true
})
const thumbnailFile = ref(null)
const thumbnailPreview = ref(null)
const imageFiles = ref([])
const imagePreviews = ref([])

// Vendor role flag
const hasVendorRole = ref(false)

// Category names are now fetched directly from the database via JOIN

// Methods
const fetchProducts = async () => {
  try {
    loading.value = true
    error.value = null

    // Ensure vendor access
    if (!hasVendorRole.value) {
      products.value = []
      return
    }

    const { data, error: fetchError } = await supabase.rpc('get_my_store_products_filtered', {
      p_price_min: priceMin.value ? parseFloat(priceMin.value) : null,
      p_price_max: priceMax.value ? parseFloat(priceMax.value) : null,
      p_category_id: categoryFilter.value || null,
      p_stock_filter: stockFilter.value || null,
      p_sort_by: sortFilter.value,
      p_sort_order: sortOrder.value
    })

    if (fetchError) throw fetchError

    products.value = data || []
  } catch (err) {
    error.value = err.message
    console.error('Error fetching products:', err)
  } finally {
    loading.value = false
  }
}

// Filtering methods
const setSortFilter = async (filter) => {
  if (sortFilter.value === filter) {
    // Toggle order if same filter is clicked
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    // Set new filter with default desc order
    sortFilter.value = filter
    sortOrder.value = 'desc'
  }
  
  // Fetch filtered products
  await fetchProducts()
}

const setCategoryFilter = async (categoryId) => {
  categoryFilter.value = categoryId
  await fetchProducts()
}

const setStockFilter = async (stockStatus) => {
  stockFilter.value = stockStatus
  await fetchProducts()
}

let priceFilterTimeout = null
const setPriceFilter = async () => {
  // Clear existing timeout
  if (priceFilterTimeout) {
    clearTimeout(priceFilterTimeout)
  }
  
  // Set new timeout to debounce the API call
  priceFilterTimeout = setTimeout(async () => {
    await fetchProducts()
  }, 500) // Wait 500ms after user stops typing
}

// Helper function to get category display name for dropdown
const getCategoryDisplayName = (category) => {
  const currentLocale = route.meta.locale || 'en'
  
  if (currentLocale === 'ar' && category.name_ar) {
    return category.name_ar
  } else if (currentLocale === 'fr' && category.name_fr) {
    return category.name_fr
  } else {
    return category.name_en
  }
}

// Helper function to get product category name in current language
const getProductCategoryName = (product) => {
  const currentLocale = route.meta.locale || 'en'
  
  if (currentLocale === 'ar' && product.category_name_ar) {
    return product.category_name_ar
  } else if (currentLocale === 'fr' && product.category_name_fr) {
    return product.category_name_fr
  } else {
    return product.category_name_en || product.category_name
  }
}

// Fetch categories from database
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
    error.value = 'Failed to load categories'
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0
  }).format(amount)
}

// Form methods
const closeAddForm = () => {
  showAddForm.value = false
  editing.value = false
  editingProductId.value = null
  resetForm()
}

const resetForm = () => {
  newProduct.value = {
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '',
    is_new: true
  }
  thumbnailFile.value = null
  thumbnailPreview.value = null
  imageFiles.value = []
  imagePreviews.value = []
}

const openEditForm = (product) => {
  editing.value = true
  editingProductId.value = product.product_id
  showAddForm.value = true
  
  // Pre-fill form with product data
  newProduct.value = {
    name: product.product_name,
    description: product.product_description,
    price: product.product_price.toString(),
    stock_quantity: product.stock_quantity.toString(),
    category_id: product.category_id,
    is_new: product.is_new
  }
  
  // Set existing images as previews
  if (product.product_image) {
    imagePreviews.value = [product.product_image]
    // Note: We can't set imageFiles for existing images since they're URLs, not files
    // The user will need to re-upload if they want to change images
  }
  
  // Set thumbnail preview if exists
  if (product.product_image) {
    thumbnailPreview.value = product.product_image
  }
}

const handleThumbnailUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      error.value = 'Thumbnail image must be less than 2MB'
      return
    }
    
    thumbnailFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      thumbnailPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleImagesUpload = (event) => {
  const files = Array.from(event.target.files)
  
  // Validate file count (max 10 total)
  if (imageFiles.value.length + files.length > 10) {
    error.value = 'Maximum 10 images allowed'
    return
  }
  
  // Validate file sizes (2MB max each)
  for (const file of files) {
    if (file.size > 2 * 1024 * 1024) {
      error.value = 'Each image must be less than 2MB'
      return
    }
  }
  
  // Add new files to existing ones
  imageFiles.value = [...imageFiles.value, ...files]
  
  // Generate previews for new files
  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreviews.value.push(e.target.result)
    }
    reader.readAsDataURL(file)
  })
}

const removeImage = (index) => {
  // Remove from both files and previews arrays
  imageFiles.value.splice(index, 1)
  imagePreviews.value.splice(index, 1)
}

const uploadImage = async (file, bucket = 'product-images') => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return data.publicUrl
  } catch (err) {
    console.error('Error uploading image:', err)
    throw err
  }
}

const handleFormSubmit = (event) => {
  event.preventDefault()
  event.stopPropagation()
  console.log('Form submitted, editing:', editing.value)
  createProduct()
}

const createProduct = async () => {
  // Prevent multiple submissions
  if (creating.value) {
    console.log('Already processing, ignoring duplicate submission')
    return
  }
  
  try {
    creating.value = true
    error.value = null

    // Validate required fields
    if (!newProduct.value.name || !newProduct.value.description || !newProduct.value.price || !newProduct.value.stock_quantity || !newProduct.value.category_id) {
      error.value = 'Please fill in all required fields'
      return
    }

    // For new products, thumbnail is required. For editing, it's optional if already exists
    if (!editing.value && !thumbnailFile.value) {
      error.value = 'Please upload a thumbnail image'
      return
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      error.value = 'User not authenticated'
      return
    }

    // Get user's store ID
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (storeError || !storeData) {
      error.value = 'Store not found'
      return
    }

    let thumbnailUrl = null
    let imageUrls = []

    // Handle thumbnail upload
    if (thumbnailFile.value) {
      // New thumbnail uploaded
      thumbnailUrl = await uploadImage(thumbnailFile.value)
    } else if (editing.value && thumbnailPreview.value && !thumbnailPreview.value.startsWith('data:')) {
      // Keep existing thumbnail (it's a URL, not a data URL)
      thumbnailUrl = thumbnailPreview.value
    }

    // Handle product images
    if (imageFiles.value.length > 0) {
      // New images uploaded
      for (const file of imageFiles.value) {
        const imageUrl = await uploadImage(file)
        imageUrls.push(imageUrl)
      }
    } else if (editing.value) {
      // Keep existing images (they're URLs, not files)
      imageUrls = imagePreviews.value.filter(url => !url.startsWith('data:'))
    }

    if (editing.value) {
      // Update existing product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .update({
          name: newProduct.value.name,
          description: newProduct.value.description,
          price: parseFloat(newProduct.value.price),
          stock_quantity: parseInt(newProduct.value.stock_quantity),
          category_id: newProduct.value.category_id,
          is_new: newProduct.value.is_new,
          thumbnail_url: thumbnailUrl,
          image_urls: imageUrls,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProductId.value)
        .select()

      if (productError) throw productError
      console.log('Product updated successfully!')
    } else {
      // Create new product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({
          name: newProduct.value.name,
          description: newProduct.value.description,
          price: parseFloat(newProduct.value.price),
          stock_quantity: parseInt(newProduct.value.stock_quantity),
          category_id: newProduct.value.category_id,
          seller_id: user.id,
          store_id: storeData.id,
          is_new: newProduct.value.is_new,
          thumbnail_url: thumbnailUrl,
          image_urls: imageUrls,
          is_active: true
        })
        .select()

      if (productError) throw productError
      console.log('Product created successfully!')
    }

    // Refresh products list
    await fetchProducts()
    
    // Close form
    closeAddForm()
    
  } catch (err) {
    console.error('Error saving product:', err)
    error.value = err.message || `Failed to ${editing.value ? 'update' : 'create'} product`
  } finally {
    creating.value = false
  }
}

const editProduct = (productId) => {
  // Find the product in the current list
  const product = products.value.find(p => p.product_id === productId)
  if (product) {
    openEditForm(product)
  } else {
    error.value = 'Product not found'
  }
}

const addProduct = () => {
  // Open the form for adding a new product
  editing.value = false
  editingProductId.value = null
  showAddForm.value = true
  resetForm()
}

const confirmDeleteProduct = (productId, productName) => {
  // Delete immediately without confirmation
  deleteProduct(productId, productName)
}

const deleteProduct = async (productId, productName) => {
  try {
    deleting.value = true
    
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (deleteError) throw deleteError

    // Remove product from local array
    products.value = products.value.filter(p => p.product_id !== productId)
    
    console.log(`Product "${productName}" deleted successfully!`)
  } catch (err) {
    error.value = err.message
    console.error('Error deleting product:', err)
  } finally {
    deleting.value = false
  }
}

const promoteProduct = (productId) => {
  // Navigate to ad request form with product pre-filled
  navigateTo('AdRequest', {
    query: {
      type: 'product',
      id: productId
    }
  })
}

// Lifecycle
onMounted(async () => {
  // Determine vendor role from user_roles
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user?.id) {
      const { data: roles, error: roleErr } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
      if (!roleErr) {
        hasVendorRole.value = Array.isArray(roles) && roles.some(r => (r.role || '').toLowerCase() === 'vendor')
      }
    }
  } catch (e) {
    console.error('Role check failed:', e)
  }

  await fetchCategories()
  await fetchProducts()
})
</script>

<style scoped>
.btn-primary {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  font-weight: 500;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 2px #3b82f6;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>