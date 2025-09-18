// Comprehensive Role Debugging Script
// Run this in the browser console while on the /dashboard page

console.log('🔍 COMPREHENSIVE ROLE DEBUGGING');
console.log('================================');

// Check if we're in the right context
if (typeof window === 'undefined') {
  console.log('❌ This script must be run in the browser console');
  process.exit(1);
}

// Function to check Supabase connection
async function checkSupabaseConnection() {
  console.log('\n1. Checking Supabase Connection...');
  try {
    // Check if supabase is available
    if (typeof window.supabase !== 'undefined') {
      console.log('✅ Supabase client found');
      return true;
    } else {
      console.log('❌ Supabase client not found');
      return false;
    }
  } catch (error) {
    console.log('❌ Error checking Supabase:', error);
    return false;
  }
}

// Function to check current user session
async function checkCurrentSession() {
  console.log('\n2. Checking Current Session...');
  try {
    if (typeof window.supabase !== 'undefined') {
      const { data: { session }, error } = await window.supabase.auth.getSession();
      if (error) {
        console.log('❌ Session error:', error);
        return null;
      }
      if (session) {
        console.log('✅ User session found');
        console.log('  - User ID:', session.user.id);
        console.log('  - User Email:', session.user.email);
        return session.user;
      } else {
        console.log('❌ No active session');
        return null;
      }
    }
    return null;
  } catch (error) {
    console.log('❌ Error checking session:', error);
    return null;
  }
}

// Function to check profile in Supabase
async function checkProfileInSupabase(userId) {
  console.log('\n3. Checking Profile in Supabase...');
  try {
    if (typeof window.supabase !== 'undefined') {
      const { data: profile, error } = await window.supabase
        .from('profiles')
        .select('id, full_name, role, city')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.log('❌ Profile query error:', error);
        return null;
      }
      
      if (profile) {
        console.log('✅ Profile found in Supabase');
        console.log('  - Profile ID:', profile.id);
        console.log('  - Full Name:', profile.full_name);
        console.log('  - Role:', profile.role);
        console.log('  - City:', profile.city);
        return profile;
      } else {
        console.log('❌ No profile found');
        return null;
      }
    }
    return null;
  } catch (error) {
    console.log('❌ Error checking profile:', error);
    return null;
  }
}

// Function to check Pinia store
function checkPiniaStore() {
  console.log('\n4. Checking Pinia Store...');
  try {
    // Try to access the auth store
    if (typeof window.Vue !== 'undefined') {
      console.log('✅ Vue detected');
      // This would need to be run in the Vue app context
      console.log('To check Pinia store, use the RoleTest component in the top-right corner');
      return true;
    } else {
      console.log('❌ Vue not detected');
      return false;
    }
  } catch (error) {
    console.log('❌ Error checking Pinia store:', error);
    return false;
  }
}

// Function to test role refresh
async function testRoleRefresh() {
  console.log('\n5. Testing Role Refresh...');
  try {
    if (typeof window.supabase !== 'undefined') {
      const { data: { session } } = await window.supabase.auth.getSession();
      if (session?.user) {
        console.log('Testing direct profile query...');
        const { data: profile, error } = await window.supabase
          .from('profiles')
          .select('id, full_name, role, city')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.log('❌ Direct profile query failed:', error);
        } else {
          console.log('✅ Direct profile query successful');
          console.log('  - Role from direct query:', profile.role);
        }
      }
    }
  } catch (error) {
    console.log('❌ Error testing role refresh:', error);
  }
}

// Main debugging function
async function debugRoleIssue() {
  console.log('Starting comprehensive role debugging...\n');
  
  // Check Supabase connection
  const supabaseOk = await checkSupabaseConnection();
  if (!supabaseOk) {
    console.log('\n❌ Cannot proceed without Supabase connection');
    return;
  }
  
  // Check current session
  const user = await checkCurrentSession();
  if (!user) {
    console.log('\n❌ Cannot proceed without active session');
    return;
  }
  
  // Check profile in Supabase
  const profile = await checkProfileInSupabase(user.id);
  if (!profile) {
    console.log('\n❌ Cannot proceed without profile data');
    return;
  }
  
  // Check Pinia store
  checkPiniaStore();
  
  // Test role refresh
  await testRoleRefresh();
  
  // Summary
  console.log('\n📋 DEBUGGING SUMMARY');
  console.log('===================');
  console.log('1. Check the RoleTest component in the top-right corner');
  console.log('2. Look for console logs starting with 🔍, ✅, or ❌');
  console.log('3. Use the debug buttons to test role refresh');
  console.log('4. Check if the admin tab appears after role refresh');
  
  console.log('\n🔧 TROUBLESHOOTING STEPS');
  console.log('========================');
  console.log('1. If role is "admin" in Supabase but not showing:');
  console.log('   - Click "Force Role Refresh" in RoleTest component');
  console.log('   - Check console for role loading messages');
  console.log('   - Verify the user object has the correct role');
  
  console.log('\n2. If role is not "admin" in Supabase:');
  console.log('   - Update the profiles table: UPDATE profiles SET role = \'admin\' WHERE id = \'[user-id]\';');
  console.log('   - Refresh the page and try again');
  
  console.log('\n3. If profile doesn\'t exist:');
  console.log('   - Create profile: INSERT INTO profiles (id, full_name, role) VALUES (\'[user-id]\', \'[name]\', \'admin\');');
  console.log('   - Refresh the page and try again');
}

// Run the debugging
debugRoleIssue();

// Export functions for manual testing
window.debugRoleIssue = debugRoleIssue;
window.checkSupabaseConnection = checkSupabaseConnection;
window.checkCurrentSession = checkCurrentSession;
window.checkProfileInSupabase = checkProfileInSupabase;
window.testRoleRefresh = testRoleRefresh;
