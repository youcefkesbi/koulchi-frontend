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
    environment.supabase.publishableKey,
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
      refreshSession: () => Promise.resolve({ data: { session: null }, error: { message: 'Supabase not configured' } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithOAuth: () => Promise.resolve({ data: { provider: null, url: null }, error: { message: 'Supabase not configured' } }),
      signInWithOtp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } })
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }) }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      delete: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
    }),
    rpc: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) })
    })
  };
}

// Verify Supabase client is properly initialized with auth
export const verifySupabaseAuth = async () => {
  try {
    // Test basic auth functionality
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.warn('Supabase auth verification failed:', error)
      return false
    }
    
    console.log('Supabase client initialized with auth support')
    return true
  } catch (error) {
    console.warn('Supabase auth verification error:', error)
    return false
  }
}

// Initialize auth verification on import
if (typeof window !== 'undefined') {
  verifySupabaseAuth().then(isValid => {
    if (isValid) {
      console.log('✅ Supabase client is properly initialized with authentication')
    } else {
      console.warn('⚠️ Supabase client may not be properly configured')
    }
  })
	// Expose for Console debugging
	try {
		window.supabase = supabase
		window.environment = environment
	} catch {}
}

export { supabase };

// Export environment for use in other parts of the app
export { environment };