import { createClient } from '@supabase/supabase-js';
import { environment, validateEnvironment } from '../config/environment.js';

// Validate environment configuration
try {
  validateEnvironment();
} catch (error) {
  console.warn('Environment validation failed:', error.message);
  // In development, we can continue with fallback values
  if (!environment.isDevelopment) {
    throw error;
  }
}

// Create Supabase client using environment configuration
let supabase = null;

try {
  supabase = createClient(
    environment.supabase.url,
    environment.supabase.anonKey,
    {
      auth: {
        // Let Supabase handle OAuth callbacks through its own fixed endpoint
        // No custom redirectTo needed
        flowType: 'pkce'
      }
    }
  );
} catch (error) {
  console.warn('Supabase client creation failed:', error);
  // Create a mock client for development
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }) }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      delete: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
    })
  };
}

export { supabase };

// Export environment for use in other parts of the app
export { environment };