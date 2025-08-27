/**
 * Environment Testing and Validation Utilities
 * 
 * This file provides utilities to test and validate environment configuration
 * in both development and production environments.
 */

import { environment, validateEnvironment } from '../config/environment.js'

/**
 * Test environment configuration and log results
 */
export const testEnvironment = () => {
  console.group('🔧 Environment Configuration Test')
  
  try {
    // Test environment detection
    console.log('✅ Environment Detection:', {
      isProduction: environment.isProduction,
      isVercel: environment.isVercel,
      isDevelopment: environment.isDevelopment,
      isLocalhost: environment.isLocalhost
    })
    
    // Test app URL
    console.log('✅ App URL:', environment.appUrl)
    
    // Test Supabase configuration
    console.log('✅ Supabase Configuration:', {
      url: environment.supabase.url ? '✅ Configured' : '❌ Missing',
      anonKey: environment.supabase.anonKey ? '✅ Configured' : '❌ Missing'
    })
    
    // Validate environment
    validateEnvironment()
    console.log('✅ Environment validation passed')
    
    // Test redirect URLs
    console.log('✅ Redirect URLs:', {
      oauth: environment.getOAuthRedirectUrl ? environment.getOAuthRedirectUrl() : '❌ Function not available',
      passwordReset: environment.getPasswordResetRedirectUrl ? environment.getPasswordResetRedirectUrl() : '❌ Function not available'
    })
    
    console.log('🎉 All environment tests passed!')
    
  } catch (error) {
    console.error('❌ Environment validation failed:', error.message)
    console.warn('⚠️  Some features may not work correctly')
  }
  
  console.groupEnd()
}

/**
 * Check if environment is properly configured for a specific feature
 */
export const checkFeatureSupport = (feature) => {
  const checks = {
    authentication: () => {
      return environment.supabase.url && environment.supabase.anonKey
    },
    oauth: () => {
      return environment.supabase.url && environment.supabase.anonKey
    },
    passwordReset: () => {
      return environment.supabase.url && environment.supabase.anonKey
    },
    emailConfirmation: () => {
      return environment.supabase.url && environment.supabase.anonKey
    }
  }
  
  if (checks[feature]) {
    return checks[feature]()
  }
  
  return false
}

/**
 * Get environment summary for debugging
 */
export const getEnvironmentSummary = () => {
  return {
    environment: {
      isProduction: environment.isProduction,
      isVercel: environment.isVercel,
      isDevelopment: environment.isDevelopment,
      isLocalhost: environment.isLocalhost
    },
    configuration: {
      appUrl: environment.appUrl,
      supabaseUrl: environment.supabase.url ? 'Configured' : 'Missing',
      supabaseAnonKey: environment.supabase.anonKey ? 'Configured' : 'Missing'
    },
    features: {
      authentication: checkFeatureSupport('authentication'),
      oauth: checkFeatureSupport('oauth'),
      passwordReset: checkFeatureSupport('passwordReset'),
      emailConfirmation: checkFeatureSupport('emailConfirmation')
    }
  }
}

/**
 * Run comprehensive environment diagnostics
 */
export const runEnvironmentDiagnostics = () => {
  console.group('🔍 Environment Diagnostics')
  
  const summary = getEnvironmentSummary()
  
  console.log('Environment:', summary.environment)
  console.log('Configuration:', summary.configuration)
  console.log('Feature Support:', summary.features)
  
  // Check for common issues
  const issues = []
  
  if (!environment.supabase.url) {
    issues.push('Missing VITE_SUPABASE_URL')
  }
  
  if (!environment.supabase.anonKey) {
    issues.push('Missing VITE_SUPABASE_ANON_KEY')
  }
  
  if (environment.isProduction && !environment.isVercel) {
    issues.push('Production environment detected but not on Vercel')
  }
  
  if (issues.length > 0) {
    console.warn('⚠️  Potential issues detected:', issues)
  } else {
    console.log('✅ No issues detected')
  }
  
  console.groupEnd()
  
  return summary
}

// Auto-run diagnostics in development
if (environment.isDevelopment) {
  // Wait for DOM to be ready
  if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        console.log('🚀 Running environment diagnostics...')
        runEnvironmentDiagnostics()
      }, 1000)
    })
  }
}

export default {
  testEnvironment,
  checkFeatureSupport,
  getEnvironmentSummary,
  runEnvironmentDiagnostics
}
