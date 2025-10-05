<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">My Store Products</h1>
        <p class="mt-2 text-gray-600">Manage your store's product inventory</p>
      </div>

      <!-- Products Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="relative px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800">Product Inventory</h3>
          <!-- Add product button -->
          <button 
            v-if="hasVendorRole"
            @click="showAddForm = true"
            class="right-4 top-2 cursor-pointer text-semibold absolute bg-indigo-700 text-white px-14 py-2 rounded-md hover:bg-indigo-800 transition-colors"
          >
            Add Product
          </button>
        </div>
        
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <i class="fas fa-spinner fa-spin text-primary text-3xl mb-4"></i>
          <p class="text-gray-600">Loading products...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-4"></i>
          <p class="text-red-600">{{ error }}</p>
          <button @click="fetchProducts" class="mt-4 btn-primary">
            Try Again
          </button>
        </div>
        
        <!-- Access Guard -->
        <div v-else-if="!hasVendorRole" class="text-center py-12">
          <i class="fas fa-lock text-gray-400 text-4xl mb-4"></i>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Vendor access required</h3>
          <p class="text-gray-600">Your store must be approved (vendor role) to manage products.</p>
        </div>

        <!-- Products Table -->
        <div v-else-if="products.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="product in products" :key="product.product_id" class="hover:bg-gray-50">
                <!-- Product Info (Image + Name) -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-12 w-12">
                      <img 
                        v-if="product.image_urls && product.image_urls.length > 0" 
                        :src="product.image_urls[0]" 
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
                  <div class="text-sm font-medium text-gray-900">{{ formatCurrency(product.price) }}</div>
                  <div v-if="product.sold_count > 0" class="text-sm text-gray-500">
                    {{ product.sold_count }} sold
                  </div>
                </td>
                
                <!-- Category -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {{ product.category_name }}
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
                      {{ product.stock_quantity > 10 ? 'In Stock' : product.stock_quantity > 0 ? 'Low Stock' : 'Out of Stock' }}
                    </span>
                  </div>
                </td>
                
                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center space-x-3">
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
          <h3 class="text-lg font-semibold text-gray-800 mb-2">No Products Found</h3>
          <p class="text-gray-600 mb-6">You haven't added any products to your store yet.</p>
          <button v-if="hasVendorRole" @click="addProduct" class="btn-primary">
            <i class="fas fa-plus mr-2"></i>
            Add Your First Product
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
          <h3 class="text-lg font-medium text-gray-900 mt-4">Delete Product</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Are you sure you want to delete "<strong>{{ productToDelete.name }}</strong>"? 
              This action cannot be undone.
            </p>
          </div>
          <div class="flex justify-center space-x-4 mt-4">
            <button 
              @click="showDeleteModal = false"
              class="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button 
              @click="deleteProduct"
              class="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              :disabled="deleting"
            >
              <i v-if="deleting" class="fas fa-spinner fa-spin mr-2"></i>
              {{ deleting ? 'Deleting...' : 'Delete' }}
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
              {{ editing ? 'Edit Product' : 'Add New Product' }}
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
                  Product Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="newProduct.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter product name"
                />
              </div>

              <!-- Description -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Description <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="newProduct.description"
                  required
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter product description"
                ></textarea>
              </div>

              <!-- Price -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Price (DZD) <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="newProduct.price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              </div>

              <!-- Stock Quantity -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="newProduct.stock_quantity"
                  type="number"
                  min="0"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>

              <!-- Category -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Category <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="newProduct.category_id"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a category</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name_en }}
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
                  Mark as new product
                </label>
              </div>
            </div>

            <!-- Thumbnail Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail Image <span class="text-red-500">*</span>
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
                      <span>Upload thumbnail</span>
                      <input
                        id="thumbnail-upload"
                        type="file"
                        accept="image/*"
                        @change="handleThumbnailUpload"
                        class="sr-only"
                      />
                    </label>
                    <p class="pl-1">or drag and drop</p>
                  </div>
                  <p class="text-xs text-gray-500">PNG, JPG, JPEG up to 2MB</p>
                </div>
              </div>
            </div>

            <!-- Product Images Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Product Images (Optional)
              </label>
              
              <!-- Upload Area -->
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div class="space-y-1 text-center">
                  <div class="mx-auto h-12 w-12 text-gray-400">
                    <i class="fas fa-images text-4xl"></i>
                  </div>
                  <div class="flex text-sm text-gray-600">
                    <label for="images-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Upload images</span>
                      <input
                        id="images-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        @change="handleImagesUpload"
                        class="sr-only"
                      />
                    </label>
                    <p class="pl-1">or drag and drop</p>
                  </div>
                  <p class="text-xs text-gray-500">PNG, JPG, JPEG up to 2MB each (max 10 images)</p>
                  <div v-if="imageFiles.length > 0" class="text-sm text-gray-600">
                    {{ imageFiles.length }} image(s) selected
                  </div>
                </div>
              </div>

              <!-- Image Previews -->
              <div v-if="imagePreviews.length > 0" class="mt-4">
                <h4 class="text-sm font-medium text-gray-700 mb-3">Selected Images:</h4>
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
                      title="Remove image"
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
                Cancel
              </button>
               <button
                 type="button"
                 @click="handleFormSubmit"
                 :disabled="creating"
                 class="px-6 py-2 bg-indigo-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <i v-if="creating" class="fas fa-spinner fa-spin mr-2"></i>
                 {{ editing ? (creating ? 'Updating...' : 'Update Product') : (creating ? 'Creating...' : 'Create Product') }}
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
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

// Reactive data
const products = ref([])
const loading = ref(false)
const error = ref(null)
const showDeleteModal = ref(false)
const productToDelete = ref({ id: null, name: '' })
const deleting = ref(false)

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

    const { data, error: fetchError } = await supabase.rpc('get_my_store_products')

    if (fetchError) throw fetchError

    products.value = data || []
  } catch (err) {
    error.value = err.message
    console.error('Error fetching products:', err)
  } finally {
    loading.value = false
  }
}

// Category names are now provided directly by the database function

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
    price: product.price.toString(),
    stock_quantity: product.stock_quantity.toString(),
    category_id: product.category_id,
    is_new: product.is_new
  }
  
  // Set existing images as previews
  if (product.image_urls && product.image_urls.length > 0) {
    imagePreviews.value = [...product.image_urls]
    // Note: We can't set imageFiles for existing images since they're URLs, not files
    // The user will need to re-upload if they want to change images
  }
  
  // Set thumbnail preview if exists
  if (product.thumbnail_url) {
    thumbnailPreview.value = product.thumbnail_url
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