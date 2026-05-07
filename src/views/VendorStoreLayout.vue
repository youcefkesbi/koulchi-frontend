<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header class="mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">{{ $t('stores.manageStores') }}</h1>
      </header>

      <nav class="flex flex-wrap gap-2 border-b border-gray-200 pb-3 mb-6">
        <router-link
          :to="getLocalizedRoute({ name: 'VendorStoreDashboard' })"
          class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :class="isActive('VendorStoreDashboard') ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          {{ $t('header.dashboard') }}
        </router-link>
        <router-link
          :to="getLocalizedRoute({ name: 'VendorStoreProducts' })"
          class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :class="isActive('VendorStoreProducts') ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          {{ $t('stores.products') }}
        </router-link>
        <router-link
          :to="getLocalizedRoute({ name: 'VendorStoreOrders' })"
          class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :class="isActive('VendorStoreOrders') ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          {{ $t('header.orders') }}
        </router-link>
        <router-link
          :to="getLocalizedRoute({ name: 'VendorStoreSettings' })"
          class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :class="isActive('VendorStoreSettings') ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          {{ $t('profile.settings') }}
        </router-link>
      </nav>

      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useLocaleRouter } from '../composables/useLocaleRouter'

const route = useRoute()
const { getLocalizedRoute } = useLocaleRouter()

const isActive = (name) => route.name === name
</script>
