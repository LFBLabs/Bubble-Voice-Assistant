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
  return;
};
export default Landing;