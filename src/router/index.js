import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'
import Home from '../views/Home.vue'
import Products from '../views/Products.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Cart from '../views/Cart.vue'
import Checkout from '../views/Checkout.vue'
import OrderConfirmation from '../views/OrderConfirmation.vue'
import UserDashboard from '../views/UserDashboard.vue'
import Profile from '../views/Profile.vue'
import AuthCallback from '../views/AuthCallback.vue'

const routes = [
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
    path: '/myannouncements/new',
    name: 'NewAnnouncement',
    component: () => import('../views/NewAnnouncement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: AuthCallback
  }
]

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

// Auth requirements
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    await getUser(next)
  } else {
    next()
  }
})

export default router 