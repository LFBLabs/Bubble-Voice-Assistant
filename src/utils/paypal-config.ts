
import { PlanType } from "./plan-config";

export const PLAN_IDS = {
  starter: "P-4G6798465L501993KM6YP6PQ",
  pro: "P-4KK601900U107132MM6YP7XY", // Updated pro plan ID
  annual: "P-7TP45305AJ1806514M6OZSSI",
} as const;

export const PAYPAL_OPTIONS = {
  currency: "USD",
  intent: "subscription",
  vault: true,
  components: "buttons",
  "enable-funding": "card",
  "disable-funding": "paylater,venmo",
  environment: "production"
} as const;

export const getPlanAmount = (planType: PlanType): number => {
  switch (planType) {
    case "starter":
      return 10.00;
    case "pro":
      return 20.00;
    case "annual":
      return 195.00;
  }
};

export const calculateValidUntil = (planType: PlanType): Date => {
  const validUntil = new Date();
  switch (planType) {
    case "starter":
    case "pro":
      validUntil.setMonth(validUntil.getMonth() + 1);
      break;
    case "annual":
      validUntil.setFullYear(validUntil.getFullYear() + 1);
      break;
  }
  return validUntil;
};
