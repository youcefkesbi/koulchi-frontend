<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
      <div>
        <h2 class="text-2xl font-bold text-dark mb-2">
          {{ $t('store.upgradeStore') }}
        </h2>
        <p class="text-gray-600">{{ $t('store.upgradeStoreDescription') }}</p>
      </div>
    </div>

    <!-- Current Pack Info -->
    <div class="bg-white rounded-2xl shadow-soft p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('store.currentPack') }}</h3>
      
      <div class="flex items-center space-x-4 space-x-reverse">
        <div class="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
          <i class="fas fa-crown text-white text-2xl"></i>
        </div>
        <div>
          <h4 class="text-xl font-bold text-gray-800">{{ currentPack?.name }}</h4>
          <p class="text-gray-600">{{ currentPack?.description }}</p>
          <div class="flex items-center space-x-4 space-x-reverse mt-2 text-sm text-gray-500">
            <span>{{ currentPack?.max_announcements }} {{ $t('store.announcements') }}</span>
            <span>{{ currentPack?.max_images }} {{ $t('store.images') }}</span>
            <span>{{ currentPack?.price }} DZD</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Upgrade Options -->
    <div v-if="currentPack?.name === 'Basic Pack'" class="space-y-6">
      <h3 class="text-lg font-semibold text-gray-800">{{ $t('store.upgradeOptions') }}</h3>
      
      <!-- Pro Pack Option -->
      <div class="bg-white rounded-2xl shadow-soft p-6 border-2 border-primary">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h4 class="text-xl font-bold text-gray-800">{{ proPack?.name }}</h4>
            <p class="text-gray-600">{{ proPack?.description }}</p>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-primary">{{ proPack?.price }} DZD</div>
            <div class="text-sm text-gray-500">{{ $t('store.oneTimePayment') }}</div>
          </div>
        </div>

        <!-- Features Comparison -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h5 class="font-semibold text-gray-800 mb-2">{{ $t('store.currentFeatures') }}</h5>
            <ul class="space-y-1 text-sm text-gray-600">
              <li class="flex items-center">
                <i class="fas fa-check text-green-500 mr-2"></i>
                {{ currentPack?.max_announcements }} {{ $t('store.announcements') }}
              </li>
              <li class="flex items-center">
                <i class="fas fa-check text-green-500 mr-2"></i>
                {{ currentPack?.max_images }} {{ $t('store.images') }}
              </li>
              <li class="flex items-center">
                <i class="fas fa-check text-green-500 mr-2"></i>
                {{ $t('store.externalButtons') }}
              </li>
              <li class="flex items-center">
                <i class="fas fa-check text-green-500 mr-2"></i>
                {{ $t('store.locationInput') }}
              </li>
            </ul>
          </div>

          <div>
            <h5 class="font-semibold text-gray-800 mb-2">{{ $t('store.proFeatures') }}</h5>
            <ul class="space-y-1 text-sm text-gray-600">
              <li class="flex items-center">
                <i class="fas fa-check text-green-500 mr-2"></i>
                {{ proPack?.max_announcements }} {{ $t('store.announcements') }}
              </li>
              <li class="flex items-center">
                <i class="fas fa-check text-green-500 mr-2"></i>
                {{ proPack?.max_images }} {{ $t('store.images') }}
              </li>
              <li class="flex items-center">
                <i class="fas fa-check text-green-500 mr-2"></i>
                {{ $t('store.storeLogo') }}
              </li>
              <li class="flex items-center">
                <i class="fas fa-check text-green-500 mr-2"></i>
                {{ $t('store.storeBanner') }}
              </li>
              <li class="flex items-center">
                <i class="fas fa-check text-green-500 mr-2"></i>
                {{ $t('store.colorCustomization') }}
              </li>
              <li class="flex items-center">
                <i class="fas fa-check text-green-500 mr-2"></i>
                {{ $t('store.storeName') }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Upgrade Button -->
        <button
          @click="startUpgrade"
          :disabled="loading"
          class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          <i v-else class="fas fa-arrow-up mr-2"></i>
          {{ loading ? $t('store.upgrading') : $t('store.upgradeToPro') }}
        </button>
      </div>
    </div>

    <!-- Already Pro Pack -->
    <div v-else-if="currentPack?.name === 'Pro Pack'" class="bg-green-50 border border-green-200 rounded-xl p-6">
      <div class="flex items-center space-x-3 space-x-reverse">
        <i class="fas fa-check-circle text-green-600 text-2xl"></i>
        <div>
          <h4 class="font-semibold text-green-800">{{ $t('store.alreadyPro') }}</h4>
          <p class="text-green-700 text-sm">{{ $t('store.alreadyProMessage') }}</p>
        </div>
      </div>
    </div>

    <!-- Upgrade Process Modal -->
    <div v-if="showUpgradeModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-soft max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-800">{{ $t('store.upgradeToPro') }}</h3>
            <button
              @click="cancelUpgrade"
              class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Upgrade Steps -->
          <div class="space-y-6">
            <!-- Step 1: Additional Verifications -->
            <div v-if="upgradeStep === 1" class="space-y-4">
              <h4 class="text-lg font-semibold text-gray-800">{{ $t('store.additionalVerifications') }}</h4>
              <p class="text-gray-600">{{ $t('store.additionalVerificationsDescription') }}</p>

              <div class="space-y-4">
                <div 
                  v-for="requirement in additionalRequirements" 
                  :key="requirement.verification_type"
                  class="border border-gray-200 rounded-lg p-4"
                >
                  <div class="flex items-center justify-between mb-3">
                    <h5 class="font-medium text-gray-800">{{ requirement.display_name }}</h5>
                    <span 
                      :class="[
                        'px-2 py-1 text-xs rounded-full',
                        uploadedDocuments[requirement.verification_type] 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      ]"
                    >
                      {{ uploadedDocuments[requirement.verification_type] ? $t('common.uploaded') : $t('common.required') }}
                    </span>
                  </div>
                  
                  <p class="text-sm text-gray-600 mb-3">{{ requirement.description }}</p>
                  
                  <div class="flex items-center space-x-3 space-x-reverse">
                    <input
                      :ref="`file-${requirement.verification_type}`"
                      type="file"
                      accept="image/*"
                      @change="handleFileUpload($event, requirement.verification_type)"
                      class="hidden"
                    />
                    <button
                      type="button"
                      @click="triggerFileUpload(requirement.verification_type)"
                      class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <i class="fas fa-upload mr-2"></i>
                      {{ $t('common.upload') }}
                    </button>
                    <button
                      v-if="uploadedDocuments[requirement.verification_type]"
                      type="button"
                      @click="removeDocument(requirement.verification_type)"
                      class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <i class="fas fa-trash mr-2"></i>
                      {{ $t('common.remove') }}
                    </button>
                  </div>
                  
                  <div v-if="uploadedDocuments[requirement.verification_type]" class="mt-3">
                    <img 
                      :src="uploadedDocuments[requirement.verification_type].preview" 
                      :alt="requirement.display_name"
                      class="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Payment -->
            <div v-if="upgradeStep === 2" class="space-y-4">
              <h4 class="text-lg font-semibold text-gray-800">{{ $t('store.payment') }}</h4>
              <p class="text-gray-600">{{ $t('store.paymentDescription') }}</p>

              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-gray-700">{{ $t('store.upgradeFee') }}</span>
                  <span class="font-semibold text-gray-800">{{ proPack?.price }} DZD</span>
                </div>
                <div class="text-sm text-gray-500">{{ $t('store.paymentMethod') }}: BaridiMob</div>
              </div>

              <div class="space-y-3">
                <label class="block text-sm font-medium text-gray-700">
                  {{ $t('store.paymentReceipt') }} *
                </label>
                <input
                  ref="paymentReceiptFile"
                  type="file"
                  accept="image/*"
                  @change="handlePaymentReceiptUpload"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                <div v-if="paymentReceiptPreview" class="mt-3">
                  <img 
                    :src="paymentReceiptPreview" 
                    alt="Payment Receipt"
                    class="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              </div>
            </div>

            <!-- Step 3: Confirmation -->
            <div v-if="upgradeStep === 3" class="space-y-4">
              <h4 class="text-lg font-semibold text-gray-800">{{ $t('store.confirmUpgrade') }}</h4>
              
              <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-700">{{ $t('store.currentPack') }}:</span>
                  <span class="font-medium">{{ currentPack?.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-700">{{ $t('store.newPack') }}:</span>
                  <span class="font-medium text-primary">{{ proPack?.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-700">{{ $t('store.upgradeFee') }}:</span>
                  <span class="font-medium">{{ proPack?.price }} DZD</span>
                </div>
              </div>

              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div class="flex items-start space-x-3 space-x-reverse">
                  <i class="fas fa-info-circle text-yellow-600 mt-1"></i>
                  <div>
                    <h5 class="font-semibold text-yellow-800 mb-1">{{ $t('store.upgradeNotice') }}</h5>
                    <p class="text-yellow-700 text-sm">{{ $t('store.upgradeNoticeMessage') }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
            <button
              v-if="upgradeStep > 1"
              @click="previousStep"
              class="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <i class="fas fa-arrow-left mr-2"></i>
              {{ $t('common.back') }}
            </button>
            <div v-else></div>

            <div class="flex space-x-3 space-x-reverse">
              <button
                v-if="upgradeStep < 3"
                @click="nextStep"
                :disabled="!canProceed"
                class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ $t('common.next') }}
                <i class="fas fa-arrow-right ml-2"></i>
              </button>
              
              <button
                v-if="upgradeStep === 3"
                @click="confirmUpgrade"
                :disabled="loading"
                class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <div v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <i v-else class="fas fa-check mr-2"></i>
                {{ loading ? $t('store.upgrading') : $t('store.confirmUpgrade') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
      <div class="flex items-center space-x-3 space-x-reverse">
        <i class="fas fa-check-circle text-green-600 flex-shrink-0"></i>
        <div>
          <h4 class="font-semibold text-green-800 mb-1">{{ $t('common.success') }}</h4>
          <p class="text-green-700 text-sm">{{ successMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
      <div class="flex items-center space-x-3 space-x-reverse">
        <i class="fas fa-exclamation-circle text-red-600 flex-shrink-0"></i>
        <div>
          <h4 class="font-semibold text-red-800 mb-1">{{ $t('common.error') }}</h4>
          <p class="text-red-700 text-sm">{{ errorMessage }}</p>
        </div>
        <button @click="errorMessage = ''" class="text-red-400 hover:text-red-600">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePackStore } from '../stores/pack'
import { useVerificationStore } from '../stores/verification'
import { useStoreStore } from '../stores/store'

const { t: $t } = useI18n()
const packStore = usePackStore()
const verificationStore = useVerificationStore()
const storeStore = useStoreStore()

// Props
const props = defineProps({
  storeId: {
    type: String,
    required: true
  }
})

// State
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const showUpgradeModal = ref(false)
const upgradeStep = ref(1)
const currentPack = ref(null)
const proPack = ref(null)
const additionalRequirements = ref([])
const uploadedDocuments = ref({})
const paymentReceiptFile = ref(null)
const paymentReceiptPreview = ref('')

// Computed
const canProceed = computed(() => {
  switch (upgradeStep.value) {
    case 1:
      return additionalRequirements.value.every(req => uploadedDocuments.value[req.verification_type])
    case 2:
      return paymentReceiptFile.value !== null
    case 3:
      return true
    default:
      return false
  }
})

// Methods
const fetchStoreInfo = async () => {
  try {
    const store = await storeStore.fetchStoreById(props.storeId)
    if (store.pack_id) {
      const pack = await packStore.fetchPacks()
      currentPack.value = pack.find(p => p.id === store.pack_id)
    }
  } catch (error) {
    console.error('Error fetching store info:', error)
    errorMessage.value = 'Failed to load store information'
  }
}

const fetchProPack = async () => {
  try {
    await packStore.fetchPacks()
    proPack.value = packStore.proPack
  } catch (error) {
    console.error('Error fetching pro pack:', error)
  }
}

const startUpgrade = async () => {
  try {
    // Fetch additional requirements for Pro Pack
    const requirements = await verificationStore.getVerificationRequirements('Pro Pack')
    additionalRequirements.value = requirements.filter(req => 
      !['id_card', 'driving_license', 'passport'].includes(req.verification_type)
    )
    
    showUpgradeModal.value = true
    upgradeStep.value = 1
  } catch (error) {
    console.error('Error starting upgrade:', error)
    errorMessage.value = 'Failed to start upgrade process'
  }
}

const nextStep = () => {
  if (upgradeStep.value < 3 && canProceed.value) {
    upgradeStep.value++
  }
}

const previousStep = () => {
  if (upgradeStep.value > 1) {
    upgradeStep.value--
  }
}

const cancelUpgrade = () => {
  showUpgradeModal.value = false
  upgradeStep.value = 1
  uploadedDocuments.value = {}
  paymentReceiptFile.value = null
  paymentReceiptPreview.value = ''
}

const handleFileUpload = (event, verificationType) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedDocuments.value[verificationType] = {
        file,
        preview: e.target.result
      }
    }
    reader.readAsDataURL(file)
  }
}

const triggerFileUpload = (verificationType) => {
  const input = document.querySelector(`input[ref="file-${verificationType}"]`)
  if (input) {
    input.click()
  }
}

const removeDocument = (verificationType) => {
  delete uploadedDocuments.value[verificationType]
}

const handlePaymentReceiptUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    paymentReceiptFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      paymentReceiptPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const confirmUpgrade = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    // Upload additional verification documents
    for (const [type, doc] of Object.entries(uploadedDocuments.value)) {
      await verificationStore.uploadVerification(type, doc.file)
    }

    // Upload payment receipt
    if (paymentReceiptFile.value) {
      await verificationStore.uploadVerification('payment_receipt', paymentReceiptFile.value)
    }

    // Update store pack
    await storeStore.updateStore(props.storeId, {
      pack_id: proPack.value.id,
      status: 'pending' // Require review for pack upgrade
    })

    successMessage.value = 'Store upgrade request submitted successfully! Your store will be reviewed and approved shortly.'
    
    // Close modal and refresh data
    cancelUpgrade()
    await fetchStoreInfo()
    
  } catch (error) {
    console.error('Error confirming upgrade:', error)
    errorMessage.value = error.message || 'Failed to upgrade store'
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchStoreInfo(),
    fetchProPack()
  ])
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
