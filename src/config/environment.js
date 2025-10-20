/**
 * Environment Configuration for Koulchi Frontend
 * OAuth is handled entirely by Supabase - no OAuth credentials needed in frontend.
 */

const isProduction = import.meta.env.PROD
const isVercel = import.meta.env.VITE_VERCEL === '1' || 
                 window.location.hostname.includes('vercel.app') ||
                 window.location.hostname.includes('vercel.com')

const appBranding = {
  name: 'Koulchi',
  displayName: 'Koulchi - E-commerce Platform',
  description: 'Simplified e-commerce platform for buying and selling',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0'
}

export const environment = {
  branding: appBranding,
  
  appUrl: (() => {
    if (isProduction && isVercel) {
      // Production: Use Vercel environment variable or fallback to current origin
      return import.meta.env.VITE_APP_URL || window.location.origin
    } else {
      // Development: Use environment variable or fallback to localhost
      return import.meta.env.VITE_APP_URL || 'http://localhost:3000'
    }
  })(),

  // Base URL for routing (without trailing slash)
  baseUrl: (() => {
    const url = isProduction && isVercel 
      ? (import.meta.env.VITE_APP_URL || window.location.origin)
      : (import.meta.env.VITE_APP_URL || 'http://localhost:3000')
    return url.replace(/\/$/, '') // Remove trailing slash
  })(),

  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
    publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key'
  },


  oauth: {
    // Supabase handles OAuth callbacks through its own fixed endpoint
    // No custom callbackPath needed
  },

  isProduction,
  isVercel,
  isDevelopment: !isProduction,
  isLocalhost: window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1',

  features: {
    debugLogging: !isProduction,
    devTools: !isProduction,
    oauthBranding: true
  }
}

export const validateEnvironment = () => {
  const errors = []
  
  if (!environment.supabase.url || environment.supabase.url === 'https://placeholder.supabase.co') {
    errors.push('VITE_SUPABASE_URL is not configured')
  }
  
  if (!environment.supabase.publishableKey || environment.supabase.publishableKey === 'placeholder-key') {
    errors.push('VITE_SUPABASE_PUBLISHABLE_KEY is not configured')
  }
  
  
  if (errors.length > 0) {
    console.warn('Environment validation failed:', errors)
    console.warn('App will run in development mode with limited functionality')
    // Don't throw error in development - just warn
    if (environment.isProduction) {
      throw new Error(`Environment validation failed: ${errors.join(', ')}`)
    }
  }
  
  return true
}

export const getAuthRedirectUrl = (path = '') => {
  const baseUrl = environment.baseUrl
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

export const getOAuthRedirectUrl = () => {
  // Supabase handles OAuth redirects through its own fixed endpoint
  // Return the base app URL for general auth redirects
  return environment.baseUrl
}

export const getPasswordResetRedirectUrl = () => {
  return getAuthRedirectUrl('reset-password')
}

export const getAppBranding = () => {
  return {
    ...environment.branding,
    appUrl: environment.appUrl,
    environment: {
      isProduction: environment.isProduction,
      isVercel: environment.isVercel,
      isDevelopment: environment.isDevelopment
    }
  }
}

export const getOAuthConfig = () => {
  return {
    ...environment.oauth,
    appUrl: environment.appUrl
  }
}


export default environment
