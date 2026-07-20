import type { GuidanceResponse } from "./types";

/**
 * Optional AI polish. When OPENAI_API_KEY is absent or the call fails,
 * the rule-based response is returned unchanged.
 * Secrets stay server-side only.
 */
export async function polishGuidanceWithAi(
  guidance: Omit<GuidanceResponse, "source">
): Promise<{ guidance: Omit<GuidanceResponse, "source">; usedAi: boolean }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { guidance, usedAi: false };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content:
              "You rewrite wellness product guidance copy to be warmer and clearer. Never invent medical claims, disease treatment, guaranteed outcomes, clinical evidence, or testimonials. Keep the same meaning. Return JSON with keys: headline, body.",
          },
          {
            role: "user",
            content: JSON.stringify({
              headline: guidance.headline,
              body: guidance.body,
              fitBand: guidance.fitBand,
            }),
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return { guidance, usedAi: false };
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return { guidance, usedAi: false };

    const parsed = JSON.parse(raw) as { headline?: string; body?: string };
    if (!parsed.headline || !parsed.body) {
      return { guidance, usedAi: false };
    }

    return {
      guidance: {
        ...guidance,
        headline: parsed.headline.slice(0, 160),
        body: parsed.body.slice(0, 600),
      },
      usedAi: true,
    };
  } catch {
    return { guidance, usedAi: false };
  }
}
