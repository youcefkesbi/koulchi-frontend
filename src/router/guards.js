// Route guards for role-based access control
import { useAuthStore } from '../stores/auth'
import { supabase } from '../lib/supabase'

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
export const employeeGuard = async (to, from, next) => {
  const authStore = useAuthStore()
  const loc = to.meta.locale || 'en'

  console.log('🔍 employeeGuard called:', { 
    to: to.path, 
    from: from?.path, 
    locale: loc,
    isAuthenticated: authStore.isAuthenticated,
    userRole: authStore.userRole,
    user: authStore.user
  })

  // Ensure we have a valid Supabase session, not just local store state
  const hasSession = await authStore.checkAuthStatus()
  console.log('🔍 Session check result:', hasSession)
  
  if (!hasSession) {
    console.log('❌ No session, redirecting to login')
    return next(`/${loc}/login`)
  }

  // CRITICAL: If store shows not authenticated but session exists, force refresh the entire user profile
  if (!authStore.isAuthenticated || !authStore.user || authStore.userRole === 'customer') {
    console.log('🔄 Store out of sync with session, forcing full refresh...')
    try {
      // Get fresh session and load user with profile
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await authStore.loadUserWithProfile(session.user)
        console.log('🔄 Full refresh completed. New state:', {
          isAuthenticated: authStore.isAuthenticated,
          userRole: authStore.userRole,
          user: authStore.user
        })
      }
    } catch (err) {
      console.error('❌ Full refresh failed:', err)
    }
  }

  // If role still not resolved, try the force refresh
  if (!authStore.userRole || String(authStore.userRole || '').trim() === '' || authStore.userRole === 'customer') {
    console.log('🔄 Role still not resolved, attempting force refresh...')
    const refreshResult = await authStore.forceRoleRefresh().catch((err) => {
      console.error('❌ Force refresh failed:', err)
      return false
    })
    console.log('🔄 Force refresh result:', refreshResult, 'New role:', authStore.userRole)
  }

  const raw = authStore.userRole
  const roles = Array.isArray(raw)
    ? raw.map(r => (typeof r === 'string' ? r : (r?.role || '')).toLowerCase())
    : [String(raw || '').toLowerCase()]

  console.log('🔍 Role analysis:', { raw, roles, hasEmployee: roles.includes('employee'), hasAdmin: roles.includes('admin') })

  if (roles.includes('employee') || roles.includes('admin')) {
    console.log('✅ Access granted')
    return next()
  }
  
  console.log('❌ Access denied, redirecting to dashboard')
  return next({ path: `/${loc}/dashboard`, query: { error: 'access_denied', message: 'Employee access required' } })
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
 * Vendor guard - only allows vendor users or admins
 * @param {Object} to - Route being navigated to
 * @param {Object} from - Route being navigated from
 * @param {Function} next - Navigation function
 */
export const vendorGuard = (to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Check if user has vendor or admin role
  if (!['vendor', 'admin'].includes(authStore.userRole)) {
    // Redirect to dashboard with error message
    next({
      path: '/dashboard',
      query: { error: 'access_denied', message: 'Vendor access required' }
    })
    return
  }
  
  next()
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
