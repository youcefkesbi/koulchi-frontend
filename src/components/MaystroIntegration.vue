<template>
  <div class="maystro-integration">
    <!-- Toggle Section -->
    <div class="toggle-section">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">
            {{ $t('maystro.integration.title') }}
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            {{ $t('maystro.integration.description') }}
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <span class="text-sm text-gray-600">
            {{ isEnabled ? $t('maystro.integration.enabled') : $t('maystro.integration.disabled') }}
          </span>
          <button
            @click="handleToggle"
            :disabled="loading"
            :class="[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
              isEnabled ? 'bg-indigo-600' : 'bg-gray-200'
            ]"
          >
            <span
              :class="[
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              ]"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Status Display -->
    <div v-if="hasIntegration" class="mt-4">
      <div
        :class="[
          'rounded-md p-4',
          integrationStatus.connected && integrationStatus.enabled
            ? 'bg-green-50 border border-green-200'
            : 'bg-yellow-50 border border-yellow-200'
        ]"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              v-if="integrationStatus.connected && integrationStatus.enabled"
              class="h-5 w-5 text-green-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else
              class="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium">
              {{ integrationStatus.message }}
            </h3>
            <div v-if="integrationStatus.integration" class="mt-2 text-sm text-gray-600">
              <p>
                {{ $t('maystro.integration.connectedSince') }}: 
                {{ formatDate(integrationStatus.integration.created_at) }}
              </p>
              <p v-if="integrationStatus.integration.expires_at">
                {{ $t('maystro.integration.expiresAt') }}: 
                {{ formatDate(integrationStatus.integration.expires_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="mt-4 flex space-x-3">
      <button
        v-if="!hasIntegration || !isEnabled"
        @click="showConnectionModal = true"
        :disabled="loading"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        {{ $t('maystro.integration.connect') }}
      </button>

      <button
        v-if="hasIntegration && isEnabled"
        @click="handleDisconnect"
        :disabled="loading"
        class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        {{ $t('maystro.integration.disconnect') }}
      </button>

      <button
        v-if="hasIntegration && isEnabled"
        @click="showConnectionModal = true"
        :disabled="loading"
        class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {{ $t('maystro.integration.manage') }}
      </button>
    </div>

    <!-- Connection Modal -->
    <div
      v-if="showConnectionModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500/75 transition-opacity modal-backdrop" aria-hidden="true"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full modal-content">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex justify-between items-start mb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {{ $t('maystro.modal.title') }}
                </h3>
                <button
                  @click="showConnectionModal = false"
                  class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    {{ $t('maystro.modal.description') }}
                  </p>
                </div>

                <!-- Connection Options -->
                <div class="mt-6 space-y-4">
                  <div class="flex space-x-4">
                    <button
                      @click="createAccount"
                      class="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {{ $t('maystro.modal.createAccount') }}
                    </button>
                    <button
                      @click="loginAccount"
                      class="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      {{ $t('maystro.modal.loginAccount') }}
                    </button>
                  </div>

                  <!-- Credentials Form -->
                  <div v-if="showCredentialsForm" class="mt-6">
                    <form @submit.prevent="submitCredentials" class="space-y-4">
                      <div>
                        <label for="accountId" class="block text-sm font-medium text-gray-700">
                          {{ $t('maystro.form.accountId') }}
                        </label>
                        <input
                          v-model="credentialsForm.accountId"
                          type="text"
                          id="accountId"
                          required
                          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          :placeholder="$t('maystro.form.accountIdPlaceholder')"
                        />
                      </div>

                      <div>
                        <label for="accessToken" class="block text-sm font-medium text-gray-700">
                          {{ $t('maystro.form.accessToken') }}
                        </label>
                        <input
                          v-model="credentialsForm.accessToken"
                          type="text"
                          id="accessToken"
                          required
                          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          :placeholder="$t('maystro.form.accessTokenPlaceholder')"
                        />
                      </div>

                      <div>
                        <label for="refreshToken" class="block text-sm font-medium text-gray-700">
                          {{ $t('maystro.form.refreshToken') }}
                        </label>
                        <input
                          v-model="credentialsForm.refreshToken"
                          type="text"
                          id="refreshToken"
                          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          :placeholder="$t('maystro.form.refreshTokenPlaceholder')"
                        />
                      </div>

                      <div>
                        <label for="expiresAt" class="block text-sm font-medium text-gray-700">
                          {{ $t('maystro.form.expiresAt') }}
                        </label>
                        <input
                          v-model="credentialsForm.expiresAt"
                          type="datetime-local"
                          id="expiresAt"
                          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div class="flex justify-end space-x-3">
                        <button
                          type="button"
                          @click="showCredentialsForm = false"
                          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          {{ $t('common.cancel') }}
                        </button>
                        <button
                          type="submit"
                          :disabled="loading"
                          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                          {{ loading ? $t('common.connecting') : $t('maystro.form.connect') }}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="mt-4 rounded-md bg-red-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">
            {{ error }}
          </h3>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { maystroClient } from '../lib/maystro'
import { useStoreStore } from '../stores/useStoresStore'

export default {
  name: 'MaystroIntegration',
  setup() {
    const { t } = useI18n()
    const storesStore = useStoreStore()
    
    // Reactive state
    const loading = ref(false)
    const error = ref(null)
    const integrationStatus = ref(null)
    const showConnectionModal = ref(false)
    const showCredentialsForm = ref(false)
    
    // Get current store
    const currentStore = computed(() => storesStore.currentStore)
    
    // Credentials form
    const credentialsForm = ref({
      accountId: '',
      accessToken: '',
      refreshToken: '',
      expiresAt: ''
    })

    // Computed properties
    const isEnabled = computed(() => {
      return integrationStatus.value?.connected && integrationStatus.value?.enabled
    })

    // Show connect button by default (no existing integration)
    const hasIntegration = computed(() => {
      return integrationStatus.value !== null
    })


    // Methods
    const loadIntegrationStatus = async () => {
      try {
        loading.value = true
        error.value = null
        
        console.log('🔍 MaystroIntegration - Current store:', currentStore.value)
        console.log('🔍 MaystroIntegration - Store ID:', currentStore.value?.id)
        
        // Since user is on StoreDashboard, they must have an approved store
        if (!currentStore.value?.id) {
          console.warn('⚠️ MaystroIntegration - No approved store available')
          throw new Error('No approved store found. Please ensure your store is approved before connecting to Maystro.')
        }
        
        console.log('🔍 MaystroIntegration - Loading integration for store:', currentStore.value.id)
        integrationStatus.value = await maystroClient.getIntegration()
      } catch (err) {
        error.value = err.message
        console.error('Error loading integration status:', err)
      } finally {
        loading.value = false
      }
    }

    const handleToggle = async () => {
      try {
        loading.value = true
        error.value = null

        if (isEnabled.value) {
          // Disable integration
          const result = await maystroClient.updateStatus(false)
          if (result.success) {
            await loadIntegrationStatus()
          } else {
            error.value = result.message
          }
        } else {
          // Show connection modal
          console.log('🔍 MaystroIntegration - Showing connection modal')
          showConnectionModal.value = true
          console.log('🔍 MaystroIntegration - Modal state:', showConnectionModal.value)
        }
      } catch (err) {
        error.value = err.message
        console.error('Error toggling integration:', err)
      } finally {
        loading.value = false
      }
    }

    const createAccount = () => {
      // Open Maystro registration page in new tab
      window.open('https://beta.maystro-delivery.com/register', '_blank')
      showCredentialsForm.value = true
    }

    const loginAccount = () => {
      // Open Maystro login page in new tab
      window.open('https://beta.maystro-delivery.com/login', '_blank')
      showCredentialsForm.value = true
    }

    const submitCredentials = async () => {
      try {
        loading.value = true
        error.value = null

        if (!currentStore.value?.id) {
          throw new Error('No approved store found. Please ensure your store is approved before connecting to Maystro.')
        }

        const result = await maystroClient.connect(credentialsForm.value)
        
        if (result.success) {
          showConnectionModal.value = false
          showCredentialsForm.value = false
          credentialsForm.value = {
            accountId: '',
            accessToken: '',
            refreshToken: '',
            expiresAt: ''
          }
          await loadIntegrationStatus()
        } else {
          error.value = result.message
        }
      } catch (err) {
        error.value = err.message
        console.error('Error submitting credentials:', err)
      } finally {
        loading.value = false
      }
    }

    const handleDisconnect = async () => {
      if (confirm(t('maystro.integration.confirmDisconnect'))) {
        try {
          loading.value = true
          error.value = null

          if (!currentStore.value?.id) {
            throw new Error('No approved store found. Please ensure your store is approved before disconnecting from Maystro.')
          }
          const result = await maystroClient.disconnect()
          
          if (result.success) {
            await loadIntegrationStatus()
          } else {
            error.value = result.message
          }
        } catch (err) {
          error.value = err.message
          console.error('Error disconnecting:', err)
        } finally {
          loading.value = false
        }
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString()
    }

    // Watch for store changes but don't load integration status immediately
    watch(currentStore, (newStore) => {
      console.log('🔍 MaystroIntegration - Store changed:', newStore)
      if (newStore?.id) {
        console.log('🔍 MaystroIntegration - Store available')
        // Don't load integration status immediately - only when user actually connects
      }
    }, { immediate: false })

    // Lifecycle
    onMounted(() => {
      console.log('🔍 MaystroIntegration - Component mounted')
      // Don't load integration status on mount - let user initiate the connection
      console.log('🔍 MaystroIntegration - Ready for user to connect')
    })

    return {
      loading,
      error,
      integrationStatus,
      showConnectionModal,
      showCredentialsForm,
      credentialsForm,
      isEnabled,
      hasIntegration,
      handleToggle,
      createAccount,
      loginAccount,
      submitCredentials,
      handleDisconnect,
      formatDate
    }
  }
}
</script>

<style scoped>
.maystro-integration {
  background-color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

/* Ensure modal is visible and properly positioned */
.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Fix for Tailwind v4 compatibility */
input:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

button:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
</style>