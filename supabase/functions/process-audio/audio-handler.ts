import { Polly } from "npm:@aws-sdk/client-polly";

export async function synthesizeAudio(text: string): Promise<string> {
  try {
    console.log('Initializing Polly with AWS credentials');
    const polly = new Polly({
      region: "us-east-1",
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY')!,
        secretAccessKey: Deno.env.get('AWS_SECRET_KEY')!
      }
    });

    console.log('Sending synthesis request to Polly');
    const response = await polly.synthesizeSpeech({
      Text: text,
      OutputFormat: "mp3",
      VoiceId: "Danielle",
      Engine: "neural"
    });

    if (!response.AudioStream) {
      throw new Error('No audio stream returned from Polly');
    }

    // Convert AudioStream to Uint8Array using chunks to prevent stack overflow
    const audioData = await response.AudioStream.transformToByteArray();
    
    // Process the audio data in chunks to prevent stack overflow
    const chunkSize = 1024;
    let base64Audio = '';
    
    for (let i = 0; i < audioData.length; i += chunkSize) {
      const chunk = audioData.slice(i, i + chunkSize);
      base64Audio += btoa(String.fromCharCode.apply(null, chunk));
    }
    
    // Return as a proper data URL
    return `data:audio/mpeg;base64,${base64Audio}`;

  } catch (error) {
    console.error('Error in synthesizeAudio:', error);
    throw error;
  }
}