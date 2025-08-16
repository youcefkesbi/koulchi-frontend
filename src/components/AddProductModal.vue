<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <!-- Header -->
              <div class="flex items-center justify-between mb-6">
                <DialogTitle as="h3" class="text-2xl font-bold text-gray-900">
                  {{ isEditing ? $t('seller.editProduct') : $t('seller.addProduct') }}
                </DialogTitle>
                <button
                  @click="closeModal"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>

              <!-- Error Message -->
              <div v-if="sellerStore.error" class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {{ sellerStore.error }}
              </div>

              <!-- Form -->
              <form @submit.prevent="submitForm" class="space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <!-- Left Column -->
                  <div class="space-y-6">
                    <!-- Basic Information -->
                    <div class="space-y-4">
                      <h4 class="text-lg font-semibold text-gray-900 border-b pb-2">
                        {{ $t('seller.basicInfo') }}
                      </h4>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          {{ $t('seller.productName') }} (English) *
                        </label>
                        <input
                          v-model="form.name"
                          type="text"
                          required
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          :placeholder="$t('seller.productNamePlaceholder')"
                        />
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          {{ $t('seller.productName') }} (Arabic) *
                        </label>
                        <input
                          v-model="form.nameAr"
                          type="text"
                          required
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          :placeholder="$t('seller.productNameArPlaceholder')"
                        />
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          {{ $t('seller.category') }} *
                        </label>
                        <select
                          v-model="form.category"
                          required
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">{{ $t('seller.selectCategory') }}</option>
                          <option v-for="category in categories" :key="category.id" :value="category.id">
                            {{ category.nameAr }}
                          </option>
                        </select>
                      </div>
                    </div>

                    <!-- Pricing -->
                    <div class="space-y-4">
                      <h4 class="text-lg font-semibold text-gray-900 border-b pb-2">
                        {{ $t('seller.pricing') }}
                      </h4>
                      
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-2">
                            {{ $t('seller.price') }} (DZD) *
                          </label>
                          <input
                            v-model.number="form.price"
                            type="number"
                            required
                            min="0"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            :placeholder="$t('seller.pricePlaceholder')"
                          />
                        </div>
                        
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-2">
                            {{ $t('seller.originalPrice') }} (DZD)
                          </label>
                          <input
                            v-model.number="form.originalPrice"
                            type="number"
                            min="0"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            :placeholder="$t('seller.originalPricePlaceholder')"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- Status -->
                    <div class="space-y-4">
                      <h4 class="text-lg font-semibold text-gray-900 border-b pb-2">
                        {{ $t('seller.status') }}
                      </h4>
                      
                      <div class="space-y-3">
                        <div class="flex items-center">
                          <input
                            v-model="form.inStock"
                            type="checkbox"
                            class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <label class="mr-3 text-sm text-gray-700">
                            {{ $t('seller.inStock') }}
                          </label>
                        </div>
                        
                        <div class="flex items-center">
                          <input
                            v-model="form.isNew"
                            type="checkbox"
                            class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <label class="mr-3 text-sm text-gray-700">
                            {{ $t('seller.isNew') }}
                          </label>
                        </div>
                        
                        <div class="flex items-center">
                          <input
                            v-model="form.isOnSale"
                            type="checkbox"
                            class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <label class="mr-3 text-sm text-gray-700">
                            {{ $t('seller.isOnSale') }}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Right Column -->
                  <div class="space-y-6">
                    <!-- Image -->
                    <div class="space-y-4">
                      <h4 class="text-lg font-semibold text-gray-900 border-b pb-2">
                        {{ $t('seller.productImage') }}
                      </h4>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          {{ $t('seller.imageUrl') }} *
                        </label>
                        <input
                          v-model="form.image"
                          type="url"
                          required
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          :placeholder="$t('seller.imageUrlPlaceholder')"
                        />
                      </div>

                      <!-- Image Preview -->
                      <div v-if="form.image" class="mt-4">
                        <img
                          :src="form.image"
                          :alt="form.name"
                          class="w-full h-48 object-cover rounded-lg border"
                          @error="handleImageError"
                        />
                      </div>
                    </div>

                    <!-- Description -->
                    <div class="space-y-4">
                      <h4 class="text-lg font-semibold text-gray-900 border-b pb-2">
                        {{ $t('seller.description') }}
                      </h4>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          {{ $t('seller.description') }} (English)
                        </label>
                        <textarea
                          v-model="form.description"
                          rows="4"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          :placeholder="$t('seller.descriptionPlaceholder')"
                        ></textarea>
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          {{ $t('seller.description') }} (Arabic)
                        </label>
                        <textarea
                          v-model="form.descriptionAr"
                          rows="4"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          :placeholder="$t('seller.descriptionArPlaceholder')"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Submit Buttons -->
                <div class="flex justify-end space-x-3 space-x-reverse pt-6 border-t">
                  <button
                    type="button"
                    @click="closeModal"
                    class="px-6 py-3 text-gray-700 bg-gray-100 border border-transparent rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    {{ $t('common.cancel') }}
                  </button>
                  <button
                    type="submit"
                    :disabled="sellerStore.loading"
                    class="px-6 py-3 bg-primary text-white border border-transparent rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span v-if="sellerStore.loading" class="flex items-center">
                      <i class="fas fa-spinner fa-spin mr-2"></i>
                      {{ $t('common.saving') }}
                    </span>
                    <span v-else>
                      {{ isEditing ? $t('common.update') : $t('common.save') }}
                    </span>
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue'
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { useSellerStore } from '../stores/seller'

export default {
  name: 'AddProductModal',
  components: {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogPanel,
    DialogTitle
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    product: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'product-saved'],
  setup(props, { emit }) {
    const sellerStore = useSellerStore()

    const form = reactive({
      name: '',
      nameAr: '',
      price: 0,
      originalPrice: 0,
      image: '',
      category: '',
      description: '',
      descriptionAr: '',
      inStock: true,
      isNew: false,
      isOnSale: false
    })

    const isEditing = computed(() => !!props.product)

    // Watch for product changes to populate form
    watch(() => props.product, (newProduct) => {
      if (newProduct) {
        Object.assign(form, {
          name: newProduct.name || '',
          nameAr: newProduct.name_ar || '',
          price: newProduct.price || 0,
          originalPrice: newProduct.original_price || 0,
          image: newProduct.image || '',
          category: newProduct.category || '',
          description: newProduct.description || '',
          descriptionAr: newProduct.description_ar || '',
          inStock: newProduct.in_stock || true,
          isNew: newProduct.is_new || false,
          isOnSale: newProduct.is_on_sale || false
        })
      } else {
        // Reset form
        Object.assign(form, {
          name: '',
          nameAr: '',
          price: 0,
          originalPrice: 0,
          image: '',
          category: '',
          description: '',
          descriptionAr: '',
          inStock: true,
          isNew: false,
          isOnSale: false
        })
      }
    }, { immediate: true })

    const closeModal = () => {
      emit('close')
      sellerStore.clearError()
    }

    const handleImageError = (event) => {
      event.target.src = 'https://picsum.photos/400/400?random=error'
    }

    const submitForm = async () => {
      try {
        if (isEditing.value) {
          await sellerStore.updateProduct(props.product.id, {
            name: form.name,
            name_ar: form.nameAr,
            price: form.price,
            original_price: form.originalPrice,
            image: form.image,
            category: form.category,
            description: form.description,
            description_ar: form.descriptionAr,
            in_stock: form.inStock,
            is_new: form.isNew,
            is_on_sale: form.isOnSale
          })
        } else {
          await sellerStore.createProduct({
            name: form.name,
            nameAr: form.nameAr,
            price: form.price,
            originalPrice: form.originalPrice,
            image: form.image,
            category: form.category,
            description: form.description,
            descriptionAr: form.descriptionAr,
            inStock: form.inStock,
            isNew: form.isNew,
            isOnSale: form.isOnSale
          })
        }
        
        emit('product-saved')
      } catch (error) {
        // Error is handled by the store
      }
    }

    return {
      sellerStore,
      form,
      categories,
      isEditing,
      closeModal,
      handleImageError,
      submitForm
    }
  }
}
</script> 