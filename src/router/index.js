import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Products from '../views/Products.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Cart from '../views/Cart.vue'
import Checkout from '../views/Checkout.vue'
import OrderConfirmation from '../views/OrderConfirmation.vue'
import SellerDashboard from '../views/SellerDashboard.vue'
import AuthCallback from '../views/AuthCallback.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
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
    path: '/seller/dashboard',
    name: 'SellerDashboard',
    component: SellerDashboard,
    meta: { requiresAuth: true, requiresSeller: true }
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

// Navigation guard for seller routes
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('supabase.auth.token')
    if (!isAuthenticated) {
      next('/')
      return
    }
  }
  
  if (to.meta.requiresSeller) {
    // Check if user is a seller (this will be handled by the component)
    next()
    return
  }
  
  next()
})

export default router 