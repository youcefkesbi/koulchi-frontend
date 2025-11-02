<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Page Header -->
    <div class="mb-8 text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ $t('profile.storeOwnerTitle') }}</h1>
      <p class="text-gray-600 text-lg">{{ $t('profile.storeOwnerSubtitle') }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-3xl shadow-soft p-8 text-center">
      <i class="fas fa-spinner fa-spin text-primary text-3xl mb-4"></i>
      <p class="text-gray-600">{{ $t('common.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-white rounded-3xl shadow-soft p-8">
      <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
        <i class="fas fa-exclamation-circle text-red-500 text-2xl mb-2"></i>
        <p class="text-red-700">{{ error }}</p>
      </div>
    </div>

    <!-- Access Denied - Not a Store Owner -->
    <div v-else-if="!isStoreOwner" class="bg-white rounded-3xl shadow-soft p-8">
      <div class="text-center py-8">
        <i class="fas fa-store-slash text-gray-400 text-6xl mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ $t('profile.notStoreOwner') }}</h3>
        <p class="text-gray-600 mb-4">{{ $t('profile.notStoreOwnerMessage') }}</p>
        <router-link
          :to="getLocalizedRoute('/dashboard')"
          class="btn-primary inline-block"
        >
          {{ $t('common.goBack') }}
        </router-link>
      </div>
    </div>

    <!-- Profile Information -->
    <div v-else class="bg-white rounded-3xl shadow-soft p-8">
      <!-- Profile Card -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <i class="fas fa-user-circle text-primary mr-3"></i>
          {{ $t('profile.personalInformation') }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Full Name -->
          <div class="bg-gray-50 rounded-xl p-4">
            <label class="block text-sm font-medium text-gray-500 mb-2">
              {{ $t('profile.fullName') }}
            </label>
            <p class="text-lg font-semibold text-gray-900">
              {{ profile.full_name || $t('profile.notProvided') }}
            </p>
          </div>

          <!-- Email -->
          <div class="bg-gray-50 rounded-xl p-4">
            <label class="block text-sm font-medium text-gray-500 mb-2">
              {{ $t('profile.email') }}
            </label>
            <p class="text-lg font-semibold text-gray-900">
              {{ profile.email || $t('profile.notProvided') }}
            </p>
          </div>

          <!-- City -->
          <div class="bg-gray-50 rounded-xl p-4">
            <label class="block text-sm font-medium text-gray-500 mb-2">
              {{ $t('profile.city') }}
            </label>
            <p class="text-lg font-semibold text-gray-900">
              {{ profile.city || $t('profile.notProvided') }}
            </p>
          </div>

          <!-- Store Name -->
          <div class="bg-gray-50 rounded-xl p-4">
            <label class="block text-sm font-medium text-gray-500 mb-2">
              {{ $t('profile.storeName') }}
            </label>
            <p class="text-lg font-semibold text-gray-900">
              {{ storeInfo.name || $t('profile.notProvided') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Store Information -->
      <div v-if="storeInfo.id" class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <i class="fas fa-store text-primary mr-3"></i>
          {{ $t('profile.storeInformation') }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Store Status -->
          <div class="bg-gray-50 rounded-xl p-4">
            <label class="block text-sm font-medium text-gray-500 mb-2">
              {{ $t('profile.storeStatus') }}
            </label>
            <span
              :class="[
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                storeInfo.status === 'approved' ? 'bg-green-100 text-green-800' :
                storeInfo.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                storeInfo.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              ]"
            >
              {{ getStoreStatusLabel(storeInfo.status) }}
            </span>
          </div>

          <!-- Pack Information -->
          <div v-if="storeInfo.pack_name" class="bg-gray-50 rounded-xl p-4">
            <label class="block text-sm font-medium text-gray-500 mb-2">
              {{ $t('profile.packPlan') }}
            </label>
            <p class="text-lg font-semibold text-gray-900">
              {{ getPackName(storeInfo) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-gray-200 mt-6">
        <router-link
          :to="getLocalizedRoute('/dashboard')"
          class="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-300 font-semibold text-center"
        >
          <i class="fas fa-arrow-left mr-2"></i>
          {{ $t('common.goBack') }}
        </router-link>

        <router-link
          v-if="storeInfo.id"
          :to="getLocalizedRoute(`/store/${storeInfo.id}`)"
          class="flex-1 bg-primary text-white py-3 px-6 rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-300 font-semibold text-center"
        >
          <i class="fas fa-eye mr-2"></i>
          {{ $t('profile.viewStore') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore'
import { useStoresStore } from '../stores/useStoresStore'
import { supabase } from '../lib/supabase'
import { useLocaleRouter } from '../composables/useLocaleRouter'

const { t } = useI18n()
const route = useRoute()
const authStore = useAuthStore()
const storesStore = useStoresStore()
const { getLocalizedPath } = useLocaleRouter()

// State
const loading = ref(true)
const error = ref(null)
const profile = ref({
  full_name: '',
  email: '',
  city: ''
})
const storeInfo = ref({
  id: null,
  name: '',
  status: '',
  pack_name: null,
  pack_name_en: null,
  pack_name_ar: null,
  pack_name_fr: null
})

// Computed
const isStoreOwner = computed(() => {
  const roles = Array.isArray(authStore.userRole) ? authStore.userRole : [authStore.userRole]
  return roles.includes('vendor') || roles.includes('customer')
})

// Get localized route
const getLocalizedRoute = (path) => {
  const currentLocale = route.meta?.locale || 'en'
  return getLocalizedPath(path, { locale: currentLocale })
}

// Get store status label
const getStoreStatusLabel = (status) => {
  const statusMap = {
    approved: t('profile.statusApproved'),
    pending: t('profile.statusPending'),
    rejected: t('profile.statusRejected'),
    suspended: t('profile.statusSuspended')
  }
  return statusMap[status] || status
}

// Get pack name based on current locale
const getPackName = (store) => {
  const currentLocale = route.meta?.locale || 'en'
  
  if (currentLocale === 'ar' && store.pack_name_ar) {
    return store.pack_name_ar
  } else if (currentLocale === 'fr' && store.pack_name_fr) {
    return store.pack_name_fr
  } else {
    return store.pack_name_en || store.pack_name || t('profile.noPack')
  }
}

// Fetch profile information
const fetchProfile = async () => {
  try {
    loading.value = true
    error.value = null

    // Check authentication
    if (!authStore.isAuthenticated || !authStore.user?.id) {
      error.value = t('profile.notAuthenticated')
      return
    }

    // Check if user is a store owner
    const roles = Array.isArray(authStore.userRole) ? authStore.userRole : [authStore.userRole]
    if (!roles.includes('vendor') && !roles.includes('customer')) {
      return // Not a store owner, but don't show error yet
    }

    // Get current session for email
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      profile.value.email = session.user.email || ''
    }

    // Fetch profile from database
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, city')
      .eq('id', authStore.user.id)
      .single()

    if (profileError) {
      throw new Error(profileError.message || 'Failed to load profile')
    }

    if (profileData) {
      profile.value.full_name = profileData.full_name || ''
      profile.value.city = profileData.city || ''
    }

    // Fetch store information
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('id, name, status, pack_id, packs(name_en, name_ar, name_fr)')
      .eq('owner_id', authStore.user.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (storeError && storeError.code !== 'PGRST116') {
      console.warn('Error fetching store:', storeError)
    }

    if (storeData) {
      storeInfo.value = {
        id: storeData.id,
        name: storeData.name || '',
        status: storeData.status || '',
        pack_name_en: storeData.packs?.name_en || null,
        pack_name_ar: storeData.packs?.name_ar || null,
        pack_name_fr: storeData.packs?.name_fr || null
      }
    }

  } catch (err) {
    console.error('Error fetching profile:', err)
    error.value = err.message || t('profile.loadError')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
.btn-primary {
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  font-weight: 500;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}
</style>

