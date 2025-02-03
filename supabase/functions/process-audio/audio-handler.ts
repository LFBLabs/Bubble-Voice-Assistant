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

  const audioData = new Uint8Array(await speechResponse.AudioStream.transformToByteArray());
  const audioBase64 = btoa(String.fromCharCode(...audioData));
  const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

  console.log('Successfully converted audio to base64');
  
  return audioUrl;
}