import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface PricingFeature {
  text: string;
}

interface PricingCardProps {
  title: string;
  price: string;
  description?: string;
  features: PricingFeature[];
  isPopular?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const PricingCard = ({
  title,
  price,
  description,
  features,
  isPopular = false,
  isSelected = false,
  onSelect,
}: PricingCardProps) => {
  return (
    <Card className={`relative w-full max-w-sm ${isPopular ? 'border-primary shadow-lg' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-0 right-0 mx-auto w-fit">
          <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
            Popular
          </span>
        </div>
      )}
      <CardHeader className="text-center">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-xl">{title}</CardTitle>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="h-5 w-5"
          />
        </div>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
        <div className="mt-4">
          <span className="text-4xl font-bold">{price}</span>
          {title !== "Annual" && <span className="text-muted-foreground">/month</span>}
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm">{feature.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};