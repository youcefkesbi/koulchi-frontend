<template>
  <div 
    id="app" 
    :dir="currentDir"
    :lang="currentLocale"
    class="min-h-screen bg-white text-gray-900 overflow-x-hidden"
  >
    <!-- Global Admin Sidebar (fixed position, doesn't affect layout) -->
    <AdminSidebar ref="adminSidebar" :sidebar-open="adminSidebarOpen" @close-sidebar="handleAdminSidebarClose" />
    
    <!-- Main Content Area -->
    <div class="flex flex-col min-h-screen w-full overflow-x-hidden max-w-[100vw]">
      <Header @toggle-admin-sidebar="handleAdminSidebarToggle" />
      <main class="flex-1 w-full min-w-0 overflow-x-hidden">
        <router-view />
      </main>
      <Footer />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/useAuthStore'
import { useLocaleStore } from './stores/useLocaleStore'
import { languages } from './i18n'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import AdminSidebar from './components/AdminSidebar.vue'

const authStore = useAuthStore()
const localeStore = useLocaleStore()
const { locale } = useI18n()
const route = useRoute()

// Watch for auth state changes to trigger component re-renders
watch(() => authStore.user, async (newUser, oldUser) => {
  // Force re-render of components that depend on auth state
  await nextTick()
  
  // Emit a custom event that components can listen to
  window.dispatchEvent(new CustomEvent('auth-state-changed', {
    detail: { user: newUser, isAuthenticated: !!newUser }
  }))
}, { deep: true })
// Admin sidebar state - starts closed by default
const adminSidebarOpen = ref(false)
const adminSidebar = ref(null)

// Handle admin sidebar toggle
const handleAdminSidebarToggle = (isOpen) => {
  adminSidebarOpen.value = isOpen
  if (adminSidebar.value) {
    if (isOpen) {
      adminSidebar.value.toggleSidebar()
    } else {
      adminSidebar.value.closeSidebar()
    }
  }
}

// Handle admin sidebar close
const handleAdminSidebarClose = () => {
  adminSidebarOpen.value = false
}

// Single source: route (after guard) > persisted store > i18n
const effectiveLocale = computed(() => {
  return route.meta.locale || localeStore.locale || locale.value || 'en'
})

const currentDir = computed(() => languages[effectiveLocale.value]?.dir || 'ltr')
const currentLocale = computed(() => languages[effectiveLocale.value]?.locale || 'en-US')

// Keep i18n in sync with route/store so all components see correct locale
watch(effectiveLocale, (newLocale) => {
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

// Sync document attributes with effective locale
watch(effectiveLocale, (newLocale) => {
  if (newLocale) {
    const dir = languages[newLocale]?.dir || 'ltr'
    document.documentElement.dir = dir
    document.documentElement.lang = newLocale
  }
}, { immediate: true })

// Initialize auth on mount with enhanced error handling
// onMounted(async () => {
//   try {
//     await authStore.initAuth()
//   } catch (error) {
//     console.error('Failed to initialize authentication:', error)
//   }
// })

// Cleanup on unmount
// onUnmounted(() => {
//   authStore.cleanup()
// })
</script>

<style>
@import './assets/rtl.css';

/* Custom scrollbar with green theme */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background-color: #f3f4f6;
}

::-webkit-scrollbar-thumb {
  background-color: var(--color-primary);
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-primary-dark);
}

/* Prevent horizontal scroll and layout shift */
html {
  overflow-x: hidden;
  scroll-behavior: smooth;
}
body {
  overflow-x: hidden;
  max-width: 100vw;
}

/* Smooth transitions */
* {
  transition: all 0.2s ease-in-out;
}

/* Custom animations - using global my-fade-in and my-slide-up classes */
</style> 