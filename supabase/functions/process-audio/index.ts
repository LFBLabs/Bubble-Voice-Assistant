import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleTextResponse } from "./text-handler.ts";
import { synthesizeAudio } from "./audio-handler.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing audio request...');
    const { text } = await req.json();
    
    if (!text || typeof text !== 'string') {
      console.error('Invalid or missing text in request');
      throw new Error('Invalid or missing text in request');
    }

    console.log('Generating AI response...');
    const responseText = await handleTextResponse(text);
    
    if (!responseText) {
      console.error('No response text generated');
      throw new Error('Failed to generate response text');
    }

    console.log('Synthesizing audio...');
    const audioUrl = await synthesizeAudio(responseText);
    
    if (!audioUrl) {
      console.error('No audio URL generated');
      throw new Error('Failed to generate audio');
    }

    console.log('Successfully processed request');
    return new Response(
      JSON.stringify({ 
        response: responseText,
        audioUrl 
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error in process-audio function:', error);
    
    // Return a more detailed error response
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});