import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'
import { getBestLocale, setLocale, getSupportedLocales } from '../lib/i18n-utils'
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
const defaultLocale = 'fr'

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
  
  // Add root redirect
  routes.push({
    path: '/',
    redirect: `/${getBestLocale()}`
  })
  
  // Add catch-all redirect for unsupported locales
  routes.push({
    path: '/:locale(.*)',
    redirect: `/${defaultLocale}`
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
      next('/')
    } else {
      next()
    }
  } catch (error) {
    console.error('Auth error:', error)
    next('/')
  }
}

// Auth requirements and language handling
router.beforeEach(async (to, from, next) => {
  // Handle language routing
  if (to.meta.locale) {
    // Set the locale using utility function
    setLocale(to.meta.locale)
    
    // Update i18n locale
    const { locale } = await import('../i18n')
    locale.value = to.meta.locale
  }
  
  if (to.meta.requiresAuth) {
    await getUser(next)
  } else {
    next()
  }
})

export default router 