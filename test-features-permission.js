// Test script to verify features table permission fix
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_PUBLISHABLE_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testFeaturesPermission() {
  try {
    console.log('Testing features table permissions...')
    
    // Test 1: Check if user can read features
    const { data: features, error: readError } = await supabase
      .from('features')
      .select('*')
      .limit(1)
    
    if (readError) {
      console.error('❌ Read features error:', readError)
    } else {
      console.log('✅ Read features successful:', features?.length || 0, 'features found')
    }
    
    // Test 2: Check if user can update a feature (this should work for admin)
    const { data: updateData, error: updateError } = await supabase
      .from('features')
      .update({ 
        description_en: 'Test update - ' + new Date().toISOString() 
      })
      .eq('name_en', 'Store Logo')
      .select()
    
    if (updateError) {
      console.error('❌ Update features error:', updateError)
    } else {
      console.log('✅ Update features successful:', updateData?.length || 0, 'features updated')
    }
    
    // Test 3: Check user roles
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
      
      if (roleError) {
        console.error('❌ Get user roles error:', roleError)
      } else {
        console.log('✅ User roles:', userRoles?.map(ur => ur.role) || [])
      }
    } else {
      console.log('❌ No authenticated user')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testFeaturesPermission()
