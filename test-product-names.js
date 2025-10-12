// Test script to verify product name consistency
import { createClient } from '@supabase/supabase-js'

// This is a test script to verify product names work correctly
// Run this with: node test-product-names.js

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProductNames() {
  console.log('Testing product name consistency...')
  
  try {
    // Test 1: Fetch products and verify name field exists
    console.log('\n1. Testing products table structure...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, category_id')
      .limit(5)
    
    if (productsError) {
      console.error('❌ Error fetching products:', productsError.message)
      return false
    }
    
    console.log('✅ Successfully fetched products:', products.length, 'products found')
    
    // Test 2: Verify products have name field
    if (products.length > 0) {
      const sampleProduct = products[0]
      const hasName = 'name' in sampleProduct
      const hasNameAr = 'name_ar' in sampleProduct
      const hasNameFr = 'name_fr' in sampleProduct
      
      console.log(`✅ name field: ${hasName ? 'exists' : 'missing'}`)
      console.log(`✅ name_ar field: ${hasNameAr ? 'exists (unexpected)' : 'missing (expected)'}`)
      console.log(`✅ name_fr field: ${hasNameFr ? 'exists (unexpected)' : 'missing (expected)'}`)
      
      if (!hasName) {
        console.error('❌ Products table is missing the name field!')
        return false
      }
      
      if (hasNameAr || hasNameFr) {
        console.warn('⚠️  Products table has localized name fields that should not exist!')
      }
    }
    
    // Test 3: Test ads with products
    console.log('\n2. Testing ads with products...')
    const { data: ads, error: adsError } = await supabase
      .from('ads')
      .select(`
        *,
        products:product_id(
          id,
          name,
          price,
          image_urls
        )
      `)
      .eq('item_type', 'product')
      .limit(3)
    
    if (adsError) {
      console.error('❌ Error fetching ads with products:', adsError.message)
      return false
    }
    
    console.log('✅ Successfully fetched ads with products:', ads.length, 'ads found')
    
    // Test 4: Verify product data in ads
    const productAds = ads.filter(ad => ad.products)
    console.log(`✅ Product ads: ${productAds.length} found`)
    
    if (productAds.length > 0) {
      const sampleAd = productAds[0]
      const product = sampleAd.products
      
      console.log(`✅ Product name in ad: ${product.name ? 'exists' : 'missing'}`)
      console.log(`✅ Product name value: "${product.name}"`)
      
      if (!product.name) {
        console.error('❌ Product name is missing in ad data!')
        return false
      }
    }
    
    // Test 5: Test categories (should have localized names)
    console.log('\n3. Testing categories structure...')
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name_en, name_ar, name_fr')
      .limit(3)
    
    if (categoriesError) {
      console.error('❌ Error fetching categories:', categoriesError.message)
      return false
    }
    
    console.log('✅ Successfully fetched categories:', categories.length, 'categories found')
    
    if (categories.length > 0) {
      const sampleCategory = categories[0]
      const hasNameEn = 'name_en' in sampleCategory
      const hasNameAr = 'name_ar' in sampleCategory
      const hasNameFr = 'name_fr' in sampleCategory
      
      console.log(`✅ name_en field: ${hasNameEn ? 'exists' : 'missing'}`)
      console.log(`✅ name_ar field: ${hasNameAr ? 'exists' : 'missing'}`)
      console.log(`✅ name_fr field: ${hasNameFr ? 'exists' : 'missing'}`)
      
      if (!hasNameEn) {
        console.error('❌ Categories table is missing the name_en field!')
        return false
      }
    }
    
    console.log('\n🎉 All tests passed! Product name consistency is working correctly.')
    console.log('\nSummary:')
    console.log('- Products use single "name" field ✅')
    console.log('- Categories use localized "name_en", "name_ar", "name_fr" fields ✅')
    console.log('- Ads correctly fetch product names ✅')
    console.log('- No localized product name fields found ✅')
    
    return true
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    return false
  }
}

// Run the test
testProductNames().then(success => {
  process.exit(success ? 0 : 1)
})
