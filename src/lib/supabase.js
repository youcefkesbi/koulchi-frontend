import { createClient } from '@supabase/supabase-js';

// Note: These environment variables are for backend infrastructure only
// Users should never see these URLs - they are used internally by Supabase
// for authentication, database connections, and API calls
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are not properly configured. Please check your .env file.');
}

// Create Supabase client for backend operations
// This client handles authentication, database queries, and file storage
// All operations happen server-side - users only see your app's UI
export const supabase = createClient(supabaseUrl, supabaseAnonKey);