<template>
  <header class="bg-white shadow-md top-0 z-50">
    <div class="container mx-auto px-4">
      <!-- Top bar with contact info and language switcher -->
      <div class="bg-primary text-white py-2 text-sm">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-4 space-x-reverse">
            <span><i class="fas fa-phone ml-2"></i>+213 123 456 789</span>
            <span><i class="fas fa-envelope ml-2"></i>info@koulchi.dz</span>
          </div>
          <div class="flex items-center space-x-4 space-x-reverse">
            <span><i class="fas fa-truck ml-2"></i>{{ $t('freeShipping') }}</span>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <!-- Main header -->
      <div class="py-4">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <router-link to="/" class="flex items-center space-x-3 space-x-reverse">
            <div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <i class="fas fa-shopping-bag text-white text-xl"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-primary">كولشي</h1>
              <p class="text-sm text-gray-600">Koulchi</p>
            </div>
          </router-link>

          <!-- Search bar -->
          <div class="flex-1 max-w-2xl mx-8">
            <div class="relative">
              <input
                v-model="searchQuery"
                @input="handleSearch"
                type="text"
                :placeholder="$t('searchPlaceholder')"
                class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <i class="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <!-- Navigation and Auth -->
          <div class="flex items-center space-x-4 space-x-reverse">
            <!-- Navigation Icons -->
            <nav class="flex items-center space-x-4 space-x-reverse">
              <router-link to="/products" class="text-gray-700 hover:text-primary transition-colors" :title="$t('products')">
                <i class="fas fa-th-large text-xl"></i>
              </router-link>
              <router-link to="/cart" class="relative text-gray-700 hover:text-primary transition-colors" :title="$t('cart')">
                <i class="fas fa-shopping-cart text-xl"></i>
                <span v-if="cartStore.totalItems > 0" class="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {{ cartStore.totalItems }}
                </span>
              </router-link>
            </nav>

            <!-- Auth Section -->
            <div class="flex items-center space-x-3 space-x-reverse">
              <!-- Become a Seller Button / Seller Dashboard -->
              <div v-if="authStore.isAuthenticated && authStore.isSeller">
                <router-link
                  to="/seller/dashboard"
                  class="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <i class="fas fa-chart-line mr-2"></i>
                  {{ $t('seller.dashboard') }}
                </router-link>
              </div>
              <button
                v-else
                @click="handleBecomeSeller"
                class="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <i class="fas fa-store mr-2"></i>
                {{ $t('becomeASeller') }}
              </button>

              <!-- User Menu / Login Button -->
              <div v-if="authStore.isAuthenticated" class="relative">
                <button
                  @click="userMenuOpen = !userMenuOpen"
                  class="flex items-center space-x-2 space-x-reverse p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <img
                    v-if="authStore.userPhotoURL"
                    :src="authStore.userPhotoURL"
                    :alt="authStore.userDisplayName"
                    class="w-8 h-8 rounded-full"
                  />
                  <div v-else class="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <i class="fas fa-user text-white text-sm"></i>
                  </div>
                  <span class="text-sm font-medium text-gray-700">{{ authStore.userDisplayName || authStore.userEmail }}</span>
                  <i class="fas fa-chevron-down text-xs text-gray-500"></i>
                </button>

                <!-- User Dropdown Menu -->
                <div
                  v-if="userMenuOpen"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                >
                  <div class="py-1">
                    <router-link
                      to="/profile"
                      class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <i class="fas fa-user mr-3"></i>
                      {{ $t('profile') }}
                    </router-link>
                    <router-link
                      to="/orders"
                      class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <i class="fas fa-shopping-bag mr-3"></i>
                      {{ $t('orders') }}
                    </router-link>
                    <button
                      @click="handleLogout"
                      class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <i class="fas fa-sign-out-alt mr-3"></i>
                      {{ $t('logout') }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Login Button -->
              <button
                v-else
                @click="showLoginModal = true"
                class="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <i class="fas fa-sign-in-alt mr-2"></i>
                {{ $t('login') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Category navigation -->
      <div class="border-t border-gray-200 py-3">
        <div class="flex items-center justify-center space-x-8 space-x-reverse">
          <button
            v-for="category in productsStore.categories"
            :key="category.id"
            @click="selectCategory(category.id)"
            :class="[
              'px-4 py-2 rounded-lg transition-colors',
              productsStore.selectedCategory === category.id
                ? 'bg-primary text-white'
                : 'text-gray-700 hover:bg-gray-100'
            ]"
          >
            {{ category.nameAr }}
          </button>
        </div>
      </div>
    </div>

    <!-- Login Modal -->
    <LoginModal :is-open="showLoginModal" @close="showLoginModal = false" />
    
    <!-- Become Seller Modal -->
    <BecomeSellerModal :is-open="showBecomeSellerModal" @close="showBecomeSellerModal = false" />
  </header>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useCartStore } from '../stores/cart'
import { useProductsStore } from '../stores/products'
import { useAuthStore } from '../stores/auth'
import LoginModal from './LoginModal.vue'
import BecomeSellerModal from './BecomeSellerModal.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'

export default {
  name: 'Header',
  components: {
    LoginModal,
    BecomeSellerModal,
    LanguageSwitcher
  },
  setup() {
    const cartStore = useCartStore()
    const productsStore = useProductsStore()
    const authStore = useAuthStore()
    const searchQuery = ref('')
    const showLoginModal = ref(false)
    const showBecomeSellerModal = ref(false)
    const userMenuOpen = ref(false)

    const handleSearch = () => {
      productsStore.setSearchQuery(searchQuery.value)
    }

    const selectCategory = (categoryId) => {
      productsStore.setCategory(categoryId)
    }

    const handleBecomeSeller = () => {
      if (authStore.isAuthenticated) {
        showBecomeSellerModal.value = true
      } else {
        showLoginModal.value = true
      }
    }

    const handleLogout = async () => {
      await authStore.logout()
      userMenuOpen.value = false
    }

    // Close user menu when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        userMenuOpen.value = false
      }
    }

    onMounted(() => {
      authStore.initAuth()
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      cartStore,
      productsStore,
      authStore,
      searchQuery,
      showLoginModal,
      showBecomeSellerModal,
      userMenuOpen,
      handleSearch,
      selectCategory,
      handleBecomeSeller,
      handleLogout
    }
  }
}
</script> 