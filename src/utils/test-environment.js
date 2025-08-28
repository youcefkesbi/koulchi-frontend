/**
 * Environment Configuration Test Script
 * OAuth is handled entirely by Supabase - no OAuth credentials needed in frontend.
 */

import { environment, validateEnvironment, getOAuthConfig } from '../config/environment.js'

console.log('🧪 Testing Environment Configuration...\n')

console.log('1️⃣ Environment Detection:')
console.log(`   - isProduction: ${environment.isProduction}`)
console.log(`   - isVercel: ${environment.isVercel}`)
console.log(`   - isDevelopment: ${environment.isDevelopment}`)
console.log(`   - isLocalhost: ${environment.isLocalhost}`)

console.log('\n2️⃣ App Configuration:')
console.log(`   - App URL: ${environment.appUrl}`)
console.log(`   - App Name: ${environment.branding.name}`)
console.log(`   - App Version: ${environment.branding.version}`)

console.log('\n3️⃣ Supabase Configuration:')
console.log(`   - Supabase URL: ${environment.supabase.url ? '✅ Configured' : '❌ Missing'}`)
console.log(`   - Supabase Anon Key: ${environment.supabase.anonKey ? '✅ Configured' : '❌ Missing'}`)

console.log('\n4️⃣ OAuth Configuration:')
console.log(`   - Callback Path: ${environment.oauth.callbackPath}`)
console.log(`   - Note: OAuth handled entirely by Supabase`)

console.log('\n5️⃣ OAuth Redirect URL:')
try {
  const oauthConfig = getOAuthConfig()
  console.log(`   - OAuth Config: ${JSON.stringify(oauthConfig, null, 2)}`)
} catch (error) {
  console.log(`   - ❌ Error getting OAuth config: ${error.message}`)
}

console.log('\n6️⃣ Environment Validation:')
try {
  const isValid = validateEnvironment()
  console.log(`   - ✅ Environment validation passed`)
} catch (error) {
  console.log(`   - ❌ Environment validation failed: ${error.message}`)
}

console.log('\n7️⃣ Feature Flags:')
console.log(`   - Debug Logging: ${environment.features.debugLogging ? '✅ Enabled' : '❌ Disabled'}`)
console.log(`   - Dev Tools: ${environment.features.devTools ? '✅ Enabled' : '❌ Disabled'}`)
console.log(`   - OAuth Branding: ${environment.features.oauthBranding ? '✅ Enabled' : '❌ Disabled'}`)

console.log('\n🎯 Environment Configuration Test Complete!')
console.log('\n📝 Next Steps:')
console.log('   1. Create .env.local for development')
console.log('   2. Configure Vercel environment variables for production')
console.log('   3. Configure OAuth providers in Supabase Dashboard')
console.log('   4. Test OAuth flow in both environments')
console.log('   5. Verify callback path is /auth/v1/callback')

export default environment
