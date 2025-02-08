
import { Polly } from "npm:@aws-sdk/client-polly";

// Split text into manageable chunks for parallel processing
function splitTextIntoChunks(text: string, maxChunkLength = 1000): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;

  for (const sentence of sentences) {
    if (currentLength + sentence.length > maxChunkLength) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [sentence];
      currentLength = sentence.length;
    } else {
      currentChunk.push(sentence);
      currentLength += sentence.length;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks;
}

// Combine audio streams efficiently
async function combineAudioStreams(audioBuffers: Uint8Array[]): Promise<ArrayBuffer> {
  const totalLength = audioBuffers.reduce((acc, buffer) => acc + buffer.length, 0);
  const combinedBuffer = new Uint8Array(totalLength);
  let offset = 0;

  for (const buffer of audioBuffers) {
    combinedBuffer.set(buffer, offset);
    offset += buffer.length;
  }

  return combinedBuffer.buffer;
}

// Implement streaming for audio synthesis
export async function synthesizeAudio(text: string): Promise<string> {
  try {
    console.log('Initializing Polly with AWS credentials');
    const polly = new Polly({
      region: "us-east-1",  // Changed back to us-east-1 which supports the generative engine
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY')!,
        secretAccessKey: Deno.env.get('AWS_SECRET_KEY')!
      }
    });

    // Split text into chunks for parallel processing
    const chunks = splitTextIntoChunks(text);
    console.log(`Split text into ${chunks.length} chunks`);
    
    // Process chunks in parallel
    const audioPromises = chunks.map(chunk => 
      polly.synthesizeSpeech({
        Text: chunk,
        OutputFormat: "mp3",
        VoiceId: "Danielle",
        Engine: "generative"
      })
    );

    console.log('Processing audio chunks in parallel');
    const audioResponses = await Promise.all(audioPromises);
    
    // Convert responses to audio buffers
    const audioBuffers = await Promise.all(
      audioResponses.map(async (response) => {
        if (!response.AudioStream) {
          throw new Error('No audio stream returned from Polly');
        }
        return new Uint8Array(await response.AudioStream.transformToByteArray());
      })
    );

    console.log('Combining audio streams');
    const combinedAudio = await combineAudioStreams(audioBuffers);
    
    // Convert to base64
    const base64Audio = btoa(
      Array.from(new Uint8Array(combinedAudio))
        .map(byte => String.fromCharCode(byte))
        .join('')
    );
    
    console.log('Audio synthesis completed successfully');
    return `data:audio/mpeg;base64,${base64Audio}`;

  } catch (error) {
    console.error('Error in synthesizeAudio:', error);
    throw error;
  }
}
