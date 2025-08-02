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
                  {{ $t('seller.becomeSeller') }}
                </DialogTitle>
                <button
                  @click="closeModal"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>

              <!-- Error Message -->
              <div v-if="authStore.error" class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {{ authStore.error }}
              </div>



              <!-- Form -->
              <form @submit.prevent="submitForm" class="space-y-6">
                <!-- Business Information -->
                <div class="space-y-4">
                  <h4 class="text-lg font-semibold text-gray-900 border-b pb-2">
                    {{ $t('seller.businessInfo') }}
                  </h4>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        {{ $t('seller.businessName') }} *
                      </label>
                      <input
                        v-model="form.businessName"
                        type="text"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        :placeholder="$t('seller.businessNamePlaceholder')"
                      />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        {{ $t('seller.phone') }} *
                      </label>
                      <input
                        v-model="form.phone"
                        type="tel"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        :placeholder="$t('seller.phonePlaceholder')"
                      />
                    </div>
                  </div>


                </div>

                <!-- Address Information -->
                <div class="space-y-4">
                  <h4 class="text-lg font-semibold text-gray-900 border-b pb-2">
                    {{ $t('seller.addressInfo') }}
                  </h4>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {{ $t('seller.city') }} *
                    </label>
                    <input
                      v-model="form.city"
                      type="text"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      :placeholder="$t('seller.cityPlaceholder')"
                    />
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
                    :disabled="authStore.loading"
                    class="px-6 py-3 bg-primary text-white border border-transparent rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span v-if="authStore.loading">
                      <i class="fas fa-spinner fa-spin mr-2"></i>
                      {{ $t('common.starting') }}
                    </span>
                    <span v-else>
                      {{ $t('seller.start') }}
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'BecomeSellerModal',
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
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    const router = useRouter()
    const form = reactive({
      businessName: '',
      phone: '',
      city: ''
    })

    const closeModal = () => {
      authStore.clearError()
      emit('close')
    }

    const submitForm = async () => {
      try {
        await authStore.createSellerProfile(form)
        await authStore.fetchSellerProfile() // Ensure isSeller is updated
        emit('close')
        router.push('/seller/dashboard')
      } catch (error) {
        // Error is handled by the store
      }
    }

    return {
      authStore,
      form,
      closeModal,
      submitForm
    }
  }
}
</script> 