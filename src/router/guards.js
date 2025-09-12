// Route guards for role-based access control
import { useAuthStore } from '../stores/auth'

/**
 * Admin route guard - only allows admin users
 * @param {Object} to - Route being navigated to
 * @param {Object} from - Route being navigated from
 * @param {Function} next - Navigation function
 */
export const adminGuard = (to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Check if user has admin role
  if (authStore.userRole !== 'admin') {
    // Redirect to dashboard with error message
    next({
      path: '/dashboard',
      query: { error: 'access_denied', message: 'Admin access required' }
    })
    return
  }
  
  next()
}

/**
 * Employee route guard - only allows employee and admin users
 * @param {Object} to - Route being navigated to
 * @param {Object} from - Route being navigated from
 * @param {Function} next - Navigation function
 */
export const employeeGuard = (to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Check if user has employee or admin role
  if (!['employee', 'admin'].includes(authStore.userRole)) {
    // Redirect to dashboard with error message
    next({
      path: '/dashboard',
      query: { error: 'access_denied', message: 'Employee access required' }
    })
    return
  }
  
  next()
}

/**
 * Authenticated user guard - only allows authenticated users
 * @param {Object} to - Route being navigated to
 * @param {Object} from - Route being navigated from
 * @param {Function} next - Navigation function
 */
export const authGuard = (to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  next()
}

/**
 * Guest guard - only allows non-authenticated users
 * @param {Object} to - Route being navigated to
 * @param {Object} from - Route being navigated from
 * @param {Function} next - Navigation function
 */
export const guestGuard = (to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if user is authenticated
  if (authStore.isAuthenticated) {
    next('/dashboard')
    return
  }
  
  next()
}

/**
 * Role-based guard factory - creates guards for specific roles
 * @param {Array|String} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Route guard function
 */
export const createRoleGuard = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  
  return (to, from, next) => {
    const authStore = useAuthStore()
    
    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }
    
    // Check if user has one of the allowed roles
    if (!roles.includes(authStore.userRole)) {
      // Redirect to dashboard with error message
      next({
        path: '/dashboard',
        query: { 
          error: 'access_denied', 
          message: `Access denied. Required roles: ${roles.join(', ')}` 
        }
      })
      return
    }
    
    next()
  }
}

/**
 * Store owner guard - only allows store owners or admins
 * @param {Object} to - Route being navigated to
 * @param {Object} from - Route being navigated from
 * @param {Function} next - Navigation function
 */
export const storeOwnerGuard = async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Admins can access any store
  if (authStore.userRole === 'admin') {
    next()
    return
  }
  
  // Check if user owns the store
  const storeId = to.params.storeId || to.params.id
  if (!storeId) {
    next('/dashboard')
    return
  }
  
  try {
    // Import store store dynamically to avoid circular dependency
    const { useStoreStore } = await import('../stores/store')
    const storeStore = useStoreStore()
    
    // Check if user owns the store
    const isOwner = await storeStore.checkStoreOwnership(storeId, authStore.user.id)
    
    if (!isOwner) {
      next({
        path: '/dashboard',
        query: { error: 'access_denied', message: 'You can only access your own stores' }
      })
      return
    }
    
    next()
  } catch (error) {
    console.error('Error checking store ownership:', error)
    next('/dashboard')
  }
}
