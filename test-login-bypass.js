// Test script to bypass profile loading issue
// Run this in browser console on the login page

// Test if we can manually set the user without profile loading
console.log('Testing manual user setup...');

// Get the auth store (if accessible)
if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
  console.log('Vue DevTools detected');
}

// Try to access the auth store directly
const app = document.querySelector('#app').__vue_app__;
if (app) {
  const authStore = app.config.globalProperties.$pinia._s.get('auth');
  if (authStore) {
    console.log('Auth store found:', authStore);
    console.log('Current user:', authStore.user);
    console.log('Is authenticated:', authStore.isAuthenticated);
  }
}

// Test Supabase connection directly
if (window.supabase) {
  console.log('Supabase client found');
  // Test profile query directly
  window.supabase
    .from('profiles')
    .select('*')
    .eq('id', 'a25a905e-1d74-4a52-ae8d-c20e7ce4b4c6')
    .then(result => {
      console.log('Direct profile query result:', result);
    })
    .catch(error => {
      console.error('Direct profile query error:', error);
    });
}
