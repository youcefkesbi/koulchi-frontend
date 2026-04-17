<template>
  <header class="bg-white shadow-soft sticky top-0 z-50 border-b border-neutral-200">
    <div class="px-4 sm:px-6 lg:px-8">
      <!-- Mobile Header (visible on mobile + tablet: < 1024px) -->
      <div class="flex items-center justify-between h-16 lg:hidden">
        <!-- Logo -->
        <router-link :to="getLocalizedRoutePath('/')" class="group flex-shrink-0">
          <Logo size="default" />
        </router-link>

        <!-- Mobile Menu Button -->
        <button
          @click.stop="mobileMenuOpen = !mobileMenuOpen"
          class="p-2 text-neutral-700 hover:text-primary transition-colors cursor-pointer touch-manipulation"
          style="pointer-events: auto; -webkit-tap-highlight-color: rgba(0,0,0,0.1); min-width: 44px; min-height: 44px;"
          aria-label="Toggle menu"
        >
          <i class="fas text-xl" :class="mobileMenuOpen ? 'fa-times' : 'fa-bars'"></i>
        </button>
      </div>

      <!-- Desktop Header (visible on desktop only: 1024px+) -->
      <div class="hidden lg:flex items-center justify-between h-20 py-4 overflow-visible">
        <div class="flex items-center justify-between w-full space-x-4 lg:space-x-6 overflow-visible">
          <!-- Logo -->
          <router-link :to="getLocalizedRoutePath('/')" class="group flex-shrink-0">
            <Logo size="large" />
          </router-link>

          <!-- Search bar -->
          <div class="flex-1 max-w-xl lg:max-w-2xl mx-2 sm:mx-4 lg:mx-8">
            <div class="relative group">
              <input
                v-model="searchQuery"
                @input="handleSearch"
                @keydown.enter="handleSearchEnter"
                @focus="showSearchResults = true"
                @blur="handleSearchBlur"
                type="text"
                :placeholder="t('header.searchPlaceholder')"
                class="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 lg:py-3 border-2 border-neutral-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 shadow-soft bg-white text-neutral-900 placeholder-neutral-600 text-xs sm:text-sm lg:text-base"
              />
              <i class="fas fa-search absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 group-hover:text-primary transition-colors text-sm sm:text-base"></i>
              
              <!-- Search Results Panel -->
              <div 
                v-if="showSearchResults && (searchQuery.trim() || searchResultsProducts.length > 0 || searchResultsStores.length > 0)"
                @mousedown.prevent
                class="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-soft border border-neutral-200 z-50 max-h-[600px] overflow-y-auto"
              >
                <!-- Loading State -->
                <div v-if="searchLoading" class="p-6 text-center">
                  <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                  <p class="text-sm text-gray-600">جاري البحث...</p>
                </div>
                
                <!-- Error State -->
                <div v-else-if="searchError" class="p-6 text-center">
                  <i class="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
                  <p class="text-sm text-red-600">{{ searchError }}</p>
                </div>
                
                <!-- Results -->
                <div v-else class="divide-y divide-neutral-200">
                  <!-- Products Section -->
                  <div v-if="searchResultsProducts.length > 0" class="p-4">
                    <h3 class="text-sm font-semibold text-gray-700 mb-3">{{ $t('header.searchProductsLabel', { count: searchResultsProducts.length }) }}</h3>
                    <div class="space-y-2">
                      <router-link
                        v-for="product in searchResultsProducts.slice(0, 5)"
                        :key="product.id"
                        :to="`/${$i18n.locale}/product/${product.id}`"
                        @click="closeSearchResults"
                        class="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors group"
                      >
                        <img 
                          v-if="product.thumbnail_url || (product.image_urls && product.image_urls[0])"
                          :src="product.thumbnail_url || product.image_urls[0]"
                          :alt="product.name"
                          class="w-12 h-12 object-cover rounded-lg"
                        />
                        <div v-else class="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                          <i class="fas fa-image text-neutral-400"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium text-gray-900 group-hover:text-primary truncate">{{ product.name }}</p>
                          <p class="text-xs text-gray-500 truncate">{{ product.description }}</p>
                        </div>
                        <div class="text-sm font-semibold text-primary">{{ product.price }} {{ $t('common.currencyShort') }}</div>
                      </router-link>
                      <router-link
                        v-if="searchResultsProducts.length > 5"
                        :to="`/products?search=${encodeURIComponent(searchQuery.trim())}`"
                        @click="closeSearchResults"
                        class="block text-center text-sm text-primary hover:underline py-2"
                      >
                        {{ $t('header.searchViewAllProducts', { count: searchResultsProducts.length }) }}
                      </router-link>
                    </div>
                  </div>
                  
                  <!-- Stores Section -->
                  <div v-if="searchResultsStores.length > 0" class="p-4">
                    <h3 class="text-sm font-semibold text-gray-700 mb-3">{{ $t('header.searchStoresLabel', { count: searchResultsStores.length }) }}</h3>
                    <div class="space-y-2">
                      <router-link
                        v-for="store in searchResultsStores.slice(0, 5)"
                        :key="store.id"
                        :to="`/stores/${store.id}`"
                        @click="closeSearchResults"
                        class="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors group"
                      >
                        <img 
                          v-if="store.logo_url"
                          :src="store.logo_url"
                          :alt="store.name"
                          class="w-12 h-12 object-cover rounded-lg"
                        />
                        <div v-else class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                          <i class="fas fa-store text-white"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium text-gray-900 group-hover:text-primary truncate">{{ store.name }}</p>
                          <p v-if="store.description" class="text-xs text-gray-500 truncate">{{ store.description }}</p>
                        </div>
                        <i class="fas fa-arrow-left text-gray-400 group-hover:text-primary"></i>
                      </router-link>
                      <router-link
                        v-if="searchResultsStores.length > 5"
                        :to="`/products?search=${encodeURIComponent(searchQuery.trim())}`"
                        @click="closeSearchResults"
                        class="block text-center text-sm text-primary hover:underline py-2"
                      >
                        {{ $t('header.searchViewAllStores', { count: searchResultsStores.length }) }}
                      </router-link>
                    </div>
                  </div>
                  
                  <!-- No Results -->
                  <div v-if="searchQuery.trim() && !searchLoading && searchResultsProducts.length === 0 && searchResultsStores.length === 0" class="p-6 text-center">
                    <i class="fas fa-search text-gray-400 text-2xl mb-2"></i>
                    <p class="text-sm text-gray-600">لم يتم العثور على نتائج</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Categories Dropdown (desktop only) -->
          <div class="relative z-60 categories-dropdown">
            <button
              type="button"
              @click.stop="toggleCategoriesMenu"
              @keydown.enter.prevent="toggleCategoriesMenu"
              @keydown.space.prevent="toggleCategoriesMenu"
              :aria-expanded="categoriesMenuOpen"
              aria-haspopup="menu"
              aria-controls="desktop-categories-menu"
              class="flex items-center space-x-2 space-x-reverse px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-neutral-700 hover:text-primary transition-all duration-300 rounded-2xl hover:bg-neutral-50"
            >
              <i class="fas fa-layer-group text-base sm:text-lg"></i>
              <span class="font-medium text-neutral-700 hidden lg:inline text-sm sm:text-base">{{ t('header.categories') }}</span>
              <i class="fas fa-chevron-down text-xs transition-transform duration-300" :class="{ 'rotate-180': categoriesMenuOpen }"></i>
            </button>

            <!-- Categories Dropdown Menu -->
            <div 
              v-if="categoriesMenuOpen"
              id="desktop-categories-menu"
              role="menu"
              @click.stop
              class="categories-dropdown-panel absolute top-full right-0 mt-2 w-56 sm:w-64 lg:w-72 bg-white rounded-2xl shadow-soft border border-neutral-200 py-2 z-50 max-h-[70vh] overflow-y-auto"
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
                v-if="isAuthenticatedRef"
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
            <div v-if="isAuthenticatedRef" class="relative z-60 user-dropdown">
              <button
                type="button"
                @click.stop="toggleUserMenu"
                @keydown.enter.prevent="toggleUserMenu"
                @keydown.space.prevent="toggleUserMenu"
                :aria-expanded="userMenuOpen"
                aria-haspopup="menu"
                aria-controls="desktop-user-menu"
                class="flex items-center space-x-2 space-x-reverse min-w-0 max-w-full px-2 lg:px-3 py-1.5 lg:py-2 text-gray-700 hover:text-primary transition-all duration-300 rounded-xl hover:bg-gray-50"
              >
                <img
                  :src="authStore.userPhotoURL"
                  :alt="authStore.userFullName || authStore.userEmail || authStore.userDisplayName"
                  class="shrink-0 w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover"
                />
                <span
                  class="hidden lg:block min-w-0 max-w-40 xl:max-w-56 2xl:max-w-72 truncate font-medium text-gray-700 text-sm leading-tight text-start"
                >{{ authStore.userFullName || authStore.userEmail }}</span>
                <i class="fas fa-chevron-down shrink-0 text-xs transition-transform duration-300 hidden lg:inline" :class="{ 'rotate-180': userMenuOpen }"></i>
              </button>

              <!-- User Dropdown Menu -->
              <div 
                v-if="userMenuOpen"
                id="desktop-user-menu"
                role="menu"
                @click.stop
                class="user-dropdown-panel absolute top-full right-0 mt-2 w-48 sm:w-56 lg:w-64 bg-white rounded-2xl shadow-soft border border-gray-100 py-2 z-60 max-h-[80vh] overflow-y-auto"
              >
                <router-link v-if="hasApprovedStore" :to="getLocalizedRoutePath('/dashboard')" class="dropdown-item">
                  <i class="fas fa-chart-line mr-3"></i>{{ t('header.dashboard') }}
                </router-link>
                <router-link :to="getLocalizedRoute('/myaccount')" class="dropdown-item">
                  <i class="fas fa-user mr-3"></i>{{ t('header.myProfile') }}
                </router-link>
                <router-link :to="getLocalizedRoute('/myaccount')" class="dropdown-item">
                  <i class="fas fa-cog mr-3"></i>{{ t('header.settings') }}
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
                  <i class="fas fa-shopping-bag mr-3"></i>{{ t('header.orders') }}
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

      <!-- Mobile Menu (visible when mobileMenuOpen is true; shown on mobile + tablet < 1024px) -->
      <div 
        v-if="mobileMenuOpen"
        class="mobile-menu-container lg:hidden border-t border-neutral-200 py-4 space-y-4 relative z-50 bg-white"
        style="pointer-events: auto;"
        @click.stop
      >
        <!-- Mobile Search -->
        <div class="relative group" style="pointer-events: auto;">
          <input
            v-model="searchQuery"
            @input="handleSearch"
            @keydown.enter="handleSearchEnter"
            @focus="showSearchResults = true"
            @blur="handleSearchBlur"
            @click.stop
            type="text"
            :placeholder="t('header.searchPlaceholder')"
            class="w-full pl-12 pr-4 py-2.5 border-2 border-neutral-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 shadow-soft bg-white text-neutral-900 placeholder-neutral-600 text-sm touch-manipulation"
            style="pointer-events: auto; -webkit-tap-highlight-color: rgba(0,0,0,0.1);"
          />
          <i class="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 group-hover:text-primary transition-colors"></i>
          
          <!-- Mobile Search Results Panel -->
          <div 
            v-if="showSearchResults && (searchQuery.trim() || searchResultsProducts.length > 0 || searchResultsStores.length > 0)"
            @mousedown.prevent
            @touchstart.prevent
            class="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-soft border border-neutral-200 z-60 max-h-[400px] overflow-y-auto"
            style="pointer-events: auto;"
          >
            <!-- Loading State -->
            <div v-if="searchLoading" class="p-4 text-center">
              <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
              <p class="text-xs text-gray-600">جاري البحث...</p>
            </div>
            
            <!-- Results -->
            <div v-else class="divide-y divide-neutral-200">
              <!-- Products Section -->
              <div v-if="searchResultsProducts.length > 0" class="p-3">
                <h3 class="text-xs font-semibold text-gray-700 mb-2">{{ $t('header.searchProductsLabel', { count: searchResultsProducts.length }) }}</h3>
                <div class="space-y-1">
                  <router-link
                    v-for="product in searchResultsProducts.slice(0, 3)"
                    :key="product.id"
                    :to="`/${$i18n.locale}/product/${product.id}`"
                    @click.stop="closeSearchResultsAndMobileMenu"
                    class="flex items-center gap-2 p-1.5 rounded hover:bg-neutral-50 cursor-pointer touch-manipulation"
                    style="pointer-events: auto; -webkit-tap-highlight-color: rgba(0,0,0,0.1); min-height: 44px;"
                  >
                    <img 
                      v-if="product.thumbnail_url || (product.image_urls && product.image_urls[0])"
                      :src="product.thumbnail_url || product.image_urls[0]"
                      :alt="product.name"
                      class="w-10 h-10 object-cover rounded"
                    />
                    <div v-else class="w-10 h-10 bg-neutral-100 rounded flex items-center justify-center">
                      <i class="fas fa-image text-neutral-400 text-xs"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium text-gray-900 truncate">{{ product.name }}</p>
                      <p class="text-xs text-primary font-semibold">{{ product.price }} {{ $t('common.currencyShort') }}</p>
                    </div>
                  </router-link>
                </div>
              </div>
              
              <!-- Stores Section -->
              <div v-if="searchResultsStores.length > 0" class="p-3">
                <h3 class="text-xs font-semibold text-gray-700 mb-2">{{ $t('header.searchStoresLabel', { count: searchResultsStores.length }) }}</h3>
                <div class="space-y-1">
                  <router-link
                    v-for="store in searchResultsStores.slice(0, 3)"
                    :key="store.id"
                    :to="`/stores/${store.id}`"
                    @click.stop="closeSearchResultsAndMobileMenu"
                    class="flex items-center gap-2 p-1.5 rounded hover:bg-neutral-50 cursor-pointer touch-manipulation"
                    style="pointer-events: auto; -webkit-tap-highlight-color: rgba(0,0,0,0.1); min-height: 44px;"
                  >
                    <img 
                      v-if="store.logo_url"
                      :src="store.logo_url"
                      :alt="store.name"
                      class="w-10 h-10 object-cover rounded"
                    />
                    <div v-else class="w-10 h-10 bg-primary rounded flex items-center justify-center">
                      <i class="fas fa-store text-white text-xs"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium text-gray-900 truncate">{{ store.name }}</p>
                    </div>
                  </router-link>
                </div>
              </div>
              
              <!-- No Results -->
              <div v-if="searchQuery.trim() && !searchLoading && searchResultsProducts.length === 0 && searchResultsStores.length === 0" class="p-4 text-center">
                <i class="fas fa-search text-gray-400 text-xl mb-1"></i>
                <p class="text-xs text-gray-600">لم يتم العثور على نتائج</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Categories -->
        <div class="relative">
          <button
            @click.stop="categoriesMenuOpen = !categoriesMenuOpen"
            class="w-full flex items-center justify-between px-4 py-3 text-neutral-700 hover:text-primary transition-all duration-300 rounded-2xl hover:bg-neutral-50 cursor-pointer touch-manipulation"
            style="pointer-events: auto; -webkit-tap-highlight-color: rgba(0,0,0,0.1); min-height: 44px;"
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
              @click.stop="closeMobileMenuAndCategories"
              class="flex items-center space-x-2 space-x-reverse p-3 rounded-xl hover:bg-white transition-all duration-300 group cursor-pointer touch-manipulation"
              style="pointer-events: auto; -webkit-tap-highlight-color: rgba(0,0,0,0.1); min-height: 44px;"
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
            class="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-primary hover:text-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer touch-manipulation"
            style="pointer-events: auto; -webkit-tap-highlight-color: rgba(0,0,0,0.1); min-height: 44px;"
          >
            <i class="fas fa-plus"></i>
            <span>{{ t('header.addProduct') }}</span>
          </button>

          <button
            v-show="shouldShowCreateStoreButton"
            @click.stop="handleSwitchToVendorMobile"
            :disabled="!shouldShowCreateStoreButton"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-primary hover:text-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer touch-manipulation"
            style="pointer-events: auto; -webkit-tap-highlight-color: rgba(0,0,0,0.1); min-height: 44px;"
          >
            <i class="fas fa-store"></i>
            <span>{{ t('seller.createStore') }}</span>
          </button>
        </div>

        <!-- Mobile User Menu (key forces re-render when auth state changes so Login/Profile switch is immediate) -->
        <div v-if="isAuthenticatedRef" key="mobile-auth-in" class="border-t border-neutral-200 pt-4 space-y-2">
          <router-link
            v-for="link in mobileUserLinks"
            :key="link.path"
            :to="getLocalizedRoutePath(link.path)"
            @click.stop="closeMobileMenu"
            class="flex items-center space-x-2 space-x-reverse px-4 py-3 text-neutral-700 hover:text-primary hover:bg-neutral-50 rounded-xl transition-all duration-300 cursor-pointer touch-manipulation"
            style="pointer-events: auto; -webkit-tap-highlight-color: rgba(0,0,0,0.1);"
          >
            <i :class="link.icon" class="text-lg"></i>
            <span class="font-medium">{{ link.label }}</span>
          </router-link>
          <button
            @click.stop="handleLogoutMobile"
            class="w-full flex items-center space-x-2 space-x-reverse px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300 cursor-pointer touch-manipulation"
            style="pointer-events: auto; -webkit-tap-highlight-color: rgba(0,0,0,0.1);"
          >
            <i class="fas fa-sign-out-alt text-lg"></i>
            <span class="font-medium">{{ t('header.logout') }}</span>
          </button>
        </div>

        <div v-else key="mobile-auth-out" class="border-t border-neutral-200 pt-4">
          <button
            type="button"
            class="w-full btn-primary text-sm py-3 cursor-pointer touch-manipulation"
            style="pointer-events: auto; -webkit-tap-highlight-color: rgba(0,0,0,0.1); min-height: 44px;"
            @click.stop.prevent="handleLoginClickMobile"
            @touchend.stop.prevent="handleLoginClickMobile"
          >
            <i class="fas fa-sign-in-alt mr-2"></i>
            {{ t('header.login') }}
          </button>
        </div>
      </div>
    </div>

  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
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
import Logo from './Logo.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
// Keep auth state as refs so template updates reliably when session changes (e.g. after login on mobile)
const { isAuthenticated: isAuthenticatedRef } = storeToRefs(authStore)
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
const showSearchResults = ref(false)
const searchResultsProducts = ref([])
const searchResultsStores = ref([])
const searchLoading = ref(false)
const searchError = ref(null)
let searchDebounceTimer = null
let searchBlurTimer = null
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

// Desktop dropdown toggles (click-based, mutually exclusive)
const toggleUserMenu = () => {
  const next = !userMenuOpen.value
  userMenuOpen.value = next
  if (next) categoriesMenuOpen.value = false
}

const toggleCategoriesMenu = () => {
  const next = !categoriesMenuOpen.value
  categoriesMenuOpen.value = next
  if (next) userMenuOpen.value = false
}

const closeDesktopDropdowns = () => {
  userMenuOpen.value = false
  categoriesMenuOpen.value = false
}

// Mobile user links (Profile, Orders, Settings, etc. for mobile/tablet menu)
const mobileUserLinks = computed(() => {
  const links = []
  if (hasApprovedStore.value) {
    links.push({ path: '/dashboard', icon: 'fas fa-chart-line', label: t('header.dashboard') })
  }
  links.push({ path: '/myaccount', icon: 'fas fa-user', label: t('header.myProfile') })
  links.push({ path: '/mypurchases', icon: 'fas fa-shopping-bag', label: t('header.orders') })
  links.push({ path: '/myaccount', icon: 'fas fa-cog', label: t('header.settings') })
  links.push({ path: '/wishlist', icon: 'fas fa-heart', label: t('wishlist.title') })
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

// Close desktop dropdowns on outside click. Use capture phase so this runs before
// bubble-phase listeners (e.g. LanguageSwitcher) and doesn't fight @click.stop on toggles.
const handleClickOutside = (event) => {
  const t = event.target
  if (!(t instanceof Element)) return

  if (t.closest('.mobile-menu-container')) {
    return
  }

  // Clicks on toggles / panels stay inside these roots — do not close here (toggle handles open/close).
  if (t.closest('.user-dropdown') || t.closest('.categories-dropdown')) {
    return
  }

  if (userMenuOpen.value) userMenuOpen.value = false
  if (categoriesMenuOpen.value) categoriesMenuOpen.value = false

  if (!t.closest('header') && mobileMenuOpen.value) {
    mobileMenuOpen.value = false
  }
}

const handleEscapeKey = (event) => {
  if (event.key === 'Escape') {
    closeDesktopDropdowns()
    if (mobileMenuOpen.value) {
      mobileMenuOpen.value = false
    }
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

const performSearch = async (query) => {
  if (!query || !query.trim()) {
    searchResultsProducts.value = []
    searchResultsStores.value = []
    searchError.value = null
    return
  }
  
  try {
    searchLoading.value = true
    searchError.value = null
    
    // Search products and stores in parallel
    const [products, stores] = await Promise.all([
      productStore.searchProducts(query.trim()),
      storeStore.searchStores(query.trim())
    ])
    
    searchResultsProducts.value = products || []
    searchResultsStores.value = stores || []
  } catch (err) {
    console.error('Error searching:', err)
    searchError.value = err?.message || 'Failed to search'
    searchResultsProducts.value = []
    searchResultsStores.value = []
  } finally {
    searchLoading.value = false
  }
}

const handleSearch = (event) => {
  // Only handle input events for real-time search
  if (event && event.type === 'input') {
    showSearchResults.value = true
    clearTimeout(searchDebounceTimer)
    
    // Debounce the search
    searchDebounceTimer = setTimeout(() => {
      performSearch(searchQuery.value)
    }, 300) // 300ms debounce
  }
}

const handleSearchEnter = (event) => {
  if (event && event.key === 'Enter') {
    const query = searchQuery.value.trim()
    if (query) {
      // Navigate to products page with search query
      navigateToPath('/products', { query: { search: query } })
      closeSearchResults()
    }
  }
}

const handleSearchBlur = () => {
  // Delay closing to allow clicks on results
  searchBlurTimer = setTimeout(() => {
    showSearchResults.value = false
  }, 200)
}

const closeSearchResults = () => {
  showSearchResults.value = false
  if (searchBlurTimer) {
    clearTimeout(searchBlurTimer)
  }
}

const closeSearchResultsAndMobileMenu = () => {
  closeSearchResults()
  mobileMenuOpen.value = false
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
    navigateToPath('/login')
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
    navigateToPath('/login')
  }
}

const handleLoginClick = () => {
  navigateToPath('/login')
}

// Mobile-specific handlers
const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const closeMobileMenuAndCategories = () => {
  categoriesMenuOpen.value = false
  mobileMenuOpen.value = false
}

const handleLoginClickMobile = (event) => {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  navigateToPath('/login')
  nextTick(() => {
    mobileMenuOpen.value = false
  })
}

const handleLogoutMobile = async (event) => {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  mobileMenuOpen.value = false
  try {
    await authStore.logout()
    navigateToPath('/')
  } catch (error) {
    console.error('Logout error:', error)
  }
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

// Watch mobile menu state to manage body scroll
watch(mobileMenuOpen, (isOpen) => {
  if (isOpen) {
    document.body.classList.add('mobile-menu-open')
    // Prevent body scroll on mobile
    document.body.style.overflow = 'hidden'
  } else {
    document.body.classList.remove('mobile-menu-open')
    document.body.style.overflow = ''
  }
})

onMounted(async () => {
  document.addEventListener('click', handleClickOutside, true)
  document.addEventListener('keydown', handleEscapeKey)
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
  document.removeEventListener('click', handleClickOutside, true)
  document.removeEventListener('keydown', handleEscapeKey)
  // Unsubscribe from notifications
  notificationStore.unsubscribeFromNotifications()
  // Clear timers
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  if (searchBlurTimer) {
    clearTimeout(searchBlurTimer)
  }
  // Clean up mobile menu state
  if (mobileMenuOpen.value) {
    document.body.classList.remove('mobile-menu-open')
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
/* Prevent horizontal overflow without clipping desktop dropdowns:
   overflow-x: hidden on header forces overflow-y to compute to auto, which clips
   absolute dropdowns (Categories, user menu). Use clip + visible on lg+. */
header {
  max-width: 100vw;
  overflow-x: hidden;
}
@media (min-width: 1024px) {
  header {
    overflow: visible;
  }
}

/* User dropdown: keep inside viewport, touch-friendly items */
.user-dropdown {
  position: relative;
}
.user-dropdown-panel {
  right: 0;
  left: auto;
  min-width: 12rem;
  max-height: min(80vh, 28rem);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
[dir="rtl"] .user-dropdown-panel {
  right: auto;
  left: 0;
}
.dropdown-item {
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #374151;
  transition: background-color 0.2s, color 0.2s;
  cursor: pointer;
  text-decoration: none;
  border: none;
  width: 100%;
  text-align: left;
  background: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.05);
}
.dropdown-item:hover {
  background-color: #f9fafb;
  color: #10b981;
}

/* Categories dropdown: viewport-safe */
.categories-dropdown-panel {
  right: 0;
  left: auto;
  max-height: min(70vh, 24rem);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
[dir="rtl"] .categories-dropdown-panel {
  right: auto;
  left: 0;
}
.categories-dropdown a {
  min-height: 44px;
  display: flex;
  align-items: center;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.05);
}

/* Mobile menu: no overflow, no layout shift, scrollable */
.mobile-menu-container {
  max-height: calc(100vh - 4rem);
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.mobile-menu-container a,
.mobile-menu-container button {
  min-height: 44px;
  display: flex;
  align-items: center;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.05);
}

/* Search dropdown: prevent overflow on small viewports */
@media (max-width: 1023px) {
  .mobile-menu-container .absolute.top-full {
    max-height: min(400px, 60vh);
  }
}
</style> 