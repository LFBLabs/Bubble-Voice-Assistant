import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, DollarSign, Check } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 sm:py-20">
        <nav className="flex justify-end mb-8">
          <Button
            variant="ghost"
            className="text-primary hover:text-primary/80"
            onClick={() => navigate("/login")}
          >
            Already subscribed?
          </Button>
        </nav>

        <main className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Your AI Voice Assistant for{" "}
            <span className="text-primary">Bubble.io</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
            Get instant, voice-powered help with your Bubble.io development. Ask questions,
            get explanations, and streamline your workflow - all through natural conversation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              className="text-lg gap-2"
              onClick={() => navigate("/login")}
            >
              <DollarSign className="w-5 h-5" />
              Get Started for $1
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
              >
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="relative">
            <img
              src="/lovable-uploads/274d4461-71f9-4e12-abb3-812c2215fb65.png"
              alt="No-code development environment"
              className="rounded-xl shadow-2xl mx-auto w-full max-w-4xl object-cover"
              width={1200}
              height={800}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-50 to-transparent dark:from-gray-900 opacity-30 rounded-xl" />
          </div>
        </main>
      </div>
    </div>
  );
};

const features = [
  {
    title: "Voice-Powered Assistance",
    description: "Ask questions naturally and get instant, accurate responses about Bubble.io development.",
  },
  {
    title: "24/7 Availability",
    description: "Get help whenever you need it, with unlimited access to your AI assistant.",
  },
  {
    title: "Contextual Understanding",
    description: "Your assistant understands Bubble.io concepts and can provide relevant examples.",
  },
];

export default Landing;