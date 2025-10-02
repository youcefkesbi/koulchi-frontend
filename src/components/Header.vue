<template>
  <header class="h-20 bg-white shadow-soft sticky top-0 z-50 border-b border-gray-100">
    <div class="container mx-auto px-4">
      <!-- Main header -->
      <div class="py-4 sm:py-6  h-20">
        <div class="h-10 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <!-- Logo -->
          <router-link :to="getLocalizedRoute('/')" class="group">
            <Logo size="large" />
          </router-link>

          <!-- Search bar -->
          <div class="w-full sm:flex-1 sm:max-w-2xl sm:mx-8 order-3 sm:order-2">
            <div class="relative group">
              <input
                v-model="searchQuery"
                @input="handleSearch"
                type="text"
                :placeholder="t('header.searchPlaceholder')"
                class="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 shadow-soft bg-white text-gray-900 placeholder-gray-500"
              />
              <i class="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors"></i>
            </div>
          </div>

          <!-- Categories Dropdown -->
          <div class="relative categories-dropdown order-2 sm:order-3">
            <button
              @click="categoriesMenuOpen = !categoriesMenuOpen"
              class="flex items-center space-x-2 space-x-reverse px-4 py-3 text-gray-700 hover:text-primary transition-all duration-300 rounded-2xl hover:bg-gray-50"
            >
              <i class="fas fa-layer-group text-lg"></i>
              <span class="font-medium text-gray-700">{{ t('header.categories') }}</span>
              <i class="fas fa-chevron-down text-xs transition-transform duration-300" :class="{ 'rotate-180': categoriesMenuOpen }"></i>
            </button>

            <!-- Categories Dropdown Menu -->
            <div 
              v-if="categoriesMenuOpen"
              class="absolute top-full right-0 mt-2 w-56 sm:w-64 bg-white rounded-2xl shadow-soft border border-gray-100 py-2 z-50"
            >
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 p-2">
                <router-link
                  v-for="category in categories"
                  :key="category.id"
                  :to="getLocalizedRoute(`/category/${category.id}`)"
                  @click="categoriesMenuOpen = false"
                  class="flex items-center space-x-2 space-x-reverse p-3 rounded-xl hover:bg-gray-50 transition-all duration-300 group"
                >
                  <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:bg-secondary transition-all duration-300">
                    <i :class="getCategoryIcon(category.id)" class="text-white text-sm"></i>
                  </div>
                  <span class="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">
                    {{ getCategoryName(category.id) }}
                  </span>
                </router-link>
              </div>
            </div>
          </div>

          <!-- Navigation and Auth -->
          <div class="flex items-center space-x-4 sm:space-x-6 space-x-reverse order-1 sm:order-4">
            <!-- Navigation Icons -->
            <nav class="flex items-center space-x-4 sm:space-x-6 space-x-reverse">
              <router-link :to="getLocalizedRoute('/cart')" class="relative text-gray-700 hover:text-primary transition-all duration-300 hover:scale-110" title="Cart">
                <i class="fas fa-shopping-cart text-xl"></i>
                <span v-if="cartStore.totalItems > 0" class="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-soft">
                  {{ cartStore.totalItems }}
                </span>
              </router-link>
            </nav>

            <!-- Post Announcement Button -->
            <button
              @click="handlePostAnnouncement"
              class="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-primary hover:text-primary transition-all duration-300"
            >
              <i class="fas fa-plus mr-1"></i>
              <span class="hidden sm:inline">{{ t('header.postAnnouncement') }}</span>
              <span class="sm:hidden">Post</span>
            </button>

            <!-- Create a store btn -->
            <button
              v-if="shouldShowCreateStoreButton"
              @click="handleSwitchToVendor"
              class="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-primary hover:text-primary transition-all duration-300"
            >
              <i class="fas fa-store mr-1"></i>
              <span class="hidden sm:inline">{{ t('seller.createStore') }}</span>
              <span class="sm:hidden">Store</span>
            </button>

            <!-- Language Switcher (always visible, compact) -->
            <LanguageSwitcher :compact="true" />

            <!-- User Menu (auth) -->
            <div v-if="authStore.isAuthenticated" class="relative user-dropdown">
              <button
                @click="userMenuOpen = !userMenuOpen"
                class="flex items-center space-x-2 space-x-reverse px-2 sm:px-4 py-2 text-gray-700 hover:text-primary transition-all duration-300 rounded-xl hover:bg-gray-50"
              >
                <img
                  :src="authStore.userAvatar || '/user-avatar.png'"
                  :alt="authStore.userDisplayName || authStore.userEmail"
                  class="w-8 h-8 rounded-full object-cover"
                />
                <span class="font-medium hidden sm:block text-gray-700">{{ authStore.userDisplayName || authStore.userEmail }}</span>
                <i class="fas fa-chevron-down text-xs transition-transform duration-300" :class="{ 'rotate-180': userMenuOpen }"></i>
              </button>

              <!-- User Dropdown Menu -->
              <div 
                v-if="userMenuOpen"
                class="absolute top-full right-0 mt-2 w-40 sm:w-48 bg-white rounded-2xl shadow-soft border border-gray-100 py-2 z-50"
              >
                <router-link v-if="hasApprovedStore" :to="getLocalizedRoute('/dashboard')" class="dropdown-item">
                  <i class="fas fa-chart-line mr-3"></i>{{ t('header.dashboard') }}
                </router-link>
                <router-link :to="getLocalizedRoute('/profile')" class="dropdown-item">
                  <i class="fas fa-user mr-3"></i>{{ t('header.myProfile') }}
                </router-link>
                <router-link :to="getLocalizedRoute('/wishlist')" class="dropdown-item flex items-center justify-between">
                  <div class="flex items-center">
                    <i class="fas fa-heart mr-3"></i>{{ t('wishlist.title') }}
                  </div>
                  <span 
                  :class="wishlistStore.totalItems > 0 ? 'ml-2 bg-secondary text-white text-xs rounded-full px-2 py-1 flex-shrink-0' : 'hidden'">
                    {{ wishlistStore.totalItems }}
                  </span>
                </router-link>
                <router-link :to="getLocalizedRoute('/mypurchases')" class="dropdown-item">
                  <i class="fas fa-shopping-bag mr-3"></i>{{ t('header.myPurchases') }}
                </router-link>
                <router-link v-if="hasApprovedStore" :to="getLocalizedRoute('/mystoreproducts')" class="dropdown-item">
                  <i class="fas fa-clipboard-list mr-3"></i>My Store products
                </router-link>
                <button
  v-if="userStoreStatus.store_id"
  @click="handleGoToStoreDashboard"
  class="dropdown-item w-full text-left"
>
  <i class="fas fa-store mr-3"></i>{{ $t('stores.myStore') }}
</button>

                <button
                  @click="handleLogout"
                  class="dropdown-item w-full text-left"
                >
                  <i class="fas fa-sign-out-alt mr-3"></i>{{ t('header.logout') }}
                </button>
              </div>
            </div>

            <div v-else class="flex items-center space-x-4 space-x-reverse">
              <button
                @click="handleLoginClick"
                class="btn-outline text-xs sm:text-sm px-3 sm:px-6 py-2 sm:py-3"
              >
                <i class="fas fa-sign-in-alt mr-2"></i>
                <span class="hidden sm:inline">{{ t('header.login') }}</span>
                <span class="sm:hidden">Login</span>
              </button>
            </div>
          </div>
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
import { getLocalizedPath } from '../lib/i18n-utils'

import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { useWishlistStore } from '../stores/wishlist'
import { useProductStore } from '../stores/product'
import { useStoreStore } from '../stores/store'
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

const searchQuery = ref('')
const userMenuOpen = ref(false)
const categoriesMenuOpen = ref(false)
const showLoginModal = ref(false)
const userStoreStatus = ref({ store_id: null, status: null, can_create: true })

// Get localized route path
const getLocalizedRoute = (path) => {
  const currentLocale = route.meta.locale || 'en'
  return getLocalizedPath(path, currentLocale)
}

// Close dropdown when clicking outside
const closeDropdown = () => {
  userMenuOpen.value = false
}

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
}

// Get categories from product store
const categories = computed(() => productStore.categories.filter(cat => cat.id !== 'all'))

// Check if user has an approved store
const hasApprovedStore = computed(() => {
  return authStore.isAuthenticated && userStoreStatus.value.status === 'approved'
})

// Check if user should see the "Create Store" button
const shouldShowCreateStoreButton = computed(() => {
  return authStore.isAuthenticated && userStoreStatus.value.can_create
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

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: getLocalizedRoute('/products'),
      query: { search: searchQuery.value.trim() }
    })
  }
}

const handlePostAnnouncement = () => {
  if (authStore.isAuthenticated) {
    router.push(getLocalizedRoute('/myannouncements/new'))
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
    router.push(getLocalizedRoute('/'))
  } catch (error) {
    console.error('Logout error:', error)
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
const handleSwitchToVendor = () => {
  router.push(getLocalizedRoute('/dashboard/store/create'))
}

//Navigate to store dashboard (if user has a store)
const handleGoToStoreDashboard = async () => {
  try {
    const currentLocale = route.meta?.locale || 'en'
    
    // Check if user has a store using the optimized status
    if (userStoreStatus.value.store_id) {
      router.push(`/${currentLocale}/store/${userStoreStatus.value.store_id}`)
    } else {
      // If no store exists, redirect to create store page
      router.push(`/${currentLocale}/dashboard/store/create`)
    }
  } catch (error) {
    console.error('Error navigating to store dashboard:', error)
    // Fallback to create store page
    const currentLocale = route.meta?.locale || 'en'
    router.push(`/${currentLocale}/dashboard/store/create`)
  }
}

// Watch for authentication changes to reload store status
watch(() => authStore.isAuthenticated, async (isAuthenticated) => {
  if (isAuthenticated) {
    await loadUserStoreStatus()
  } else {
    userStoreStatus.value = { store_id: null, status: null, can_create: true }
  }
}, { immediate: true })

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await loadUserStoreStatus()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script> 