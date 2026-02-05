import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'
import { environment } from '../config/environment'
import i18n from '../i18n'
import { useLocaleStore } from '../stores/useLocaleStore'
import { authGuard, adminGuard, employeeGuard, vendorGuard, storeOwnerGuard } from './guards'
import Home from '../views/Home.vue'
import Products from '../views/Products.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Cart from '../views/Cart.vue'
import Checkout from '../views/Checkout.vue'
import OrderConfirmation from '../views/OrderConfirmation.vue'
import StoreDashboard from '../views/StoreDashboard.vue'
import Account from '../views/Account.vue'
import AuthCallback from '../views/AuthCallback.vue'
import Wishlist from '../views/Wishlist.vue'
import ResetPassword from '../views/ResetPassword.vue'
import CategoryPage from '../views/CategoryPage.vue'
import Stores from '../views/Stores.vue'
import StoreDetail from '../views/StoreDetail.vue'
import StoreProfile from '../views/StoreProfile.vue'
import MyStoreInfos from '../views/MyStoreInfos.vue'
import Profile from '../views/Profile.vue'
import NotFound from '../views/NotFound.vue'
import AdminTab from '../components/dashboard/AdminTab.vue'
import ManageUsers from '../views/ManageUsers.vue'
import ManageCategories from '../views/ManageCategories.vue'
import ManageStores from '../views/ManageStores.vue'
import ManagePacks from '../views/ManagePacks.vue'
import ManageOrders from '../views/ManageOrders.vue'
import ManageProducts from '../views/ManageProducts.vue'
import Notifications from '../views/Notifications.vue'
import Subscription from '../views/Subscription.vue'
// Supported locales configuration
const supportedLocales = ['en', 'fr', 'ar']
const defaultLocale = 'en'

// Base routes without locale prefix - these will be nested under /:locale
// Note: Using relative paths (no leading slash) so they inherit the locale param from parent
const baseRoutes = [
  {
    path: 'subscription',
    name: 'subscription',
    component: Subscription,
    meta: { requiresAuth: true }
  },
  {
    path: 'notifications',
    name: 'notifications',
    component: Notifications,
    meta: { requiresAuth: true }
  },
  {
    path: 'users',
    name: 'users',
    component: ManageUsers,
    meta: { requiresAuth: true }
  },
  {
    path: 'admintab',
    name: 'AdminTab',
    component: AdminTab,
    meta: { requiresAuth: true }
  },
  {
    path: 'productCard',
    name: 'productCard',
    component: () => import('../components/ProductCard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '',
    name: 'Home',
    component: Home
  },
  {
    path: 'products',
    name: 'Products',
    component: Products
  },
  {
    path: 'product/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    props: true
  },
  {
    path: 'cart',
    name: 'Cart',
    component: Cart
  },
  {
    path: 'checkout',
    name: 'Checkout',
    component: Checkout
  },
  {
    path: 'order-confirmation',
    name: 'OrderConfirmation',
    component: OrderConfirmation
  },
  {
    path: 'dashboard',
    name: 'StoreDashboard',
    component: StoreDashboard,
    meta: { requiresAuth: true },
    beforeEnter: authGuard
  },
  {
    path: 'myaccount',
    name: 'Account',
    component: Account,
    meta: { requiresAuth: true }
  },
  {
    path: 'profile/:ownerId?',
    name: 'Profile',
    component: Profile,
    props: true
  },
  {
    path: 'wishlist',
    name: 'Wishlist',
    component: Wishlist,
    meta: { requiresAuth: true }
  },
  {
    path: 'myannouncements/new',
    name: 'NewAnnouncement',
    component: () => import('../views/NewAnnouncement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: 'auth/callback',
    name: 'AuthCallback',
    component: AuthCallback
  },
  {
    path: 'reset-password',
    name: 'ResetPassword',
    component: ResetPassword
  },
  {
    path: 'category/:categoryId',
    name: 'CategoryPage',
    component: CategoryPage,
    props: true
  },
  {
    path: 'categories',
    name: 'Categories',
    component: ManageCategories,
    props: true
  },
  {
    path: 'stores',
    name: 'Stores',
    component: Stores
  },
  {
    path: 'managestores',
    name: 'ManageStores',
    component: ManageStores
  },
  {
    path: 'packs',
    name: 'Packs',
    component: ManagePacks
  },
  {
    path: 'orders',
    name: 'Orders',
    component: ManageOrders,
    meta: { requiresAuth: true, requiresAdmin: true },
    beforeEnter: adminGuard
  },
  {
    path: 'products',
    name: 'Products',
    component: ManageProducts,
    meta: { requiresAuth: true, requiresAdmin: true },
    beforeEnter: adminGuard
  },
  {
    path: 'shipping',
    name: 'ShippingManagement',
    component: () => import('../views/ShippingManagement.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    beforeEnter: adminGuard
  },
  {
    path: 'webhooks',
    name: 'Webhooks',
    component: () => import('../views/Webhooks.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    beforeEnter: adminGuard
  },
  {
    path: 'stores/:id',
    name: 'StoreDetail',
    component: StoreDetail,
    props: true
  },
  {
    path: 'store-profile/:id',
    name: 'StoreProfile',
    component: StoreProfile,
    props: true
  },
  {
    path: 'dashboard/store/create',
    name: 'CreateStore',
    component: () => import('../views/CreateStore.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: 'store/:id',
    name: 'MyStoreInfos',
    component: MyStoreInfos,
    meta: { requiresAuth: true },
    beforeEnter: storeOwnerGuard
  },
  {
    path: 'store/:id/upgrade',
    name: 'StoreUpgrade',
    component: () => import('../components/StoreUpgrade.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: 'store/:id/downgrade',
    name: 'StoreDowngrade',
    component: () => import('../components/StoreDowngrade.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: 'mypurchases',
    name: 'MyPurchases',
    component: () => import('../views/MyPurchases.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: 'mystoreproducts',
    name: 'MyStoreProducts',
    component: () => import('../views/MyStoreProducts.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: 'admin',
    name: 'AdminDashboard',
    component: () => import('../views/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    beforeEnter: adminGuard
  },
  {
    path: 'employee',
    name: 'EmployeeDashboard',
    component: () => import('../views/EmployeeDashboard.vue'),
    meta: { requiresAuth: true, requiresEmployee: true },
    beforeEnter: employeeGuard
  },
  {
    path: 'ad-request',
    name: 'AdRequest',
    component: () => import('../views/AdRequest.vue'),
    meta: { requiresAuth: true },
    beforeEnter: authGuard
  }
]

// Create localized routes with locale parameter
const createLocalizedRoutes = () => {
  const routes = []
  
  // Add root redirect route
  routes.push({
    path: '/',
    name: 'RootRedirect',
    redirect: () => {
      const bestLocale = getBestLocale()
      return `/${bestLocale}`
    }
  })
  
  // Create main locale route with children
  routes.push({
    path: '/:locale',
    name: 'LocaleRoot',
    component: { template: '<router-view />' },
    beforeEnter: (to, from, next) => {
      const locale = to.params.locale
      if (!supportedLocales.includes(locale)) {
        const bestLocale = getBestLocale()
        next(`/${bestLocale}`)
        return
      }
      next()
    },
    children: baseRoutes.map(route => ({
      ...route,
      meta: { 
        ...route.meta, 
        locale: route.meta?.locale || 'en', // Will be overridden by parent
        requiresAuth: route.meta?.requiresAuth || false
      }
    }))
  })
  
  // Add catch-all route for unknown routes - show 404 component
  routes.push({
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { 
      locale: 'en', // Default locale for 404 page
      requiresAuth: false 
    }
  })
  
  return routes
}

// Get best locale based on priority order
const getBestLocale = () => {
  try {
    // 1. From URL (highest priority) - check current route
    const currentPath = window.location.pathname
    const urlLocale = currentPath.match(/^\/(en|fr|ar)/)?.[1]
    if (urlLocale && supportedLocales.includes(urlLocale)) {
      return urlLocale
    }
    
    // 2. From localStorage
    const savedLocale = localStorage.getItem('locale')
    if (savedLocale && supportedLocales.includes(savedLocale)) {
      return savedLocale
    }
    
    // 3. From browser navigator.language
    const browserLang = navigator.language || navigator.userLanguage
    if (browserLang) {
      const langCode = browserLang.split('-')[0]
      if (supportedLocales.includes(langCode)) {
        return langCode
      }
    }
    
    // 4. Fallback to default
    return defaultLocale
  } catch (error) {
    console.warn('Error detecting locale, defaulting to English:', error)
    return defaultLocale
  }
}

// Set locale: store + localStorage + i18n (single place so language stays consistent)
const setLocale = (locale) => {
  if (!supportedLocales.includes(locale)) return
  try {
    const localeStore = useLocaleStore()
    localeStore.setLocale(locale)
  } catch (_) {
    localStorage.setItem('locale', locale)
  }
  i18n.global.locale.value = locale
}

const routes = createLocalizedRoutes()

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Authentication helper function
async function getUser(next) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      // Redirect to login in current locale
      const currentLocale = router.currentRoute.value.meta.locale || defaultLocale
      next(`/${currentLocale}/login`)
    } else {
      next()
    }
  } catch (error) {
    console.error('Auth error:', error)
    next(`/${defaultLocale}/login`)
  }
}

// Global router guard for locale handling and authentication
router.beforeEach(async (to, from, next) => {
  // Handle root redirect
  if (to.name === 'RootRedirect') {
    const bestLocale = getBestLocale()
    next(`/${bestLocale}`)
    return
  }
  
  // Extract locale from route params (new structure)
  const locale = to.params.locale
  
  // Ensure locale is valid
  if (!locale || !supportedLocales.includes(locale)) {
    const bestLocale = getBestLocale()
    // If we're in a locale route but locale is invalid, redirect to best locale
    if (to.name === 'LocaleRoot') {
      next(`/${bestLocale}`)
      return
    }
    // For other routes, redirect to localized version
    next(`/${bestLocale}${to.path}`)
    return
  }
  
  // Set locale in i18n and localStorage
  setLocale(locale)
  
  // Update route meta with locale
  to.meta.locale = locale
  
  // Handle authentication requirements
  if (to.meta.requiresAuth) {
    // Prefer store-based session validation to reduce false negatives on refresh
    try {
      const { useAuthStore } = await import('../stores/useAuthStore')
      const authStore = useAuthStore()
      const hasSession = await authStore.checkAuthStatus()
      if (!hasSession) {
        next(`/${locale}/login`)
        return
      }
      next()
    } catch (e) {
      await getUser(next)
    }
  } else {
    next()
  }
})

export default router 