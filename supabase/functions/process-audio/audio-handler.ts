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
      VoiceId: "Joanna"
    });

    if (!response.AudioStream) {
      throw new Error('No audio stream returned from Polly');
    }

    // Convert AudioStream to Uint8Array
    const audioData = await response.AudioStream.transformToByteArray();
    
    // Convert to base64
    const base64Audio = btoa(String.fromCharCode(...audioData));
    
    // Return as a proper data URL
    return `data:audio/mpeg;base64,${base64Audio}`;

  } catch (error) {
    console.error('Error in synthesizeAudio:', error);
    throw error;
  }
}