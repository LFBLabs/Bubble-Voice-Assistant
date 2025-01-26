import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic, Brain, Zap, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1F2C] to-[#141824]">
      <div className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            <Mic className="h-8 w-8 text-[#9B87F5]" />
            <span className="text-xl font-bold text-white">Voice Assistant</span>
          </div>
          <Button
            variant="ghost"
            className="text-[#9B87F5] hover:bg-[#9B87F5]/10 hover:text-[#9B87F5]"
            onClick={() => navigate("/login")}
          >
            Already subscribed?
          </Button>
        </nav>

        <main className="max-w-5xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 leading-tight">
              Your AI Voice Assistant for{" "}
              <span className="text-[#9B87F5] inline-block animate-pulse">Bubble.io</span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Get instant, voice-powered help with your Bubble.io development. Ask questions,
              get explanations, and streamline your workflow.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="text-lg gap-2 bg-[#9B87F5] hover:bg-[#8B75E3] transition-colors duration-300"
                onClick={() => navigate("/login")}
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
              <p className="text-sm text-gray-400">
                Includes a 1-day free trial, then $24/month
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4 mb-16">
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Fun to use</span>
                  <span>98%</span>
                </div>
                <Progress value={98} className="h-2 bg-gray-700" />
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Sentient Agents</span>
                  <span>92%</span>
                </div>
                <Progress value={92} className="h-2 bg-gray-700" />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#232836] p-6 rounded-xl border border-gray-700 hover:border-[#9B87F5]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#9B87F5]/5 group"
              >
                <div className="mb-4">
                  <feature.icon className="h-8 w-8 text-[#9B87F5] group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="relative rounded-xl overflow-hidden">
            <img
              src="/lovable-uploads/274d4461-71f9-4e12-abb3-812c2215fb65.png"
              alt="No-code development environment"
              className="w-full object-cover rounded-xl shadow-2xl"
              style={{ height: '600px' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1F2C] to-transparent opacity-90" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <h2 className="text-2xl font-bold mb-2">Powerful Voice Commands</h2>
              <p className="text-gray-300">
                Control your Bubble.io development environment with natural voice interactions
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const features = [
  {
    icon: Mic,
    title: "Voice Control",
    description: "Natural language voice commands for seamless development",
  },
  {
    icon: Brain,
    title: "AI Powered",
    description: "Advanced AI understanding of Bubble.io concepts and workflows",
  },
  {
    icon: Zap,
    title: "Instant Help",
    description: "Get immediate assistance with your development questions",
  },
  {
    icon: Clock,
    title: "24/7 Available",
    description: "Round-the-clock access to your AI development partner",
  },
];

export default Landing;