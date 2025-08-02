<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
      <div>
        <h1 class="text-3xl font-bold text-dark">{{ $t('seller.dashboard') }}</h1>
        <p class="text-gray-600 mt-2">
          {{ $t('seller.welcomeMessage', { name: authStore.userDisplayName }) }}
        </p>
      </div>
      
      <button
        @click="showAddProductModal = true"
        class="btn-primary"
      >
        <i class="fas fa-plus ml-2"></i>
        {{ $t('seller.addProduct') }}
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-box text-blue-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">{{ $t('seller.totalProducts') }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ sellerStore.totalProducts }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-check-circle text-green-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">{{ $t('seller.activeProducts') }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ sellerStore.activeProducts.length }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-pause-circle text-yellow-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">{{ $t('seller.inactiveProducts') }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ sellerStore.inactiveProducts.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Products Table -->
    <div class="card">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-dark">{{ $t('seller.myProducts') }}</h2>
        <div class="flex space-x-2 space-x-reverse">
          <button
            @click="refreshProducts"
            :disabled="sellerStore.loading"
            class="btn-outline"
          >
            <i class="fas fa-refresh ml-2" :class="{ 'fa-spin': sellerStore.loading }"></i>
            {{ $t('common.refresh') }}
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="sellerStore.error" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        {{ sellerStore.error }}
      </div>

      <!-- Loading State -->
      <div v-if="sellerStore.loading" class="text-center py-8">
        <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600">{{ $t('common.loading') }}</p>
      </div>

      <!-- Products Table -->
      <div v-else-if="sellerStore.products.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('seller.product') }}
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('seller.category') }}
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('seller.price') }}
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('seller.status') }}
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('seller.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in sellerStore.products" :key="product.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img
                    :src="product.image"
                    :alt="product.name"
                    class="w-12 h-12 object-cover rounded-lg"
                  />
                  <div class="mr-4">
                    <div class="text-sm font-medium text-gray-900">{{ product.name_ar }}</div>
                    <div class="text-sm text-gray-500">{{ product.name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ getCategoryName(product.category) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatPrice(product.price) }} دج
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    product.in_stock
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ product.in_stock ? $t('seller.inStock') : $t('seller.outOfStock') }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 space-x-reverse">
                <button
                  @click="toggleProductStatus(product.id, !product.in_stock)"
                  :class="[
                    'px-3 py-1 rounded-md text-xs font-medium',
                    product.in_stock
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  ]"
                >
                  {{ product.in_stock ? $t('seller.deactivate') : $t('seller.activate') }}
                </button>
                <button
                  @click="editProduct(product)"
                  class="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium hover:bg-blue-200"
                >
                  {{ $t('common.edit') }}
                </button>
                <button
                  @click="deleteProduct(product.id)"
                  class="px-3 py-1 bg-red-100 text-red-800 rounded-md text-xs font-medium hover:bg-red-200"
                >
                  {{ $t('common.delete') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-box text-gray-400 text-3xl"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">{{ $t('seller.noProducts') }}</h3>
        <p class="text-gray-500 mb-6">{{ $t('seller.noProductsMessage') }}</p>
        <button
          @click="showAddProductModal = true"
          class="btn-primary"
        >
          <i class="fas fa-plus ml-2"></i>
          {{ $t('seller.addFirstProduct') }}
        </button>
      </div>
    </div>

    <!-- Add/Edit Product Modal -->
    <AddProductModal
      :is-open="showAddProductModal"
      :product="editingProduct"
      @close="closeProductModal"
      @product-saved="onProductSaved"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useSellerStore } from '../stores/seller'
import AddProductModal from '../components/AddProductModal.vue'

export default {
  name: 'SellerDashboard',
  components: {
    AddProductModal
  },
  setup() {
    const authStore = useAuthStore()
    const sellerStore = useSellerStore()
    const showAddProductModal = ref(false)
    const editingProduct = ref(null)

    const categories = [
      { id: 'all', name: 'All Products', nameAr: 'جميع المنتجات' },
      { id: 'cars', name: 'Cars', nameAr: 'السيارات' },
      { id: 'realestate', name: 'Real Estate', nameAr: 'العقارات' },
      { id: 'electronics', name: 'Electronics', nameAr: 'الإلكترونيات' },
      { id: 'fashion', name: 'Fashion', nameAr: 'الموضة' },
      { id: 'home', name: 'Home & Kitchen', nameAr: 'المنزل والمطبخ' },
      { id: 'beauty', name: 'Beauty & Personal Care', nameAr: 'الجمال والرعاية الشخصية' },
      { id: 'kids', name: 'Kids', nameAr: 'الأطفال' },
      { id: 'food', name: 'Food & Beverages', nameAr: 'الطعام والمشروبات' }
    ]

    const getCategoryName = (categoryId) => {
      const category = categories.find(cat => cat.id === categoryId)
      return category ? category.nameAr : categoryId
    }

    const formatPrice = (price) => {
      return price.toLocaleString('ar-DZ')
    }

    const refreshProducts = async () => {
      await sellerStore.fetchSellerProducts()
    }

    const toggleProductStatus = async (productId, inStock) => {
      try {
        await sellerStore.toggleProductStatus(productId, inStock)
      } catch (error) {
        console.error('Error toggling product status:', error)
      }
    }

    const editProduct = (product) => {
      editingProduct.value = product
      showAddProductModal.value = true
    }

    const deleteProduct = async (productId) => {
      if (confirm('Are you sure you want to delete this product?')) {
        try {
          await sellerStore.deleteProduct(productId)
        } catch (error) {
          console.error('Error deleting product:', error)
        }
      }
    }

    const closeProductModal = () => {
      showAddProductModal.value = false
      editingProduct.value = null
      sellerStore.clearError()
    }

    const onProductSaved = () => {
      closeProductModal()
      refreshProducts()
    }

    onMounted(async () => {
      await sellerStore.fetchSellerProducts()
    })

    return {
      authStore,
      sellerStore,
      showAddProductModal,
      editingProduct,
      categories,
      getCategoryName,
      formatPrice,
      refreshProducts,
      toggleProductStatus,
      editProduct,
      deleteProduct,
      closeProductModal,
      onProductSaved
    }
  }
}
</script> 