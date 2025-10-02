<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
      <div>
        <h2 class="text-2xl font-bold text-dark mb-2">
          {{ $t('verification.manageVerifications') }}
        </h2>
        <p class="text-gray-600">{{ $t('verification.manageVerificationsDescription') }}</p>
      </div>
    </div>

    <!-- Verification Status Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-xl shadow-soft p-6">
        <div class="flex items-center space-x-3 space-x-reverse">
          <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-clock text-primary-600 text-xl"></i>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-800">{{ pendingCount }}</h3>
            <p class="text-sm text-gray-600">{{ $t('verification.pending') }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-soft p-6">
        <div class="flex items-center space-x-3 space-x-reverse">
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-check-circle text-green-600 text-xl"></i>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-800">{{ approvedCount }}</h3>
            <p class="text-sm text-gray-600">{{ $t('verification.approved') }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-soft p-6">
        <div class="flex items-center space-x-3 space-x-reverse">
          <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-times-circle text-red-600 text-xl"></i>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-800">{{ rejectedCount }}</h3>
            <p class="text-sm text-gray-600">{{ $t('verification.rejected') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload New Verification -->
    <div class="bg-white rounded-2xl shadow-soft p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('verification.uploadNew') }}</h3>
      
      <form @submit.prevent="uploadVerification" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('verification.documentType') }} *
            </label>
            <select
              v-model="newVerification.type"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="">{{ $t('verification.selectType') }}</option>
              <option value="id_card">{{ $t('verification.idCard') }}</option>
              <option value="driving_license">{{ $t('verification.drivingLicense') }}</option>
              <option value="passport">{{ $t('verification.passport') }}</option>
              <option value="commerce_register">{{ $t('verification.commerceRegister') }}</option>
              <option value="payment_receipt">{{ $t('verification.paymentReceipt') }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('verification.document') }} *
            </label>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileSelect"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
        </div>

        <div v-if="newVerification.preview" class="mt-4">
          <img 
            :src="newVerification.preview" 
            :alt="newVerification.type"
            class="w-32 h-32 object-cover rounded-lg border border-gray-200"
          />
        </div>

        <div class="flex items-center justify-end space-x-3 space-x-reverse">
          <button
            type="button"
            @click="resetForm"
            class="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="!newVerification.type || !newVerification.file || uploading"
            class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div v-if="uploading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {{ uploading ? $t('verification.uploading') : $t('verification.upload') }}
          </button>
        </div>
      </form>
    </div>

    <!-- Verification List -->
    <div class="bg-white rounded-2xl shadow-soft">
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-800">{{ $t('verification.verificationHistory') }}</h3>
      </div>

      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p class="text-gray-600">{{ $t('common.loading') }}</p>
      </div>

      <div v-else-if="verifications.length === 0" class="p-8 text-center">
        <div class="text-gray-400 text-5xl mb-4">
          <i class="fas fa-file-upload"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ $t('verification.noVerifications') }}</h3>
        <p class="text-gray-600">{{ $t('verification.noVerificationsMessage') }}</p>
      </div>

      <div v-else class="divide-y divide-gray-200">
        <div 
          v-for="verification in verifications" 
          :key="verification.id"
          class="p-6 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-start space-x-4 space-x-reverse">
              <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <i class="fas fa-file-image text-gray-600 text-xl"></i>
              </div>
              
              <div class="flex-1">
                <div class="flex items-center space-x-3 space-x-reverse mb-2">
                  <h4 class="font-semibold text-gray-800">{{ getDocumentTypeName(verification.verification_type) }}</h4>
                  <span 
                    :class="[
                      'px-2 py-1 text-xs rounded-full font-medium',
                      getStatusClass(verification.status)
                    ]"
                  >
                    {{ getStatusName(verification.status) }}
                  </span>
                </div>
                
                <p class="text-sm text-gray-600 mb-2">
                  {{ $t('verification.uploadedOn') }}: {{ formatDate(verification.created_at) }}
                </p>
                
                <div v-if="verification.reviewed_at" class="text-sm text-gray-600 mb-2">
                  {{ $t('verification.reviewedOn') }}: {{ formatDate(verification.reviewed_at) }}
                </div>
                
                <div v-if="verification.rejection_reason" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <strong>{{ $t('verification.rejectionReason') }}:</strong> {{ verification.rejection_reason }}
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-2 space-x-reverse">
              <button
                @click="viewDocument(verification.document_url)"
                class="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                :title="$t('verification.viewDocument')"
              >
                <i class="fas fa-eye"></i>
              </button>
              
              <button
                v-if="verification.status === 'rejected'"
                @click="reuploadVerification(verification)"
                class="p-2 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                :title="$t('verification.reupload')"
              >
                <i class="fas fa-upload"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Document Viewer Modal -->
    <div v-if="showDocumentViewer" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-soft max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div class="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">{{ $t('verification.documentViewer') }}</h3>
          <button
            @click="showDocumentViewer = false"
            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="p-6">
          <img 
            :src="viewingDocumentUrl" 
            :alt="viewingDocumentType"
            class="w-full h-auto max-h-[70vh] object-contain rounded-lg"
          />
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
const verifications = ref([])
const loading = ref(false)
const uploading = ref(false)
const showDocumentViewer = ref(false)
const viewingDocumentUrl = ref('')
const viewingDocumentType = ref('')

// New verification form
const newVerification = reactive({
  type: '',
  file: null,
  preview: null
})

// Computed properties
const pendingCount = computed(() => 
  verifications.value.filter(v => v.status === 'pending').length
)

const approvedCount = computed(() => 
  verifications.value.filter(v => v.status === 'approved').length
)

const rejectedCount = computed(() => 
  verifications.value.filter(v => v.status === 'rejected').length
)

// Methods
const fetchVerifications = async () => {
  try {
    loading.value = true
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('verifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    verifications.value = data || []
  } catch (error) {
    console.error('Error fetching verifications:', error)
  } finally {
    loading.value = false
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    newVerification.file = file
    const reader = new FileReader()
    reader.onload = (e) => {
      newVerification.preview = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const uploadVerification = async () => {
  try {
    uploading.value = true

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      throw new Error('User not authenticated')
    }

    // Upload file to Supabase storage
    const fileName = `verification-${Date.now()}-${Math.random().toString(36).substring(2)}-${newVerification.file.name}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(fileName, newVerification.file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(fileName)

    // Create verification record
    const { data, error: verificationError } = await supabase
      .from('verifications')
      .upsert({
        user_id: session.user.id,
        verification_type: newVerification.type,
        document_url: publicUrl,
        status: 'pending'
      })
      .select()
      .single()

    if (verificationError) throw verificationError

    // Refresh verifications list
    await fetchVerifications()
    
    // Reset form
    resetForm()
    
  } catch (error) {
    console.error('Error uploading verification:', error)
    alert(error.message || 'Failed to upload verification')
  } finally {
    uploading.value = false
  }
}

const resetForm = () => {
  newVerification.type = ''
  newVerification.file = null
  newVerification.preview = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const viewDocument = (documentUrl) => {
  viewingDocumentUrl.value = documentUrl
  viewingDocumentType.value = 'Document'
  showDocumentViewer.value = true
}

const reuploadVerification = (verification) => {
  newVerification.type = verification.verification_type
  // Scroll to upload form
  document.querySelector('.bg-white.rounded-2xl.shadow-soft.p-6.mb-8').scrollIntoView({ behavior: 'smooth' })
}

const getDocumentTypeName = (type) => {
  const types = {
    'id_card': $t('verification.idCard'),
    'driving_license': $t('verification.drivingLicense'),
    'passport': $t('verification.passport'),
    'commerce_register': $t('verification.commerceRegister'),
    'payment_receipt': $t('verification.paymentReceipt')
  }
  return types[type] || type
}

const getStatusName = (status) => {
  const statuses = {
    'pending': $t('verification.pending'),
    'approved': $t('verification.approved'),
    'rejected': $t('verification.rejected')
  }
  return statuses[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
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

// Template refs
const fileInput = ref(null)

// Lifecycle
onMounted(() => {
  fetchVerifications()
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
