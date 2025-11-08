<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">{{ $t('subscription.title') || 'Subscription History' }}</h1>
        <p class="mt-2 text-gray-600">{{ $t('subscription.subtitle') || 'View your current subscription and subscription history' }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-2xl shadow-soft p-8 text-center">
        <i class="fas fa-spinner fa-spin text-primary text-3xl mb-4"></i>
        <p class="text-gray-600">{{ $t('common.loading') || 'Loading...' }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-2xl shadow-soft p-8">
        <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <i class="fas fa-exclamation-circle text-red-500 text-2xl mb-2"></i>
          <p class="text-red-700">{{ error }}</p>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="space-y-6">
        <!-- Pending Approval Message -->
        <div v-if="currentSubscription && currentSubscription.store_status === 'pending'" class="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <i class="fas fa-clock text-yellow-600 text-2xl mr-4"></i>
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-yellow-800 mb-2">{{ $t('subscription.pendingApproval') || 'Store Pending Approval' }}</h3>
              <p class="text-sm text-yellow-700 mb-3">{{ $t('subscription.subscriptionWillBeCreated') || 'Your subscription will be created once your store is approved by an employee.' }}</p>
              <p class="text-sm text-yellow-700">{{ $t('subscription.productsWillBeMigrated') || 'Products will be migrated after approval.' }}</p>
            </div>
          </div>
        </div>

        <!-- Current Subscription Card -->
        <div v-if="currentSubscription" class="bg-white rounded-2xl shadow-soft p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">{{ $t('subscription.currentSubscription') || 'Current Subscription' }}</h2>
            <span 
              :class="[
                'px-3 py-1 rounded-full text-sm font-semibold',
                currentSubscription.store_status === 'approved' 
                  ? 'bg-green-100 text-green-800' 
                  : currentSubscription.store_status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              ]"
            >
              {{ currentSubscription.store_status }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Pack Info -->
            <div class="space-y-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ $t('subscription.packName') || 'Pack Name' }}</h3>
                <p class="text-xl font-bold text-primary">{{ currentPackName }}</p>
              </div>

              <div>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ $t('subscription.price') || 'Price' }}</h3>
                <p class="text-2xl font-bold text-gray-900">
                  {{ currentSubscription.pack_price === 0 ? ($t('subscription.free') || 'Free') : `${currentSubscription.pack_price} DZD` }}
                </p>
              </div>

              <div v-if="currentSubscription.store_status === 'approved'">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ $t('subscription.subscriptionDate') || 'Subscription Date' }}</h3>
                <p class="text-gray-700">{{ formatDate(currentSubscription.subscription_start) }}</p>
              </div>
              <div v-else>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ $t('subscription.subscriptionDate') || 'Subscription Date' }}</h3>
                <p class="text-gray-700 text-yellow-600">{{ $t('subscription.pending') || 'Pending' }}</p>
              </div>
            </div>

            <!-- Usage Stats -->
            <div class="space-y-4" v-if="currentSubscription.store_status === 'approved'">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-lg font-semibold text-gray-800">{{ $t('subscription.announcements') || 'Announcements' }}</h3>
                  <span class="text-sm text-gray-600">
                    {{ currentSubscription.current_announcements }} / {{ currentSubscription.max_announcements }}
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    class="bg-primary h-3 rounded-full transition-all"
                    :style="{ width: `${(currentSubscription.current_announcements / currentSubscription.max_announcements) * 100}%` }"
                  ></div>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-lg font-semibold text-gray-800">{{ $t('subscription.images') || 'Images' }}</h3>
                  <span class="text-sm text-gray-600">
                    {{ currentSubscription.current_images }} / {{ currentSubscription.max_images }}
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    class="bg-primary h-3 rounded-full transition-all"
                    :style="{ width: `${(currentSubscription.current_images / currentSubscription.max_images) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
            <div v-else class="space-y-4">
              <div class="text-sm text-gray-500 italic">
                {{ $t('subscription.statsWillBeAvailable') || 'Usage statistics will be available after approval.' }}
              </div>
            </div>
          </div>

          <!-- Pack Features -->
          <div v-if="currentSubscription.pack_features && Object.keys(currentSubscription.pack_features).length > 0" class="mt-6 pt-6 border-t border-gray-200">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('subscription.features') || 'Features' }}</h3>
            <ul class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <li 
                v-for="(feature, index) in currentPackFeatures" 
                :key="index"
                class="flex items-start space-x-2"
              >
                <i class="fas fa-check text-green-500 mt-1"></i>
                <span class="text-gray-700">{{ feature }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- No Current Subscription -->
        <div v-else class="bg-white rounded-2xl shadow-soft p-8 text-center">
          <i class="fas fa-store-slash text-gray-400 text-6xl mb-4"></i>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ $t('subscription.noSubscription') || 'No Active Subscription' }}</h3>
          <p class="text-gray-600 mb-4">{{ $t('subscription.noSubscriptionMessage') || 'You don\'t have an active subscription yet.' }}</p>
          <router-link
            :to="getLocalizedPath('/dashboard/store/create')"
            class="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            {{ $t('subscription.createStore') || 'Create Store' }}
          </router-link>
        </div>

        <!-- Subscription History -->
        <div class="bg-white rounded-2xl shadow-soft p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ $t('subscription.history') || 'Subscription History' }}</h2>
          
          <div v-if="subscriptionHistory.length === 0" class="text-center py-8">
            <i class="fas fa-history text-gray-400 text-4xl mb-4"></i>
            <p class="text-gray-600">{{ $t('subscription.noHistory') || 'No subscription history found' }}</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ $t('subscription.date') || 'Date' }}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ $t('subscription.planType') || 'Plan Type' }}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ $t('subscription.status') || 'Status' }}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ $t('subscription.duration') || 'Duration' }}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ $t('subscription.endDate') || 'End Date' }}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="subscription in subscriptionHistory" :key="subscription.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(subscription.start_date) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ subscription.plan_type }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      :class="[
                        'px-2 py-1 text-xs font-semibold rounded-full',
                        subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                        subscription.status === 'expired' ? 'bg-red-100 text-red-800' :
                        subscription.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      ]"
                    >
                      {{ subscription.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {{ calculateDuration(subscription.start_date, subscription.end_date) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {{ subscription.end_date ? formatDate(subscription.end_date) : ($t('subscription.lifetime') || 'Lifetime') }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Upgrade/Downgrade History -->
        <div class="bg-white rounded-2xl shadow-soft p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ $t('subscription.upgradeDowngradeHistory') || 'Upgrade/Downgrade History' }}</h2>
          
          <div v-if="upgradeHistory.length === 0" class="text-center py-8">
            <i class="fas fa-exchange-alt text-gray-400 text-4xl mb-4"></i>
            <p class="text-gray-600">{{ $t('subscription.noUpgradeHistory') || 'No upgrade/downgrade history found' }}</p>
          </div>

          <div v-else class="space-y-4">
            <div 
              v-for="(change, index) in upgradeHistory" 
              :key="index"
              class="border-l-4 pl-4 py-2"
              :class="change.type === 'upgrade' ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-semibold text-gray-900">
                    <i 
                      :class="change.type === 'upgrade' ? 'fas fa-arrow-up text-green-600' : 'fas fa-arrow-down text-blue-600'"
                      class="mr-2"
                    ></i>
                    {{ change.type === 'upgrade' ? ($t('subscription.upgraded') || 'Upgraded') : ($t('subscription.downgraded') || 'Downgraded') }}
                    {{ $t('subscription.from') || 'from' }} <span class="text-gray-700">{{ change.from }}</span>
                    {{ $t('subscription.to') || 'to' }} <span class="text-gray-700">{{ change.to }}</span>
                  </p>
                  <p class="text-sm text-gray-600 mt-1">{{ formatDate(change.date) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/useAuthStore'
import { useLocaleRouter } from '../composables/useLocaleRouter'
import { supabase } from '../lib/supabase'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const { getLocalizedPath } = useLocaleRouter()

// State
const loading = ref(true)
const error = ref(null)
const currentSubscription = ref(null)
const subscriptionHistory = ref([])
const upgradeHistory = ref([])

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

const currentPackFeatures = computed(() => {
  if (!currentSubscription.value?.pack_features) return []
  const currentLocale = locale.value
  const features = currentSubscription.value.pack_features[currentLocale] || 
                   currentSubscription.value.pack_features['en'] || 
                   []
  return Array.isArray(features) ? features : []
})

// Methods
const fetchCurrentSubscription = async () => {
  try {
    if (!authStore.isAuthenticated || !authStore.user?.id) {
      error.value = t('subscription.notAuthenticated') || 'Please log in to view your subscription'
      return
    }

    // Fetch current store with pack details
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select(`
        id,
        pack_id,
        status,
        created_at,
        current_announcements,
        current_images,
        packs (
          id,
          name_en,
          name_ar,
          name_fr,
          price,
          max_announcements,
          max_images
        )
      `)
      .eq('owner_id', authStore.user.id)
      .in('status', ['pending', 'approved'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (storeError && storeError.code !== 'PGRST116') {
      throw storeError
    }

    // Fetch pack features separately using relational structure
    let packFeatures = { en: [], ar: [], fr: [] }
    if (storeData && storeData.packs && storeData.packs.id) {
      const { data: featuresData, error: featuresError } = await supabase
        .from('pack_features')
        .select(`
          is_enabled,
          features (
            name_en,
            name_ar,
            name_fr
          )
        `)
        .eq('pack_id', storeData.packs.id)
        .eq('is_enabled', true)

      if (!featuresError && featuresData) {
        // Transform features data to match the expected structure
        featuresData.forEach(pf => {
          if (pf.is_enabled && pf.features) {
            const feature = pf.features
            if (feature.name_en) packFeatures.en.push(feature.name_en)
            if (feature.name_ar) packFeatures.ar.push(feature.name_ar)
            if (feature.name_fr) packFeatures.fr.push(feature.name_fr)
          }
        })
      }
    }

    if (storeData && storeData.packs) {
      currentSubscription.value = {
        store_id: storeData.id,
        store_status: storeData.status,
        pack_id: storeData.pack_id,
        pack_name_en: storeData.packs.name_en,
        pack_name_ar: storeData.packs.name_ar,
        pack_name_fr: storeData.packs.name_fr,
        pack_price: storeData.packs.price,
        max_announcements: storeData.packs.max_announcements,
        max_images: storeData.packs.max_images,
        current_announcements: storeData.current_announcements || 0,
        current_images: storeData.current_images || 0,
        subscription_start: storeData.created_at,
        pack_features: packFeatures
      }
    }
  } catch (err) {
    console.error('Error fetching current subscription:', err)
    error.value = err?.message || 'Failed to load current subscription'
  }
}

const fetchSubscriptionHistory = async () => {
  try {
    if (!authStore.isAuthenticated || !authStore.user?.id) {
      return
    }

    // Fetch subscription history from vendor_subscriptions table
    const { data: historyData, error: historyError } = await supabase
      .from('vendor_subscriptions')
      .select('*')
      .eq('vendor_id', authStore.user.id)
      .order('start_date', { ascending: false })

    if (historyError) {
      throw historyError
    }

    subscriptionHistory.value = historyData || []
  } catch (err) {
    console.error('Error fetching subscription history:', err)
    // Don't set error, just log it - history is optional
  }
}

const calculateUpgradeHistory = () => {
  if (subscriptionHistory.value.length < 2) {
    upgradeHistory.value = []
    return
  }

  const history = [...subscriptionHistory.value].sort((a, b) => 
    new Date(a.start_date) - new Date(b.start_date)
  )

  const upgrades = []
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1]
    const curr = history[i]
    
    // Determine if it's an upgrade or downgrade based on plan_type
    // plan_type is 'basic' or 'pro' (from vendor_subscriptions table)
    const prevIsPro = prev.plan_type === 'pro'
    const currIsPro = curr.plan_type === 'pro'
    
    if (prevIsPro !== currIsPro) {
      upgrades.push({
        type: currIsPro ? 'upgrade' : 'downgrade',
        from: prev.plan_type || 'Unknown',
        to: curr.plan_type || 'Unknown',
        date: curr.start_date
      })
    }
  }

  upgradeHistory.value = upgrades.reverse() // Most recent first
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value || 'en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const calculateDuration = (startDate, endDate) => {
  if (!startDate) return '-'
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date()
  
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 30) {
    return `${diffDays} ${t('subscription.days') || 'days'}`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} ${t('subscription.months') || 'months'}`
  } else {
    const years = Math.floor(diffDays / 365)
    const remainingMonths = Math.floor((diffDays % 365) / 30)
    if (remainingMonths > 0) {
      return `${years} ${t('subscription.years') || 'years'}, ${remainingMonths} ${t('subscription.months') || 'months'}`
    }
    return `${years} ${t('subscription.years') || 'years'}`
  }
}

// Lifecycle
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchCurrentSubscription(),
      fetchSubscriptionHistory()
    ])
    calculateUpgradeHistory()
  } catch (err) {
    console.error('Error initializing subscription page:', err)
  } finally {
    loading.value = false
  }
})
</script>
