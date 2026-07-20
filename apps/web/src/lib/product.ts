/**
 * Demo product model for Kerala Ayurveda Ashwagandha capsules.
 * Content synthesized from public storefront information and labeled where illustrative.
 * Source reference: https://keralaayurveda.store/products/ashwagandha-60-capsules
 */

export interface ProductVariant {
  id: string;
  title: string;
  priceCents: number;
  compareAtCents?: number;
  available: boolean;
  packSize: "60" | "120";
  sku: string;
}

export interface ProductImage {
  src: string;
  alt: string;
}

export interface MerchantSettings {
  quizHeadline: string;
  quizCtaLabel: string;
  disclaimerCopy: string;
  /** Product-specific — maps to Shopify product metafield custom.pdp_benefits */
  benefitBullets: string[];
  recommendedVariantId?: string;
}

export interface DemoProduct {
  handle: string;
  title: string;
  subtitle: string;
  description: string;
  vendor: string;
  images: ProductImage[];
  variants: ProductVariant[];
  trustSignals: string[];
  howToUse: string;
  /** Assumptions / illustrative notes shown in UI footer */
  contentNotes: string[];
  merchantDefaults: MerchantSettings;
}

export const ASHWAGANDHA_PRODUCT: DemoProduct = {
  handle: "ashwagandha-60-capsules",
  title: "Ashwagandha",
  subtitle: "60 Veg Capsules",
  description:
    "A classic adaptogen traditionally used to support the body’s response to everyday stress, a calmer mood, and natural energy. Each serving provides 650 mg of pure Ashwagandha with withanolides for bioavailability. Harvested from gardens in Kerala, India.",
  vendor: "Kerala Ayurveda",
  images: [
    {
      src: "/product/ashwagandha-hero.svg",
      alt: "Kerala Ayurveda Ashwagandha bottle on a warm botanical background",
    },
    {
      src: "/product/ashwagandha-detail.svg",
      alt: "Ashwagandha root and capsule illustration",
    },
  ],
  variants: [
    {
      id: "var-60",
      title: "60 capsules",
      priceCents: 2499,
      available: true,
      packSize: "60",
      sku: "KA-ASH-60",
    },
    {
      id: "var-120",
      title: "120 capsules",
      priceCents: 4499,
      compareAtCents: 4998,
      available: true,
      packSize: "120",
      sku: "KA-ASH-120",
    },
    {
      id: "var-60-oos",
      title: "Travel tin (illustrative)",
      priceCents: 1499,
      available: false,
      packSize: "60",
      sku: "KA-ASH-TIN",
    },
  ],
  trustSignals: [
    "Crafted in India",
    "100% natural herbal formula",
    "FDA-compliant manufacturing standards (as stated by brand)",
  ],
  howToUse:
    "Take one capsule in the morning and one in the evening, or as recommended by your healthcare professional.",
  contentNotes: [
    "Prices and the 120-capsule / travel-tin variants are illustrative for this assignment demo.",
    "Benefit language is adapted from public brand messaging and kept within general wellness framing.",
  ],
  merchantDefaults: {
    quizHeadline: "Is this right for me?",
    quizCtaLabel: "Find my fit",
    disclaimerCopy:
      "Wellness guidance only—not medical advice, diagnosis, or treatment. Consult a healthcare professional before use.",
    benefitBullets: [
      "Supports a healthy stress response",
      "Helps calm the mind and mood",
      "Supports natural energy production",
      "Nourishes immune and nervous system function",
      "Supports mental stamina and cognitive balance",
    ],
    recommendedVariantId: "var-60",
  },
};

export function formatPrice(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
