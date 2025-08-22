<template>
  <header class="bg-white shadow-soft sticky top-0 z-50 border-b border-gray-100">
    <div class="container mx-auto px-4">
      <!-- Top bar with contact info and language switcher -->
      <div class="bg-primary text-white py-3 text-sm">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-4 space-x-reverse">
            <span class="flex items-center hover:text-primary-light transition-colors">
              <i class="fas fa-phone ml-2"></i>+213 123 456 789
            </span>
            <span class="flex items-center hover:text-primary-light transition-colors">
              <i class="fas fa-envelope ml-2"></i>info@koulchi.dz
            </span>
          </div>
          <div class="flex items-center space-x-4 space-x-reverse">
            <span class="flex items-center hover:text-primary-light transition-colors">
              <i class="fas fa-truck ml-2"></i>{{ $t('header.freeShipping') }}
            </span>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <!-- Main header -->
      <div class="py-6">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <router-link to="/" class="flex items-center space-x-3 space-x-reverse group">
            <div class="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300 group-hover:scale-105">
              <i class="fas fa-shopping-bag text-white text-xl"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-primary">كولشي</h1>
              <p class="text-sm text-gray-600 font-medium">Koulchi</p>
            </div>
          </router-link>

          <!-- Search bar -->
          <div class="flex-1 max-w-2xl mx-8">
            <div class="relative group">
              <input
                v-model="searchQuery"
                @input="handleSearch"
                type="text"
                :placeholder="$t('header.searchPlaceholder')"
                class="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 shadow-soft"
              />
              <i class="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors"></i>
            </div>
          </div>

          <!-- Navigation and Auth -->
          <div class="flex items-center space-x-6 space-x-reverse">
            <!-- Navigation Icons -->
            <nav class="flex items-center space-x-6 space-x-reverse">
              <router-link to="/products" class="text-gray-700 hover:text-primary transition-all duration-300 hover:scale-110" title="Products">
                <i class="fas fa-th-large text-xl"></i>
              </router-link>
              <router-link to="/wishlist" class="relative text-gray-700 hover:text-primary transition-all duration-300 hover:scale-110" title="Wishlist">
                <i class="fas fa-heart text-xl"></i>
                <span v-if="wishlistStore.totalItems > 0" class="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-soft">
                  {{ wishlistStore.totalItems }}
                </span>
              </router-link>
              <router-link to="/cart" class="relative text-gray-700 hover:text-primary transition-all duration-300 hover:scale-110" title="Cart">
                <i class="fas fa-shopping-cart text-xl"></i>
                <span v-if="cartStore.totalItems > 0" class="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-soft">
                  {{ cartStore.totalItems }}
                </span>
              </router-link>
            </nav>

            <!-- Auth Section -->
            <div class="flex items-center space-x-4 space-x-reverse">
              <!-- Post Announcement Button -->
              <button
                @click="handlePostAnnouncement"
                class="px-6 py-3 bg-secondary text-white text-sm font-semibold rounded-2xl hover:bg-secondary-dark focus:outline-none focus:ring-4 focus:ring-secondary/20 transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
              >
                <i class="fas fa-bullhorn mr-2"></i>
                {{ $t('header.postAnnouncement') }}
              </button>

              <!-- User Dashboard / Login Button -->
              <div v-if="authStore.isAuthenticated" class="flex items-center space-x-4 space-x-reverse">
                <router-link
                  to="/dashboard"
                  class="px-6 py-3 bg-primary text-white text-sm font-semibold rounded-2xl hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
                >
                  <i class="fas fa-chart-line mr-2"></i>
                  {{ $t('header.userDashboard') }}
                </router-link>
                
                <router-link
                  to="/profile"
                  class="px-6 py-3 bg-secondary text-white text-sm font-semibold rounded-2xl hover:bg-secondary-dark focus:outline-none focus:ring-4 focus:ring-secondary/20 transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
                >
                  <i class="fas fa-user mr-2"></i>
                  {{ $t('header.myProfile') }}
                </router-link>
              </div>

              <!-- User Menu / Login Button -->
              <div v-if="authStore.isAuthenticated" class="relative user-dropdown">
                <button
                  @click="userMenuOpen = !userMenuOpen"
                  class="flex items-center space-x-3 space-x-reverse p-3 rounded-2xl hover:bg-gray-50 transition-all duration-300 group"
                >
                  <img
                    :src="authStore.userPhotoURL"
                    :alt="authStore.userDisplayName"
                    class="w-10 h-10 rounded-full border-2 border-primary group-hover:border-secondary transition-colors object-cover"
                  />
                  <span class="text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors">{{ authStore.userDisplayName || authStore.userEmail }}</span>
                  <i class="fas fa-chevron-down text-xs text-gray-500 group-hover:text-primary transition-colors"></i>
                </button>

                <!-- User Dropdown Menu -->
                <div 
                  v-if="userMenuOpen" 
                  @click.stop
                  class="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-soft border border-gray-100 py-2 z-50"
                >
                  <router-link to="/dashboard" class="block px-4 py-3 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors">
                    <i class="fas fa-chart-line mr-3"></i>{{ $t('header.dashboard') }}
                  </router-link>
                  <router-link to="/wishlist" class="block px-4 py-3 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors">
                    <i class="fas fa-heart mr-3"></i>قائمة الأمنيات
                  </router-link>
                  <router-link to="/profile" class="block px-4 py-3 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors">
                    <i class="fas fa-user mr-3"></i>{{ $t('header.myProfile') }}
                  </router-link>
                  <button 
                    type="button"
                    @click.prevent="logout" 
                    class="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <i class="fas fa-sign-out-alt mr-3"></i>{{ $t('header.logout') }}
                  </button>
                </div>
              </div>

              <!-- Login Button -->
              <button
                v-else
                @click="handleLoginClick"
                class="px-6 py-3 bg-primary text-white text-sm font-semibold rounded-2xl hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-300 shadow-soft hover:shadow-glow transform hover:scale-105"
              >
                <i class="fas fa-sign-in-alt mr-2"></i>{{ $t('header.login') }}
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

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { useWishlistStore } from '../stores/wishlist'
import LanguageSwitcher from './LanguageSwitcher.vue'
import LoginModal from './LoginModal.vue'

export default {
  name: 'Header',
  components: {
    LanguageSwitcher,
    LoginModal
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const cartStore = useCartStore()
    const wishlistStore = useWishlistStore()
    
    const searchQuery = ref('')
    const userMenuOpen = ref(false)
    const showLoginModal = ref(false)
    
    // Close dropdown when clicking outside
    const closeDropdown = () => {
      userMenuOpen.value = false
    }
    
    // Handle click outside dropdown
    const handleClickOutside = (event) => {
      // Only close if clicking outside the user dropdown area
      const dropdown = event.target.closest('.user-dropdown')
      if (!dropdown && userMenuOpen.value) {
        userMenuOpen.value = false
      }
    }

    const handleSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({
          path: '/products',
          query: { search: searchQuery.value.trim() }
        })
      }
    }

    const handlePostAnnouncement = () => {
      if (authStore.isAuthenticated) {
        router.push('/myannouncements/new')
      } else {
        showLoginModal.value = true
      }
    }

    const handleLoginClick = () => {
      showLoginModal.value = true
    }

    const logout = async () => {
      try {
        // Close the dropdown first
        userMenuOpen.value = false
        
        // Small delay to ensure dropdown closes
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Perform logout
        await authStore.logout()
        
        // Clear any cart data
        cartStore.clearCart()
        
        // Redirect to home page
        router.push('/')
      } catch (error) {
        // Even if logout fails, redirect to home
        router.push('/')
      }
    }

    // Add click outside listener
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      searchQuery,
      userMenuOpen,
      showLoginModal,
      authStore,
      cartStore,
      wishlistStore,
      handleSearch,
      handlePostAnnouncement,
      handleLoginClick,
      logout,
      closeDropdown
    }
  }
}
</script> 