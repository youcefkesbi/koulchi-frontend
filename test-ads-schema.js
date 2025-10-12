// Test script to verify ads schema changes
import { createClient } from '@supabase/supabase-js'

// This is a test script to verify the ads schema works correctly
// Run this with: node test-ads-schema.js

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAdsSchema() {
  console.log('Testing ads schema changes...')
  
  try {
    // Test 1: Fetch ads with new schema
    console.log('\n1. Testing ads fetch with new schema...')
    const { data: ads, error: adsError } = await supabase
      .from('ads')
      .select(`
        *,
        products:product_id(
          id,
          name,
          price,
          image_urls
        ),
        stores:store_id(
          id,
          name,
          logo_url,
          location
        )
      `)
      .limit(5)
    
    if (adsError) {
      console.error('❌ Error fetching ads:', adsError.message)
      return false
    }
    
    console.log('✅ Successfully fetched ads:', ads.length, 'ads found')
    
    // Test 2: Verify product ads structure
    const productAds = ads.filter(ad => ad.item_type === 'product' && ad.products)
    console.log(`✅ Product ads: ${productAds.length} found`)
    
    // Test 3: Verify store ads structure  
    const storeAds = ads.filter(ad => ad.item_type === 'store' && ad.stores)
    console.log(`✅ Store ads: ${storeAds.length} found`)
    
    // Test 4: Test ad_requests table structure
    console.log('\n2. Testing ad_requests table...')
    const { data: adRequests, error: requestsError } = await supabase
      .from('ad_requests')
      .select('*')
      .limit(5)
    
    if (requestsError) {
      console.error('❌ Error fetching ad_requests:', requestsError.message)
      return false
    }
    
    console.log('✅ Successfully fetched ad_requests:', adRequests.length, 'requests found')
    
    // Test 5: Verify new columns exist
    if (adRequests.length > 0) {
      const sampleRequest = adRequests[0]
      const hasProductId = 'product_id' in sampleRequest
      const hasStoreId = 'store_id' in sampleRequest
      const hasStartDate = 'start_date' in sampleRequest
      const hasEndDate = 'end_date' in sampleRequest
      
      console.log(`✅ product_id column: ${hasProductId ? 'exists' : 'missing'}`)
      console.log(`✅ store_id column: ${hasStoreId ? 'exists' : 'missing'}`)
      console.log(`✅ start_date column: ${hasStartDate ? 'exists' : 'missing'}`)
      console.log(`✅ end_date column: ${hasEndDate ? 'exists' : 'missing'}`)
      
      if (!hasProductId || !hasStoreId || !hasStartDate || !hasEndDate) {
        console.error('❌ Some required columns are missing!')
        return false
      }
    }
    
    console.log('\n🎉 All tests passed! The ads schema migration is working correctly.')
    return true
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    return false
  }
}

// Run the test
testAdsSchema().then(success => {
  process.exit(success ? 0 : 1)
})
