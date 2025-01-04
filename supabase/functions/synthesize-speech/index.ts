import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Polly } from 'npm:@aws-sdk/client-polly';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );
    
    // Get user's AWS credentials
    const { data: apiKeys, error: apiKeysError } = await supabase
      .from('api_keys')
      .select('aws_access_key, aws_secret_key')
      .single();
      
    if (apiKeysError || !apiKeys) {
      throw new Error('Failed to get AWS credentials');
    }

    const polly = new Polly({
      region: "us-east-1",
      credentials: {
        accessKeyId: apiKeys.aws_access_key!,
        secretAccessKey: apiKeys.aws_secret_key!
      }
    });

    const response = await polly.synthesizeSpeech({
      Text: text,
      OutputFormat: "mp3",
      VoiceId: "Joanna"
    });

    const audioStream = response.AudioStream;
    if (!audioStream) {
      throw new Error('No audio stream returned');
    }

    return new Response(audioStream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 400,
    });
  }
});