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
                class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between">
                  <div class="flex items-start space-x-4 space-x-reverse">
                    <div class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                      <img 
                        v-if="store.logo_url" 
                        :src="store.logo_url" 
                        :alt="store.name"
                        class="w-full h-full object-cover rounded-xl"
                      />
                      <i v-else class="fas fa-store text-blue-600 text-2xl"></i>
                    </div>
                    
                    <div class="flex-1">
                      <div class="flex items-center space-x-3 space-x-reverse mb-2">
                        <h3 class="text-lg font-semibold text-gray-800">{{ store.name || $t('stores.defaultStoreName') }}</h3>
                        <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          {{ $t('employee.pending') }}
                        </span>
                      </div>
                      
                      <p class="text-gray-600 mb-2">{{ store.description || $t('stores.noDescription') }}</p>
                      
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                        <div>
                          <strong>{{ $t('employee.owner') }}:</strong> {{ store.owner_name || 'N/A' }}
                        </div>
                        <div>
                          <strong>{{ $t('employee.pack') }}:</strong> {{ store.pack_name_en || 'N/A' }}
                        </div>
                        <div>
                          <strong>{{ $t('employee.created') }}:</strong> {{ formatDate(store.created_at) }}
                        </div>
                        <div>
                          <strong>{{ $t('employee.location') }}:</strong> {{ store.location }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center space-x-2 space-x-reverse">
                    <button
                      @click="approveStore(store.id)"
                      :disabled="processing"
                      class="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                    >
                      <i class="fas fa-check mr-2"></i>
                      {{ $t('employee.approve') }}
                    </button>
                    <button
                      @click="rejectStore(store.id)"
                      :disabled="processing"
                      class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      <i class="fas fa-times mr-2"></i>
                      {{ $t('employee.reject') }}
                    </button>
                    <button
                      @click="viewStoreDetails(store)"
                      class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <i class="fas fa-eye mr-2"></i>
                      {{ $t('common.view') }}
                    </button>
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
                :key="product.id"
                class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between">
                  <div class="flex items-start space-x-4 space-x-reverse">
                    <div class="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                      <img 
                        v-if="product.image_urls && product.image_urls.length > 0" 
                        :src="product.image_urls[0]" 
                        :alt="product.name"
                        class="w-full h-full object-cover rounded-xl"
                      />
                      <i v-else class="fas fa-box text-gray-400 text-2xl"></i>
                    </div>
                    
                    <div class="flex-1">
                      <div class="flex items-center space-x-3 space-x-reverse mb-2">
                        <h3 class="text-lg font-semibold text-gray-800">{{ product.name }}</h3>
                        <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          {{ $t('employee.pending') }}
                        </span>
                      </div>
                      
                      <p class="text-gray-600 mb-2">{{ product.description || $t('products.noDescription') }}</p>
                      
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                        <div>
                          <strong>{{ $t('employee.price') }}:</strong> {{ product.price }} DZD
                        </div>
                        <div>
                          <strong>{{ $t('employee.stock') }}:</strong> {{ product.stock_quantity }}
                        </div>
                        <div>
                          <strong>{{ $t('employee.store') }}:</strong> {{ product.stores?.name || 'N/A' }}
                        </div>
                        <div>
                          <strong>{{ $t('employee.created') }}:</strong> {{ formatDate(product.created_at) }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center space-x-2 space-x-reverse">
                    <button
                      @click="approveProduct(product.id)"
                      :disabled="processing"
                      class="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                    >
                      <i class="fas fa-check mr-2"></i>
                      {{ $t('employee.approve') }}
                    </button>
                    <button
                      @click="rejectProduct(product.id)"
                      :disabled="processing"
                      class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      <i class="fas fa-times mr-2"></i>
                      {{ $t('employee.reject') }}
                    </button>
                    <button
                      @click="viewProductDetails(product)"
                      class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <i class="fas fa-eye mr-2"></i>
                      {{ $t('common.view') }}
                    </button>
                  </div>
                </div>
              </div>
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
              @click="currentRejectionTarget.type === 'document' ? confirmDocumentRejection() : confirmElementRejection()"
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
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        stores!products_store_id_fkey(name)
      `)
      .eq('is_active', false) // Assuming inactive means pending review
      .order('created_at', { ascending: false })

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

// Store actions
const approveStore = async (storeId) => {
  try {
    processing.value = true
    
    const { error } = await supabase
      .from('stores')
      .update({
        status: 'approved',
        reviewed_by: (await supabase.auth.getUser()).data.user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', storeId)

    if (error) throw error

    // Log the action
    await logEmployeeAction('approve_store', 'store', storeId, { action: 'approve' })

    // Refresh data
    await refreshData()
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
  if (!confirm('Are you sure you want to reject this store?')) {
    return
  }

  try {
    processing.value = true
    
    // Update store status to rejected
    const { error } = await supabase
      .from('stores')
      .update({
        status: 'rejected',
        reviewed_by: (await supabase.auth.getUser()).data.user.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: 'Store rejected by employee'
      })
      .eq('id', storeId)

    if (error) throw error

    // Log the action
    await logEmployeeAction('reject_store', 'store', storeId, { 
      action: 'reject',
      reason: 'Store rejected by employee'
    })

    // Close store details modal
    showStoreDetailsModal.value = false
    selectedStore.value = null

    // Refresh data
    await refreshData()
    
    alert('Store rejected successfully')
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

// Confirm document rejection
const confirmDocumentRejection = async () => {
  if (!isDocumentRejectionValid.value) return

  try {
    processing.value = true
    
    const { id, verificationType } = currentRejectionTarget.value
    
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

    // Reset modal
    showRejectionModal.value = false
    rejectionReason.value = ''
    customRejectionReason.value = ''
    currentRejectionTarget.value = null

    // Refresh data
    await refreshData()
    
    // Close store details if open
    if (showStoreDetailsModal.value) {
      showStoreDetailsModal.value = false
      selectedStore.value = null
    }
  } catch (error) {
    console.error('Error rejecting document:', error)
    alert('Failed to reject document')
  } finally {
    processing.value = false
  }
}


// Element rejection (logo, banner, name, description)
const rejectElement = (elementType, elementId, elementName) => {
  // For verification documents, use the document rejection flow
  if (['id_card', 'commerce_register', 'payment_receipt'].includes(elementType)) {
    rejectDocument(elementType, elementId, elementName)
    return
  }
  
  // For other elements (logo, banner, name, description)
  currentRejectionTarget.value = { 
    type: 'element', 
    id: elementId, 
    elementType: elementType,
    elementName: elementName
  }
  showRejectionModal.value = true
}

// Confirm element rejection (for non-verification elements only)
const confirmElementRejection = async () => {
  if (!isDocumentRejectionValid.value) return

  try {
    processing.value = true
    
    const { elementType, id } = currentRejectionTarget.value
    
    // For non-verification elements (logo, banner, name, description), just log the action
    // since we don't have individual status fields in the stores table
    await logEmployeeAction('reject_element', 'store_element', id, { 
      action: 'reject',
      element_type: elementType,
      reason: rejectionReason.value.trim(),
      details: customRejectionReason.value.trim()
    })

    // Reset modal
    showRejectionModal.value = false
    rejectionReason.value = ''
    customRejectionReason.value = ''
    currentRejectionTarget.value = null

    // Refresh data
    await refreshData()
  } catch (error) {
    console.error('Error rejecting element:', error)
    alert('Failed to reject element')
  } finally {
    processing.value = false
  }
}


const approveProduct = async (productId) => {
  try {
    processing.value = true
    
    const { error } = await supabase
      .from('products')
      .update({ is_active: true })
      .eq('id', productId)

    if (error) throw error

    // Log the action
    await logEmployeeAction('approve_product', 'product', productId, { action: 'approve' })

    // Refresh data
    await refreshData()
  } catch (error) {
    console.error('Error approving product:', error)
    alert('Failed to approve product')
  } finally {
    processing.value = false
  }
}

const rejectProduct = (productId) => {
  currentRejectionTarget.value = { type: 'product', id: productId }
  showRejectionModal.value = true
}


const confirmRejection = async () => {
  if (!isRejectionValid.value) return

  try {
    processing.value = true
    
    const { type, id } = currentRejectionTarget.value
    
    // Prepare rejection details
    const rejectionDetails = {
      fields: rejectedFields.value,
      custom_reason: customRejectionReason.value.trim()
    }

    let updateData = {
      status: 'rejected',
      reviewed_by: (await supabase.auth.getUser()).data.user.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: rejectionReason.value.trim(),
      rejection_details: rejectionDetails
    }

    let tableName = type === 'store' ? 'stores' : 'products'
    
    if (type === 'product') {
      updateData = { 
        is_active: false, 
        rejection_reason: rejectionReason.value.trim(),
        rejection_details: rejectionDetails
      }
    }

    const { error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', id)

    if (error) throw error

    // Log the action
    await logEmployeeAction(`reject_${type}`, type, id, { 
      action: 'reject', 
      reason: rejectionReason.value.trim(),
      fields: rejectedFields.value,
      details: customRejectionReason.value.trim()
    })

    // Reset modal
    showRejectionModal.value = false
    rejectionReason.value = ''
    rejectedFields.value = []
    customRejectionReason.value = ''
    currentRejectionTarget.value = null

    // Refresh data
    await refreshData()
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
  showStoreDetailsModal.value = true
}

const closeStoreDetails = () => {
  showStoreDetailsModal.value = false
  selectedStore.value = null
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

