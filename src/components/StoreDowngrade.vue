<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-soft border-b border-gray-100">
      <div class="container mx-auto px-4 py-6 flex items-center space-x-4">
        <router-link :to="getLocalizedPath('/subscription')" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <i class="fas fa-arrow-left text-xl"></i>
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-800">{{ $t('stores.downgradeToBasic') || 'Downgrade to Basic Pack' }}</h1>
          <p class="text-gray-600">{{ $t('stores.downgradeDescription') || 'Downgrade your store to Basic Pack' }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-soft p-8">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-primary text-3xl mb-4"></i>
          <p class="text-gray-600">{{ $t('common.loading') || 'Loading...' }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <i class="fas fa-exclamation-circle text-red-500 text-xl mb-2"></i>
          <p class="text-red-700">{{ errorMessage }}</p>
        </div>

        <!-- Success State -->
        <div v-else-if="successMessage" class="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <i class="fas fa-check-circle text-green-500 text-xl mb-2"></i>
          <p class="text-green-700">{{ successMessage }}</p>
        </div>

        <!-- Downgrade Confirmation -->
        <div v-else class="space-y-6">
          <!-- Warning Message -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div class="flex items-start">
              <i class="fas fa-exclamation-triangle text-yellow-600 text-2xl mr-4 mt-1"></i>
              <div>
                <h3 class="font-semibold text-yellow-800 mb-2">{{ $t('stores.downgradeWarning') || 'Important: Downgrade Warning' }}</h3>
                <p class="text-sm text-yellow-700 mb-2">
                  {{ $t('stores.downgradeWarningMessage') || 'You are about to downgrade from Pro Pack to Basic Pack.' }}
                </p>
                <ul class="text-sm text-yellow-700 list-disc list-inside space-y-1">
                  <li>{{ $t('stores.downgradeFeature1') || 'Pro features will be disabled (custom branding, advanced analytics, unlimited social links)' }}</li>
                  <li v-if="limitWarning">
                    {{ $t('stores.downgradeFeature2') || 'You have' }} {{ currentSubscription.current_announcements }} {{ $t('stores.downgradeFeature3') || 'products, Basic plan allows' }} {{ basicPackData.max_announcements }}. {{ $t('stores.downgradeFeature4') || 'Existing products will remain active (grandfathered), but you cannot add more until below limit.' }}
                  </li>
                  <li v-else>
                    {{ $t('stores.downgradeFeature5') || 'All your existing products will remain active (grandfathered)' }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Current Pack Info -->
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('stores.currentPlan') || 'Current Plan' }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600 mb-1">{{ $t('subscription.packName') || 'Pack Name' }}</p>
                <p class="text-xl font-bold text-primary">{{ currentPackName }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">{{ $t('subscription.announcements') || 'Announcements' }}</p>
                <p class="text-lg font-semibold text-gray-900">
                  {{ currentSubscription.current_announcements }} / {{ currentSubscription.max_announcements }}
                </p>
              </div>
            </div>
          </div>

          <!-- New Pack Info -->
          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('stores.newPlan') || 'New Plan' }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600 mb-1">{{ $t('subscription.packName') || 'Pack Name' }}</p>
                <p class="text-xl font-bold text-gray-900">{{ basicPackName }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">{{ $t('subscription.announcements') || 'Announcements' }}</p>
                <p class="text-lg font-semibold text-gray-900">
                  {{ currentSubscription.current_announcements }} / {{ basicPackData.max_announcements }}
                  <span v-if="limitWarning" class="text-yellow-600 text-sm ml-2">({{ $t('stores.grandfathered') || 'Grandfathered' }})</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Confirmation Checkbox -->
          <div class="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <label class="flex items-start space-x-3 cursor-pointer">
              <input
                v-model="confirmed"
                type="checkbox"
                class="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span class="text-sm text-gray-700">
                {{ $t('stores.downgradeConfirmation') || 'I understand that I am downgrading to Basic Pack and Pro features will be disabled. I confirm that I want to proceed with the downgrade.' }}
              </span>
            </label>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <router-link
              :to="getLocalizedPath('/subscription')"
              class="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              {{ $t('common.cancel') || 'Cancel' }}
            </router-link>
            <button
              @click="handleDowngrade"
              :disabled="!confirmed || loading"
              :class="[
                'px-6 py-3 rounded-lg transition-colors',
                confirmed && !loading
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-400 cursor-not-allowed text-white'
              ]"
            >
              <span v-if="loading" class="flex items-center">
                <i class="fas fa-spinner fa-spin mr-2"></i>
                {{ $t('stores.downgrading') || 'Downgrading...' }}
              </span>
              <span v-else>
                {{ $t('stores.confirmDowngrade') || 'Confirm Downgrade' }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/useAuthStore'
import { useLocaleRouter } from '../composables/useLocaleRouter'
import { supabase } from '../lib/supabase'

const router = useRouter()
const { t, locale } = useI18n()
const authStore = useAuthStore()
const { navigateToPath, getLocalizedPath } = useLocaleRouter()

// Props
const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

// State
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const confirmed = ref(false)
const currentSubscription = ref(null)
const basicPackData = ref(null)

// Computed
const currentPackName = computed(() => {
  if (!currentSubscription.value) return ''
  const currentLocale = locale.value
  if (currentLocale === 'ar' && currentSubscription.value.pack_name_ar) {
    return currentSubscription.value.pack_name_ar
  }
  if (currentLocale === 'fr' && currentSubscription.value.pack_name_fr) {
    return currentSubscription.value.pack_name_fr
  }
  return currentSubscription.value.pack_name_en || 'No Pack'
})

const basicPackName = computed(() => {
  if (!basicPackData.value) return ''
  const currentLocale = locale.value
  if (currentLocale === 'ar' && basicPackData.value.name_ar) {
    return basicPackData.value.name_ar
  }
  if (currentLocale === 'fr' && basicPackData.value.name_fr) {
    return basicPackData.value.name_fr
  }
  return basicPackData.value.name_en || 'Basic Pack'
})

const limitWarning = computed(() => {
  if (!currentSubscription.value || !basicPackData.value) return false
  return currentSubscription.value.current_announcements > basicPackData.value.max_announcements
})

// Fetch current store and Basic pack
const fetchStoreAndPack = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    // Fetch current store
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('*, packs(*)')
      .eq('id', props.id)
      .single()

    if (storeError) throw storeError

    // Verify store is Pro pack
    if (storeData.packs?.type !== 'pro') {
      throw new Error('Store is not on Pro pack. Cannot downgrade.')
    }

    // Build current subscription data
    currentSubscription.value = {
      pack_id: storeData.pack_id,
      pack_name_en: storeData.packs.name_en,
      pack_name_ar: storeData.packs.name_ar,
      pack_name_fr: storeData.packs.name_fr,
      current_announcements: storeData.current_announcements || 0,
      max_announcements: storeData.packs.max_announcements || 0
    }

    // Fetch Basic pack
    const { data: packsData, error: packsError } = await supabase
      .from('packs')
      .select('*')
      .eq('is_active', true)
      .eq('type', 'basic')
      .order('price', { ascending: true })
      .limit(1)

    if (packsError) throw packsError

    if (!packsData || packsData.length === 0) {
      throw new Error('Basic pack not found')
    }

    basicPackData.value = packsData[0]
  } catch (err) {
    console.error('Error fetching store and pack:', err)
    errorMessage.value = err?.message || 'Failed to load store information'
  } finally {
    loading.value = false
  }
}

// Handle downgrade
const handleDowngrade = async () => {
  try {
    if (!confirmed.value) {
      errorMessage.value = t('stores.confirmDowngradeFirst') || 'Please confirm the downgrade'
      return
    }

    loading.value = true
    successMessage.value = ''
    errorMessage.value = ''

    if (!authStore.isAuthenticated || !authStore.user?.id) {
      throw new Error('Not authenticated')
    }

    if (!basicPackData.value) {
      throw new Error('Basic pack data not loaded')
    }

    console.log('🔄 Downgrading store...')
    
    // Call RPC function
    const { data, error: rpcError } = await supabase
      .rpc('downgrade_store_to_basic', {
        p_store_id: props.id,
        p_owner_id: authStore.user.id,
        p_pack_id: basicPackData.value.id
      })

    if (rpcError) {
      throw new Error(`Failed to downgrade store: ${rpcError.message}`)
    }

    console.log('✅ Store downgraded successfully')
    successMessage.value = t('stores.downgradeSuccess') || 'Store downgraded successfully! You are now on Basic Pack.'

    // Redirect to subscription page after 2 seconds
    setTimeout(() => {
      navigateToPath('/subscription')
    }, 2000)

    loading.value = false
  } catch (error) {
    console.error('Error downgrading store:', error)
    errorMessage.value = error?.message || 'Failed to downgrade store'
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await fetchStoreAndPack()
})
</script>

