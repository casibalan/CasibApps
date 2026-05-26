export type LandingFeature = {
  title: string;
  description: string;
};

export const features: LandingFeature[] = [
  {
    title: "AI Invoice Generator",
    description:
      "Turn merchant details, line items, and payment terms into clear USDC invoices in seconds.",
  },
  {
    title: "USDC Checkout",
    description:
      "Share a payment link that gives customers a focused checkout experience for USDC payments.",
  },
  {
    title: "Arc Settlement",
    description:
      "Route confirmed payments toward fast settlement on Arc with infrastructure designed for commerce.",
  },
  {
    title: "Merchant Dashboard",
    description:
      "Track invoice status, checkout activity, settlement progress, and business-ready payment records.",
  },
];

export const flowSteps = [
  "Create invoice",
  "Share payment link",
  "Accept USDC",
  "Settle on Arc",
] as const;
