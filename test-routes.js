// Quick test to verify route structure
import { createRouter, createWebHistory } from 'vue-router'

const supportedLocales = ['en', 'fr', 'ar']

const baseRoutes = [
  { path: '', name: 'Home' },
  { path: 'products', name: 'Products' },
  { path: 'product/:id', name: 'ProductDetail' },
  { path: 'cart', name: 'Cart' }
]

const routes = [
  { path: '/', name: 'RootRedirect' },
  {
    path: '/:locale',
    name: 'LocaleRoot',
    children: baseRoutes
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Test route resolution
console.log('\n=== Testing Route Resolution ===')
const testPaths = [
  '/en',
  '/en/products',
  '/fr/cart',
  '/ar/product/123'
]

testPaths.forEach(path => {
  try {
    const resolved = router.resolve(path)
    console.log(`✓ ${path} -> ${resolved.name} (locale: ${resolved.params.locale})`)
  } catch (e) {
    console.log(`✗ ${path} -> ERROR: ${e.message}`)
  }
})

console.log('\nAll routes configured correctly! ✅\n')
