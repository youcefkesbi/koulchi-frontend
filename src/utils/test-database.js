// Test database connection and products table
import { supabase } from '../lib/supabase'

export const testDatabase = async () => {
  console.log('Testing database connection...')
  
  try {
    // Test basic connection
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Auth status:', user ? 'Authenticated' : 'Not authenticated', user?.id)
    
    if (authError) {
      console.error('Auth error:', authError)
    }
    
    // Test products table with different queries
    console.log('Testing products table...')
    
    // Test 1: Simple select
    const { data: products1, error: error1 } = await supabase
      .from('products')
      .select('*')
      .limit(5)
    
    console.log('Simple select result:', products1?.length || 0, 'products, error:', error1)
    
    // Test 2: Select with count
    const { data: products2, error: error2, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .limit(5)
    
    console.log('Count select result:', products2?.length || 0, 'products, total count:', count, 'error:', error2)
    
    // Test 3: Select only active products
    const { data: products3, error: error3 } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .limit(5)
    
    console.log('Active products result:', products3?.length || 0, 'products, error:', error3)
    
    // Test 4: Select only new products
    const { data: products4, error: error4 } = await supabase
      .from('products')
      .select('*')
      .eq('is_new', true)
      .limit(5)
    
    console.log('New products result:', products4?.length || 0, 'products, error:', error4)
    
    // Test 5: Check if table exists and has any data
    const { data: tableInfo, error: tableError } = await supabase
      .from('products')
      .select('id')
      .limit(1)
    
    console.log('Table existence test:', tableInfo?.length || 0, 'rows, error:', tableError)
    
    if (products1 && products1.length > 0) {
      console.log('Sample product:', products1[0])
    }
    
    // Test categories table
    console.log('Testing categories table...')
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(5)
    
    if (categoriesError) {
      console.error('Categories table error:', categoriesError)
    } else {
      console.log('Categories table accessible:', categories?.length || 0, 'categories found')
    }
    
    return true
  } catch (error) {
    console.error('Database test failed:', error)
    return false
  }
}

export const testProductQueries = async () => {
  console.log('Testing product queries...')
  
  try {
    // Test simple select
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price')
      .limit(3)
    
    if (error) {
      console.error('Simple select error:', error)
      return false
    }
    
    console.log('Simple select successful:', data?.length || 0, 'products')
    return true
  } catch (error) {
    console.error('Product query test failed:', error)
    return false
  }
}

export const checkDatabaseTables = async () => {
  console.log('Checking database tables...')
  
  try {
    // Check if we can access the information_schema
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['products', 'categories', 'profiles', 'stores'])
    
    if (error) {
      console.error('Schema query error:', error)
      return false
    }
    
    console.log('Available tables:', tables?.map(t => t.table_name) || [])
    return true
  } catch (error) {
    console.error('Schema check failed:', error)
    return false
  }
}
