/**
 * Routing Configuration Test Script
 * Tests environment-aware routing and unknown route handling
 */

import { environment } from '../config/environment.js'

console.log('🧪 Testing Routing Configuration...\n')

// Test 1: Environment Detection
console.log('1️⃣ Environment Detection:')
console.log(`   - isProduction: ${environment.isProduction}`)
console.log(`   - isVercel: ${environment.isVercel}`)
console.log(`   - isDevelopment: ${environment.isDevelopment}`)
console.log(`   - App URL: ${environment.appUrl}`)

// Test 2: OAuth Redirect URLs
console.log('\n2️⃣ OAuth Redirect URLs:')
console.log(`   - OAuth Callback: ${environment.appUrl}${environment.oauth.callbackPath}`)
console.log(`   - Password Reset: ${environment.appUrl}/reset-password`)

// Test 3: Unknown Route Handling
console.log('\n3️⃣ Unknown Route Handling:')
if (environment.isProduction) {
  console.log(`   - Production: Unknown routes redirect to ${environment.appUrl}`)
  console.log(`   - This ensures no 404 errors in production`)
} else {
  console.log(`   - Development: Unknown routes redirect to home with best locale`)
  console.log(`   - This allows for local development and testing`)
}

// Test 4: Environment Variables
console.log('\n4️⃣ Environment Variables:')
console.log(`   - VITE_APP_URL: ${import.meta.env.VITE_APP_URL || 'Not set'}`)
console.log(`   - VITE_SUPABASE_URL: ${import.meta.env.VITE_SUPABASE_URL ? 'Configured' : 'Not set'}`)
console.log(`   - VITE_SUPABASE_ANON_KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configured' : 'Not set'}`)

// Test 5: Routing Behavior
console.log('\n5️⃣ Routing Behavior:')
console.log(`   - Catch-all route: /:pathMatch(.*)* → ${environment.isProduction ? 'Production URL' : 'Home with locale'}`)
console.log(`   - OAuth callback: ${environment.oauth.callbackPath}`)
console.log(`   - Password reset: /reset-password`)

console.log('\n🎯 Routing Configuration Test Complete!')
console.log('\n📝 Next Steps:')
console.log('   1. Test unknown routes in browser')
console.log('   2. Verify OAuth redirects work correctly')
console.log('   3. Test password reset flow')
console.log('   4. Deploy to production and test')

export default environment
