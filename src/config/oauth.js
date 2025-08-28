/**
 * OAuth Configuration for Koulchi Frontend
 * 
 * This file contains OAuth provider configurations and redirect URLs.
 * 
 * IMPORTANT: 
 * - OAuth is handled entirely by Supabase - no OAuth credentials needed in frontend
 * - Supabase URLs are backend infrastructure and should NEVER be visible to users
 * - Users will see Google/Facebook OAuth pages, not Supabase URLs
 * - All redirects are handled internally by Supabase's OAuth flow
 * - OAuth callback path uses Supabase's built-in /auth/v1/callback
 */

import { getOAuthRedirectUrl, getOAuthConfig } from './environment.js';

// App branding configuration
export const appConfig = {
  name: 'Koulchi',
  displayName: 'Koulchi - E-commerce Platform',
  description: 'Simplified e-commerce platform for buying and selling',
  logo: '/src/assets/logo.png', // Optional: Add your logo
  privacyPolicy: '/privacy-policy', // Optional: Add privacy policy URL
  termsOfService: '/terms-of-service' // Optional: Add terms URL
}

// OAuth provider configurations - handled entirely by Supabase
export const oauthConfig = {
  // Google OAuth settings
  google: {
    provider: 'google',
    options: {
      // Note: This redirectTo URL is for Supabase's internal routing only
      // Users will be redirected to Google's OAuth page, then back to our app
      // The actual OAuth flow is handled by Supabase - users never see backend URLs
      redirectTo: getOAuthRedirectUrl(),
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
        // Additional parameters for better branding
        hd: '*', // Allow any hosted domain
        include_granted_scopes: 'true'
      }
    }
  },
  
  // Facebook OAuth settings
  facebook: {
    provider: 'facebook',
    options: {
      // Note: This redirectTo URL is for Supabase's internal routing only
      // Users will be redirected to Facebook's OAuth page, then back to our app
      // The actual OAuth flow is handled by Supabase - users never see backend URLs
      redirectTo: getOAuthRedirectUrl(),
      queryParams: {
        scope: 'email,public_profile',
        // Additional parameters for better branding
        display: 'popup',
        auth_type: 'rerequest'
      }
    }
  }
}

// User-friendly OAuth provider names
export const oauthProviderNames = {
  google: 'Google',
  facebook: 'Facebook'
}

// OAuth callback route (Supabase's built-in path)
export const oauthCallbackRoute = '/auth/v1/callback'

// OAuth error messages (user-friendly)
export const oauthErrorMessages = {
  network: 'Network connection issue. Please check your internet connection and try again.',
  timeout: 'Login request timed out. Please try again.',
  cancelled: 'Login was cancelled. Please try again when you\'re ready.',
  oauth: 'Login with your account provider failed. Please try again.',
  default: 'Something went wrong during login. Please try again.'
}

// Export all configurations for use in other components
