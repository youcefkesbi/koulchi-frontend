<template>
  <header class="bg-white shadow-soft sticky top-0 z-50 border-b border-neutral-200">
    <div class="px-4 sm:px-6 lg:px-8">
      <!-- Mobile Header (visible on small screens) -->
      <div class="flex items-center justify-between h-16 sm:hidden">
        <!-- Logo -->
        <router-link :to="getLocalizedRoutePath('/')" class="group flex-shrink-0">
          <Logo size="default" />
        </router-link>

        <!-- Mobile Menu Button -->
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="p-2 text-neutral-700 hover:text-primary transition-colors"
          aria-label="Toggle menu"
        >
          <i class="fas text-xl" :class="mobileMenuOpen ? 'fa-times' : 'fa-bars'"></i>
        </button>
      </div>

      <!-- Desktop Header (hidden on small screens) -->
      <div class="hidden sm:flex items-center justify-between h-20 py-4">
        <div class="flex items-center justify-between w-full space-x-4 lg:space-x-6">
          <!-- Logo -->
          <router-link :to="getLocalizedRoutePath('/')" class="group flex-shrink-0">
            <Logo size="large" />
          </router-link>

          <!-- Search bar -->
          <div class="flex-1 max-w-2xl mx-4 lg:mx-8">
            <div class="relative group">
              <input
                v-model="searchQuery"
                @input="handleSearch"
                @keydown.enter="handleSearch"
                type="text"
                :placeholder="t('header.searchPlaceholder')"
                class="w-full pl-12 pr-4 py-2.5 lg:py-3 border-2 border-neutral-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 shadow-soft bg-white text-neutral-900 placeholder-neutral-600 text-sm lg:text-base"
              />
              <i class="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 group-hover:text-primary transition-colors"></i>
            </div>
          </div>

          <!-- Categories Dropdown -->
          <div class="relative categories-dropdown hidden md:block">
            <button
              @click="categoriesMenuOpen = !categoriesMenuOpen"
              class="flex items-center space-x-2 space-x-reverse px-4 py-2.5 lg:py-3 text-neutral-700 hover:text-primary transition-all duration-300 rounded-2xl hover:bg-neutral-50"
            >
              <i class="fas fa-layer-group text-lg"></i>
              <span class="font-medium text-neutral-700 hidden lg:inline">{{ t('header.categories') }}</span>
              <i class="fas fa-chevron-down text-xs transition-transform duration-300" :class="{ 'rotate-180': categoriesMenuOpen }"></i>
            </button>

            <!-- Categories Dropdown Menu -->
            <div 
              v-if="categoriesMenuOpen"
              class="absolute top-full right-0 mt-2 w-56 lg:w-64 bg-white rounded-2xl shadow-soft border border-neutral-200 py-2 z-50"
            >
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-1 p-2">
                <router-link
                  v-for="category in categories"
                  :key="category.id"
                  :to="getLocalizedRoutePath(`/category/${category.id}`)"
                  @click="categoriesMenuOpen = false"
                  class="flex items-center space-x-2 space-x-reverse p-3 rounded-xl hover:bg-neutral-50 transition-all duration-300 group"
                >
                    <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:bg-accent transition-all duration-300">
                    <i :class="getCategoryIcon(category.id)" class="text-white text-sm"></i>
                  </div>
                  <span class="text-sm font-medium text-neutral-700 group-hover:text-primary transition-colors">
                    {{ getCategoryName(category.id) }}
                  </span>
                </router-link>
              </div>
            </div>
          </div>

          <!-- Navigation and Auth -->
          <div class="flex items-center space-x-3 lg:space-x-4 space-x-reverse flex-shrink-0">
            <!-- Navigation Icons -->
            <nav class="flex items-center space-x-4 sm:space-x-6 space-x-reverse">
              <!-- Notifications Bell -->
              <router-link 
                v-if="authStore.isAuthenticated"
                :to="getLocalizedRoute('/notifications')" 
                class="relative text-neutral-700 hover:text-primary transition-all duration-300 hover:scale-110" 
                title="Notifications"
              >
                <i class="fas fa-bell text-xl"></i>
                <span 
                  v-if="notificationStore.unreadCount > 0" 
                  class="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold shadow-soft px-1"
                >
                  {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
                </span>
              </router-link>
              
              <!-- Cart -->
              <router-link :to="getLocalizedRoute('/cart')" class="relative text-neutral-700 hover:text-primary transition-all duration-300 hover:scale-110" title="Cart">
                <i class="fas fa-shopping-cart text-xl"></i>
                <span v-if="cartStore.totalItems > 0" class="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-soft">
                  {{ cartStore.totalItems }}
                </span>
              </router-link>
            </nav>

            <!-- Post Announcement Button -->
            <button
              v-show="shouldShowProductButton"
              @click.stop="handlePostAnnouncement"
              :disabled="!shouldShowProductButton"
              class="hidden md:flex gap-2 items-center text-xs lg:text-sm px-2 lg:px-3 py-1.5 lg:py-2 rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-primary hover:text-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-plus"></i>
              <span class="hidden lg:inline">{{ t('header.addProduct') }}</span>
              <span class="lg:hidden">Post</span>
            </button>

            <!-- Create a store btn -->
            <button
              v-show="shouldShowCreateStoreButton"
              @click.stop="handleSwitchToVendor"
              :disabled="!shouldShowCreateStoreButton"
              class="hidden md:flex text-xs lg:text-sm px-2 lg:px-3 py-1.5 lg:py-2 rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-primary hover:text-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-store"></i>
              <span class="hidden lg:inline">{{ t('seller.createStore') }}</span>
              <span class="lg:hidden">Store</span>
            </button>
            

              <!-- Language Switcher (always visible, compact) -->
              <LanguageSwitcher :compact="true" />

              <!-- Admin Sidebar Toggle -->
              <button 
                v-if="isAdmin"
                @click="toggleAdminSidebar"
                class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                :title="adminSidebarOpen ? 'Hide Admin Panel' : 'Show Admin Panel'"
              >
                <i class="fas fa-cog"></i>
              </button>

              <!-- User Menu (auth) -->
            <div v-if="authStore.isAuthenticated" class="relative user-dropdown">
              <button
                @click="userMenuOpen = !userMenuOpen"
                class="flex items-center space-x-2 space-x-reverse px-2 lg:px-3 py-1.5 lg:py-2 text-gray-700 hover:text-primary transition-all duration-300 rounded-xl hover:bg-gray-50"
              >
                <img
                  :src="authStore.userAvatar || '/user-avatar.png'"
                  :alt="authStore.userDisplayName || authStore.userEmail"
                  class="w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover"
                />
                <span class="font-medium hidden xl:block text-gray-700 text-sm">{{ authStore.userDisplayName || authStore.userEmail }}</span>
                <i class="fas fa-chevron-down text-xs transition-transform duration-300 hidden lg:inline" :class="{ 'rotate-180': userMenuOpen }"></i>
              </button>

              <!-- User Dropdown Menu -->
              <div 
                v-if="userMenuOpen"
                class="absolute top-full right-0 mt-2 w-48 lg:w-56 bg-white rounded-2xl shadow-soft border border-gray-100 py-2 z-50"
              >
                <router-link v-if="hasApprovedStore" :to="getLocalizedRoutePath('/dashboard')" class="dropdown-item">
                  <i class="fas fa-chart-line mr-3"></i>{{ t('header.dashboard') }}
                </router-link>
                <router-link :to="getLocalizedRoute('/myaccount')" class="dropdown-item">
                  <i class="fas fa-user mr-3"></i>{{ t('header.myProfile') }}
                </router-link>
                <router-link :to="getLocalizedRoutePath('/wishlist')" class="dropdown-item flex items-center justify-between">
                  <div class="flex items-center">
                    <i class="fas fa-heart mr-3"></i>{{ t('wishlist.title') }}
                  </div>
                  <span 
                  :class="wishlistStore.totalItems > 0 ? 'ml-2 bg-secondary text-white text-xs rounded-full px-2 py-1 flex-shrink-0' : 'hidden'">
                    {{ wishlistStore.totalItems }}
                  </span>
                </router-link>
                <router-link :to="getLocalizedRoutePath('/mypurchases')" class="dropdown-item">
                  <i class="fas fa-shopping-bag mr-3"></i>{{ t('header.myPurchases') }}
                </router-link>
                <router-link v-if="hasApprovedStore" :to="getLocalizedRoutePath('/mystoreproducts')" class="dropdown-item">
                  <i class="fas fa-clipboard-list mr-3"></i>{{ t('header.myStoreProducts') }}
                </router-link>
                <router-link v-if="hasApprovedStore || hasPendingStore" :to="getLocalizedRoute('/subscription')" class="dropdown-item">
                  <i class="fas fa-crown mr-3"></i>{{ t('header.subscription') || 'Subscription' }}
                  <span v-if="hasPendingStore" class="ml-2 text-xs text-yellow-600">({{ $t('subscription.pending') || 'Pending' }})</span>
                </router-link>
                <button
  v-if="userStoreStatus.store_id"
  @click="handleGoToStoreDashboard"
  class="dropdown-item w-full text-left"
>
  <i class="fas fa-store mr-3"></i>{{ $t('stores.myStore') }}
</button>
                <router-link v-if="isEmployee" :to="getLocalizedRoutePath('/employee')" class="dropdown-item">
                  <i class="fas fa-gavel mr-3"></i>{{ t('header.moderation') }}
                </router-link>

                <button
                  @click="handleLogout"
                  class="dropdown-item w-full text-left"
                >
                  <i class="fas fa-sign-out-alt mr-3"></i>{{ t('header.logout') }}
                </button>
              </div>
            </div>

            <div v-else class="flex items-center space-x-3 space-x-reverse">
              <button
                @click="handleLoginClick"
                class="btn-outline text-xs lg:text-sm px-3 lg:px-6 py-1.5 lg:py-2"
              >
                <i class="fas fa-sign-in-alt mr-1 lg:mr-2"></i>
                <span class="hidden lg:inline">{{ t('header.login') }}</span>
                <span class="lg:hidden">Login</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Menu (visible when mobileMenuOpen is true) -->
      <div 
        v-if="mobileMenuOpen"
        class="sm:hidden border-t border-neutral-200 py-4 space-y-4"
      >
        <!-- Mobile Search -->
        <div class="relative group">
          <input
            v-model="searchQuery"
            @input="handleSearch"
            @keydown.enter="handleSearch"
            type="text"
            :placeholder="t('header.searchPlaceholder')"
            class="w-full pl-12 pr-4 py-2.5 border-2 border-neutral-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 shadow-soft bg-white text-neutral-900 placeholder-neutral-600 text-sm"
          />
          <i class="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 group-hover:text-primary transition-colors"></i>
        </div>

        <!-- Mobile Categories -->
        <div class="relative">
          <button
            @click="categoriesMenuOpen = !categoriesMenuOpen"
            class="w-full flex items-center justify-between px-4 py-3 text-neutral-700 hover:text-primary transition-all duration-300 rounded-2xl hover:bg-neutral-50"
          >
            <div class="flex items-center space-x-2 space-x-reverse">
              <i class="fas fa-layer-group text-lg"></i>
              <span class="font-medium text-neutral-700">{{ t('header.categories') }}</span>
            </div>
            <i class="fas fa-chevron-down text-xs transition-transform duration-300" :class="{ 'rotate-180': categoriesMenuOpen }"></i>
          </button>

          <!-- Mobile Categories Menu -->
          <div 
            v-if="categoriesMenuOpen"
            class="mt-2 bg-neutral-50 rounded-2xl p-2 space-y-1"
          >
            <router-link
              v-for="category in categories"
              :key="category.id"
              :to="getLocalizedRoutePath(`/category/${category.id}`)"
              @click="categoriesMenuOpen = false; mobileMenuOpen = false"
              class="flex items-center space-x-2 space-x-reverse p-3 rounded-xl hover:bg-white transition-all duration-300 group"
            >
              <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:bg-accent transition-all duration-300">
                <i :class="getCategoryIcon(category.id)" class="text-white text-sm"></i>
              </div>
              <span class="text-sm font-medium text-neutral-700 group-hover:text-primary transition-colors">
                {{ getCategoryName(category.id) }}
              </span>
            </router-link>
          </div>
        </div>

        <!-- Mobile Action Buttons -->
        <div class="space-y-2">
          <button
            v-show="shouldShowProductButton"
            @click.stop="handlePostAnnouncementMobile"
            :disabled="!shouldShowProductButton"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-primary hover:text-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fas fa-plus"></i>
            <span>{{ t('header.addProduct') }}</span>
          </button>

          <button
            v-show="shouldShowCreateStoreButton"
            @click.stop="handleSwitchToVendorMobile"
            :disabled="!shouldShowCreateStoreButton"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-primary hover:text-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fas fa-store"></i>
            <span>{{ t('seller.createStore') }}</span>
          </button>
        </div>

        <!-- Mobile User Menu -->
        <div v-if="authStore.isAuthenticated" class="border-t border-neutral-200 pt-4 space-y-2">
          <router-link
            v-for="link in mobileUserLinks"
            :key="link.path"
            :to="getLocalizedRoutePath(link.path)"
            @click="mobileMenuOpen = false"
            class="flex items-center space-x-2 space-x-reverse px-4 py-3 text-neutral-700 hover:text-primary hover:bg-neutral-50 rounded-xl transition-all duration-300"
          >
            <i :class="link.icon" class="text-lg"></i>
            <span class="font-medium">{{ link.label }}</span>
          </router-link>
          <button
            @click="handleLogout; mobileMenuOpen = false"
            class="w-full flex items-center space-x-2 space-x-reverse px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300"
          >
            <i class="fas fa-sign-out-alt text-lg"></i>
            <span class="font-medium">{{ t('header.logout') }}</span>
          </button>
        </div>

        <div v-else class="border-t border-neutral-200 pt-4">
          <button
            @click="handleLoginClick; mobileMenuOpen = false"
            class="w-full btn-primary text-sm py-3"
          >
            <i class="fas fa-sign-in-alt mr-2"></i>
            {{ t('header.login') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Login Modal -->
    <LoginModal :isOpen="showLoginModal" @close="showLoginModal = false" />
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocaleRouter } from '../composables/useLocaleRouter'

import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/useAuthStore'
import { useCartStore } from '../stores/useCartStore'
import { useWishlistStore } from '../stores/useWishlistStore'
import { useProductStore } from '../stores/useProductStore'
import { useStoreStore } from '../stores/useStoresStore'
import { useNotificationStore } from '../stores/useNotificationStore'
import LanguageSwitcher from './LanguageSwitcher.vue'
import LoginModal from './LoginModal.vue'
import Logo from './Logo.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const productStore = useProductStore()
const storeStore = useStoreStore()
const notificationStore = useNotificationStore()
const { getLocalizedPath, navigateToPath } = useLocaleRouter()

// Define emits
const emit = defineEmits(['toggle-admin-sidebar'])

const searchQuery = ref('')
const userMenuOpen = ref(false)
const categoriesMenuOpen = ref(false)
const mobileMenuOpen = ref(false)
const showLoginModal = ref(false)
let searchDebounceTimer = null
const userStoreStatus = ref({ store_id: null, status: null, can_create: true })
const hasVendorRole = ref(false)

// Admin sidebar state - starts closed by default
const adminSidebarOpen = ref(false)

// Get localized route path (using the composable method)
const getLocalizedRoutePath = (path) => {
  const result = getLocalizedPath(path)
  // getLocalizedPath returns an object with path and query, but router-link needs just the path string
  return typeof result === 'string' ? result : result.path
}

// Get localized route (for router-link :to)
const getLocalizedRoute = (path) => {
  return getLocalizedPath(path)
}

// Close dropdown when clicking outside
const closeDropdown = () => {
  userMenuOpen.value = false
}

// Mobile user links
const mobileUserLinks = computed(() => {
  const links = []
  if (hasApprovedStore.value) {
    links.push({ path: '/dashboard', icon: 'fas fa-chart-line', label: t('header.dashboard') })
  }
  links.push({ path: '/myaccount', icon: 'fas fa-user', label: t('header.myProfile') })
  links.push({ path: '/wishlist', icon: 'fas fa-heart', label: t('wishlist.title') })
  links.push({ path: '/mypurchases', icon: 'fas fa-shopping-bag', label: t('header.myPurchases') })
  if (hasApprovedStore.value) {
    links.push({ path: '/mystoreproducts', icon: 'fas fa-clipboard-list', label: t('header.myStoreProducts') })
  }
  if (hasApprovedStore.value || hasPendingStore.value) {
    links.push({ path: '/subscription', icon: 'fas fa-crown', label: t('header.subscription') || 'Subscription' })
  }
  if (userStoreStatus.value.store_id) {
    links.push({ path: `/store/${userStoreStatus.value.store_id}`, icon: 'fas fa-store', label: t('stores.myStore') })
  }
  if (isEmployee.value) {
    links.push({ path: '/employee', icon: 'fas fa-gavel', label: t('header.moderation') })
  }
  return links
})

// Handle click outside dropdown
const handleClickOutside = (event) => {
  // Close user dropdown if clicking outside
  const userDropdown = event.target.closest('.user-dropdown')
  if (!userDropdown && userMenuOpen.value) {
    userMenuOpen.value = false
  }
  
  // Close categories dropdown if clicking outside
  const categoriesDropdown = event.target.closest('.categories-dropdown')
  if (!categoriesDropdown && categoriesMenuOpen.value) {
    categoriesMenuOpen.value = false
  }

  // Close mobile menu if clicking outside
  const header = event.target.closest('header')
  if (!header && mobileMenuOpen.value) {
    mobileMenuOpen.value = false
  }
}

// Get categories from product store
const categories = computed(() => productStore.categories.filter(cat => cat.id !== 'all'))

// Admin role check for toggle button
const isAdmin = ref(false)
const adminRoleLoaded = ref(false)

// Employee role check for moderation link
const isEmployee = ref(false)
const employeeRoleLoaded = ref(false)

// Fetch admin role once for toggle button
const fetchAdminRoleForToggle = async () => {
  if (adminRoleLoaded.value) return
  
  try {
    const hasSession = await authStore.checkAuthStatus()
    if (!hasSession) {
      isAdmin.value = false
      adminRoleLoaded.value = true
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
      
      if (error) {
        console.error('Error fetching user roles for toggle:', error)
        isAdmin.value = false
      } else {
        const roles = userRoles?.map(ur => ur.role) || []
        isAdmin.value = roles.includes('admin')
      }
    } else {
      isAdmin.value = false
    }
    
    adminRoleLoaded.value = true
  } catch (err) {
    console.error('Error fetching admin role for toggle:', err)
    isAdmin.value = false
    adminRoleLoaded.value = true
  }
}

// Fetch employee role once for moderation link
const fetchEmployeeRoleForModeration = async () => {
  if (employeeRoleLoaded.value) return
  
  try {
    const hasSession = await authStore.checkAuthStatus()
    if (!hasSession) {
      isEmployee.value = false
      employeeRoleLoaded.value = true
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
      
      if (error) {
        console.error('Error fetching user roles for moderation:', error)
        isEmployee.value = false
      } else {
        const roles = userRoles?.map(ur => ur.role) || []
        isEmployee.value = roles.includes('employee')
      }
    } else {
      isEmployee.value = false
    }
    
    employeeRoleLoaded.value = true
  } catch (err) {
    console.error('Error fetching employee role for moderation:', err)
    isEmployee.value = false
    employeeRoleLoaded.value = true
  }
}

// Show vendor-only buttons when user has vendor role
const hasApprovedStore = computed(() => {
  // Check if user has vendor role AND store is approved (not just pending)
  return authStore.isAuthenticated && 
         hasVendorRole.value && 
         userStoreStatus.value.status === 'approved'
})

// Check if user has pending store
const hasPendingStore = computed(() => {
  return authStore.isAuthenticated && 
         userStoreStatus.value.store_id && 
         userStoreStatus.value.status === 'pending'
})

// Check if user should see the "Create Store" button
const shouldShowCreateStoreButton = computed(() => {
  return authStore.isAuthenticated && userStoreStatus.value.can_create
})

// Check if user should see the "Add Product" button (only if user doesn't have vendor role)
const shouldShowProductButton = computed(() => {
  return authStore.isAuthenticated && !hasVendorRole.value
})

// Get category icon based on category ID
const getCategoryIcon = (categoryId) => {
  const iconMap = {
    'cars': 'fas fa-car',
    'realestate': 'fas fa-home',
    'electronics': 'fas fa-laptop',
    'fashion': 'fas fa-tshirt',
    'home': 'fas fa-couch',
    'beauty': 'fas fa-spa',
    'kids': 'fas fa-baby',
    'food': 'fas fa-utensils'
  }
  return iconMap[categoryId] || 'fas fa-tag'
}

// Get category name from database
const getCategoryName = (categoryId) => {
  const category = categories.value.find(cat => cat.id === categoryId)
  if (category) {
    // Check if we have a localized name for the current language
    const currentLocale = route.meta.locale || 'en'
    
    if (currentLocale === 'ar' && category.name_ar) {
      return category.name_ar
    }
    
    if (currentLocale === 'fr' && category.name_fr) {
      return category.name_fr
    }
    
    // Fall back to the English name field
    return category.name_en
  }
  return categoryId
}

const handleSearch = (event) => {
  // If Enter key is pressed, navigate immediately
  if (event && event.type === 'keydown' && event.key === 'Enter') {
    const query = searchQuery.value.trim()
    if (query) {
      navigateToPath('/products', { query: { search: query } })
    } else {
      navigateToPath('/products')
    }
    return
  }
  
  // For input events, debounce the navigation
  if (event && event.type === 'input') {
    clearTimeout(searchDebounceTimer)
    searchDebounceTimer = setTimeout(() => {
      const query = searchQuery.value.trim()
      if (query) {
        navigateToPath('/products', { query: { search: query } })
      } else {
        navigateToPath('/products')
      }
    }, 300) // 300ms debounce
  }
}

const handlePostAnnouncement = (event) => {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  // Ensure button is enabled
  if (!shouldShowProductButton.value) {
    return
  }
  
  if (authStore.isAuthenticated) {
    navigateToPath('/myannouncements/new')
  } else {
    showLoginModal.value = true
  }
}

// Mobile version with menu close
const handlePostAnnouncementMobile = (event) => {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  // Ensure button is enabled
  if (!shouldShowProductButton.value) {
    return
  }
  
  mobileMenuOpen.value = false
  
  if (authStore.isAuthenticated) {
    navigateToPath('/myannouncements/new')
  } else {
    showLoginModal.value = true
  }
}

const handleLoginClick = () => {
  showLoginModal.value = true
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    navigateToPath('/')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Admin sidebar toggle
const toggleAdminSidebar = () => {
  adminSidebarOpen.value = !adminSidebarOpen.value
  // Emit event to parent component to control sidebar
  emit('toggle-admin-sidebar', adminSidebarOpen.value)
}
// Load vendor role from user_roles table
const loadVendorRole = async () => {
  try {
    hasVendorRole.value = false
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) return
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
    if (error) {
      console.error('Error loading user roles:', error)
      return
    }
    hasVendorRole.value = Array.isArray(data) && data.some(r => (r.role || '').toLowerCase() === 'vendor')
  } catch (e) {
    console.error('loadVendorRole error:', e)
  }
}


// Load user store status using optimized RPC function
const loadUserStoreStatus = async () => {
  if (authStore.isAuthenticated) {
    try {
      const status = await storeStore.getUserStoreStatus()
      userStoreStatus.value = status
    } catch (error) {
      console.error('Error loading user store status:', error)
      userStoreStatus.value = { store_id: null, status: null, can_create: true }
    }
  }
}

//Navigate to the store creation page
const handleSwitchToVendor = (event) => {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  // Ensure button is enabled
  if (!shouldShowCreateStoreButton.value) {
    return
  }
  
  navigateToPath('/dashboard/store/create')
}

// Mobile version with menu close
const handleSwitchToVendorMobile = (event) => {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  // Ensure button is enabled
  if (!shouldShowCreateStoreButton.value) {
    return
  }
  
  mobileMenuOpen.value = false
  navigateToPath('/dashboard/store/create')
}

//Navigate to store dashboard (if user has a store)
const handleGoToStoreDashboard = async () => {
  try {
    // Check if user has a store using the optimized status
    if (userStoreStatus.value.store_id) {
      navigateToPath(`/store/${userStoreStatus.value.store_id}`)
    } else {
      // If no store exists, redirect to create store page
      navigateToPath('/dashboard/store/create')
    }
  } catch (error) {
    console.error('Error navigating to store dashboard:', error)
    // Fallback to create store page
    navigateToPath('/dashboard/store/create')
  }
}

// Watch for authentication changes to reload store status
watch(() => authStore.isAuthenticated, async (isAuthenticated) => {
  if (isAuthenticated) {
    await loadUserStoreStatus()
    await loadVendorRole()
    // Load notifications when user logs in
    await notificationStore.fetchNotifications({ limit: 50 })
    notificationStore.subscribeToNotifications()
  } else {
    userStoreStatus.value = { store_id: null, status: null, can_create: true }
    hasVendorRole.value = false
    // Clear notifications and unsubscribe when user logs out
    notificationStore.clearNotifications()
    notificationStore.unsubscribeFromNotifications()
  }
}, { immediate: true })

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await loadUserStoreStatus()
  await loadVendorRole()
  await fetchAdminRoleForToggle()
  await fetchEmployeeRoleForModeration()
  
  // Load notifications if user is authenticated
  if (authStore.isAuthenticated) {
    await notificationStore.fetchNotifications({ limit: 50 })
    notificationStore.subscribeToNotifications()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  // Unsubscribe from notifications
  notificationStore.unsubscribeFromNotifications()
  // Clear search debounce timer
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
})
</script> 