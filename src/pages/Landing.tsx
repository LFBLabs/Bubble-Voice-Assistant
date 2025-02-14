
import React, { useRef } from "react";
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
  const pricingSectionRef = useRef<HTMLDivElement>(null);

  const scrollToPricing = () => {
    pricingSectionRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto rounded-3xl bg-gray-50 px-0 py-0">
        <nav className="flex justify-center items-center mb-8 mx-0 px-0 py-[10px]">
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300" 
            onClick={scrollToPricing}
          >
            View Pricing
          </Button>
        </nav>

        <main className="w-full max-w-7xl mx-auto">
          <HeroSection />
          <FeatureGrid />

          {!isMobile && <PreviewImage />}

          {/* Bottom Pricing Section */}
          <div ref={pricingSectionRef} className="mb-20">
            <PricingSection />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Landing;
