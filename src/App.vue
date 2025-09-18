<template>
  <div 
    id="app" 
    :dir="currentDir"
    :lang="currentLocale"
    class="min-h-screen bg-gradient-to-br from-light-gray to-white dark:from-gray-900 dark:to-gray-800"
  >
    <Header />
    <main class="flex-1">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { languages } from './i18n'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

const authStore = useAuthStore()
const { locale } = useI18n()
const route = useRoute()

// Computed properties for language direction and locale
const currentDir = computed(() => {
  const currentLocale = route.meta.locale || locale.value || 'en'
  return languages[currentLocale]?.dir || 'ltr'
})

const currentLocale = computed(() => {
  const currentLocale = route.meta.locale || locale.value || 'en'
  return languages[currentLocale]?.locale || 'en-US'
})

// Watch for route changes and update i18n locale
watch(() => route.meta.locale, (newLocale) => {
  if (newLocale && newLocale !== locale.value) {
    locale.value = newLocale
  }
}, { immediate: true })

// Watch for locale changes and update document direction
watch(locale, (newLocale) => {
  const dir = languages[newLocale]?.dir || 'ltr'
  document.documentElement.dir = dir
  document.documentElement.lang = newLocale
}, { immediate: true })

// Watch for route locale changes and update document attributes
watch(() => route.meta.locale, (newLocale) => {
  if (newLocale) {
    const dir = languages[newLocale]?.dir || 'ltr'
    document.documentElement.dir = dir
    document.documentElement.lang = newLocale
  }
}, { immediate: true })

// Initialize auth on mount
onMounted(() => {
  authStore.initAuth()
})

onUnmounted(() => {
  authStore.cleanup()
})
</script>

<style>
@import './assets/rtl.css';

/* Custom scrollbar with green theme */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-800;
}

::-webkit-scrollbar-thumb {
  @apply bg-primary rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-primary-dark;
}

/* Smooth transitions */
* {
  transition: all 0.2s ease-in-out;
}

/* Custom animations - using global my-fade-in and my-slide-up classes */
</style> 