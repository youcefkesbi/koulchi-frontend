/**
 * OAuth Configuration for Koulchi Frontend
 * 
 * This file contains OAuth provider configurations and redirect URLs.
 * 
 * IMPORTANT: 
 * - Supabase URLs are backend infrastructure and should NEVER be visible to users
 * - Users will see Google/Facebook OAuth pages, not Supabase URLs
 * - All redirects are handled internally by Supabase's OAuth flow
 */

import { getOAuthRedirectUrl } from './environment.js';

// OAuth provider configurations
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
        prompt: 'consent'
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
        scope: 'email,public_profile'
      }
    }
  }
}

// User-friendly OAuth provider names
export const oauthProviderNames = {
  google: 'Google',
  facebook: 'Facebook'
}

// OAuth callback route
export const oauthCallbackRoute = '/auth/callback'

// OAuth error messages (user-friendly)
export const oauthErrorMessages = {
  network: 'Network connection issue. Please check your internet connection and try again.',
  timeout: 'Login request timed out. Please try again.',
  cancelled: 'Login was cancelled. Please try again when you\'re ready.',
  oauth: 'Login with your account provider failed. Please try again.',
  default: 'Something went wrong during login. Please try again.'
}
