import { z } from "zod";

export const guidanceAnswersSchema = z.object({
  goal: z.enum(["calm_focus", "steady_energy", "daily_resilience", "sleep_wind_down"]),
  experience: z.enum(["new", "occasional", "consistent"]),
  routine: z.enum(["morning", "evening", "both"]),
  constraint: z.enum(["none", "pregnancy_nursing", "medication", "thyroid_autoimmune"]),
});

export const guidanceRequestSchema = z.object({
  productHandle: z
    .string()
    .min(1, "productHandle is required")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "productHandle must be a Shopify-style handle"),
  answers: guidanceAnswersSchema,
});

export type GuidanceRequestInput = z.infer<typeof guidanceRequestSchema>;
