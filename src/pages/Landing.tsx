import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import HeroSection from "@/components/landing/HeroSection";
import FeatureGrid from "@/components/landing/FeatureGrid";
import PricingSection from "@/components/landing/PricingSection";
import PreviewImage from "@/components/landing/PreviewImage";

const Landing = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
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

        <main className="w-full max-w-7xl mx-auto">
          <HeroSection />

          {/* First Pricing Section - After Hero */}
          <div className="mb-20">
            <PricingSection />
          </div>

          <FeatureGrid />

          {!isMobile && <PreviewImage />}

          {/* Bottom Pricing Section */}
          <div className="mb-20">
            <PricingSection />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Landing;