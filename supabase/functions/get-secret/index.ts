import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse the request body
    const { secretName } = await req.json()
    
    if (!secretName) {
      throw new Error('Secret name is required')
    }

    console.log(`Attempting to fetch secret: ${secretName}`)
    const secret = Deno.env.get(secretName)
    
    if (!secret) {
      console.error(`Secret ${secretName} not found`)
      return new Response(
        JSON.stringify({ 
          error: `Secret ${secretName} not found`,
          status: 404 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        },
      )
    }

    console.log(`Successfully retrieved secret: ${secretName}`)
    return new Response(
      JSON.stringify({ [secretName]: secret }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in get-secret function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: 400 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})