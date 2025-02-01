import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic, Brain, Zap, Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { PricingCard } from "@/components/PricingCard";

const pricingPlans = [
  {
    title: "Starter",
    price: "$15",
    priceDetail: "/month",
    features: [
      { text: "10 voice interactions per day" },
      { text: "Limited support" },
      { text: "Limited updates" },
    ],
  },
  {
    title: "Pro",
    price: "$24",
    priceDetail: "/month",
    features: [
      { text: "5-day trial included" },
      { text: "Unlimited voice interactions" },
      { text: "Priority support" },
      { text: "Unlimited updates" },
    ],
    isPopular: true,
  },
  {
    title: "Annual",
    price: "$230",
    features: [
      { text: "Everything in pro" },
    ],
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const PricingSection = () => (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center text-[#1a1a1a] mb-8">Pricing</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {pricingPlans.map((plan, index) => (
          <PricingCard
            key={index}
            title={plan.title}
            price={plan.price}
            priceDetail={plan.priceDetail}
            features={plan.features}
            isPopular={plan.isPopular}
          />
        ))}
      </div>
      <div className="flex justify-center mt-8">
        <Button
          size="lg"
          className="text-lg gap-2 bg-[#0037ff] hover:bg-[#0028bd] transition-all duration-300 transform hover:scale-105"
          onClick={() => navigate("/login")}
        >
          Get Started Free
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );

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

          {/* First Pricing Section - After Hero */}
          <div className="mb-20">
            <PricingSection />
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
                <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#4A4A4A] text-sm leading-relaxed">
                  {feature.description}
                </p>
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
                style={{ height: "600px" }}
              />
            </div>
          )}

          {/* Bottom Pricing Section */}
          <div className="mb-20">
            <PricingSection />
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

export default Landing;