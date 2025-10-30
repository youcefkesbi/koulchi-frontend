import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Match the simple CORS pattern used in other functions
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
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
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client (pattern: use ANON key and forward Authorization header)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY')
    if (!supabaseUrl || !supabaseAnon) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseAnon, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    })

    // Verify the JWT token via forwarded Authorization
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Invalid token')
    }

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

    // Insert or update the integration
    const { data, error } = await supabase
      .from('seller_shipping')
      .upsert({
        seller_id: user.id,
        store_id: storeId,
        provider: 'maystro',
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        expires_at: expiresAt,
        enabled: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'seller_id,provider'
      })

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to save integration')
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
