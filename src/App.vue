<template>
  <div 
    id="app" 
    :dir="currentDir"
    :lang="currentLocale"
    class="min-h-screen bg-gradient-to-br from-light-gray to-white"
  >
    <Header />
    <main class="flex-1">
      <!-- Debug info -->
      <div v-if="debug" class="bg-yellow-100 p-4 text-sm">
        <p>Current locale: {{ locale }}</p>
        <p>Current route: {{ $route.path }}</p>
        <p>Current route meta: {{ $route.meta }}</p>
      </div>
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from './stores/auth'
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

// Components are automatically imported in <script setup>
const authStore = useAuthStore()
const { locale } = useI18n()
const route = useRoute()
const debug = ref(true) // Set to false in production

// Computed properties for language direction and locale
const currentDir = computed(() => {
  return locale.value === 'ar' ? 'rtl' : 'ltr'
})

const currentLocale = computed(() => {
  return locale.value === 'ar' ? 'ar-DZ' : locale.value === 'fr' ? 'fr-FR' : 'en-US'
})

// Watch for locale changes and update document direction
watch(locale, (newLocale) => {
  const dir = newLocale === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.dir = dir
  document.documentElement.lang = newLocale
  
  // Save to localStorage
  localStorage.setItem('locale', newLocale)
}, { immediate: true })

onMounted(() => {
  authStore.initAuth()
  
  // Set initial document direction and language based on current i18n locale
  const currentLocale = locale.value
  const dir = currentLocale === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.dir = dir
  document.documentElement.lang = currentLocale
  
  console.log('App mounted, locale:', locale.value, 'route:', route.path)
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
  @apply bg-gray-100;
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

/* Custom animations */
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

.slide-up {
  animation: slideUp 0.3s ease-out;
}

.bounce-gentle {
  animation: bounceGentle 2s infinite;
}

/* RTL Support */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .space-x-reverse > :not([hidden]) ~ :not([hidden]) {
  --tw-space-x-reverse: 1;
}

[dir="rtl"] .ml-2 {
  margin-left: 0;
  margin-right: 0.5rem;
}

[dir="rtl"] .mr-2 {
  margin-right: 0;
  margin-left: 0.5rem;
}

[dir="rtl"] .ml-3 {
  margin-left: 0;
  margin-right: 0.75rem;
}

[dir="rtl"] .mr-3 {
  margin-right: 0;
  margin-left: 0.75rem;
}

[dir="rtl"] .pl-12 {
  padding-left: 0;
  padding-right: 3rem;
}

[dir="rtl"] .pr-4 {
  padding-right: 0;
  padding-left: 1rem;
}

[dir="rtl"] .left-4 {
  left: auto;
  right: 1rem;
}

[dir="rtl"] .right-0 {
  right: auto;
  left: 0;
}

[dir="rtl"] .right-4 {
  right: auto;
  left: 1rem;
}

/* Keyframes */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    transform: translateY(20px); 
    opacity: 0; 
  }
  to { 
    transform: translateY(0); 
    opacity: 1; 
  }
}

@keyframes bounceGentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
</style> 