import { Polly } from "npm:@aws-sdk/client-polly";

export async function synthesizeAudio(text: string) {
  console.log('Initializing AWS Polly...');
  const polly = new Polly({
    region: "us-east-1",
    credentials: {
      accessKeyId: Deno.env.get('AWS_ACCESS_KEY'),
      secretAccessKey: Deno.env.get('AWS_SECRET_KEY')
    }
  });

  if (!polly) {
    throw new Error('Failed to initialize AWS Polly');
  }

  console.log('Synthesizing speech with AWS Polly...');

  const speechResponse = await polly.synthesizeSpeech({
    Text: text,
    OutputFormat: "mp3",
    VoiceId: "Danielle",
    Engine: "neural",
    SampleRate: "24000"
  });

  if (!speechResponse.AudioStream) {
    throw new Error('No audio stream returned from AWS Polly');
  }

  console.log('Successfully generated audio stream');

  // Convert AudioStream to Uint8Array directly
  const audioData = await speechResponse.AudioStream.transformToByteArray();
  
  // Convert to base64 in chunks to prevent stack overflow
  const chunkSize = 32768;
  let base64String = '';
  
  for (let i = 0; i < audioData.length; i += chunkSize) {
    const chunk = audioData.slice(i, i + chunkSize);
    base64String += btoa(String.fromCharCode.apply(null, chunk));
  }

  const audioUrl = `data:audio/mpeg;base64,${base64String}`;

  console.log('Successfully converted audio to base64');
  
  return audioUrl;
}