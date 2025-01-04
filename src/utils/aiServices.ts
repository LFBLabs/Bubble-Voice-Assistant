import { GoogleGenerativeAI } from "@google/generative-ai";
import AWS from 'aws-sdk';

export const initializeGemini = (apiKey: string) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
};

export const initializePolly = (accessKeyId: string, secretAccessKey: string) => {
  return new AWS.Polly({
    region: 'us-east-1',
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
};

export const synthesizeSpeech = async (polly: AWS.Polly, text: string) => {
  const params = {
    Text: text,
    OutputFormat: 'mp3',
    VoiceId: 'Joanna'
  };

  try {
    const data = await polly.synthesizeSpeech(params).promise();
    if (data.AudioStream instanceof Buffer) {
      const blob = new Blob([data.AudioStream], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      return url;
    }
    throw new Error('Failed to synthesize speech');
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    throw error;
  }
};