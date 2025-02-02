import React from "react";

const HeroSection = () => {
  return (
    <div className="text-center mb-20 space-y-8">
      <h1 className="text-4xl sm:text-6xl font-bold text-[#1a1a1a] mb-6 leading-tight">
        Your AI Voice Assistant for{" "}
        <span className="relative inline-block">
          <span className="relative z-10 text-[#0037ff] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
            Bubble.io
          </span>
          <span className="absolute -bottom-2 left-0 right-0 h-3 bg-[#0037ff]/10 transform -skew-x-12"></span>
        </span>
      </h1>

      <p className="text-xl text-[#4A4A4A] mb-8 max-w-2xl mx-auto leading-relaxed">
        Get instant, voice-powered answers to your Bubble.io questions. Learn faster,
        build better, and master no-code development with AI assistance.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
      </div>
    </div>
  );
};

export default HeroSection;