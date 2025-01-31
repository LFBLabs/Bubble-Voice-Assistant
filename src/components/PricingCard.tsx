import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

interface PricingFeature {
  text: string;
}

interface PricingCardProps {
  title: string;
  price: string;
  priceDetail?: string;
  features: PricingFeature[];
  isPopular?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const PricingCard = ({
  title,
  price,
  priceDetail,
  features,
  isPopular = false,
  isSelected = false,
  onSelect,
}: PricingCardProps) => {
  return (
    <Card className={`relative w-full max-w-sm ${isPopular ? 'border-primary border-2' : 'border'}`}>
      {isPopular && (
        <div className="absolute -top-3 left-0 right-0 mx-auto w-fit">
          <span className="bg-primary text-primary-foreground text-sm font-medium px-6 py-1 rounded-full">
            Popular
          </span>
        </div>
      )}
      <CardHeader className="text-center pt-8">
        <CardTitle className="text-xl font-semibold mb-4">{title}</CardTitle>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold">{price}</span>
          {priceDetail && (
            <span className="text-gray-600 dark:text-gray-400">{priceDetail}</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <Check className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-300">{feature.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};