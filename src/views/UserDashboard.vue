<template>
  <div class="min-h-screen bg-white">
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
      <!-- Loading State -->
      <div v-if="authStore.profileLoading" class="text-center py-12">
        <i class="fas fa-spinner fa-spin text-primary text-3xl mb-4"></i>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('common.loading') }}</h3>
        <p class="text-gray-600">{{ t('dashboard.loadingProfile') }}</p>
      </div>
      
      <!-- Dashboard Tabs -->
      <template v-else>
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
        
        <!-- Verification Tab -->
        <VerificationManager v-else-if="activeTab === 'verification'" />
      </template>
    </div>

    <!-- Debug component (remove in production) -->
    <RoleDebugger />
    <RoleTest />
    <ThemeTest />
    <ThemeDebugger />
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
import VerificationManager from '../components/VerificationManager.vue'
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
  console.log('🔍 Computing availableTabs:')
  console.log('  - userRole:', userRole)
  console.log('  - isAuthenticated:', authStore.isAuthenticated)
  console.log('  - profileLoading:', authStore.profileLoading)
  console.log('  - user object:', authStore.user)
  console.log('  - user.role from object:', authStore.user?.role)
  
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
    },
    {
      id: 'verification',
      name: t('dashboard.verification'),
      icon: 'fas fa-shield-alt',
      roles: ['customer', 'admin', 'employee', 'vendor']
    }
  ]

  // Add admin tab for admins
  if (userRole === 'admin') {
    console.log('✅ Adding admin tab - userRole is admin')
    tabs.push({
      id: 'admin',
      name: t('admin.dashboard'),
      icon: 'fas fa-crown',
      roles: ['admin']
    })
  } else {
    console.log('❌ Not adding admin tab - userRole is:', userRole)
  }

  // Add employee tab for employees
  if (userRole === 'employee') {
    console.log('✅ Adding employee tab - userRole is employee')
    tabs.push({
      id: 'employee',
      name: t('employee.dashboard'),
      icon: 'fas fa-user-tie',
      roles: ['employee']
    })
  } else {
    console.log('❌ Not adding employee tab - userRole is:', userRole)
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

onMounted(async () => {
  // Force role refresh on dashboard mount to ensure fresh data
  if (authStore.isAuthenticated) {
    console.log('🔄 Dashboard mounted, ensuring fresh role data...')
    await authStore.forceRoleRefresh()
  }
  
  // Validate tab access on mount
  validateTabAccess()
})
</script>

<style scoped>
.card {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04);
  padding: 1.5rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  font-weight: 500;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-primary);
}

.btn-outline {
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  background-color: transparent;
  font-weight: 500;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  background-color: var(--color-primary);
  color: white;
}

.btn-outline:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-primary);
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background-color: #f3f4f6;
  color: #374151;
  font-weight: 500;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-secondary:focus {
  outline: none;
  box-shadow: 0 0 0 2px #6b7280;
}
</style> 