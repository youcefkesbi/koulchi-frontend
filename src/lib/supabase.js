import { createClient } from '@supabase/supabase-js';
import { environment, validateEnvironment } from '../config/environment.js';

// Validate environment configuration
try {
  validateEnvironment();
} catch (error) {
  if (environment.isDevelopment) {
    console.warn('⚠️ Environment validation failed (DEV MODE):', error.message);
  } else {
    console.error('❌ Environment validation failed (PROD):', error.message);
    throw error;
  }
}

// Create Supabase client using environment configuration
export const supabase = createClient(
    environment.supabase.url,
    environment.supabase.anonKey,
    {
      auth: {
        // Use PKCE flow for better security
        flowType: 'pkce',
        // Enable automatic token refresh
        autoRefreshToken: true,
        // Persist session in localStorage
        persistSession: true,
        // Detect session in URL (for OAuth callbacks)
        detectSessionInUrl: true,
        // Storage key for session persistence
        storageKey: 'koulchi-auth-token',
        // Storage implementation
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      },
      // Global configuration
      global: {
        headers: {
          'X-Client-Info': 'koulchi-frontend'
        }
      }
    }
);

// Export environment for use in other parts of the app
export { environment };