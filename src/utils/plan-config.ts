export type PlanType = "starter" | "pro" | "monthly" | "annual";

export interface Plan {
  type: PlanType;
  name: string;
  price: string;
  description: string;
  features: string[];
}

export const plans: Plan[] = [
  {
    type: "starter",
    name: "Starter Plan",
    price: "15.00",
    description: "Billed monthly",
    features: [
      "3 day free trial",
      "10 voice interactions per day",
      "Limited support",
      "Limited updates",
    ],
  },
  {
    type: "pro",
    name: "Pro Plan",
    price: "24.00",
    description: "Billed monthly",
    features: [
      "5 days trial included",
      "Unlimited voice interactions",
      "Priority support",
      "Unlimited updates",
    ],
  },
  {
    type: "monthly",
    name: "Monthly Plan",
    price: "24.00",
    description: "Billed monthly",
    features: [
      "Unlimited voice interactions",
      "Priority support",
      "Unlimited updates",
    ],
  },
  {
    type: "annual",
    name: "Annual Plan",
    price: "245.00",
    description: "Billed annually (Save 15%)",
    features: [
      "Everything in pro",
      "Two months free",
      "Annual exclusive features",
    ],
  },
];