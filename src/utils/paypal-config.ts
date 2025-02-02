export const PLAN_IDS = {
  starter: "P-0ED97087CN9355402M6OZN4Y",
  pro: "P-5KF35011AK525611SM6OZQNY",
  annual: "P-7TP45305AJ1806514M6OZSSI",
} as const;

export const PAYPAL_OPTIONS = {
  currency: "USD",
  intent: "subscription",
  vault: true,
  components: "buttons",
  "enable-funding": "card",
  "disable-funding": "paylater,venmo",
  environment: "sandbox"
} as const;

export type PlanType = keyof typeof PLAN_IDS;

export const getPlanAmount = (planType: PlanType): number => {
  switch (planType) {
    case "starter":
      return 15.00;
    case "pro":
      return 24.00;
    case "annual":
      return 230.00;
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