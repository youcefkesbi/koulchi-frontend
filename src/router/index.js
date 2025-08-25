import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'
import { setLocale, getSupportedLocales } from '../lib/i18n-utils'
import i18n from '../i18n'
import Home from '../views/Home.vue'
import Products from '../views/Products.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Cart from '../views/Cart.vue'
import Checkout from '../views/Checkout.vue'
import OrderConfirmation from '../views/OrderConfirmation.vue'
import UserDashboard from '../views/UserDashboard.vue'
import Profile from '../views/Profile.vue'
import AuthCallback from '../views/AuthCallback.vue'
import Wishlist from '../views/Wishlist.vue'
import ResetPassword from '../views/ResetPassword.vue'
import CategoryPage from '../views/CategoryPage.vue'
import Stores from '../views/Stores.vue'
import StoreDetail from '../views/StoreDetail.vue'

// Language detection and routing
const supportedLocales = getSupportedLocales()
const defaultLocale = 'en'

// Create routes with language prefixes
const createLocalizedRoutes = () => {
  const baseRoutes = [
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
      name: 'UserDashboard',
      component: UserDashboard,
      meta: { requiresAuth: true }
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
    }
  ]

  const routes = []
  
  // Add localized routes
  supportedLocales.forEach(locale => {
    baseRoutes.forEach(route => {
      routes.push({
        ...route,
        path: `/${locale}${route.path === '/' ? '' : route.path}`,
        name: `${route.name}_${locale}`,
        meta: { ...route.meta, locale }
      })
    })
  })
  
  // Add root redirect - will be handled in beforeEach
  routes.push({
    path: '/',
    name: 'RootRedirect',
    component: Home,
    meta: { isRoot: true }
  })
  
  return routes
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

async function getUser(next) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      // Instead of redirecting to '/', redirect to the current locale
      const currentPath = router.currentRoute.value.path
      const localeMatch = currentPath.match(/^\/(fr|en|ar)/)
      if (localeMatch) {
        next(`/${localeMatch[1]}/login`)
      } else {
        next('/en/login')
      }
    } else {
      next()
    }
  } catch (error) {
    console.error('Auth error:', error)
    // Default to English login page
    next('/en/login')
  }
}

// Helper function to get best locale
const getBestLocaleForRedirect = () => {
  try {
    // Check localStorage first
    const savedLocale = localStorage.getItem('locale')
    if (savedLocale && supportedLocales.includes(savedLocale)) {
      return savedLocale
    }
    
    // Check browser language
    const browserLang = navigator.language || navigator.userLanguage
    if (browserLang) {
      const langCode = browserLang.split('-')[0]
      if (supportedLocales.includes(langCode)) {
        return langCode
      }
    }
    
    // Default to English
    return 'en'
  } catch (error) {
    console.warn('Error detecting language, defaulting to English:', error)
    return 'en'
  }
}

// Auth requirements and language handling
router.beforeEach(async (to, from, next) => {
  // Handle root redirect
  if (to.meta.isRoot) {
    const bestLocale = getBestLocaleForRedirect()
    next(`/${bestLocale}`)
    return
  }
  
  // Handle language routing
  if (to.meta.locale) {
    // Set the locale using utility function
    setLocale(to.meta.locale)
    
    // Update i18n locale directly
    i18n.global.locale.value = to.meta.locale
  }
  
  if (to.meta.requiresAuth) {
    await getUser(next)
  } else {
    next()
  }
})

export default router 