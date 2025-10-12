<template>
  <div v-if="isAdmin && sidebarOpen" 
  class="admin-sidebar-container z-50">
    <!-- Mobile Overlay - only show on mobile when sidebar is open -->
    <div 
      v-if="sidebarOpen" 
      @click="closeSidebar"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
    ></div>

    <!-- Admin Sidebar -->
    <div :class="[
      'admin-sidebar',
      'bg-white shadow-lg border-r border-gray-200 flex-shrink-0 transition-all duration-300 z-50',
      'fixed md:relative md:translate-x-0',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full md:w-0 md:overflow-hidden',
      'w-64 md:w-64',
      'top-20' // Start below header (header height is h-20)
    ]">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-800">Admin Panel</h2>
            <p class="text-sm text-gray-600 mt-1">Administrative Controls</p>
          </div>
          <button 
            @click="closeSidebar"
            class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close Admin Panel"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <nav class="mt-6">
        <div class="px-6 py-3">
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Management</h3>
          <ul class="space-y-2">
            <li>
              <router-link 
                to="/admin"
                @click="closeSidebarOnMobile"
                :class="[
                  'w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  $route.path === '/admin' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                ]"
              >
                <i class="fas fa-tachometer-alt mr-3"></i>
                Dashboard
              </router-link>
            </li>
            <li>
              <router-link 
                :to="`/${$route.meta.locale || 'en'}/users`"
                @click="closeSidebarOnMobile"
                :class="[
                  'w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  $route.path.includes('/users') 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                ]"
              >
                <i class="fas fa-users mr-3"></i>
                Users
              </router-link>
            </li>
            <li>
              <router-link 
                :to="`/${$route.meta.locale || 'en'}/categories`"
                @click="closeSidebarOnMobile"
                :class="[
                  'w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  $route.path.includes('/categories') 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                ]"
              >
                <i class="fas fa-tags mr-3"></i>
                Categories
              </router-link>
            </li>
            <li>
              <router-link 
                :to="`/${$route.meta.locale || 'en'}/managestores`"
                @click="closeSidebarOnMobile"
                :class="[
                  'w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  $route.path.includes('/managestores') 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                ]"
              >
                <i class="fas fa-store mr-3"></i>
                Stores
              </router-link>
            </li>
            <li>
              <router-link 
                :to="`/${$route.meta.locale || 'en'}/packs`"
                @click="closeSidebarOnMobile"
                :class="[
                  'w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  $route.path.includes('/packs') 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                ]"
              >
                <i class="fas fa-crown mr-3"></i>
                Packs
              </router-link>
            </li>
            <li>
              <router-link 
                to="/admin/logs"
                @click="closeSidebarOnMobile"
                :class="[
                  'w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  $route.path.startsWith('/admin/logs') 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                ]"
              >
                <i class="fas fa-list-alt mr-3"></i>
                Audit Logs
              </router-link>
            </li>
          </ul>
        </div>
        
        <div class="px-6 py-3 border-t border-gray-200">
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">System</h3>
          <ul class="space-y-2">
            <li>
              <button class="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                <i class="fas fa-cog mr-3"></i>
                Settings
              </button>
            </li>
            <li>
              <button class="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                <i class="fas fa-chart-bar mr-3"></i>
                Analytics
              </button>
            </li>
            <li>
              <button class="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                <i class="fas fa-database mr-3"></i>
                Database
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '../stores/useAuthStore'
import { supabase } from '../lib/supabase'

const authStore = useAuthStore()

// Props
const props = defineProps({
  sidebarOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close-sidebar'])

// Admin role check with stable role fetching
const isAdmin = ref(false)
const roleLoaded = ref(false)

// Fetch role once and keep it stable
const fetchAdminRoleOnce = async () => {
  if (roleLoaded.value) return // Only fetch once
  
  try {
    const hasSession = await authStore.checkAuthStatus()
    if (!hasSession) {
      isAdmin.value = false
      roleLoaded.value = true
      return
    }

    // Get fresh role from database
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      // Fetch user roles directly from database
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
      
      if (error) {
        console.error('Error fetching user roles:', error)
        isAdmin.value = false
      } else {
        const roles = userRoles?.map(ur => ur.role) || []
        isAdmin.value = roles.includes('admin')
        console.log('🔍 AdminSidebar: Direct role fetch result:', roles, 'isAdmin:', isAdmin.value)
      }
    } else {
      isAdmin.value = false
    }
    
    roleLoaded.value = true
  } catch (err) {
    console.error('❌ AdminSidebar: Error fetching admin role:', err)
    isAdmin.value = false
    roleLoaded.value = true
  }
}

// Sidebar state - starts closed by default
const sidebarOpen = ref(false)

// Mobile detection
const isMobile = ref(false)

// Watch for prop changes and update local state
watch(() => props.sidebarOpen, (newValue) => {
  sidebarOpen.value = newValue
}, { immediate: true })

// Close sidebar and notify parent
const closeSidebar = () => {
  sidebarOpen.value = false
  // Emit event to parent to update its state
  emit('close-sidebar')
}

const closeSidebarOnMobile = () => {
  if (window.innerWidth < 768) {
    sidebarOpen.value = false
  }
}

// Handle responsive behavior
const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  // Don't automatically open sidebar on desktop - let toggle button control it
}

// Expose methods for parent components
defineExpose({
  toggleSidebar: () => { sidebarOpen.value = !sidebarOpen.value },
  closeSidebar,
  sidebarOpen: computed(() => sidebarOpen.value)
})

// Lifecycle
onMounted(async () => {
  // Fetch admin role once and keep it stable
  await fetchAdminRoleOnce()
  
  // Initialize mobile detection
  handleResize()
  
  // Add resize event listener
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.admin-sidebar-container {
  position: fixed;
}

.admin-sidebar {
  height: calc(100vh - 5rem); /* 100vh minus header height (h-20 = 5rem) */
  width: 20vw;
  overflow-y: auto;
}

/* Custom scrollbar for sidebar */
.admin-sidebar::-webkit-scrollbar {
  width: 4px;
}

.admin-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.admin-sidebar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 2px;
}

.admin-sidebar::-webkit-scrollbar-thumb:hover {
  background-color: #d1d5db;
}
</style>

