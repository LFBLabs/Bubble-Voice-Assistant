import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic, Brain, Zap, Clock, Check } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Landing = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center mb-16">
          <div className="text-2xl font-bold text-[#1a1a1a]">BubbleVoice</div>
          <Button
            variant="ghost"
            className="text-[#1a1a1a] hover:bg-gray-100 transition-all duration-300"
            onClick={() => navigate("/login")}
          >
            Already subscribed?
          </Button>
        </nav>

        <main className="max-w-5xl mx-auto">
          <div className="text-center mb-20 space-y-8">
            <h1 className="text-4xl sm:text-6xl font-bold text-[#1a1a1a] mb-6 leading-tight">
              Your AI Voice Assistant for{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-[#0037ff] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">Bubble.io</span>
                <span className="absolute -bottom-2 left-0 right-0 h-3 bg-[#0037ff]/10 transform -skew-x-12"></span>
              </span>
            </h1>
            
            <p className="text-xl text-[#4A4A4A] mb-8 max-w-2xl mx-auto leading-relaxed">
              Get instant, voice-powered answers to your Bubble.io questions. Learn faster,
              build better, and master no-code development with AI assistance.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white shadow-sm p-8 rounded-xl border border-gray-100 hover:border-[#0037ff] hover:shadow-lg transition-all duration-300 group hover:transform hover:-translate-y-1"
              >
                <div className="mb-4 bg-[#f5f5f5] p-3 rounded-lg inline-block">
                  <feature.icon className="h-8 w-8 text-[#0037ff] group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">{feature.title}</h3>
                <p className="text-[#4A4A4A] text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {!isMobile && (
            <div className="relative rounded-xl overflow-hidden hidden sm:block transform hover:scale-[1.02] transition-transform duration-300 mb-20">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0037ff]/10 to-transparent pointer-events-none"></div>
              <img
                src="/lovable-uploads/274d4461-71f9-4e12-abb3-812c2215fb65.png"
                alt="Bubble.io AI Voice Assistant Interface"
                className="w-full object-cover rounded-xl shadow-lg"
                style={{ height: '600px' }}
              />
            </div>
          )}

          {/* Pricing Section */}
          <div className="py-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-[#1a1a1a] mb-12">
              Choose Your Plan
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-[#0037ff] text-white px-4 py-1 text-sm">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-center">{plan.name}</CardTitle>
                    <div className="text-center mt-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      {plan.name !== "Annual" && <span className="text-gray-500">/month</span>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-[#0037ff]" />
                          <span className="text-[#4A4A4A]">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-[#0037ff] hover:bg-[#0028bd] transition-all duration-300"
                      onClick={() => navigate("/login")}
                    >
                      {plan.trial ? `Start ${plan.trial} Free Trial` : "Get Started"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
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

const pricingPlans = [
  {
    name: "Basic",
    price: 19,
    trial: "1-day",
    features: [
      "Voice-powered Q&A",
      "5 queries per day",
    ],
  },
  {
    name: "Pro",
    price: 29,
    trial: "3-day",
    popular: true,
    features: [
      "Unlimited queries",
      "Priority support",
    ],
  },
  {
    name: "Annual",
    price: 275,
    features: [
      "Everything in Pro",
      "Dedicated support",
    ],
  },
];

export default Landing;
