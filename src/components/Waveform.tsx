import React, { useEffect, useRef, useState } from "react";

interface WaveformProps {
  audioUrl?: string;
}

const Waveform = ({ audioUrl }: WaveformProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(8));
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!audioUrl) return;

    // Create audio context and analyzer
    const initializeAudio = async () => {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 32; // Keep it small for 8 bars
      
      const source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Start playing the audio
      try {
        await audio.play();
        updateWaveform();
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    };

    initializeAudio();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl]);

  const updateWaveform = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Sample 8 points from the frequency data
    const sampledData = new Uint8Array(8);
    const step = Math.floor(dataArray.length / 8);
    for (let i = 0; i < 8; i++) {
      sampledData[i] = dataArray[i * step];
    }

    setFrequencyData(sampledData);
    animationFrameRef.current = requestAnimationFrame(updateWaveform);
  };

  return (
    <div className="flex items-center justify-center space-x-1 h-12">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-primary rounded-full transition-all duration-50"
          style={{
            height: `${Math.max(15, (frequencyData[i] / 255) * 48)}px`,
          }}
        />
      ))}
    </div>
  );
};

export default Waveform;