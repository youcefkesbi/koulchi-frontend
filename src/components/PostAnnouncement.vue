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
            <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <!-- Header -->
              <div class="flex items-center justify-between mb-6">
                <DialogTitle as="h3" class="text-2xl font-bold text-gray-900">
                  {{ $t('announcement.postAnnouncement') }}
                </DialogTitle>
                <button
                  @click="closeModal"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>

              <!-- Success Message -->
              <div v-if="showSuccess" class="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {{ $t('announcement.success') }}
              </div>

              <!-- Error Message -->
              <div v-if="error" class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {{ error }}
              </div>

              <!-- Form -->
              <form @submit.prevent="submitForm" class="space-y-6">
                <!-- Product Information -->
                <div class="space-y-4">
                  <h4 class="text-lg font-semibold text-gray-900 border-b pb-2">
                    {{ $t('announcement.productInfo') }}
                  </h4>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        {{ $t('announcement.productName') }} (English) *
                      </label>
                      <input
                        v-model="form.name"
                        type="text"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        :placeholder="$t('announcement.productNamePlaceholder')"
                      />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        {{ $t('announcement.productName') }} (Arabic) *
                      </label>
                      <input
                        v-model="form.nameAr"
                        type="text"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        :placeholder="$t('announcement.productNameArPlaceholder')"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        {{ $t('announcement.category') }} *
                      </label>
                      <select
                        v-model="form.category"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">{{ $t('announcement.selectCategory') }}</option>
                        <option value="cars">{{ $t('seller.cars') }}</option>
                        <option value="realestate">{{ $t('seller.realestate') }}</option>
                        <option value="electronics">{{ $t('seller.electronics') }}</option>
                        <option value="fashion">{{ $t('seller.fashion') }}</option>
                        <option value="home">{{ $t('seller.home') }}</option>
                        <option value="beauty">{{ $t('seller.beauty') }}</option>
                        <option value="kids">{{ $t('seller.kids') }}</option>
                        <option value="food">{{ $t('seller.food') }}</option>
                      </select>
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        {{ $t('announcement.price') }} *
                      </label>
                      <input
                        v-model="form.price"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        :placeholder="$t('announcement.pricePlaceholder')"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {{ $t('announcement.image') }}
                    </label>
                    <input
                      v-model="form.image"
                      type="url"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      :placeholder="$t('announcement.imageUrlPlaceholder')"
                    />
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        {{ $t('announcement.description') }} (English)
                      </label>
                      <textarea
                        v-model="form.description"
                        rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        :placeholder="$t('announcement.descriptionPlaceholder')"
                      ></textarea>
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        {{ $t('announcement.description') }} (Arabic)
                      </label>
                      <textarea
                        v-model="form.descriptionAr"
                        rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        :placeholder="$t('announcement.descriptionArPlaceholder')"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <!-- Submit Button -->
                <div class="flex justify-end space-x-3 space-x-reverse">
                  <button
                    type="button"
                    @click="closeModal"
                    class="px-6 py-3 text-gray-700 bg-gray-100 border border-transparent rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    {{ $t('common.cancel') }}
                  </button>
                  <button
                    type="submit"
                    :disabled="loading"
                    class="px-6 py-3 bg-primary text-white border border-transparent rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span v-if="loading">
                      <i class="fas fa-spinner fa-spin mr-2"></i>
                      {{ $t('announcement.submitting') }}
                    </span>
                    <span v-else>
                      {{ $t('announcement.submit') }}
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

<script setup>
import { ref, reactive } from 'vue'
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { supabase } from '../lib/supabase'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'announcement-posted'])

const loading = ref(false)
const error = ref('')
const showSuccess = ref(false)

const form = reactive({
  name: '',
  nameAr: '',
  category: '',
  price: '',
  image: '',
  description: '',
  descriptionAr: ''
})

const closeModal = () => {
  error.value = ''
  showSuccess.value = false
  // Reset form
  Object.keys(form).forEach(key => {
    form[key] = ''
  })
  emit('close')
}

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
        in_stock: true,
        is_new: true,
        is_on_sale: false,
        is_active: true,
        rating: 0,
        reviews: 0
      })
      .select()
      .single()

    if (createError) throw createError

    showSuccess.value = true
    emit('announcement-posted')
    setTimeout(() => {
      closeModal()
    }, 2000)
  } catch (err) {
    error.value = err.message || 'Error creating announcement'
    console.error('Error creating product:', err)
  } finally {
    loading.value = false
  }
}
</script> 