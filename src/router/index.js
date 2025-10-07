import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'
import { environment } from '../config/environment'
import i18n from '../i18n'
import { authGuard, adminGuard, employeeGuard, vendorGuard, storeOwnerGuard } from './guards'
import Home from '../views/Home.vue'
import Products from '../views/Products.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Cart from '../views/Cart.vue'
import Checkout from '../views/Checkout.vue'
import OrderConfirmation from '../views/OrderConfirmation.vue'
import StoreDashboard from '../views/StoreDashboard.vue'
import Profile from '../views/Profile.vue'
import AuthCallback from '../views/AuthCallback.vue'
import Wishlist from '../views/Wishlist.vue'
import ResetPassword from '../views/ResetPassword.vue'
import CategoryPage from '../views/CategoryPage.vue'
import Stores from '../views/Stores.vue'
import StoreDetail from '../views/StoreDetail.vue'
import MyStoreInfos from '../views/MyStoreInfos.vue'
import NotFound from '../views/NotFound.vue'

// Supported locales configuration
const supportedLocales = ['en', 'fr', 'ar']
const defaultLocale = 'en'

// Base routes without locale prefix
const baseRoutes = [
  {
    path: '/productCard',
    name: 'productCard',
    component: () => import('../components/ProductCard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'LoginModal',
    component: Home
  },
  {
    path: '/products',
    name: 'Products',
    component: Products
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    props: true
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout
  },
  {
    path: '/order-confirmation',
    name: 'OrderConfirmation',
    component: OrderConfirmation
  },
  {
    path: '/dashboard',
    name: 'StoreDashboard',
    component: StoreDashboard,
    meta: { requiresAuth: true },
    beforeEnter: authGuard
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/wishlist',
    name: 'Wishlist',
    component: Wishlist,
    meta: { requiresAuth: true }
  },
  {
    path: '/myannouncements/new',
    name: 'NewAnnouncement',
    component: () => import('../views/NewAnnouncement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: AuthCallback
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword
  },
  {
    path: '/category/:categoryId',
    name: 'CategoryPage',
    component: CategoryPage,
    props: true
  },
  {
    path: '/stores',
    name: 'Stores',
    component: Stores
  },
  {
    path: '/stores/:id',
    name: 'StoreDetail',
    component: StoreDetail,
    props: true
  },
  {
    path: '/dashboard/store/create',
    name: 'CreateStore',
    component: () => import('../views/CreateStore.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/store/:id',
    name: 'MyStoreInfos',
    component: MyStoreInfos,
    meta: { requiresAuth: true },
    beforeEnter: storeOwnerGuard
  },
  {
    path: '/mypurchases',
    name: 'MyPurchases',
    component: () => import('../views/MyPurchases.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/mystoreproducts',
    name: 'MyStoreProducts',
    component: () => import('../views/MyStoreProducts.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('../views/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    beforeEnter: adminGuard
  },
  {
    path: '/employee',
    name: 'EmployeeDashboard',
    component: () => import('../views/EmployeeDashboard.vue'),
    meta: { requiresAuth: true, requiresEmployee: true },
    beforeEnter: employeeGuard
  }
]

// Create localized routes with locale parameter
const createLocalizedRoutes = () => {
  const routes = []
  
  // Add localized routes for each supported locale
  supportedLocales.forEach(locale => {
    baseRoutes.forEach(route => {
      routes.push({
        ...route,
        path: `/${locale}${route.path === '/' ? '' : route.path}`,
        name: `${route.name}_${locale}`,
        meta: { 
          ...route.meta, 
          locale,
          requiresAuth: route.meta?.requiresAuth || false
        }
      })
    })
  })
  
  // Add root redirect route
  routes.push({
    path: '/',
    name: 'RootRedirect',
    redirect: () => {
      const bestLocale = getBestLocale()
      return `/${bestLocale}`
    }
  })
  
  // Add catch-all route for invalid locales
  routes.push({
    path: '/:locale(.*)',
    name: 'InvalidLocale',
    redirect: () => {
      const bestLocale = getBestLocale()
      return `/${bestLocale}`
    }
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

// Set locale in localStorage and update i18n
const setLocale = (locale) => {
  if (supportedLocales.includes(locale)) {
    localStorage.setItem('locale', locale)
    i18n.global.locale.value = locale
    
    // Update document direction for RTL support
    const dir = locale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.dir = dir
    document.documentElement.lang = locale
  }
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
  console.log('🌐 Global guard:', { 
    to: to.path, 
    name: to.name, 
    meta: to.meta,
    from: from?.path 
  })

  // Handle root redirect
  if (to.name === 'RootRedirect') {
    const bestLocale = getBestLocale()
    console.log('🔄 Root redirect to:', `/${bestLocale}`)
    next(`/${bestLocale}`)
    return
  }
  
  // Handle invalid locale redirect
  if (to.name === 'InvalidLocale') {
    const bestLocale = getBestLocale()
    console.log('🔄 Invalid locale redirect to:', `/${bestLocale}`)
    next(`/${bestLocale}`)
    return
  }
  
  // Extract locale from URL path first, fallback to meta
  const pathLocaleMatch = to.path.match(/^\/(en|fr|ar)(?:\/|$)/)
  const locale = (pathLocaleMatch && pathLocaleMatch[1]) || to.meta.locale
  
  console.log('🌐 Locale analysis:', { 
    path: to.path, 
    pathLocaleMatch, 
    metaLocale: to.meta.locale, 
    finalLocale: locale 
  })
  
  // Ensure locale is valid without duplicating the prefix
  if (!locale || !supportedLocales.includes(locale)) {
    const bestLocale = getBestLocale()
    console.log('🔄 Invalid locale, redirecting to:', `/${bestLocale}${to.path.startsWith('/') ? '' : '/'}${to.path}`)
    // If path already starts with a supported locale but meta is missing, keep path as-is
    if (pathLocaleMatch) {
      next()
      return
    }
    next(`/${bestLocale}${to.path.startsWith('/') ? '' : '/'}${to.path}`)
    return
  }
  
  // Set locale in i18n and localStorage
  setLocale(locale)
  
  // Handle authentication requirements
  if (to.meta.requiresAuth) {
    console.log('🔐 Auth required, checking session...')
    // Prefer store-based session validation to reduce false negatives on refresh
    try {
      const { useAuthStore } = await import('../stores/auth')
      const authStore = useAuthStore()
      const hasSession = await authStore.checkAuthStatus()
      console.log('🔐 Session check result:', hasSession)
      if (!hasSession) {
        const currentLocale = to.meta.locale || defaultLocale
        console.log('❌ No session, redirecting to login:', `/${currentLocale}/login`)
        next(`/${currentLocale}/login`)
        return
      }
      console.log('✅ Session valid, continuing...')
      next()
    } catch (e) {
      console.log('⚠️ Store check failed, falling back to getUser:', e.message)
      await getUser(next)
    }
  } else {
    console.log('✅ No auth required, continuing...')
    next()
  }
})

export default router 