import React from "react";
import { Brain, Clock, Mic, Zap } from "lucide-react";

export const features = [
  {
    icon: Mic,
    title: "Voice Interaction",
    description: "Ask questions naturally and get instant answers about Bubble.io",
  },
  {
    icon: Brain,
    title: "AI Knowledge Base",
    description: "Access comprehensive Bubble.io documentation and best practices",
  },
  {
    icon: Zap,
    title: "Quick Learning",
    description: "Get immediate answers to your Bubble.io questions",
  },
  {
    icon: Clock,
    title: "24/7 Available",
    description: "Learn and get help with Bubble.io anytime you need",
  },
];

const FeatureGrid = () => {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 max-w-6xl mx-auto">
      {features.map((feature, index) => (
        <div
          key={index}
          className="bg-white shadow-sm p-8 rounded-xl border border-gray-100 hover:border-[#0037ff] hover:shadow-lg transition-all duration-300 group hover:transform hover:-translate-y-1"
        >
          <div className="mb-4 bg-[#f5f5f5] p-3 rounded-lg inline-block">
            <feature.icon className="h-8 w-8 text-[#0037ff] group-hover:scale-110 transition-transform duration-300" />
          </div>
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">
            {feature.title}
          </h3>
          <p className="text-[#4A4A4A] text-sm leading-relaxed">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default FeatureGrid;