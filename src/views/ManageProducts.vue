<template>
  <div class="min-h-screen bg-white">
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Product Management</h1>
        <p class="mt-2 text-gray-600">View and manage all products across all stores</p>
      </div>

      <!-- Product Management Table -->
      <div class="bg-white rounded-lg shadow-md">
        <!-- Table Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-800">All Products</h2>
            
            <!-- Search and Filter Controls -->
            <div class="flex items-center space-x-4">
              <!-- Search Input -->
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search products..."
                  class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              </div>
              
              <!-- Status Filter -->
              <select 
                v-model="statusFilter"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <i class="fas fa-spinner fa-spin text-blue-600 text-3xl mb-4"></i>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Loading Products</h3>
          <p class="text-gray-600">Please wait while we fetch product data...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-4"></i>
          <h3 class="text-lg font-semibold text-red-800 mb-2">Error Loading Products</h3>
          <p class="text-red-600">{{ error }}</p>
          <button 
            @click="fetchProducts"
            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
        
        <!-- Products Table -->
        <div v-else-if="filteredProducts.length > 0" class="w-full">
          <table class="w-full divide-y divide-gray-200 table-fixed">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                  Product
                </th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Seller
                </th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Store
                </th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                  Price
                </th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                  Stock
                </th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="product in filteredProducts" :key="product.product_id" class="hover:bg-gray-50 cursor-pointer" @click="openProductDetails(product.product_id)">
                <!-- Product Info -->
                <td class="px-3 py-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <img 
                        v-if="product.product_image" 
                        :src="product.product_image" 
                        :alt="product.product_name"
                        class="h-10 w-10 rounded-lg object-cover"
                      >
                      <div v-else class="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <i class="fas fa-image text-gray-400 text-xs"></i>
                      </div>
                    </div>
                    <div class="ml-3 min-w-0 flex-1">
                      <div class="text-sm font-medium text-gray-900 truncate" :title="product.product_name">
                        {{ product.product_name }}
                      </div>
                      <div class="text-xs text-gray-500 truncate" :title="product.product_description">
                        {{ product.product_description || 'No description' }}
                      </div>
                    </div>
                  </div>
                </td>
                
                <!-- Seller -->
                <td class="px-3 py-4">
                  <div class="text-sm text-gray-900 truncate" :title="product.seller_name">{{ product.seller_name }}</div>
                  <div class="text-xs text-gray-500 truncate" :title="product.seller_email">{{ product.seller_email }}</div>
                </td>

                <!-- Store -->
                <td class="px-3 py-4">
                  <div class="text-sm text-gray-900 truncate" :title="product.store_name">{{ product.store_name }}</div>
                </td>

                <!-- Price -->
                <td class="px-3 py-4">
                  <div class="text-sm font-semibold text-gray-900">{{ formatPrice(product.product_price) }}</div>
                </td>
                
                <!-- Stock -->
                <td class="px-3 py-4">
                  <div class="text-sm text-gray-900">{{ product.stock_quantity }}</div>
                  <div class="text-xs text-gray-500">Sold: {{ product.sold_count }}</div>
                </td>
                
                <!-- Status -->
                <td class="px-3 py-4">
                  <span 
                    :class="getStatusClass(product.status)"
                    class="px-2 py-1 text-xs font-semibold rounded-full"
                  >
                    {{ product.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- No Products Message -->
        <div v-else class="text-center py-12 text-gray-500">
          <i class="fas fa-box text-4xl mb-4"></i>
          <p class="text-lg font-medium">No products found</p>
          <p class="text-sm">Adjust your filters or try again later.</p>
        </div>
      </div>
    </div>

    <!-- Product Details Modal -->
    <div v-if="selectedProduct" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <i class="fas fa-box text-blue-600"></i>
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-800">Product Details</h2>
              <p class="text-sm text-gray-500">Product ID: {{ selectedProduct.product_id.substring(0, 8) }}...</p>
            </div>
          </div>
          <button @click="closeProductDetails" class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6 flex-1 overflow-y-auto">
          <div v-if="productDetailsLoading" class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-blue-600 text-2xl mb-4"></i>
            <p class="text-gray-600">Loading product details...</p>
          </div>
          
          <div v-else-if="productDetailsError" class="text-center py-8">
            <i class="fas fa-exclamation-triangle text-red-500 text-2xl mb-4"></i>
            <p class="text-red-600">{{ productDetailsError }}</p>
          </div>
          
          <div v-else-if="productDetails" class="space-y-6">
            <!-- Product Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Product Information</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Name:</span>
                    <span class="font-medium">{{ productDetails.product_name }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Status:</span>
                    <span :class="getStatusClass(productDetails.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                      {{ productDetails.status }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Price:</span>
                    <span class="font-medium">{{ formatPrice(productDetails.product_price) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Stock:</span>
                    <span class="font-medium">{{ productDetails.stock_quantity }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Sold:</span>
                    <span class="font-medium">{{ productDetails.sold_count }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Active:</span>
                    <span class="font-medium">{{ productDetails.status === 'approved' ? 'Yes' : 'No' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">New:</span>
                    <span class="font-medium">{{ productDetails.is_new ? 'Yes' : 'No' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Created:</span>
                    <span class="font-medium">{{ formatDate(productDetails.created_at) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Updated:</span>
                    <span class="font-medium">{{ formatDate(productDetails.updated_at) }}</span>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Seller & Store Information</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Seller Name:</span>
                    <span class="font-medium">{{ productDetails.seller_name }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Seller Email:</span>
                    <span class="font-medium">{{ productDetails.seller_email }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Store Name:</span>
                    <span class="font-medium">{{ productDetails.store_name }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Category:</span>
                    <span class="font-medium">{{ productDetails.category_name }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Product ID:</span>
                    <span class="font-medium font-mono text-xs">{{ productDetails.product_id }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Seller ID:</span>
                    <span class="font-medium font-mono text-xs">{{ productDetails.seller_id }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Store ID:</span>
                    <span class="font-medium font-mono text-xs">{{ productDetails.store_id || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Category ID:</span>
                    <span class="font-medium font-mono text-xs">{{ productDetails.category_id || 'N/A' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Product Description -->
            <div v-if="productDetails.product_description" class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Description</h3>
              <p class="text-gray-700">{{ productDetails.product_description }}</p>
            </div>

            <!-- Product Image -->
            <div v-if="productDetails.product_image" class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Product Image</h3>
              <img 
                :src="productDetails.product_image" 
                :alt="productDetails.product_name"
                class="w-full h-64 object-cover rounded-lg border border-gray-200"
              />
            </div>

            <!-- Rejection Reason -->
            <div v-if="productDetails.rejection_reason" class="bg-red-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-red-800 mb-4">Rejection Reason</h3>
              <p class="text-red-700">{{ productDetails.rejection_reason }}</p>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button @click="closeProductDetails" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { maystroApi, transformFromMaystro } from '../services/maystroApi'

// Reactive data
const products = ref([])
const loading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const statusFilter = ref('')

const selectedProduct = ref(null)
const productDetails = ref(null)
const productDetailsLoading = ref(false)
const productDetailsError = ref(null)

// Computed properties for filtering
const filteredProducts = computed(() => {
  let filtered = products.value

  // Filter by search query (product name, seller name, store name)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(product =>
      product.product_name.toLowerCase().includes(query) ||
      product.seller_name.toLowerCase().includes(query) ||
      product.store_name.toLowerCase().includes(query) ||
      product.category_name.toLowerCase().includes(query)
    )
  }

  // Filter by status
  if (statusFilter.value) {
    filtered = filtered.filter(product => product.status === statusFilter.value)
  }

  return filtered
})

// Methods
const fetchProducts = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await maystroApi.getProducts(1)
    
    // Transform Maystro response to frontend format
    const transformedProducts = response.list.results.map(product => 
      transformFromMaystro(product)
    )
    
    products.value = transformedProducts
  } catch (err) {
    console.error('Error fetching products:', err)
    error.value = err.message || 'Failed to fetch products'
  } finally {
    loading.value = false
  }
}

const openProductDetails = async (productId) => {
  selectedProduct.value = products.value.find(p => p.product_id === productId)
  if (selectedProduct.value) {
    await fetchProductDetails(productId)
  }
}

const closeProductDetails = () => {
  selectedProduct.value = null
  productDetails.value = null
  productDetailsError.value = null
}

const fetchProductDetails = async (productId) => {
  try {
    productDetailsLoading.value = true
    productDetailsError.value = null

    // For now, we'll use the same RPC function and find the specific product
    // In a real implementation, you might want a separate RPC function for product details
    const product = products.value.find(p => p.product_id === productId)
    if (product) {
      productDetails.value = product
    } else {
      throw new Error('Product not found')
    }
  } catch (err) {
    console.error('Error fetching product details:', err)
    productDetailsError.value = err.message || 'Failed to fetch product details'
  } finally {
    productDetailsLoading.value = false
  }
}

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPrice = (price) => {
  if (price === null || price === undefined) return 'N/A'
  return `${price.toLocaleString()} DZD`
}

const getStatusClass = (status) => {
  const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full'
  
  switch (status) {
    case 'active':
      return `${baseClasses} bg-green-100 text-green-800`
    case 'inactive':
      return `${baseClasses} bg-gray-100 text-gray-800`
    case 'approved':
      return `${baseClasses} bg-blue-100 text-blue-800`
    case 'rejected':
      return `${baseClasses} bg-red-100 text-red-800`
    case 'pending':
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`
  }
}

// Lifecycle hook
onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>