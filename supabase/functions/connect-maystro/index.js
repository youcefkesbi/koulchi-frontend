import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid token')
    }

    // Get the request body
    const body = await req.json()
    
    // Validate required fields
    if (!body.accountId || !body.accessToken || !body.refreshToken || !body.expiresAt) {
      throw new Error('Missing required fields')
    }

    // Get encryption secret from environment
    const encryptionSecret = Deno.env.get('MAYSTRO_ENCRYPTION_SECRET')
    if (!encryptionSecret) {
      throw new Error('Missing encryption secret')
    }

    // Encrypt sensitive tokens
    const encryptedAccessToken = await encryptToken(body.accessToken, encryptionSecret)
    const encryptedRefreshToken = await encryptToken(body.refreshToken, encryptionSecret)

    // Parse expiry date
    const expiresAt = new Date(body.expiresAt).toISOString()

    // Get user's store ID
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', user.id)
      .eq('status', 'approved')
      .single()

    if (storeError || !storeData) {
      throw new Error('No approved store found for user')
    }

    // Insert or update the integration
    const { data, error } = await supabase
      .from('seller_shipping')
      .upsert({
        seller_id: user.id,
        store_id: storeData.id,
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
          id: data?.[0]?.id,
          account_id: body.accountId,
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
