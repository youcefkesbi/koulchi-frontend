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

serve(async (req) => {
  // Handle CORS preflight requests - MUST be first and return 204
  if (req.method === 'OPTIONS') {
    try {
      const corsHeaders = getCorsHeaders(req)
      console.log('✅ OPTIONS preflight request - returning 204 with headers:', corsHeaders)
      return new Response(null, { 
        status: 204, 
        headers: corsHeaders 
      })
    } catch (err) {
      // Even if getCorsHeaders fails, return basic CORS headers
      console.error('Error in OPTIONS handler:', err)
      return new Response(null, { 
        status: 204, 
        headers: baseCorsHeaders 
      })
    }
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    // Support new naming: SUPABASE_SECRET_KEY (formerly service role)
    const supabaseServiceKey = Deno.env.get('SUPABASE_SECRET_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
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

    // Delete the Maystro integration for this seller
    const { error } = await supabase
      .from('seller_shipping')
      .delete()
      .eq('seller_id', user.id)
      .eq('provider', 'maystro')

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to disconnect integration')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Maystro integration disconnected successfully'
      }),
      { 
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in disconnect-maystro:', error)
    
    // Ensure CORS headers are always included, even on error
    let corsHeaders
    try {
      corsHeaders = getCorsHeaders(req)
    } catch (corsError) {
      console.error('Error getting CORS headers:', corsError)
      corsHeaders = baseCorsHeaders
    }
    
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
