<template>
  <div class="notification-settings bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">
          {{ $t('maystro.notifications.settings.title') }}
        </h3>
        <p class="text-sm text-gray-600 mt-1">
          {{ $t('maystro.notifications.settings.description') }}
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <i class="fas fa-spinner fa-spin text-blue-600 text-2xl mb-2"></i>
      <p class="text-gray-600">{{ $t('common.loading') }}</p>
    </div>

    <!-- Notification Preferences -->
    <div v-else class="space-y-4">
      <!-- Order Confirmation Notifications -->
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div class="flex-1">
          <div class="flex items-center">
            <i class="fas fa-check-circle text-blue-600 mr-3"></i>
            <div>
              <h4 class="text-sm font-medium text-gray-900">
                {{ $t('maystro.notifications.types.confirmation.title') }}
              </h4>
              <p class="text-xs text-gray-500 mt-1">
                {{ $t('maystro.notifications.types.confirmation.description') }}
              </p>
            </div>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            v-model="settings.enableConfirmation"
            type="checkbox"
            @change="updateSettings"
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      <!-- Order Shipped Notifications -->
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div class="flex-1">
          <div class="flex items-center">
            <i class="fas fa-truck text-purple-600 mr-3"></i>
            <div>
              <h4 class="text-sm font-medium text-gray-900">
                {{ $t('maystro.notifications.types.shipped.title') }}
              </h4>
              <p class="text-xs text-gray-500 mt-1">
                {{ $t('maystro.notifications.types.shipped.description') }}
              </p>
            </div>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            v-model="settings.enableShipped"
            type="checkbox"
            @change="updateSettings"
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      <!-- Order Delivered Notifications -->
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div class="flex-1">
          <div class="flex items-center">
            <i class="fas fa-box-check text-green-600 mr-3"></i>
            <div>
              <h4 class="text-sm font-medium text-gray-900">
                {{ $t('maystro.notifications.types.delivered.title') }}
              </h4>
              <p class="text-xs text-gray-500 mt-1">
                {{ $t('maystro.notifications.types.delivered.description') }}
              </p>
            </div>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            v-model="settings.enableDelivered"
            type="checkbox"
            @change="updateSettings"
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      <!-- Order Cancelled Notifications -->
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div class="flex-1">
          <div class="flex items-center">
            <i class="fas fa-times-circle text-red-600 mr-3"></i>
            <div>
              <h4 class="text-sm font-medium text-gray-900">
                {{ $t('maystro.notifications.types.cancelled.title') }}
              </h4>
              <p class="text-xs text-gray-500 mt-1">
                {{ $t('maystro.notifications.types.cancelled.description') }}
              </p>
            </div>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            v-model="settings.enableCancelled"
            type="checkbox"
            @change="updateSettings"
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      <!-- Urgent Delivery Notifications -->
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div class="flex-1">
          <div class="flex items-center">
            <i class="fas fa-exclamation-triangle text-orange-600 mr-3"></i>
            <div>
              <h4 class="text-sm font-medium text-gray-900">
                {{ $t('maystro.notifications.types.urgent.title') }}
              </h4>
              <p class="text-xs text-gray-500 mt-1">
                {{ $t('maystro.notifications.types.urgent.description') }}
              </p>
            </div>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            v-model="settings.enableUrgent"
            type="checkbox"
            @change="updateSettings"
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      <!-- Save Status Message -->
      <div v-if="saveStatus" class="mt-4">
        <div
          :class="[
            'p-3 rounded-md text-sm',
            saveStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          ]"
        >
          <i
            :class="[
              'mr-2',
              saveStatus.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'
            ]"
          ></i>
          {{ saveStatus.message }}
        </div>
      </div>
    </div>

    <!-- Test Notification Button -->
    <div class="mt-6 pt-6 border-t border-gray-200">
      <button
        @click="testNotification"
        :disabled="testing"
        class="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <i v-if="testing" class="fas fa-spinner fa-spin mr-2"></i>
        <i v-else class="fas fa-paper-plane mr-2"></i>
        {{ $t('maystro.notifications.test.title') }}
      </button>
      <p class="text-xs text-gray-500 mt-2 text-center">
        {{ $t('maystro.notifications.test.description') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineExpose } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '../lib/supabase'
import { useStoreStore } from '../stores/useStoresStore'
    const { t } = useI18n()
    const storeStore = useStoreStore()
    const loading = ref(false)
    const testing = ref(false)
    const saveStatus = ref(null)
    
    const settings = ref({
      enableConfirmation: true,
      enableShipped: true,
      enableDelivered: true,
      enableCancelled: true,
      enableUrgent: true
    })

    // Load notification settings from database or local storage
    const loadSettings = async () => {
      try {
        loading.value = true
        
        // Get current store
        const currentStore = storeStore.currentStore
        if (!currentStore) {
          console.warn('No current store found')
          return
        }

        // In the future, we can store settings in a database table
        // For now, use localStorage per store
        const storageKey = `notification_settings_${currentStore.id}`
        const savedSettings = localStorage.getItem(storageKey)
        
        if (savedSettings) {
          settings.value = { ...settings.value, ...JSON.parse(savedSettings) }
        }
      } catch (error) {
        console.error('Error loading notification settings:', error)
      } finally {
        loading.value = false
      }
    }

    // Update notification settings
    const updateSettings = async () => {
      try {
        const currentStore = storeStore.currentStore
        if (!currentStore) {
          throw new Error('No current store found')
        }

        // Save to localStorage (can be migrated to database later)
        const storageKey = `notification_settings_${currentStore.id}`
        localStorage.setItem(storageKey, JSON.stringify(settings.value))

        // Show success message
        saveStatus.value = {
          type: 'success',
          message: t('maystro.notifications.settings.saved')
        }

        // Clear message after 3 seconds
        setTimeout(() => {
          saveStatus.value = null
        }, 3000)
      } catch (error) {
        console.error('Error updating notification settings:', error)
        saveStatus.value = {
          type: 'error',
          message: t('maystro.notifications.settings.error')
        }
      }
    }

    // Test notification
    const testNotification = async () => {
      try {
        testing.value = true
        
        const session = await supabase.auth.getSession()
        if (!session.data.session) {
          throw new Error('Not authenticated')
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/notifications/test`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.data.session.access_token}`
          },
          body: JSON.stringify({
            storeId: storeStore.currentStore?.id
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to send test notification')
        }

        const result = await response.json()
        
        saveStatus.value = {
          type: 'success',
          message: t('maystro.notifications.test.success')
        }

        setTimeout(() => {
          saveStatus.value = null
        }, 5000)
      } catch (error) {
        console.error('Error testing notification:', error)
        saveStatus.value = {
          type: 'error',
          message: t('maystro.notifications.test.error') + ': ' + error.message
        }
      } finally {
        testing.value = false
      }
    }

    // Check if a notification type is enabled
    const isNotificationEnabled = (type) => {
      const typeMap = {
        confirmation: 'enableConfirmation',
        shipped: 'enableShipped',
        delivered: 'enableDelivered',
        cancelled: 'enableCancelled',
        urgent: 'enableUrgent'
      }
      return settings.value[typeMap[type]] ?? true
    }

    onMounted(() => {
      loadSettings()
    })

    // Expose method for parent component access
    defineExpose({
      isNotificationEnabled
    })
</script>

<style scoped>
/* Component styles */
</style>

