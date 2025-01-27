import React from "react";
import VoiceRecorder from "./VoiceRecorder";

interface VoiceContainerProps {
  isRecording: boolean;
  isProcessing: boolean;
  toggleRecording: () => void;
  transcript: string;
  response: string;
}

const VoiceContainer = ({
  isRecording,
  isProcessing,
  toggleRecording,
  transcript,
  response,
}: VoiceContainerProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 p-8 mb-8">
      <VoiceRecorder
        isRecording={isRecording}
        isProcessing={isProcessing}
        toggleRecording={toggleRecording}
        transcript={transcript}
        response={response}
      />
    </div>
  );
};

export default VoiceContainer;