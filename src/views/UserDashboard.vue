<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Dashboard Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="w-full px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">{{ t('dashboard.userDashboard') }}</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ t('dashboard.welcomeMessage', { name: authStore.userDisplayName || authStore.userEmail }) }}</span>
            <span 
              v-if="authStore.userRole !== 'customer'"
              :class="[
                'px-3 py-1 rounded-full text-xs font-medium',
                authStore.userRole === 'admin' ? 'bg-red-100 text-red-800' :
                authStore.userRole === 'employee' ? 'bg-blue-100 text-blue-800' :
                authStore.userRole === 'vendor' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              ]"
            >
              {{ authStore.userRole }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="bg-white border-b border-gray-200">
      <div class="w-full px-4 sm:px-6 lg:px-8">
        <nav class="flex space-x-8" aria-label="Dashboard Tabs">
          <button
            v-for="tab in availableTabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <i :class="tab.icon + ' mr-2'"></i>
            {{ tab.name }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div class="w-full px-4 sm:px-6 lg:px-8 py-8">
      <!-- Buying Tab -->
      <BuyingTab v-if="activeTab === 'buying'" />
      
      <!-- Selling Tab -->
      <SellingTab v-else-if="activeTab === 'selling'" />
      
      <!-- Admin Tab -->
      <AdminTab 
        v-else-if="activeTab === 'admin'" 
        @navigate-to="handleAdminNavigation"
      />
      
      <!-- Employee Tab -->
      <EmployeeTab 
        v-else-if="activeTab === 'employee'" 
        @navigate-to="handleEmployeeNavigation"
                />
              </div>

    <!-- Debug component (remove in production) -->
    <RoleDebugger />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import BuyingTab from '../components/dashboard/BuyingTab.vue'
import SellingTab from '../components/dashboard/SellingTab.vue'
import AdminTab from '../components/dashboard/AdminTab.vue'
import EmployeeTab from '../components/dashboard/EmployeeTab.vue'
import RoleDebugger from '../components/RoleDebugger.vue'
import { getLocalizedPath } from '../lib/i18n-utils'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

// Default to buying dashboard
const activeTab = ref('buying')

// Available tabs based on user role
const availableTabs = computed(() => {
  const userRole = authStore.userRole || 'customer'
  console.log('Computing availableTabs, userRole:', userRole, 'isAuthenticated:', authStore.isAuthenticated)
  
  const tabs = [
    {
      id: 'buying',
      name: t('dashboard.buyingDashboard'),
      icon: 'fas fa-shopping-bag',
      roles: ['customer', 'admin', 'employee', 'vendor']
    },
    {
      id: 'selling',
      name: t('dashboard.sellingDashboard'),
      icon: 'fas fa-store',
      roles: ['customer', 'admin', 'employee', 'vendor']
    }
  ]

  // Add admin tab for admins
  if (userRole === 'admin') {
    console.log('Adding admin tab')
    tabs.push({
      id: 'admin',
      name: t('admin.dashboard'),
      icon: 'fas fa-crown',
      roles: ['admin']
    })
  }

  // Add employee tab for employees
  if (userRole === 'employee') {
    console.log('Adding employee tab')
    tabs.push({
      id: 'employee',
      name: t('employee.dashboard'),
      icon: 'fas fa-user-tie',
      roles: ['employee']
    })
  }

  console.log('Final tabs:', tabs)
  return tabs
})

// Handle admin navigation
const handleAdminNavigation = (section) => {
  // Navigate to admin section or show admin modal
  console.log('Navigate to admin section:', section)
  // This could open a modal or navigate to a different route
  // For now, we'll just log it
}

// Handle employee navigation
const handleEmployeeNavigation = (section) => {
  // Navigate to employee section or show employee modal
  console.log('Navigate to employee section:', section)
  // This could open a modal or navigate to a different route
  // For now, we'll just log it
}

// Get localized route path
const getLocalizedRoute = (path) => {
  const currentLocale = route.meta.locale || 'en'
  return getLocalizedPath(path, currentLocale)
}

// Check if user has access to a specific tab
const hasAccessToTab = (tabId) => {
  const tab = availableTabs.value.find(t => t.id === tabId)
  return tab && tab.roles.includes(authStore.userRole)
}

// Redirect to appropriate tab if current tab is not accessible
const validateTabAccess = () => {
  if (!hasAccessToTab(activeTab.value)) {
    // Redirect to first available tab
    activeTab.value = availableTabs.value[0]?.id || 'buying'
  }
}

// Watch for role changes and refresh tabs
watch(() => authStore.userRole, (newRole, oldRole) => {
  console.log('User role changed from', oldRole, 'to', newRole)
  validateTabAccess()
}, { immediate: true })

onMounted(() => {
  // Validate tab access on mount
  validateTabAccess()
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-xl shadow-soft p-6;
}

.btn-primary {
  @apply px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors;
}

.btn-outline {
  @apply px-6 py-3 border border-primary text-primary font-medium rounded-lg hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors;
}

.btn-secondary {
  @apply px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors;
}
</style> 