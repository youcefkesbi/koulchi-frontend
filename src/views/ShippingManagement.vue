<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="md:flex md:items-center md:justify-between">
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {{ $t('maystro.shipping.title') }}
            </h2>
            <p class="mt-1 text-sm text-gray-500">
              {{ $t('maystro.shipping.description') }}
            </p>
          </div>
          <div class="mt-4 flex md:mt-0 md:ml-4">
            <button
              @click="refreshIntegrations"
              :disabled="loading"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <svg class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ $t('common.refresh') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Loading State -->
        <div v-if="loading && !integrations.length" class="text-center py-12">
          <i class="fas fa-spinner fa-spin text-blue-600 text-3xl mb-4"></i>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ $t('common.loading') }}</h3>
          <p class="text-gray-600">{{ $t('maystro.shipping.loadingIntegrations') }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="rounded-md bg-red-50 p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
            </div>
          </div>
        </div>

        <!-- Integrations List -->
        <div v-else-if="integrations.length > 0" class="space-y-6">
          <div
            v-for="integration in integrations"
            :key="integration.id"
            class="bg-white shadow rounded-lg p-6"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">
                    {{ getProviderName(integration.provider) }}
                  </h3>
                  <p class="text-sm text-gray-500">
                    {{ $t('maystro.shipping.connectedSince') }}: {{ formatDate(integration.created_at) }}
                  </p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    integration.enabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ integration.enabled ? $t('maystro.shipping.enabled') : $t('maystro.shipping.disabled') }}
                </span>
                <button
                  @click="toggleIntegration(integration)"
                  :disabled="loading"
                  class="text-indigo-600 hover:text-indigo-900 text-sm font-medium disabled:opacity-50"
                >
                  {{ integration.enabled ? $t('maystro.shipping.disable') : $t('maystro.shipping.enable') }}
                </button>
                <button
                  @click="disconnectIntegration(integration)"
                  :disabled="loading"
                  class="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                >
                  {{ $t('maystro.shipping.disconnect') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('maystro.shipping.noIntegrations') }}</h3>
          <p class="mt-1 text-sm text-gray-500">{{ $t('maystro.shipping.noIntegrationsDescription') }}</p>
          <div class="mt-6">
            <button
              @click="showAddIntegrationModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {{ $t('maystro.shipping.addIntegration') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Integration Modal -->
    <div
      v-if="showAddIntegrationModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {{ $t('maystro.shipping.addIntegration') }}
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    {{ $t('maystro.shipping.chooseProvider') }}
                  </p>
                </div>

                <!-- Provider Options -->
                <div class="mt-6 space-y-4">
                  <div
                    v-for="provider in availableProviders"
                    :key="provider.id"
                    @click="selectProvider(provider)"
                    class="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </div>
                      </div>
                      <div class="ml-3">
                        <h4 class="text-sm font-medium text-gray-900">{{ provider.name }}</h4>
                        <p class="text-sm text-gray-500">{{ provider.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="showAddIntegrationModal = false"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {{ $t('common.cancel') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { maystroClient } from '../lib/maystro'

export default {
  name: 'ShippingManagement',
  setup() {
    const { t } = useI18n()
    
    // Reactive state
    const loading = ref(false)
    const error = ref(null)
    const integrations = ref([])
    const showAddIntegrationModal = ref(false)
    
    // Available providers
    const availableProviders = ref([
      {
        id: 'maystro',
        name: 'Maystro Delivery',
        description: 'Automated delivery management service'
      }
    ])

    // Methods
    const loadIntegrations = async () => {
      try {
        loading.value = true
        error.value = null
        
        // Get all integrations for the current user
        const { data, error: fetchError } = await supabase
          .from('seller_shipping')
          .select('*')
          .order('created_at', { ascending: false })

        if (fetchError) {
          throw new Error(fetchError.message)
        }

        integrations.value = data || []
      } catch (err) {
        error.value = err.message
        console.error('Error loading integrations:', err)
      } finally {
        loading.value = false
      }
    }

    const refreshIntegrations = async () => {
      await loadIntegrations()
    }

    const toggleIntegration = async (integration) => {
      try {
        loading.value = true
        error.value = null

        const result = await maystroClient.updateStatus(!integration.enabled)
        
        if (result.success) {
          await loadIntegrations()
        } else {
          error.value = result.message
        }
      } catch (err) {
        error.value = err.message
        console.error('Error toggling integration:', err)
      } finally {
        loading.value = false
      }
    }

    const disconnectIntegration = async (integration) => {
      if (confirm(t('maystro.shipping.confirmDisconnect'))) {
        try {
          loading.value = true
          error.value = null

          const result = await maystroClient.disconnect()
          
          if (result.success) {
            await loadIntegrations()
          } else {
            error.value = result.message
          }
        } catch (err) {
          error.value = err.message
          console.error('Error disconnecting integration:', err)
        } finally {
          loading.value = false
        }
      }
    }

    const selectProvider = (provider) => {
      showAddIntegrationModal.value = false
      // For now, we only support Maystro
      // In the future, this could redirect to provider-specific setup
      if (provider.id === 'maystro') {
        // Redirect to store dashboard where MaystroIntegration component is available
        window.location.href = '/dashboard'
      }
    }

    const getProviderName = (provider) => {
      const providerInfo = availableProviders.value.find(p => p.id === provider)
      return providerInfo ? providerInfo.name : provider
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString()
    }

    // Lifecycle
    onMounted(() => {
      loadIntegrations()
    })

    return {
      loading,
      error,
      integrations,
      showAddIntegrationModal,
      availableProviders,
      loadIntegrations,
      refreshIntegrations,
      toggleIntegration,
      disconnectIntegration,
      selectProvider,
      getProviderName,
      formatDate
    }
  }
}
</script>
