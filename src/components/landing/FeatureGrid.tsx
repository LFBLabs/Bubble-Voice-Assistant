
import React from "react";
import { Brain, Clock, Mic, Zap } from "lucide-react";

export const features = [
  {
    icon: Mic,
    title: "Voice Interaction",
    description: "Ask questions in natural language and get instant answers with our voice-enabled AI. Over 95% accuracy in understanding Bubble.io-related queries.",
  },
  {
    icon: Brain,
    title: "AI Knowledge Base",
    description: "Access 10,000+ curated resources including official Bubble.io docs, community best practices, and real-world examples from successful apps.",
  },
  {
    icon: Zap,
    title: "Quick Learning",
    description: "Reduce your learning curve by 60%. Get contextual answers to your Bubble.io questions in under 20 seconds.",
  },
  {
    icon: Clock,
    title: "24/7 Available",
    description: "Instant access to AI assistance whenever you need it. Join other developers who rely on our platform for round-the-clock Bubble.io support.",
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
          <div className="mb-5 bg-[#f5f5f5] p-4 rounded-lg inline-block">
            <feature.icon className="h-10 w-10 text-[#0037ff] group-hover:scale-110 transition-transform duration-300" />
          </div>
          <h3 className="text-xl font-bold text-[#1a1a1a] mb-3 tracking-tight">
            {feature.title}
          </h3>
          <p className="text-[#4A4A4A] text-base leading-relaxed">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default FeatureGrid;
