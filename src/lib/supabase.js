import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables are missing!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey);
  throw new Error('Supabase environment variables are not properly configured. Please check your .env file.');
}

console.log('✅ Supabase client configuration:');
console.log('  URL:', supabaseUrl);
console.log('  Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test the connection
console.log('🔍 Testing Supabase connection...');
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection test failed:', error);
  } else {
    console.log('✅ Supabase connection test successful');
  }
}).catch(err => {
  console.error('❌ Supabase connection test exception:', err);
});

// Test basic database access
console.log('🔍 Testing database access...');
supabase.from('profiles').select('count').limit(1).then(({ data, error }) => {
  if (error) {
    console.error('❌ Database access test failed:', error);
    console.error('This might indicate a permissions or table issue');
  } else {
    console.log('✅ Database access test successful');
  }
}).catch(err => {
  console.error('❌ Database access test exception:', err);
});