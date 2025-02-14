
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const navigate = useNavigate();
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

      <h2 className="text-2xl sm:text-3xl font-semibold text-[#1a1a1a]/80 mb-6">
        Build your Bubble.io apps 3x faster with voice-powered AI assistance
      </h2>

      <p className="text-xl text-[#4A4A4A] mb-8 max-w-2xl mx-auto leading-relaxed">
        Get voice-powered answers to your Bubble.io questions in seconds. Learn faster,
        build better, and master no-code development with AI assistance.
      </p>

      <div className="flex flex-col items-center gap-4 justify-center">
        <Button 
          size="lg" 
          className="bg-[#0037ff] hover:bg-[#0037ff]/90 text-white font-semibold px-8 py-6 text-lg" 
          onClick={() => navigate("/login")}
        >
          Try It For Free
        </Button>
        <Button 
          variant="ghost" 
          className="text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300" 
          onClick={() => navigate("/login")}
        >
          Already subscribed?
        </Button>
      </div>
    </div>
  );
};

export default HeroSection;
