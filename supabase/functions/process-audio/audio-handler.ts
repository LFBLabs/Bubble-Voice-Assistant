import { Polly } from "npm:@aws-sdk/client-polly";

// Implement streaming for audio synthesis
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

    // Split long text into chunks for parallel processing
    const chunks = splitTextIntoChunks(text);
    
    // Process chunks in parallel
    const audioPromises = chunks.map(chunk => 
      polly.synthesizeSpeech({
        Text: chunk,
        OutputFormat: "mp3",
        VoiceId: "Danielle",
        Engine: "generative"
      })
    );

    const audioResponses = await Promise.all(audioPromises);
    
    // Combine audio streams
    const combinedAudio = await combineAudioStreams(audioResponses);
    
    // Convert to base64
    const base64Audio = btoa(
      Array.from(new Uint8Array(combinedAudio))
        .map(byte => String.fromCharCode(byte))
        .join('')
    );
    
    return `data:audio/mpeg;base64,${base64Audio}`;

  } catch (error) {
    console.error('Error in synthesizeAudio:', error);
    throw error;
  }
}

// Helper function to split text into manageable chunks
function splitTextIntoChunks(text: string, maxChunkLength = 1000): string[] {
  const words = text.split(' ');
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  
  for (const word of words) {
    if (currentChunk.join(' ').length + word.length > maxChunkLength) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [word];
    } else {
      currentChunk.push(word);
    }
  }
  
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }
  
  return chunks;
}

// Helper function to combine audio streams
async function combineAudioStreams(responses: any[]): Promise<ArrayBuffer> {
  const audioBuffers = await Promise.all(
    responses.map(async (response) => {
      if (!response.AudioStream) {
        throw new Error('No audio stream returned from Polly');
      }
      return await response.AudioStream.transformToByteArray();
    })
  );
  
  // Calculate total length
  const totalLength = audioBuffers.reduce((acc, buffer) => acc + buffer.length, 0);
  const combinedBuffer = new Uint8Array(totalLength);
  
  // Combine buffers
  let offset = 0;
  for (const buffer of audioBuffers) {
    combinedBuffer.set(buffer, offset);
    offset += buffer.length;
  }
  
  return combinedBuffer.buffer;
}