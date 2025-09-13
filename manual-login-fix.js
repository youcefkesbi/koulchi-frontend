// Manual login fix - run this in browser console
// This will bypass the hanging profile loading and set the user as logged in

console.log('Starting manual login fix...');

// Get the auth store
const app = document.querySelector('#app').__vue_app__;
if (app) {
  const authStore = app.config.globalProperties.$pinia._s.get('auth');
  
  if (authStore) {
    console.log('Auth store found, attempting manual login...');
    
    // Get the current session from Supabase
    window.supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        console.log('Valid session found:', session.user.email);
        
        // Manually set the user without loading profile
        authStore.user = {
          ...session.user,
          full_name: session.user.user_metadata?.full_name || 'User',
          role: 'user'
        };
        
        console.log('User manually set:', authStore.user);
        console.log('Is authenticated now:', authStore.isAuthenticated);
        
        // Close the login modal if it's open
        const modal = document.querySelector('[data-testid="login-modal"]') || 
                     document.querySelector('.modal') ||
                     document.querySelector('[role="dialog"]');
        if (modal) {
          const closeButton = modal.querySelector('button[aria-label="Close"]') ||
                             modal.querySelector('.close') ||
                             modal.querySelector('[data-dismiss="modal"]');
          if (closeButton) {
            closeButton.click();
            console.log('Login modal closed');
          }
        }
        
        // Refresh the page to ensure everything is in sync
        setTimeout(() => {
          console.log('Refreshing page to sync state...');
          window.location.reload();
        }, 1000);
        
      } else {
        console.log('No valid session found');
      }
    }).catch(error => {
      console.error('Error getting session:', error);
    });
  } else {
    console.log('Auth store not found');
  }
} else {
  console.log('Vue app not found');
}
