# Loom walkthrough script (2–4 minutes)

Record this after `npm run dev` (and Shopify preview if available). Keep it calm and specific.

## 0:00–0:40 — Product thinking
- Show the Ashwagandha PDP hero.
- State the problem: shoppers are unsure if this adaptogen fits their routine.
- One decision-support feature: “Is this right for me?”

## 0:40–1:40 — Frontend craft
- Switch variants (including unavailable state).
- Add to cart → loading → success feedback.
- Run the quiz; highlight progress, option press feedback, loading shimmer, result reveal, pack suggestion updating the variant.

## 1:40–2:20 — Backend
- Briefly show `POST /api/guidance` request/response (Network tab or curl).
- Mention Zod validation, GuidanceEngine separation, unit tests, optional AI polish with fallback.
- Show a reconsider path (pregnancy/nursing).

## 2:20–3:10 — Shopify + merchant configurability
- Open Theme Editor settings: headline, CTA, disclaimer, API URL.
- Show product metafield `custom.pdp_benefits` as the product-specific control.
- Note Liquid/JS extension mirrors the React prototype.

## 3:10–3:45 — AI workflow + honesty
- Point to `AI_USAGE.md`: rejected medical claims, corrected reconsider logic, verification steps.
- Call out real vs mocked (demo cart vs Ajax cart; illustrative packs; optional AI).

## Close
- Repo + README location; what you’d build next (metafield prefs, Playwright, metaobjects).
