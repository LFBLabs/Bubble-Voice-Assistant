
export type PlanType = "starter" | "pro" | "annual";

export interface Plan {
  type: PlanType;
  name: string;
  price: string;
  description: string;
  features: { text: string }[];
}

export const plans: Plan[] = [
  {
    type: "starter",
    name: "Starter Plan",
    price: "$10.00",
    description: "Billed monthly",
    features: [
      { text: "3 day free trial" },
      { text: "10 voice interactions per day" },
      { text: "Limited support" },
      { text: "Limited updates" },
    ],
  },
  {
    type: "pro",
    name: "Pro Plan",
    price: "$20.00",
    description: "Billed monthly",
    features: [
      { text: "5 day free trial" },
      { text: "Unlimited voice interactions" },
      { text: "Priority support" },
      { text: "Unlimited updates" },
    ],
  },
  {
    type: "annual",
    name: "Annual Plan",
    price: "$195.00",
    description: "Billed annually",
    features: [
      { text: "Everything in pro" },
    ],
  },
];
