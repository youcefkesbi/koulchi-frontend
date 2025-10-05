<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-xl font-bold text-gray-900">{{ t('maystro.title') }}</h3>
        <p class="text-sm text-gray-600">{{ t('maystro.description') }}</p>
      </div>
      <div class="flex items-center space-x-3">
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            :checked="isEnabled"
            @change="handleToggle"
            :disabled="loading"
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
        <span class="text-sm font-medium text-gray-700">
          {{ isEnabled ? t('maystro.enabled') : t('maystro.disabled') }}
        </span>
      </div>
    </div>

    <!-- Integration Status -->
    <div v-if="integration" class="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
      <div class="flex items-center space-x-2 mb-2">
        <i class="fas fa-check-circle text-green-500"></i>
        <span class="text-sm font-medium text-green-800">{{ t('maystro.connected') }}</span>
      </div>
      <p class="text-sm text-green-700">{{ t('maystro.accountId') }}: {{ integration.account_id }}</p>
      <div class="mt-3 flex space-x-2">
        <button
          @click="openManageModal"
          class="btn-outline text-sm px-3 py-1"
        >
          {{ t('maystro.manageAccount') }}
        </button>
        <button
          @click="disconnect"
          class="btn-secondary text-sm px-3 py-1"
          :disabled="loading"
        >
          {{ t('maystro.disconnect') }}
        </button>
      </div>
    </div>

    <!-- No Integration Status -->
    <div v-else class="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div class="flex items-center space-x-2 mb-2">
        <i class="fas fa-info-circle text-gray-500"></i>
        <span class="text-sm font-medium text-gray-800">{{ t('maystro.notConnected') }}</span>
      </div>
      <p class="text-sm text-gray-700">{{ t('maystro.connectToStart') }}</p>
    </div>

    <!-- Connection Modal -->
    <div v-if="showConnectionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-900">{{ t('maystro.connectAccount') }}</h3>
          <button
            @click="closeConnectionModal"
            class="text-gray-400 hover:text-gray-600"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <p class="text-gray-600 mb-6">{{ t('maystro.chooseOption') }}</p>
        
        <div class="space-y-3">
          <button
            @click="createAccount"
            class="w-full btn-primary py-3"
          >
            <i class="fas fa-plus mr-2"></i>
            {{ t('maystro.createAccount') }}
          </button>
          
          <button
            @click="loginAccount"
            class="w-full btn-outline py-3"
          >
            <i class="fas fa-sign-in-alt mr-2"></i>
            {{ t('maystro.loginAccount') }}
          </button>
        </div>
        
        <div class="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
          <div class="flex items-start space-x-2">
            <i class="fas fa-info-circle text-primary-500 mt-0.5"></i>
            <div class="text-sm text-primary-700">
              <p class="font-medium mb-1">{{ t('maystro.howToConnect') }}</p>
              <p>{{ t('maystro.connectionSteps') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Credentials Modal -->
    <div v-if="showCredentialsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-900">{{ t('maystro.enterCredentials') }}</h3>
          <button
            @click="closeCredentialsModal"
            class="text-gray-400 hover:text-gray-600"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="submitCredentials" class="space-y-4">
          <div>
            <label class="form-label">{{ t('maystro.accountId') }}</label>
            <input
              v-model="credentials.accountId"
              type="text"
              required
              class="input-field"
              :placeholder="t('maystro.accountIdPlaceholder')"
            />
          </div>
          
          <div>
            <label class="form-label">{{ t('maystro.accessToken') }}</label>
            <input
              v-model="credentials.accessToken"
              type="text"
              required
              class="input-field"
              :placeholder="t('maystro.accessTokenPlaceholder')"
            />
          </div>
          
          <div>
            <label class="form-label">{{ t('maystro.refreshToken') }}</label>
            <input
              v-model="credentials.refreshToken"
              type="text"
              required
              class="input-field"
              :placeholder="t('maystro.refreshTokenPlaceholder')"
            />
          </div>
          
          <div>
            <label class="form-label">{{ t('maystro.expiresAt') }}</label>
            <input
              v-model="credentials.expiresAt"
              type="datetime-local"
              required
              class="input-field"
            />
          </div>
          
          <div class="flex space-x-3 pt-2">
            <button
              type="button"
              @click="closeCredentialsModal"
              class="btn-outline flex-1"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              type="submit"
              class="btn-primary flex-1"
              :disabled="loading"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              {{ t('maystro.connect') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/useAuthStore'
import MaystroClient from '../lib/maystro'

const { t } = useI18n()
const authStore = useAuthStore()

// Reactive state
const loading = ref(false)
const integration = ref(null)
const showConnectionModal = ref(false)
const showCredentialsModal = ref(false)
const credentials = ref({
  accountId: '',
  accessToken: '',
  refreshToken: '',
  expiresAt: ''
})

// Computed properties
const isEnabled = computed(() => {
  return integration.value?.enabled || false
})

// Methods
const fetchIntegration = async () => {
  try {
    const data = await MaystroClient.getIntegration()
    integration.value = data
  } catch (error) {
    console.error('Error fetching integration:', error)
  }
}

const handleToggle = async () => {
  if (!integration.value) {
    showConnectionModal.value = true
    return
  }

  try {
    loading.value = true
    const newEnabled = !isEnabled.value

    const updatedIntegration = await MaystroClient.updateStatus(newEnabled)
    if (updatedIntegration) {
      integration.value.enabled = newEnabled
    }
  } catch (error) {
    console.error('Error updating integration:', error)
  } finally {
    loading.value = false
  }
}

const createAccount = () => {
  window.open('https://beta.maystro-delivery.com/register', '_blank')
  closeConnectionModal()
  showCredentialsModal.value = true
}

const loginAccount = () => {
  window.open('https://beta.maystro-delivery.com/login', '_blank')
  closeConnectionModal()
  showCredentialsModal.value = true
}

const closeConnectionModal = () => {
  showConnectionModal.value = false
}

const closeCredentialsModal = () => {
  showCredentialsModal.value = false
  credentials.value = {
    accountId: '',
    accessToken: '',
    refreshToken: '',
    expiresAt: ''
  }
}

const submitCredentials = async () => {
  try {
    loading.value = true

    await MaystroClient.connect({
      accountId: credentials.value.accountId,
      accessToken: credentials.value.accessToken,
      refreshToken: credentials.value.refreshToken,
      expiresAt: credentials.value.expiresAt
    })

    // Refresh integration data
    await fetchIntegration()
    closeCredentialsModal()
  } catch (error) {
    console.error('Error connecting Maystro:', error)
  } finally {
    loading.value = false
  }
}

const disconnect = async () => {
  if (!confirm(t('maystro.disconnectConfirm'))) {
    return
  }

  try {
    loading.value = true

    await MaystroClient.disconnect()
    integration.value = null
  } catch (error) {
    console.error('Error disconnecting Maystro:', error)
  } finally {
    loading.value = false
  }
}

const openManageModal = () => {
  // For now, just show the disconnect option
  // In the future, this could open a more comprehensive management modal
}

// Lifecycle
onMounted(() => {
  if (authStore.user) {
    fetchIntegration()
  }
})
</script>

<style scoped>
/* Component-specific styles */
</style>
