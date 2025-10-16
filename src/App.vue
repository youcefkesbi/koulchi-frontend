<template>
  <div 
    id="app" 
    :dir="currentDir"
    :lang="currentLocale"
    class="min-h-screen bg-white text-gray-900"
  >
    <div class="flex min-h-screen">
      <!-- Global Admin Sidebar -->
      <AdminSidebar ref="adminSidebar" :sidebar-open="adminSidebarOpen" @close-sidebar="handleAdminSidebarClose" />
      
      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col">
        <Header @toggle-admin-sidebar="handleAdminSidebarToggle" />
        <main class="flex-1">
          <router-view />
        </main>
        <Footer />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/useAuthStore'
import { languages } from './i18n'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import AdminSidebar from './components/AdminSidebar.vue'

const authStore = useAuthStore()
const { locale } = useI18n()
const route = useRoute()

// Watch for auth state changes to trigger component re-renders
watch(() => authStore.user, async (newUser, oldUser) => {
  console.log('🔄 Auth state changed:', { 
    wasAuthenticated: !!oldUser, 
    isAuthenticated: !!newUser,
    userId: newUser?.id || 'none'
  })
  
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

// Initialize auth on mount with enhanced error handling
onMounted(async () => {
  try {
    console.log('🚀 App mounting, initializing authentication...')
    await authStore.initAuth()
    console.log('✅ App authentication initialized')
  } catch (error) {
    console.error('❌ Failed to initialize authentication:', error)
  }
})

// Cleanup on unmount
onUnmounted(() => {
  console.log('🧹 App unmounting, cleaning up authentication...')
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
  background-color: #f3f4f6;
}

::-webkit-scrollbar-thumb {
  background-color: var(--color-primary);
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-primary-dark);
}

/* Smooth transitions */
* {
  transition: all 0.2s ease-in-out;
}

/* Custom animations - using global my-fade-in and my-slide-up classes */
</style> 