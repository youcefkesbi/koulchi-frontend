/**
 * OAuth Configuration for Koulchi Frontend
 * OAuth is handled entirely by Supabase - no OAuth credentials needed in frontend.
 */

import { getOAuthRedirectUrl, getOAuthConfig } from './environment.js';

export const appConfig = {
  name: 'Koulchi',
  displayName: 'Koulchi - E-commerce Platform',
  description: 'Simplified e-commerce platform for buying and selling',
  logo: '/src/assets/logo.png',
  privacyPolicy: '/privacy-policy',
  termsOfService: '/terms-of-service'
}

export const oauthConfig = {
  google: {
    provider: 'google',
    options: {
      redirectTo: getOAuthRedirectUrl(),
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
        hd: '*',
        include_granted_scopes: 'true'
      }
    }
  },
  
  facebook: {
    provider: 'facebook',
    options: {
      redirectTo: getOAuthRedirectUrl(),
      queryParams: {
        scope: 'email,public_profile',
        display: 'popup',
        auth_type: 'rerequest'
      }
    }
  }
}

export const oauthProviderNames = {
  google: 'Google',
  facebook: 'Facebook'
}

export const oauthCallbackRoute = '/auth/v1/callback'

export const oauthErrorMessages = {
  network: 'Network connection issue. Please check your internet connection and try again.',
  timeout: 'Login request timed out. Please try again.',
  cancelled: 'Login was cancelled. Please try again when you\'re ready.',
  oauth: 'Login with your account provider failed. Please try again.',
  default: 'Something went wrong during login. Please try again.'
}
