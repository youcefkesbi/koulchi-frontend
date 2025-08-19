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
                            {{ category.name_ar }}
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
                        {{ $t('seller.productImages') }}
                      </h4>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          {{ $t('seller.uploadImages') }} *
                        </label>
                        <input
                          ref="imageInput"
                          type="file"
                          multiple
                          accept="image/*"
                          @change="handleImageUpload"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <p class="text-sm text-gray-500 mt-1">
                          {{ $t('seller.imageUploadHelp') }}
                        </p>
                      </div>

                      <!-- Image Preview -->
                      <div v-if="selectedImages.length > 0" class="mt-4">
                        <div class="grid grid-cols-2 gap-4">
                          <div
                            v-for="(image, index) in selectedImages"
                            :key="index"
                            class="relative"
                          >
                            <img
                              :src="image.preview"
                              :alt="`Product image ${index + 1}`"
                              class="w-full h-32 object-cover rounded-lg border"
                            />
                            <button
                              @click="removeImage(index)"
                              class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              <i class="fas fa-times text-xs"></i>
                            </button>
                          </div>
                        </div>
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
import { useProductStore } from '../stores/product'
import { supabase } from '@/lib/supabase'

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
    const productStore = useProductStore()
    const imageInput = ref(null)
    const selectedImages = ref([])

    const form = reactive({
      name: '',
      nameAr: '',
      price: 0,
      originalPrice: 0,
      category: '',
      description: '',
      descriptionAr: '',
      inStock: true,
      isNew: false,
      isOnSale: false
    })
    const categories = ref([])
    const isEditing = computed(() => !!props.product)

    // Watch for product changes to populate form
    watch(() => props.product, (newProduct) => {
      if (newProduct) {
        Object.assign(form, {
          name: newProduct.name || '',
          nameAr: newProduct.name_ar || '',
          price: newProduct.price || 0,
          originalPrice: newProduct.original_price || 0,
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
          category: '',
          description: '',
          descriptionAr: '',
          inStock: true,
          isNew: false,
          isOnSale: false
        })
      }
      // Reset selected images
      selectedImages.value = []
    }, { immediate: true })

    // Fetch categories on mount
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name')
        if (error) throw error
        categories.value = data || []
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    }

    // Fetch categories when component mounts
    fetchCategories()

    const closeModal = () => {
      emit('close')
      sellerStore.clearError()
    }

    const handleImageUpload = (event) => {
      const files = Array.from(event.target.files)
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            selectedImages.value.push({
              file: file,
              preview: e.target.result
            })
          }
          reader.readAsDataURL(file)
        }
      })
    }

    const removeImage = (index) => {
      selectedImages.value.splice(index, 1)
    }

    const handleImageError = (event) => {
      event.target.src = 'https://picsum.photos/400/400?random=error'
    }

    const submitForm = async () => {
      try {
        const productData = {
          name: form.name,
          name_ar: form.nameAr,
          price: form.price,
          original_price: form.originalPrice,
          category_id: form.category,
          description: form.description,
          description_ar: form.descriptionAr,
          stock_quantity: form.inStock ? 100 : 0,
          is_new: form.isNew,
          is_on_sale: form.isOnSale
        }

        if (isEditing.value) {
          await productStore.updateProduct(props.product.id, productData)
        } else {
          // Extract files from selectedImages
          const imageFiles = selectedImages.value.map(img => img.file)
          await productStore.createProduct(productData, imageFiles)
        }
        
        emit('product-saved')
        closeModal()
      } catch (error) {
        // Error is handled by the store
      }
    }

    return {
      sellerStore,
      productStore,
      form,
      categories,
      isEditing,
      imageInput,
      selectedImages,
      closeModal,
      handleImageUpload,
      removeImage,
      handleImageError,
      submitForm
    }
  }
}
</script> 