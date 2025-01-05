import React from "react";
import NotesSection from "@/components/NotesSection";
import VoiceContainer from "@/components/VoiceContainer";

const Index = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8">
        <NotesSection />
        <VoiceContainer />
      </div>
    </div>
  );
};

export default Index;