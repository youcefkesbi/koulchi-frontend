import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Base CORS values; dynamic parts will reflect request headers for preflight
const baseCorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Max-Age': '86400'
}

function getCorsHeaders(req) {
  const requestedMethod = req.headers.get('Access-Control-Request-Method')
  const requestedHeaders = req.headers.get('Access-Control-Request-Headers')

  const headers = { ...baseCorsHeaders }
  headers['Access-Control-Allow-Methods'] = requestedMethod || 'POST, OPTIONS'
  headers['Access-Control-Allow-Headers'] = requestedHeaders || 'authorization, x-client-info, apikey, content-type'
  return headers
}

// Encryption function using Web Crypto API
async function encryptToken(token, secretKey) {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  
  // Generate a random IV
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  // Import the secret key
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  )
  
  // Encrypt the data
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  )
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.length)
  
  // Return as base64
  return btoa(String.fromCharCode(...combined))
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client using anon key with user JWT (RLS policies will enforce security)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY') 
    
    if (!supabaseUrl || !supabaseAnon) {
      throw new Error('Missing environment variables: SUPABASE_URL and SUPABASE_ANON_KEY')
    }

    const supabase = createClient(supabaseUrl, supabaseAnon, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    })

    // Verify the JWT token (RLS policies will also check this)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Invalid token')
    }
    
    console.log('✅ User authenticated:', { userId: user.id, email: user.email })

    // Get the request body
    const body = await req.json()
    console.log('🔍 connect-maystro received body keys:', Object.keys(body || {}))
    
    // Validate required fields (updated)
    if (!body.apiToken) {
      throw new Error('Missing required fields: apiToken')
    }

    // Get encryption secret from environment
    const encryptionSecret = Deno.env.get('MAYSTRO_ENCRYPTION_SECRET')
    if (!encryptionSecret) {
      throw new Error('Missing encryption secret')
    }

    // Encrypt token (no refresh/expires in simplified flow)
    const encryptedAccessToken = await encryptToken(body.apiToken, encryptionSecret)
    const encryptedRefreshToken = null
    const expiresAt = null

    // Resolve store ID
    let storeId = body.storeId || null
    if (storeId) {
      const { data: checkStore, error: checkError } = await supabase
        .from('stores')
        .select('id, owner_id, status')
        .eq('id', storeId)
        .single()
      if (checkError || !checkStore || checkStore.owner_id !== user.id || checkStore.status !== 'approved') {
        throw new Error('Invalid storeId or store not approved for this user')
      }
    } else {
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .eq('status', 'approved')
        .single()
      if (storeError || !storeData) {
        throw new Error('No approved store found for user')
      }
      storeId = storeData.id
    }
    console.log('✅ connect-maystro using storeId:', storeId)

    // Check if integration already exists
    const { data: existing, error: checkError } = await supabase
      .from('seller_shipping')
      .select('id')
      .eq('seller_id', user.id)
      .eq('provider', 'maystro')
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing integration:', checkError)
      throw new Error(`Failed to check integration: ${checkError.message}`)
    }

    const integrationData = {
      seller_id: user.id,  // This MUST match auth.uid() in RLS policies
      store_id: storeId,
      provider: 'maystro',
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      expires_at: expiresAt,
      enabled: true,
      updated_at: new Date().toISOString()
    }
    
    console.log('📝 Integration data - seller_id:', integrationData.seller_id, 'store_id:', integrationData.store_id)
    console.log('🔐 RLS check: seller_id MUST equal auth.uid() =', user.id)

    let data, error
    
    if (existing) {
      // Update existing
      console.log('🔄 Updating existing integration:', existing.id)
      console.log('🔄 UPDATE operation - seller_id:', user.id, 'store_id:', storeId)
      const result = await supabase
        .from('seller_shipping')
        .update(integrationData)
        .eq('id', existing.id)
        .select()
      data = result.data
      error = result.error
      if (error) {
        console.error('❌ UPDATE operation failed:', {
          operation: 'UPDATE',
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
      }
    } else {
      // Insert new
      console.log('➕ Inserting new integration')
      console.log('➕ INSERT operation - seller_id:', user.id, 'store_id:', storeId)
      const result = await supabase
        .from('seller_shipping')
        .insert(integrationData)
        .select()
      data = result.data
      error = result.error
      if (error) {
        console.error('❌ INSERT operation failed:', {
          operation: 'INSERT',
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
      }
    }

    if (error) {
      console.error('Database error details:', {
        operation: existing ? 'UPDATE' : 'INSERT',
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        fullError: JSON.stringify(error, null, 2)
      })
      throw new Error(`Failed to save integration: ${error.message || 'Database error'}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Maystro integration connected successfully',
        data: {
          id: Array.isArray(data) ? data?.[0]?.id : data?.id,
          store_id: storeId,
          enabled: true
        }
      }),
      { 
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in connect-maystro:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
