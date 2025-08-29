import { createClient } from '@supabase/supabase-js';
import { environment, validateEnvironment } from '../config/environment.js';

// Validate environment configuration
try {
  validateEnvironment();
} catch (error) {
  console.error('Environment validation failed:', error.message);
  // In development, we can continue with fallback values
  if (!environment.isDevelopment) {
    throw error;
  }
}

// Create Supabase client using environment configuration
export const supabase = createClient(
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

// Export environment for use in other parts of the app
export { environment };