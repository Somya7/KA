# AI usage note

This submission used AI tools actively in the development workflow, with human ownership of product decisions, claims safety, and final code review.

## Tools used and where they saved time

| Tool | Where it helped |
|---|---|
| Cursor (Composer) | Scaffolding Next.js app structure, GuidanceEngine draft, Liquid/JS theme extension mirror, README skeleton |
| Web search / public product pages | Grounding Ashwagandha benefit language in public brand copy instead of inventing claims |
| Optional OpenAI API (`gpt-4o-mini`) | Runtime polish of headline/body only when `OPENAI_API_KEY` is present |

Meaningful time saved: converting the React quiz interaction model into a Shopify theme-extension JS equivalent, and generating the first pass of CSS motion tokens aligned to a botanical visual system.

## One AI-generated suggestion rejected (and why)

**Rejected:** Framing quiz results as “clinically proven stress reduction” and auto-generating fake star ratings / testimonials on the PDP.

**Why:** The brief explicitly forbids invented clinical evidence and testimonials. Wellness copy must stay educational and non-diagnostic. Shipping that would fail claims review and hurt trust.

## One implementation / content piece corrected materially

**Corrected:** Early draft treated pregnancy/nursing as a soft “possible fit” with dosage tips.

**Final behavior:** `pregnancy_nursing` and `thyroid_autoimmune` force `fitBand: "reconsider"` with clinician-first copy and no usage encouragement. Medication answers add an explicit “check with your clinician” routine step and reduce fit score.

## Example prompt / workflow

```text
Build a deterministic GuidanceEngine for an Ashwagandha PDP quiz.
Inputs: goal, experience, routine, constraint.
Output: fitBand (strong|possible|reconsider), headline, body, routineSteps, suggestedPack, disclaimer.
Constraints:
- No disease-treatment or guaranteed outcome claims
- Pregnancy/nursing and thyroid/autoimmune => reconsider
- Keep pure functions unit-testable; AI polish is optional and outside the engine
- Separate Zod schema + Next.js route validation
```

Workflow: generate → run vitest → manually walk three quiz paths → tighten copy → port interaction to Liquid/JS.

## How generated code / product content was verified

1. **Automated:** `npm test` covers fit bands, pack sizing, and clinician-first ordering.
2. **Manual API:** curl validation + intentional bad payloads (expect 400).
3. **Claims pass:** searched output for forbidden patterns (cure, treat disease, guaranteed, testimonial).
4. **UX pass:** loading, error, unavailable variant, ATC success, mobile layout, reduced-motion.
5. **Shopify concepts:** confirmed section schema exposes ≥3 merchant settings and product metafield benefits are documented.

## React/Next.js → Liquid conversion

- React `IsThisRightForMe` state machine was mirrored in `extensions/pdp-enhance/assets/pdp-enhance.js` (idle → answering → loading → ready/error).
- Visual system ported to `pdp-enhance.css` with the same tokens (leaf/clay/cream), without copying Seed.com.
- ATC in React is a demo toast; Liquid/JS uses real Shopify `/cart/add.js`.
- Shared contract documented in the README so both clients stay aligned.

## What I would improve or build next

- Wire customer account metafields to remember last quiz answers
- Add Playwright smoke tests for the quiz + API
- Deploy sample Vercel URL + Partner store preview for one-click reviewer access
- Metaobject-driven quiz matrices for additional SKUs beyond Ashwagandha
