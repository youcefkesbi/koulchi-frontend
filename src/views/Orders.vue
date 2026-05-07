<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container-lg section-padding max-w-6xl mx-auto">
      <header class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">{{ $t('header.orders') }}</h1>
        <p class="mt-2 text-gray-600">{{ $t('ordersPage.subtitle') }}</p>
      </header>

      <nav
        class="flex gap-1 sm:gap-2 border-b border-gray-200 mb-8"
        aria-label="Orders sections"
      >
        <router-link
          custom
          v-slot="{ href, navigate, isActive }"
          :to="getLocalizedRoute({ name: 'OrdersPurchases' })"
        >
          <a
            :href="href"
            class="inline-flex items-center px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-t-md"
            :class="isActive
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-600 hover:text-gray-900'"
            @click="navigate"
          >
            {{ $t('ordersPage.purchases') }}
          </a>
        </router-link>
        <router-link
          custom
          v-slot="{ href, navigate, isActive }"
          :to="getLocalizedRoute({ name: 'OrdersSales' })"
        >
          <a
            :href="href"
            class="inline-flex items-center px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-t-md"
            :class="isActive
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-600 hover:text-gray-900'"
            @click="navigate"
          >
            {{ $t('ordersPage.sales') }}
          </a>
        </router-link>
      </nav>

      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useLocaleRouter } from '../composables/useLocaleRouter'

const { getLocalizedRoute } = useLocaleRouter()
</script>
