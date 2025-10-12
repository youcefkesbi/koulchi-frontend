<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-soft border-b border-gray-100">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">{{ $t('employee.dashboard') }}</h1>
            <p class="text-gray-600">{{ $t('employee.dashboardDescription') }}</p>
          </div>
          <div class="flex items-center space-x-4 space-x-reverse">
            <span class="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
              {{ $t('employee.employeeRole') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-soft p-6">
          <div class="flex items-center space-x-3 space-x-reverse">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <i class="fas fa-store text-blue-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-800">{{ basicStoresCount }}</h3>
              <p class="text-sm text-gray-600">{{ $t('employee.basicPackStores') }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-soft p-6">
          <div class="flex items-center space-x-3 space-x-reverse">
            <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <i class="fas fa-crown text-yellow-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-800">{{ proStoresCount }}</h3>
              <p class="text-sm text-gray-600">{{ $t('employee.proPackStores') }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-soft p-6">
          <div class="flex items-center space-x-3 space-x-reverse">
            <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <i class="fas fa-box text-primary-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-800">{{ productsCount }}</h3>
              <p class="text-sm text-gray-600">{{ $t('employee.products') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-2xl shadow-soft mb-8">
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 space-x-reverse px-6">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <i :class="tab.icon + ' mr-2'"></i>
              {{ tab.name }}
              <span v-if="tab.count > 0" class="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                {{ tab.count }}
              </span>
            </button>
          </nav>
        </div>

        <div class="p-6">
          <!-- Basic Pack Stores Tab -->
          <div v-if="activeTab === 'basicStores'" class="space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-800">{{ $t('employee.basicPackStores') }}</h2>
              <button
                @click="refreshData"
                :disabled="loading"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <i class="fas fa-sync-alt mr-2" :class="{ 'animate-spin': loading }"></i>
                {{ $t('common.refresh') }}
              </button>
            </div>

            <div v-if="loading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p class="text-gray-600">{{ $t('common.loading') }}</p>
            </div>

            <div v-else-if="basicStores.length === 0" class="text-center py-12">
              <div class="text-gray-400 text-5xl mb-4">
                <i class="fas fa-check-circle"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ $t('employee.noBasicStores') }}</h3>
              <p class="text-gray-600">{{ $t('employee.noBasicStoresMessage') }}</p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="store in basicStores"
                :key="store.id"
                @click="openBasicStoreDetails(store)"
                class="border border-gray-200 rounded-xl p-6 hover:shadow-md cursor-pointer transition-shadow"
              >
                <div class="flex items-start space-x-4 space-x-reverse">
                  <div class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                    <i class="fas fa-store text-blue-600 text-2xl"></i>
                  </div>
                  
                  <div class="flex-1">
                    <div class="space-y-2">
                      <h3 class="text-lg font-semibold text-gray-800">{{ store.name || $t('stores.defaultStoreName') }}</h3>
                      <div class="text-sm text-gray-500">
                        <strong>{{ $t('employee.storeId') }}:</strong> {{ store.id }}
                      </div>
                      <div class="text-sm text-gray-500">
                        <strong>{{ $t('employee.owner') }}:</strong> {{ store.owner_name || 'N/A' }}
                      </div>
                      <div class="text-sm text-gray-500">
                        <strong>{{ $t('employee.created') }}:</strong> {{ formatDate(store.created_at) }}
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center">
                    <span :class="getStatusClass(store.status)">
                      {{ store.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pro Pack Stores Tab -->
          <div v-if="activeTab === 'proStores'" class="space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-800">{{ $t('employee.proPackStores') }}</h2>
              <button
                @click="refreshData"
                :disabled="loading"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <i class="fas fa-sync-alt mr-2" :class="{ 'animate-spin': loading }"></i>
                {{ $t('common.refresh') }}
              </button>
            </div>

            <div v-if="loading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p class="text-gray-600">{{ $t('common.loading') }}</p>
            </div>

            <div v-else-if="proStores.length === 0" class="text-center py-12">
              <div class="text-gray-400 text-5xl mb-4">
                <i class="fas fa-check-circle"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ $t('employee.noPendingStores') }}</h3>
              <p class="text-gray-600">{{ $t('employee.noPendingStoresMessage') }}</p>
            </div>
            <!--Pro pack stores list -->
            <div v-else class="space-y-4">
              <div
                v-for="store in proStores"
                :key="store.id"
                @click="store.status === 'pending' ? openStoreDetails(store) : null"
                :class="[
                  'border border-gray-200 rounded-xl p-6 transition-shadow',
                  store.status === 'pending' ? 'hover:shadow-md cursor-pointer' : 'cursor-default'
                ]"
              >
                <div class="flex items-start space-x-4 space-x-reverse">
                  <div class="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                    <img 
                      v-if="store.logo_url" 
                      :src="store.logo_url" 
                      :alt="store.name"
                      class="w-full h-full object-cover rounded-xl"
                    />
                    <i v-else class="fas fa-store text-white text-2xl"></i>
                  </div>
                  
                  <div class="flex-1">
                    <div class="space-y-2">
                      <h3 class="text-lg font-semibold text-gray-800">{{ store.name || $t('stores.defaultStoreName') }}</h3>
                      <div class="text-sm text-gray-500">
                        <strong>{{ $t('employee.owner') }}:</strong> {{ store.owner_name || 'N/A' }}
                      </div>
                      <div class="text-sm text-gray-500">
                        <strong>{{ $t('employee.created') }}:</strong> {{ formatDate(store.created_at) }}
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center">
                    <span :class="getStatusClass(store.status)">
                      {{ store.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>


          

          <!-- Products Tab -->
          <div v-if="activeTab === 'products'" class="space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-800">{{ $t('employee.products') }}</h2>
              <button
                @click="refreshData"
                :disabled="loading"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <i class="fas fa-sync-alt mr-2" :class="{ 'animate-spin': loading }"></i>
                {{ $t('common.refresh') }}
              </button>
            </div>

            <div v-if="loading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p class="text-gray-600">{{ $t('common.loading') }}</p>
            </div>

            <div v-else-if="products.length === 0" class="text-center py-12">
              <div class="text-gray-400 text-5xl mb-4">
                <i class="fas fa-check-circle"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ $t('employee.noProducts') }}</h3>
              <p class="text-gray-600">{{ $t('employee.noProductsMessage') }}</p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="product in products"
                :key="product.product_id"
                @click="openProductDetails(product)"
                class="border border-gray-200 rounded-xl p-6 transition-shadow hover:shadow-md cursor-pointer"
              >
                <div class="flex items-start space-x-4 space-x-reverse">
                    <div class="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                      <img 
                        v-if="product.thumbnail_url" 
                        :src="product.thumbnail_url" 
                        :alt="product.product_name"
                        class="w-full h-full object-cover rounded-xl"
                      />
                      <i v-else class="fas fa-box text-white text-2xl"></i>
                    </div>
                  
                  <div class="flex-1">
                    <div class="space-y-2">
                      <h3 class="text-lg font-semibold text-gray-800">{{ product.product_name }}</h3>
                      <div class="text-sm text-gray-500">
                        <strong>{{ $t('employee.owner') }}:</strong> {{ product.seller_name }}
                      </div>
                      <div class="text-sm text-gray-500">
                        <strong>{{ $t('employee.created') }}:</strong> {{ formatDate(product.created_at) }}
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center">
                    <span :class="getStatusClass(product.status)">
                      {{ product.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Product Details Modal -->
    <div v-if="showProductDetailsModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-soft max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div class="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">{{ $t('employee.productDetails') }}</h3>
          <button
            @click="closeProductDetails"
            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[70vh]">
          <div v-if="selectedProduct" class="space-y-6">
            <!-- Product Basic Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex flex-col">
                <h4 class="text-md font-semibold text-gray-800 mb-3">{{ $t('employee.productInfo') }}</h4>
                <div class="space-y-4 flex-1">
                  <!-- Product Name -->
                  <div class="border border-gray-200 rounded-lg p-4 h-24 flex flex-col justify-between">
                    <label class="text-sm font-medium text-gray-600 mb-2 block">{{ $t('employee.productName') }}:</label>
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <p class="text-gray-800 mb-2">{{ selectedProduct.product_name || 'N/A' }}</p>
                      </div>
                      <div class="flex space-x-2 space-x-reverse ml-3">
                        <button
                          @click="rejectElement('name', selectedProduct.product_id, $t('employee.productName'))"
                          :disabled="processing"
                          class="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          <i class="fas fa-times mr-1"></i>
                          {{ $t('employee.reject') }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Product Description -->
                  <div class="border border-gray-200 rounded-lg p-4 h-24 flex flex-col justify-between">
                    <label class="text-sm font-medium text-gray-600 mb-2 block">{{ $t('employee.productDescription') }}:</label>
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <p class="text-gray-800 mb-2">{{ selectedProduct.product_description || 'N/A' }}</p>
                      </div>
                      <div class="flex space-x-2 space-x-reverse ml-3">
                        <button
                          @click="rejectElement('description', selectedProduct.product_id, $t('employee.productDescription'))"
                          :disabled="processing"
                          class="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          <i class="fas fa-times mr-1"></i>
                          {{ $t('employee.reject') }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Product Price -->
                  <div class="border border-gray-200 rounded-lg p-4 h-24 flex flex-col justify-between">
                    <label class="text-sm font-medium text-gray-600 mb-2 block">{{ $t('employee.price') }}:</label>
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <p class="text-gray-800 mb-2">{{ selectedProduct.product_price }} DZD</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Product Details -->
              <div class="flex flex-col">
                <h4 class="text-md font-semibold text-gray-800 mb-3">{{ $t('employee.productDetails') }}</h4>
                <div class="space-y-4 flex-1">
                  <!-- Product Image -->
                  <div class="border border-gray-200 rounded-lg p-4 h-24 flex flex-col justify-between">
                    <label class="text-sm font-medium text-gray-600 mb-2 block">{{ $t('employee.productImage') }}:</label>
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <img 
                          v-if="selectedProduct.thumbnail_url" 
                          :src="selectedProduct.thumbnail_url" 
                          :alt="selectedProduct.product_name + ' image'"
                          @click="viewDocument(selectedProduct.thumbnail_url, $t('employee.productImage'))"
                          class="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                        />
                        <div v-else class="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <span class="text-gray-400 text-xs">{{ $t('employee.noImage') }}</span>
                        </div>
                      </div>
                      <div class="flex space-x-2 space-x-reverse ml-3">
                        <button
                          @click="rejectDocument('product_image', selectedProduct.product_id, $t('employee.productImage'))"
                          :disabled="processing"
                          class="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          <i class="fas fa-times mr-1"></i>
                          {{ $t('employee.reject') }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Stock Quantity -->
                  <div class="border border-gray-200 rounded-lg p-4 h-24 flex flex-col justify-between">
                    <label class="text-sm font-medium text-gray-600 mb-2 block">{{ $t('employee.stock') }}:</label>
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <p class="text-gray-800 mb-2">{{ selectedProduct.stock_quantity }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Category -->
                  <div class="border border-gray-200 rounded-lg p-4 h-24 flex flex-col justify-between">
                    <label class="text-sm font-medium text-gray-600 mb-2 block">{{ $t('employee.category') }}:</label>
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <p class="text-gray-800 mb-2">{{ selectedProduct.category_name || 'N/A' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <!-- Action Buttons -->
            <div class="flex items-center justify-end space-x-3 space-x-reverse pt-4 border-t border-gray-200">
              <button
                @click="approveProduct(selectedProduct.product_id)"
                :disabled="processing"
                class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <i class="fas fa-check mr-2"></i>
                {{ $t('employee.approve') }}
              </button>
              <button
                @click="rejectProduct(selectedProduct.product_id)"
                :disabled="processing"
                class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <i class="fas fa-times mr-2"></i>
                {{ $t('employee.reject') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Document Rejection Modal -->
    <div v-if="showRejectionModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]">
      <div class="bg-white rounded-2xl shadow-soft max-w-md w-full">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            {{ currentRejectionTarget.type === 'document' ? $t('employee.rejectDocument') : $t('employee.rejectElement') }}: {{ currentRejectionTarget.documentName || currentRejectionTarget.elementName }}
          </h3>
          
              <!-- Rejection reason -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('employee.rejectionCategory') }}
                </label>
                <select
                  v-model="rejectionReason"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                >
                  <option value="">{{ $t('employee.selectRejectionCategory') }}</option>
                  <!-- Document-specific categories -->
                  <template v-if="currentRejectionTarget.type === 'document'">
                    <option value="invalid_document">{{ $t('employee.invalidDocuments') }}</option>
                    <option value="expired_document">{{ $t('employee.expiredDocuments') }}</option>
                    <option value="poor_quality">{{ $t('employee.poorQuality') }}</option>
                    <option value="policy_violation">{{ $t('employee.policyViolation') }}</option>
                    <option value="other">{{ $t('employee.other') }}</option>
                  </template>
                  <!-- Text content categories for name/description -->
                  <template v-else>
                    <option value="inappropriate_content">{{ $t('employee.inappropriateContent') }}</option>
                    <option value="incomplete_information">{{ $t('employee.incompleteInformation') }}</option>
                    <option value="not_descriptive">{{ $t('employee.notDescriptive') }}</option>
                    <option value="too_short">{{ $t('employee.tooShort') }}</option>
                    <option value="too_long">{{ $t('employee.tooLong') }}</option>
                    <option value="unclear_language">{{ $t('employee.unclearLanguage') }}</option>
                    <option value="policy_violation">{{ $t('employee.policyViolation') }}</option>
                    <option value="other">{{ $t('employee.other') }}</option>
                  </template>
                </select>
              </div>

          <!-- Additional details -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('employee.additionalDetails') }}
            </label>
            <textarea
              v-model="customRejectionReason"
              rows="3"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
              :placeholder="$t('employee.documentRejectionPlaceholder')"
            ></textarea>
          </div>

          <!-- Validation message -->
          <div v-if="!isDocumentRejectionValid" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">
              {{ $t('employee.documentRejectionValidationMessage') }}
            </p>
          </div>
          
          <div class="flex items-center justify-end space-x-3 space-x-reverse">
            <button
              @click="cancelRejection"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              @click="confirmRejection"
              :disabled="!isDocumentRejectionValid || processing"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {{ $t('employee.reject') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Document Viewer Modal -->
    <div v-if="showDocumentViewer" 
    class="z-[60] fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-soft max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div class="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">{{ $t('employee.documentViewer') }}</h3>
          <button
            @click="showDocumentViewer = false"
            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="p-6 overflow-auto max-h-[70vh]">
          <img 
            :src="viewingDocumentUrl" 
            :alt="viewingDocumentType"
            class="w-full h-auto object-contain rounded-lg"
          />
        </div>
      </div>
    </div>

    <!-- Store Details Modal -->
    <div v-if="showStoreDetailsModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-soft max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div class="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">{{ $t('employee.storeDetails') }}</h3>
          <button
            @click="closeStoreDetails"
            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[70vh]">
          <div v-if="selectedStore" class="space-y-6">
            <!-- Store Basic Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex flex-col">
                <h4 class="text-md font-semibold text-gray-800 mb-3">{{ $t('employee.storeInfo') }}</h4>
                <div class="space-y-4 flex-1">
                  <!-- Store Name -->
                  <div class="border border-gray-200 rounded-lg p-4 h-24 flex flex-col justify-between">
                    <label class="text-sm font-medium text-gray-600 mb-2 block">{{ $t('employee.storeName') }}:</label>
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <p class="text-gray-800 mb-2">{{ selectedStore.name || 'N/A' }}</p>
                      </div>
                      <div class="flex space-x-2 space-x-reverse ml-3">
                        <button
                          @click="rejectElement('name', selectedStore.name_id, $t('employee.storeName'))"
                          :disabled="processing"
                          class="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          <i class="fas fa-times mr-1"></i>
                          {{ $t('employee.reject') }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Store Description -->
                  <div class="border border-gray-200 rounded-lg p-4 h-24 flex flex-col justify-between">
                    <label class="text-sm font-medium text-gray-600 mb-2 block">{{ $t('employee.storeDescription') }}:</label>
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <p class="text-gray-800 mb-2">{{ selectedStore.description || 'N/A' }}</p>
                      </div>
                      <div class="flex space-x-2 space-x-reverse ml-3">
                        <button
                          @click="rejectElement('description', selectedStore.description_id, $t('employee.storeDescription'))"
                          :disabled="processing"
                          class="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          <i class="fas fa-times mr-1"></i>
                          {{ $t('employee.reject') }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Store Visuals -->
              <div class="flex flex-col">
                <h4 class="text-md font-semibold text-gray-800 mb-3">{{ $t('employee.storeVisuals') }}</h4>
                <div class="space-y-4 flex-1">
                  <!-- Logo -->
                  <div class="border border-gray-200 rounded-lg p-4 h-24 flex flex-col justify-between">
                    <label class="text-sm font-medium text-gray-600 mb-2 block">{{ $t('employee.logo') }}:</label>
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <img 
                          v-if="selectedStore.logo_url" 
                          :src="selectedStore.logo_url" 
                          :alt="selectedStore.name + ' logo'"
                          @click="viewDocument(selectedStore.logo_url, $t('employee.logo'))"
                          class="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                        />
                        <div v-else class="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <span class="text-gray-400 text-xs">{{ $t('employee.noLogo') }}</span>
                        </div>
                      </div>
                      <div class="flex space-x-2 space-x-reverse ml-3">
                        <button
                          @click="rejectElement('logo', selectedStore.logo_id, $t('employee.logo'))"
                          :disabled="processing"
                          class="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          <i class="fas fa-times mr-1"></i>
                          {{ $t('employee.reject') }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Banner -->
                  <div class="border border-gray-200 rounded-lg p-4 h-24 flex flex-col justify-between">
                    <label class="text-sm font-medium text-gray-600 mb-2 block">{{ $t('employee.banner') }}:</label>
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <img 
                          v-if="selectedStore.banner_url" 
                          :src="selectedStore.banner_url" 
                          :alt="selectedStore.name + ' banner'"
                          @click="viewDocument(selectedStore.banner_url, $t('employee.banner'))"
                          class="w-16 h-8 object-cover rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                        />
                        <div v-else class="w-16 h-8 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <span class="text-gray-400 text-xs">{{ $t('employee.noBanner') }}</span>
                        </div>
                      </div>
                      <div class="flex space-x-2 space-x-reverse ml-3">
                        <button
                          @click="rejectElement('banner', selectedStore.banner_id, $t('employee.banner'))"
                          :disabled="processing"
                          class="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          <i class="fas fa-times mr-1"></i>
                          {{ $t('employee.reject') }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Verification Documents -->
            <div>
              <h4 class="text-md font-semibold text-gray-800 mb-3">{{ $t('employee.verificationDocuments') }}</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- ID Document -->
                <div v-if="selectedStore.id_document_url" class="text-center border border-gray-200 rounded-lg p-4">
                  <div class="mb-2">
                    <img 
                      :src="selectedStore.id_document_url" 
                      :alt="$t('verification.idCard')"
                      @click="viewDocument(selectedStore.id_document_url, $t('verification.idCard'))"
                      class="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow mx-auto"
                    />
                  </div>
                  <p class="text-sm text-gray-600 mb-3">{{ $t('verification.idCard') }}</p>
                  
                  <!-- Document Actions -->
                  <div class="flex justify-center space-x-2 space-x-reverse">
                    <button
                      @click="rejectDocument('id_card', selectedStore.id_document_id, $t('verification.idCard'))"
                      :disabled="processing"
                      class="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      <i class="fas fa-times mr-1"></i>
                      {{ $t('employee.reject') }}
                    </button>
                  </div>
                </div>

                <!-- Commerce Register Document -->
                <div v-if="selectedStore.commerce_register_url" class="text-center border border-gray-200 rounded-lg p-4">
                  <div class="mb-2">
                    <img 
                      :src="selectedStore.commerce_register_url" 
                      :alt="$t('verification.commerceRegister')"
                      @click="viewDocument(selectedStore.commerce_register_url, $t('verification.commerceRegister'))"
                      class="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow mx-auto"
                    />
                  </div>
                  <p class="text-sm text-gray-600 mb-3">{{ $t('verification.commerceRegister') }}</p>
                  
                  <!-- Document Actions -->
                  <div class="flex justify-center space-x-2 space-x-reverse">
                    <button
                      @click="rejectDocument('commerce_register', selectedStore.commerce_register_id, $t('verification.commerceRegister'))"
                      :disabled="processing"
                      class="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      <i class="fas fa-times mr-1"></i>
                      {{ $t('employee.reject') }}
                    </button>
                  </div>
                </div>

                <!-- Payment Receipt Document -->
                <div v-if="selectedStore.payment_receipt_url" class="text-center border border-gray-200 rounded-lg p-4">
                  <div class="mb-2">
                    <img 
                      :src="selectedStore.payment_receipt_url" 
                      :alt="$t('verification.paymentReceipt')"
                      @click="viewDocument(selectedStore.payment_receipt_url, $t('verification.paymentReceipt'))"
                      class="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow mx-auto"
                    />
                  </div>
                  <p class="text-sm text-gray-600 mb-3">{{ $t('verification.paymentReceipt') }}</p>
                  
                  <!-- Document Actions -->
                  <div class="flex justify-center space-x-2 space-x-reverse">
                    <button
                      @click="rejectDocument('payment_receipt', selectedStore.payment_receipt_id, $t('verification.paymentReceipt'))"
                      :disabled="processing"
                      class="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      <i class="fas fa-times mr-1"></i>
                      {{ $t('employee.reject') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end space-x-3 space-x-reverse pt-4 border-t border-gray-200">
              <button
                @click="approveStore(selectedStore.id)"
                :disabled="processing"
                class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <i class="fas fa-check mr-2"></i>
                {{ $t('employee.approve') }}
              </button>
              <button
                @click="rejectStoreFromDetails(selectedStore.id)"
                :disabled="processing"
                class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <i class="fas fa-times mr-2"></i>
                {{ $t('employee.reject') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Basic Store Details Modal -->
    <div v-if="showBasicStoreDetailsModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-soft max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div class="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">{{ $t('employee.basicStoreDetails') || 'Basic Store Details' }}</h3>
          <button
            @click="closeBasicStoreDetails"
            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[70vh]">
          <div v-if="selectedBasicStore" class="space-y-6">
            <!-- Store Basic Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex flex-col">
                <h4 class="text-md font-semibold text-gray-800 mb-3">{{ $t('employee.storeInfo') || 'Store Information' }}</h4>
                <div class="space-y-4 flex-1">
                  <!-- Store ID -->
                  <div class="border border-gray-200 rounded-lg p-4 h-24 flex flex-col justify-between">
                    <label class="text-sm font-medium text-gray-600 mb-2 block">{{ $t('employee.storeId') }}:</label>
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <p class="text-gray-800 mb-2 font-mono text-sm">{{ selectedBasicStore.id }}</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div class="flex flex-col">
                <h4 class="text-md font-semibold text-gray-800 mb-3">{{ $t('employee.ownerInfo') || 'Owner Information' }}</h4>
                <div class="space-y-4 flex-1">
                  <!-- Owner Name -->
                  <div class="border border-gray-200 rounded-lg p-4 h-24 flex flex-col justify-between">
                    <label class="text-sm font-medium text-gray-600 mb-2 block">{{ $t('employee.owner') }}:</label>
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <p class="text-gray-800 mb-2">{{ selectedBasicStore.owner_name || 'N/A' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ID Document Section -->
            <div>
              <h4 class="text-md font-semibold text-gray-800 mb-3">{{ $t('employee.idDocument') || 'ID Document' }}</h4>
              <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div v-if="selectedBasicStore.id_document_url" class="border border-gray-200 rounded-lg p-4">
                  <div class="flex items-center space-x-4 space-x-reverse">
                    <!-- Document Image -->
                    <div class="flex-shrink-0">
                      <img 
                        :src="selectedBasicStore.id_document_url" 
                        :alt="$t('verification.idCard') || 'ID Card'"
                        @click="viewDocument(selectedBasicStore.id_document_url, $t('verification.idCard') || 'ID Card')"
                        class="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                      />
                    </div>
                    
                    <!-- Document Info and Actions -->
                    <div class="flex-1 flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-800">{{ $t('verification.idCard') || 'ID Card' }}</p>
                        <p class="text-xs text-gray-500">{{ $t('employee.clickToView') || 'Click to view full size' }}</p>
                      </div>
                      
                      <!-- Document Actions -->
                      <div class="flex space-x-2 space-x-reverse">
                        <button
                          @click="rejectDocument('id_card', selectedBasicStore.id_document_id, $t('verification.idCard') || 'ID Card')"
                          :disabled="processing"
                          class="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          <i class="fas fa-times mr-1"></i>
                          {{ $t('employee.reject') }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="border border-gray-200 rounded-lg p-4">
                  <div class="flex items-center space-x-4 space-x-reverse">
                    <div class="flex-shrink-0">
                      <div class="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                        <i class="fas fa-id-card text-gray-400 text-2xl"></i>
                      </div>
                    </div>
                    <div class="flex-1">
                      <p class="text-sm text-gray-500">{{ $t('employee.noIdDocument') || 'No ID Document Available' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end space-x-3 space-x-reverse pt-4 border-t border-gray-200">
              <button
                @click="approveStore(selectedBasicStore.id)"
                :disabled="processing"
                class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <i class="fas fa-check mr-2"></i>
                {{ $t('employee.approve') }}
              </button>
              <button
                @click="rejectStoreFromDetails(selectedBasicStore.id)"
                :disabled="processing"
                class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <i class="fas fa-times mr-2"></i>
                {{ $t('employee.reject') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '../lib/supabase'

const { t: $t } = useI18n()

// State
const activeTab = ref('stores')
const loading = ref(false)
const processing = ref(false)
const showRejectionModal = ref(false)
const showDocumentViewer = ref(false)
const showStoreDetailsModal = ref(false)
const rejectionReason = ref('')
const rejectedFields = ref([])
const customRejectionReason = ref('')
const currentRejectionTarget = ref(null)
const viewingDocumentUrl = ref('')
const viewingDocumentType = ref('')
const selectedStore = ref(null)
const showBasicStoreDetailsModal = ref(false)
const selectedBasicStore = ref(null)
const showProductDetailsModal = ref(false)
const selectedProduct = ref(null)

// Store rejection reasons for name and description
const storeRejectionReasons = ref({
  name: null,
  description: null
})

// Product rejection reasons for name, description, and image
const productRejectionReasons = ref({
  name: null,
  description: null,
  image: null
})

// Data
const basicStores = ref([])
const proStores = ref([])
const products = ref([])

// Tabs configuration
const tabs = computed(() => [
  {
    id: 'basicStores',
    name: $t('employee.basicPackStores'),
    icon: 'fas fa-store',
    count: basicStores.value.length
  },
  {
    id: 'proStores',
    name: $t('employee.proPackStores'),
    icon: 'fas fa-crown',
    count: proStores.value.length
  },
  {
    id: 'products',
    name: $t('employee.products'),
    icon: 'fas fa-box',
    count: products.value.length
  }
])

// Computed properties
const basicStoresCount = computed(() => basicStores.value.length)
const proStoresCount = computed(() => proStores.value.length)
const productsCount = computed(() => products.value.length)
const todayApprovalsCount = computed(() => 0) // TODO: Implement today's approvals count

// Rejection validation
const isRejectionValid = computed(() => {
  return rejectionReason.value.trim() !== '' && rejectedFields.value.length > 0
})

// Document rejection validation
const isDocumentRejectionValid = computed(() => {
  return rejectionReason.value.trim() !== ''
})

// Methods
const fetchBasicStores = async () => {
  try {
    const { data, error } = await supabase.rpc('get_stores_by_pack_type', {
      pack_type: 'basic'
    })

    if (error) throw error
    basicStores.value = data || []
  } catch (error) {
    console.error('Error fetching basic stores:', error)
  }
}

const fetchProStores = async () => {
  try {
    const { data, error } = await supabase.rpc('get_stores_by_pack_type', {
      pack_type: 'pro'
    })

    if (error) throw error
    proStores.value = data || []
  } catch (error) {
    console.error('Error fetching pro stores:', error)
  }
}

const fetchProducts = async () => {
  try {
    const { data, error } = await supabase.rpc('get_products_without_store')
    if (error) throw error
    products.value = data || []
  } catch (error) {
    console.error('Error fetching products:', error)
  }
}


const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchBasicStores(),
      fetchProStores(),
      fetchProducts()
    ])
  } finally {
    loading.value = false
  }
}

// Reset store rejection reasons when opening store details
const resetStoreRejectionReasons = () => {
  storeRejectionReasons.value = {
    name: null,
    description: null
  }
}

const resetProductRejectionReasons = () => {
  productRejectionReasons.value = {
    name: null,
    description: null,
    image: null
  }
}

// Store actions
const approveStore = async (storeId) => {
  try {
    processing.value = true
    
    // First, get the store owner ID
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('owner_id')
      .eq('id', storeId)
      .single()

    if (storeError) throw storeError

    // Update store status
    const { error } = await supabase
      .from('stores')
      .update({
        status: 'approved',
        reviewed_by: (await supabase.auth.getUser()).data.user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', storeId)

    if (error) throw error

    // Add vendor role to the store owner
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: storeData.owner_id,
        role: 'vendor'
      }, {
        onConflict: 'user_id,role'
      })

    if (roleError) throw roleError

    // CASE 2: Approve all documents when store is approved
    await approveAllDocuments(storeData.owner_id)

    // Log the action
    await logEmployeeAction('approve_store', 'store', storeId, { action: 'approve' })

    // Close modals
    showStoreDetailsModal.value = false
    showBasicStoreDetailsModal.value = false
    selectedStore.value = null
    selectedBasicStore.value = null

    // Refresh data
    await refreshData()
    
    alert('Store approved successfully')
  } catch (error) {
    console.error('Error approving store:', error)
    alert('Failed to approve store')
  } finally {
    processing.value = false
  }
}

const rejectStore = (storeId) => {
  currentRejectionTarget.value = { type: 'store', id: storeId }
  showRejectionModal.value = true
}

const rejectStoreFromDetails = async (storeId) => {
  // Check if this is a basic store (no name/description fields)
  const isBasicStore = showBasicStoreDetailsModal.value
  
  try {
    processing.value = true
    
    // Get the store owner ID
    const currentStore = isBasicStore ? selectedBasicStore.value : selectedStore.value
    const ownerId = currentStore?.owner_id
    
    if (!ownerId) {
      alert('Store owner information not found')
      return
    }

    // Check if there are any rejected documents for this store owner
    const { data: rejectedDocs, error: docError } = await supabase
      .from('verifications')
      .select('rejection_reason, verification_type')
      .eq('user_id', ownerId)
      .eq('status', 'rejected')

    if (docError) {
      console.error('Error fetching rejected documents:', docError)
      alert('Error checking rejected documents')
      return
    }

    if (rejectedDocs && rejectedDocs.length > 0) {
      // Concatenate all rejection reasons with clear formatting
      const docRejectionReasons = rejectedDocs
        .filter(doc => doc.rejection_reason && doc.rejection_reason.trim())
        .map(doc => `${doc.verification_type}: ${doc.rejection_reason}`)
      
      // Add name and description rejection reasons if they exist
      const allRejectionReasons = [...docRejectionReasons]
      
      if (storeRejectionReasons.value.name) {
        allRejectionReasons.push(storeRejectionReasons.value.name)
      }
      
      if (storeRejectionReasons.value.description) {
        allRejectionReasons.push(storeRejectionReasons.value.description)
      }
      
      const finalRejectionReason = allRejectionReasons.length > 0 
        ? allRejectionReasons.join(' | ')
        : 'Documents rejected'

      // Update store status with all rejection reasons
      const { error } = await supabase
        .from('stores')
        .update({
          status: 'rejected',
          reviewed_by: (await supabase.auth.getUser()).data.user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: finalRejectionReason
        })
        .eq('id', storeId)

      if (error) throw error

      // CASE 1: Approve all non-rejected documents when store is rejected
      await approveNonRejectedDocuments(ownerId)

      // Log the action
      await logEmployeeAction('reject_store', 'store', storeId, { 
        action: 'reject',
        reason: finalRejectionReason,
        source: 'document_rejection',
        rejected_documents: rejectedDocs.map(doc => doc.verification_type)
      })

      // Close modals
      showStoreDetailsModal.value = false
      showBasicStoreDetailsModal.value = false
      selectedStore.value = null
      selectedBasicStore.value = null

      // Refresh data
      await refreshData()
      
      alert('Store rejected successfully')
      
      // Refresh the page to show updated store button
      window.location.reload()
    } else {
      // No rejected documents found, open rejection modal
      currentRejectionTarget.value = { 
        type: 'store', 
        id: storeId,
        storeId: storeId
      }
      showRejectionModal.value = true
    }
  } catch (error) {
    console.error('Error rejecting store:', error)
    alert('Failed to reject store')
  } finally {
    processing.value = false
  }
}

// Document approval
const approveDocument = async (verificationType, documentId) => {
  if (!documentId) return
  
  try {
    processing.value = true
    
    const { error } = await supabase
      .from('verifications')
      .update({
        status: 'approved',
        reviewed_by: (await supabase.auth.getUser()).data.user.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: null
      })
      .eq('id', documentId)

    if (error) throw error

    // Log the action
    await logEmployeeAction('approve_document', 'verification', documentId, { 
      action: 'approve',
      verification_type: verificationType
    })

    // Refresh data
    await refreshData()
    
    // Close store details if open
    if (showStoreDetailsModal.value) {
      showStoreDetailsModal.value = false
      selectedStore.value = null
    }
  } catch (error) {
    console.error('Error approving document:', error)
    alert('Failed to approve document')
  } finally {
    processing.value = false
  }
}

// Document rejection
const rejectDocument = (verificationType, documentId, documentName) => {
  currentRejectionTarget.value = { 
    type: 'document', 
    id: documentId, 
    verificationType: verificationType,
    documentName: documentName
  }
  showRejectionModal.value = true
}

// Helper function: Approve all non-rejected documents (Case 1)
const approveNonRejectedDocuments = async (ownerId) => {
  try {
    const { error } = await supabase
      .from('verifications')
      .update({
        status: 'approved',
        reviewed_by: (await supabase.auth.getUser()).data.user.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: null
      })
      .eq('user_id', ownerId)
      .neq('status', 'rejected') // Only update non-rejected documents

    if (error) {
      console.error('Error approving non-rejected documents:', error)
    }
  } catch (error) {
    console.error('Error in approveNonRejectedDocuments:', error)
  }
}

// Helper function: Approve all documents (Case 2)
const approveAllDocuments = async (ownerId) => {
  try {
    const { error } = await supabase
      .from('verifications')
      .update({
        status: 'approved',
        reviewed_by: (await supabase.auth.getUser()).data.user.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: null
      })
      .eq('user_id', ownerId)

    if (error) {
      console.error('Error approving all documents:', error)
    }
  } catch (error) {
    console.error('Error in approveAllDocuments:', error)
  }
}



// Element rejection (logo, banner, name, description)
const rejectElement = (elementType, elementId, elementName) => {
  // For verification documents and product images, use the document rejection flow
  if (['id_card', 'commerce_register', 'payment_receipt', 'logo', 'banner', 'product_image'].includes(elementType)) {
    rejectDocument(elementType, elementId, elementName)
    return
  }
  
  // For other elements (name, description)
  currentRejectionTarget.value = { 
    type: 'element', 
    id: elementId, 
    elementType: elementType,
    elementName: elementName
  }
  showRejectionModal.value = true
}



const approveProduct = async (productId) => {
  try {
    processing.value = true
    
    const { error } = await supabase
      .from('products')
      .update({ 
        is_active: true,
        status: 'approved',
        rejection_reason: null
      })
      .eq('id', productId)

    if (error) throw error

    // Log the action
    await logEmployeeAction('approve_product', 'product', productId, { action: 'approve' })

    // Close modal
    showProductDetailsModal.value = false
    selectedProduct.value = null

    // Reset rejection reasons
    resetProductRejectionReasons()

    // Refresh data
    await refreshData()
    
    alert('Product approved successfully')
  } catch (error) {
    console.error('Error approving product:', error)
    alert('Failed to approve product')
  } finally {
    processing.value = false
  }
}

const rejectProduct = async (productId) => {
  try {
    processing.value = true
    
    // Check if there are any rejected elements first
    const rejectedElements = []
    
    if (productRejectionReasons.value.name) {
      rejectedElements.push(productRejectionReasons.value.name)
    }
    
    if (productRejectionReasons.value.description) {
      rejectedElements.push(productRejectionReasons.value.description)
    }
    
    if (productRejectionReasons.value.image) {
      rejectedElements.push(productRejectionReasons.value.image)
    }
    
    // Always combine rejected elements and reject the product
    let finalRejectionReason = ''
    
    if (rejectedElements.length > 0) {
      finalRejectionReason = rejectedElements.join(' | ')
    } else {
      // If no elements were rejected, use a default reason
      finalRejectionReason = 'Product rejected by employee'
    }
    
    const { error } = await supabase
      .from('products')
      .update({
        status: 'rejected',
        rejection_reason: finalRejectionReason
      })
      .eq('id', productId)

    if (error) throw error

    // Log the action
    await logEmployeeAction('reject_product', 'product', productId, { 
      action: 'reject',
      reason: finalRejectionReason
    })

    // Close modal
    showProductDetailsModal.value = false
    selectedProduct.value = null

    // Reset rejection reasons
    resetProductRejectionReasons()

    // Refresh data
    await refreshData()
    
    alert('Product rejected successfully')
  } catch (error) {
    console.error('Error rejecting product:', error)
    alert('Failed to reject product')
  } finally {
    processing.value = false
  }
}


const confirmRejection = async () => {
  if (!isDocumentRejectionValid.value) return

  try {
    processing.value = true
    
    const { type, id, verificationType, storeId, elementType } = currentRejectionTarget.value
    
    if (type === 'document') {
      // Update verification document status
      const { error } = await supabase
        .from('verifications')
        .update({
          status: 'rejected',
          reviewed_by: (await supabase.auth.getUser()).data.user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason.value.trim(),
          metadata: {
            custom_reason: customRejectionReason.value.trim()
          }
        })
        .eq('id', id)

      if (error) throw error

      // Log the action
      await logEmployeeAction('reject_document', 'verification', id, { 
        action: 'reject',
        verification_type: verificationType,
        reason: rejectionReason.value.trim(),
        details: customRejectionReason.value.trim()
      })

      // Check if this is a product image rejection
      if (showProductDetailsModal.value && verificationType === 'product_image') {
        // For product image rejection, store the reason temporarily
        if (!productRejectionReasons.value) {
          productRejectionReasons.value = {}
        }
        productRejectionReasons.value.image = `image: ${rejectionReason.value.trim()}`
        if (customRejectionReason.value.trim()) {
          productRejectionReasons.value.image += ` - ${customRejectionReason.value.trim()}`
        }

        // Close rejection modal but keep product details modal open
        showRejectionModal.value = false
        rejectionReason.value = ''
        customRejectionReason.value = ''
        currentRejectionTarget.value = null
        
        alert('Image rejected successfully')
      } else {
        // For store document rejection, don't close the store details modal
        // Just close the rejection modal and refresh data
        showRejectionModal.value = false
        rejectionReason.value = ''
        customRejectionReason.value = ''
        currentRejectionTarget.value = null

        // Refresh data to update document status
        await refreshData()
        
        alert('Document rejected successfully')
      }
    } else if (type === 'element') {
      // Store rejection reason for name or description
      let rejectionText = `${elementType}: ${rejectionReason.value.trim()}`
      if (customRejectionReason.value.trim()) {
        rejectionText += ` - ${customRejectionReason.value.trim()}`
      }
      
      // Check if this is a product element or store element
      if (showProductDetailsModal.value) {
        // For product elements, store in product rejection reasons
        if (!productRejectionReasons.value) {
          productRejectionReasons.value = {}
        }
        productRejectionReasons.value[elementType] = rejectionText

        // Log the action
        await logEmployeeAction('reject_element', 'product_element', id, { 
          action: 'reject',
          element_type: elementType,
          reason: rejectionReason.value.trim(),
          details: customRejectionReason.value.trim()
        })

        // For product elements, don't refresh data or close modals
        // Just close the rejection modal and keep product details open
        showRejectionModal.value = false
        rejectionReason.value = ''
        customRejectionReason.value = ''
        currentRejectionTarget.value = null
        
        alert(`${elementType} rejected successfully`)
      } else {
        // For store elements, store in store rejection reasons
        storeRejectionReasons.value[elementType] = rejectionText

        // Log the action
        await logEmployeeAction('reject_element', 'store_element', id, { 
          action: 'reject',
          element_type: elementType,
          reason: rejectionReason.value.trim(),
          details: customRejectionReason.value.trim()
        })

        // Close rejection modal but keep store details modal open
        showRejectionModal.value = false
        rejectionReason.value = ''
        customRejectionReason.value = ''
        currentRejectionTarget.value = null

        // Refresh data
        await refreshData()
        
        alert(`${elementType} rejected successfully`)
      }
    } else if (type === 'store') {
      // Update store status to rejected
      const { error } = await supabase
        .from('stores')
        .update({
          status: 'rejected',
          reviewed_by: (await supabase.auth.getUser()).data.user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason.value.trim()
        })
        .eq('id', id)

      if (error) throw error

      // Log the action
      await logEmployeeAction('reject_store', 'store', id, { 
        action: 'reject',
        reason: rejectionReason.value.trim(),
        details: customRejectionReason.value.trim()
      })

      // Close modals
      showStoreDetailsModal.value = false
      showBasicStoreDetailsModal.value = false
      selectedStore.value = null
      selectedBasicStore.value = null

      // Reset modal
      showRejectionModal.value = false
      rejectionReason.value = ''
      customRejectionReason.value = ''
      currentRejectionTarget.value = null

      // Refresh data
      await refreshData()
      
      alert('Store rejected successfully')
    } else if (type === 'product') {
      // Update product status to rejected
      const { error } = await supabase
        .from('products')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason.value.trim()
        })
        .eq('id', id)

      if (error) throw error

      // Log the action
      await logEmployeeAction('reject_product', 'product', id, { 
        action: 'reject',
        reason: rejectionReason.value.trim(),
        details: customRejectionReason.value.trim()
      })

      // Close modals
      showProductDetailsModal.value = false
      selectedProduct.value = null

      // Reset modal
      showRejectionModal.value = false
      rejectionReason.value = ''
      customRejectionReason.value = ''
      currentRejectionTarget.value = null

      // Refresh data
      await refreshData()
      
      alert('Product rejected successfully')
    }
  } catch (error) {
    console.error('Error rejecting item:', error)
    alert('Failed to reject item')
  } finally {
    processing.value = false
  }
}

const cancelRejection = () => {
  showRejectionModal.value = false
  rejectionReason.value = ''
  rejectedFields.value = []
  customRejectionReason.value = ''
  currentRejectionTarget.value = null
}

const openStoreDetails = (store) => {
  selectedStore.value = store
  resetStoreRejectionReasons()
  showStoreDetailsModal.value = true
}

const closeStoreDetails = () => {
  showStoreDetailsModal.value = false
  selectedStore.value = null
}

const openBasicStoreDetails = (store) => {
  selectedBasicStore.value = store
  resetStoreRejectionReasons()
  showBasicStoreDetailsModal.value = true
}

const closeBasicStoreDetails = () => {
  showBasicStoreDetailsModal.value = false
  selectedBasicStore.value = null
}

const openProductDetails = (product) => {
  selectedProduct.value = product
  resetProductRejectionReasons()
  showProductDetailsModal.value = true
}

const closeProductDetails = () => {
  showProductDetailsModal.value = false
  selectedProduct.value = null
}

const viewDocument = (documentUrl, documentType) => {
  viewingDocumentUrl.value = documentUrl
  viewingDocumentType.value = documentType
  showDocumentViewer.value = true
}

const getDocumentTypeName = (type) => {
  const types = {
    'id_card': $t('verification.idCard'),
    'commerce_register': $t('verification.commerceRegister'),
    'payment_receipt': $t('verification.paymentReceipt')
  }
  return types[type] || type
}

const getDocumentStatusClass = (status) => {
  switch (status) {
    case 'pending':
      return 'px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium'
    case 'approved':
      return 'px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium'
    case 'rejected':
      return 'px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium'
    default:
      return 'px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium'
  }
}

const viewStoreDetails = (store) => {
  // TODO: Implement store details modal
}

const viewProductDetails = (product) => {
  // TODO: Implement product details modal
}


const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusClass = (status) => {
  switch (status) {
    case 'pending':
      return 'px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium'
    case 'approved':
      return 'px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium'
    case 'rejected':
      return 'px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium'
    case 'active':
      return 'px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium'
    case 'inactive':
      return 'px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium'
    default:
      return 'px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium'
  }
}

const logEmployeeAction = async (action, targetType, targetId, details = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.rpc('log_employee_action', {
      p_employee_id: user.id,
      p_action: action,
      p_target_type: targetType,
      p_target_id: targetId,
      p_details: details
    })
  } catch (error) {
    console.error('Error logging employee action:', error)
  }
}

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.btn-primary {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color, #3B82F6);
  color: white;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: var(--primary-dark, #2563EB);
}

.btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}
</style>

