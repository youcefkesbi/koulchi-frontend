/**
 * Environment Configuration for Koulchi Frontend
 * 
 * This file automatically detects the environment and provides the correct
 * configuration values for both production (Vercel) and development (localhost).
 */

// Detect environment
const isProduction = import.meta.env.PROD
const isVercel = import.meta.env.VITE_VERCEL === '1' || 
                 window.location.hostname.includes('vercel.app') ||
                 window.location.hostname.includes('vercel.com')

// App branding configuration
const appBranding = {
  name: 'Koulchi',
  displayName: 'Koulchi - E-commerce Platform',
  description: 'Simplified e-commerce platform for buying and selling',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0'
}

// Environment-specific configuration
export const environment = {
  // App branding
  branding: appBranding,
  
  // App URL - automatically detected
  appUrl: (() => {
    if (isProduction && isVercel) {
      // Production: Use Vercel environment variable or fallback to current origin
      return import.meta.env.VITE_APP_URL || window.location.origin
    } else {
      // Development: Use localhost:3000
      return 'http://localhost:3000'
    }
  })(),

  // Supabase configuration
  supabase: {
    url: (() => {
      if (isProduction && isVercel) {
        // Production: Use Vercel environment variable
        return import.meta.env.VITE_SUPABASE_URL
      } else {
        // Development: Use local Supabase project
        return import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'
      }
    })(),
    
    anonKey: (() => {
      if (isProduction && isVercel) {
        // Production: Use Vercel environment variable
        return import.meta.env.VITE_SUPABASE_ANON_KEY
      } else {
        // Development: Use local Supabase project
        return import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-local-anon-key'
      }
    })()
  },

  // Environment flags
  isProduction,
  isVercel,
  isDevelopment: !isProduction,
  isLocalhost: window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1',

  // Feature flags
  features: {
    // Enable debug logging in development
    debugLogging: !isProduction,
    
    // Enable development tools in development
    devTools: !isProduction,
    
    // OAuth branding features
    oauthBranding: true
  }
}

// Validation function to ensure required environment variables are set
export const validateEnvironment = () => {
  const errors = []
  
  if (!environment.supabase.url) {
    errors.push('VITE_SUPABASE_URL is not configured')
  }
  
  if (!environment.supabase.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is not configured')
  }
  
  if (errors.length > 0) {
    console.error('Environment validation failed:', errors)
    throw new Error(`Environment validation failed: ${errors.join(', ')}`)
  }
  
  return true
}

// Helper function to get redirect URL for authentication flows
export const getAuthRedirectUrl = (path = '') => {
  const baseUrl = environment.appUrl
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

// Helper function to get OAuth redirect URL
export const getOAuthRedirectUrl = () => {
  return getAuthRedirectUrl('auth/callback')
}

// Helper function to get password reset redirect URL
export const getPasswordResetRedirectUrl = () => {
  return getAuthRedirectUrl('reset-password')
}

// Helper function to get app branding information
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

// Debug logging in development
if (environment.features.debugLogging) {
  console.log('Environment Configuration:', {
    appName: environment.branding.name,
    appUrl: environment.appUrl,
    isProduction: environment.isProduction,
    isVercel: environment.isVercel,
    isDevelopment: environment.isDevelopment,
    isLocalhost: environment.isLocalhost,
    supabaseUrl: environment.supabase.url ? 'Configured' : 'Missing',
    supabaseAnonKey: environment.supabase.anonKey ? 'Configured' : 'Missing',
    oauthBranding: environment.features.oauthBranding
  })
}

export default environment
