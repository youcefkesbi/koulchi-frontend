<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center items-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-gray-600">{{ $t('profile.loading') }}</p>
      </div>
    </div>

    <div v-else-if="error" class="max-w-2xl mx-auto">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p class="text-red-600">{{ error }}</p>
        <button 
          @click="fetchProfileData" 
          class="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          {{ $t('profile.retry') }}
        </button>
      </div>
    </div>

    <div v-else class="max-w-4xl mx-auto">
      <!-- Store Banner (only if has store) -->
      <div v-if="isStoreOwner && storeData.banner_url" class="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-6 shadow-lg">
        <img 
          :src="storeData.banner_url" 
          :alt="storeData.name"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      <!-- Store Header (only if has store) -->
      <div v-if="isStoreOwner && storeData" class="bg-white rounded-2xl shadow-lg p-6 md:p-8 -mt-16 md:-mt-20 relative z-10">
        <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
          <!-- Store Logo -->
          <div v-if="storeData.logo_url" class="flex-shrink-0">
            <img 
              :src="storeData.logo_url" 
              :alt="storeData.name"
              class="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>
          
          <!-- Store Info -->
          <div class="flex-1">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{{ storeData.name }}</h1>
            <div v-if="storeData.location" class="flex items-center text-gray-600 mb-3">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{{ storeData.location }}</span>
            </div>
            <p v-if="storeData.description" class="text-gray-700 text-lg leading-relaxed">{{ storeData.description }}</p>
          </div>
        </div>
      </div>

      <!-- Owner Header (if no store) -->
      <div v-if="!isStoreOwner && profileData.full_name" class="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div class="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-3xl md:text-4xl font-bold flex-shrink-0">
            {{ getInitials(profileData.full_name) }}
          </div>
          <div class="flex-1">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{{ profileData.full_name }}</h1>
          </div>
        </div>
      </div>

      <!-- Store Statistics (only if has store) -->
      <div v-if="isStoreOwner && storeStatistics" class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
          <div class="text-3xl font-bold text-blue-600 mb-2">{{ storeStatistics.totalOrders || 0 }}</div>
          <div class="text-sm text-gray-600">{{ $t('profile.totalOrders') }}</div>
        </div>
        <div class="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
          <div class="text-3xl font-bold text-green-600 mb-2">{{ storeStatistics.totalProducts || 0 }}</div>
          <div class="text-sm text-gray-600">{{ $t('profile.totalProducts') }}</div>
        </div>
        <div class="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
          <div class="text-3xl font-bold text-purple-600 mb-2">{{ formatCurrency(storeStatistics.totalSales || 0) }}</div>
          <div class="text-sm text-gray-600">{{ $t('profile.totalSales') }}</div>
        </div>
        <div class="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
          <div class="text-3xl font-bold text-orange-600 mb-2">{{ storeStatistics.totalVisitors || 0 }}</div>
          <div class="text-sm text-gray-600">{{ $t('profile.totalVisitors') }}</div>
        </div>
      </div>

      <!-- Owner Information (shown for both cases) -->
      <div v-if="profileData.full_name" class="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">{{ $t('profile.aboutOwner') }}</h2>
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {{ getInitials(profileData.full_name) }}
          </div>
          <div>
            <p class="text-lg font-medium text-gray-900">{{ profileData.full_name }}</p>
            <p v-if="profileData.email" class="text-gray-600">{{ profileData.email }}</p>
            <p v-if="profileData.phone_num" class="text-gray-600">{{ profileData.phone_num }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/useAuthStore'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const route = useRoute()

const loading = ref(true)
const error = ref(null)
const profileData = ref({})
const storeData = ref(null)
const storeStatistics = ref(null)
const isStoreOwner = ref(false)

const fetchProfileData = async () => {
  try {
    loading.value = true
    error.value = null

    // Get owner_id from route params
    const ownerId = route.params.ownerId
    
    if (!ownerId) {
      error.value = t('profile.ownerIdMissing')
      return
    }

    // Fetch owner information using RPC function
    const { data: ownerInfo, error: rpcError } = await supabase.rpc('get_product_owner_info', {
      owner_user_id: ownerId
    })

    if (rpcError) {
      throw new Error(rpcError.message || 'Failed to load owner information')
    }

    if (!ownerInfo || ownerInfo.length === 0) {
      error.value = t('profile.ownerNotFound')
      return
    }

    const info = ownerInfo[0]

    // Set profile data (always available)
    profileData.value = {
      id: info.profile_id,
      full_name: info.full_name,
      phone_num: info.phone_num,
      email: info.email,
      status: info.profile_status
    }

    // Check if owner has a store
    if (info.has_store && info.store_id) {
      isStoreOwner.value = true
      
      // Get pack name based on locale
      const currentLocale = locale.value || 'en'
      const packName = info[`pack_name_${currentLocale}`] || 
                       info.pack_name_en || 
                       t('profile.noPack')

      // Set store data
      storeData.value = {
        id: info.store_id,
        name: info.store_name,
        description: info.store_description,
        logo_url: info.store_logo_url,
        banner_url: info.store_banner_url,
        location: info.store_location,
        status: info.store_status,
        created_at: info.store_created_at,
        pack_name: packName
      }

      // Set store statistics
      if (info.total_orders !== null) {
        storeStatistics.value = {
          totalOrders: info.total_orders || 0,
          totalProducts: info.total_products || 0,
          totalSales: info.total_sales || 0,
          totalVisitors: info.total_visitors || 0
        }
      }
    } else {
      // Owner doesn't have a store (customer)
      isStoreOwner.value = false
      storeData.value = null
      storeStatistics.value = null
    }
  } catch (err) {
    console.error('Error fetching profile data:', err)
    error.value = err.message || t('profile.loadError')
  } finally {
    loading.value = false
  }
}

const formatCurrency = (amount) => {
  if (!amount) return '0.00'
  const currentLocale = locale.value || 'en'
  return new Intl.NumberFormat(currentLocale, {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

onMounted(() => {
  fetchProfileData()
})
</script>
