# Kerala Ayurveda — Shopify PDP Enhancement

Hiring assignment demo for an **AI-First Full-Stack Product Engineer** role: a focused product detail page experience that moves a customer from confusion to confidence.

**Product:** Ashwagandha (60 veg capsules) — modeled on public Kerala Ayurveda storefront content  
**Decision support:** “Is this right for me?” quiz  
**Backend:** `POST /api/guidance` rule engine (+ optional AI polish)

---

## Expected deliverables map

| Artifact | Location / how to produce |
|---|---|
| Working demo | Next.js PDP at `apps/web` (`npm run dev`) — primary polished craft surface |
| Shopify-native implementation | Theme App Extension in `extensions/pdp-enhance` |
| GitHub repository | This repo |
| README | This file |
| AI usage note | [`AI_USAGE.md`](./AI_USAGE.md) |
| Loom (2–4 min) | Record after deploy: customer journey → merchant settings → API → AI workflow |

> **Shopify preview link:** Requires a Shopify Partner development store + `shopify app dev`. See [Shopify installation](#shopify-installation). Until linked to a store, reviewers can evaluate the full UX + API via the Next.js demo.

---

## Quick start (Next.js demo)

```bash
cd apps/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test          # GuidanceEngine unit tests
npm run build     # production build
```

Optional AI polish (server-only):

```bash
cp .env.example .env.local
# set OPENAI_API_KEY=...
```

Without a key, guidance remains fully functional via the deterministic rule engine (`source: "rules"`).

---

## Architecture

```
Customer (PDP)
  ├─ Hero / variants / ATC
  ├─ Trust benefits (merchant + product metafield)
  └─ “Is this right for me?” quiz
        └─ POST /api/guidance
              ├─ Zod validation
              ├─ GuidanceEngine (pure rules)
              └─ optional AI polish (fallback to rules)
```

| Layer | Path |
|---|---|
| PDP UI (React) | `apps/web/src/components/pdp/*` |
| Product content | `apps/web/src/lib/product.ts` |
| Guidance engine | `apps/web/src/lib/guidance/engine.ts` |
| Validation | `apps/web/src/lib/guidance/schema.ts` |
| API route | `apps/web/src/app/api/guidance/route.ts` |
| Tests | `apps/web/src/lib/guidance/engine.test.ts` |
| Shopify block | `extensions/pdp-enhance/blocks/pdp-enhance.liquid` |
| Shopify JS/CSS | `extensions/pdp-enhance/assets/*` |

---

## API details

### `POST /api/guidance`

**Request**

```json
{
  "productHandle": "ashwagandha-60-capsules",
  "answers": {
    "goal": "calm_focus",
    "experience": "new",
    "routine": "morning",
    "constraint": "none"
  }
}
```

| Field | Values |
|---|---|
| `goal` | `calm_focus` \| `steady_energy` \| `daily_resilience` \| `sleep_wind_down` |
| `experience` | `new` \| `occasional` \| `consistent` |
| `routine` | `morning` \| `evening` \| `both` |
| `constraint` | `none` \| `pregnancy_nursing` \| `medication` \| `thyroid_autoimmune` |

**Response**

```json
{
  "fitBand": "strong",
  "headline": "...",
  "body": "...",
  "routineSteps": [{ "title": "...", "detail": "..." }],
  "suggestedPack": { "size": "60", "label": "60 capsules (starter pack)", "rationale": "..." },
  "disclaimer": "...",
  "source": "rules"
}
```

**Statuses**

- `200` — guidance payload
- `400` — invalid JSON / validation error (`code: VALIDATION_ERROR`)
- `500` — unexpected failure (`code: GUIDANCE_FAILED`)

Business logic lives in `GuidanceEngine`, not in the route handler.

---

## Shopify installation

1. Create a [Shopify Partner](https://partners.shopify.com/) account and a development store.
2. Install [Shopify CLI](https://shopify.dev/docs/api/shopify-cli).
3. From the repo root, create/link an app (replace placeholder `client_id` in `shopify.app.toml`):

```bash
shopify app dev
```

4. In the Theme Editor of the development store:
   - Open a **product** template
   - **Add block / section** → **KA PDP Enhance**
   - Set **Guidance API URL** to your deployed Next.js URL, e.g. `https://your-app.vercel.app/api/guidance`
5. Create product metafield definition (product-specific benefits):
   - Namespace/key: `custom.pdp_benefits`
   - Type: **List of single line text** (or JSON array of strings)
   - Populate on the Ashwagandha product in Admin

### Merchant configuration (≥3 editable properties)

| Property | Where | Product-specific? |
|---|---|---|
| Quiz headline | Theme Editor → block setting `quiz_headline` | No |
| Quiz CTA label | Theme Editor → block setting `quiz_cta_label` | No |
| Disclaimer copy | Theme Editor → block setting `disclaimer_copy` | No |
| Guidance API URL | Theme Editor → block setting `guidance_api_url` | No |
| Benefit bullets | Product metafield `custom.pdp_benefits` | **Yes** |

Merchants edit section/block settings without code. Benefits change per product via Admin metafields. See [`docs/merchant-config.md`](./docs/merchant-config.md).

---

## What is real vs mocked

| Real | Mocked / illustrative |
|---|---|
| Guidance rule engine + Zod validation + tests | Prices / 120-pack / travel-tin variants on the Next.js demo |
| Optional OpenAI polish when `OPENAI_API_KEY` is set | Full Shopify checkout beyond Ajax `/cart/add.js` in the extension |
| Theme app extension Liquid schema + merchant settings | Live Kerala Ayurveda catalog sync / Admin OAuth app backend |
| Micro-interactions, loading/error/empty states | Product photography (SVG illustrations for demo) |
| Shopify Ajax add-to-cart in the extension JS | Next.js demo cart (toast only) |

---

## Performance & reliability decisions

- Rule engine is sync and cheap; AI polish is optional with a **4s abort** and silent fallback.
- Client quiz fetch uses a **10s timeout**, retry UI, and empty/error states.
- Images: Next.js uses lightweight SVGs; Shopify block uses `image_url` + `loading`/`sizes`/`widths`.
- Unavailable variants are disabled in both UIs.
- `prefers-reduced-motion` disables non-essential animation.
- No heavy animation libraries — CSS only (smaller dependency surface).

---

## Product content & claims

- Benefit language adapted from public brand messaging (e.g. [Kerala Ayurveda USA Ashwagandha](https://keralaayurveda.store/products/ashwagandha-60-capsules)).
- No disease-treatment claims, guaranteed outcomes, fake clinical evidence, or invented testimonials.
- UI and API always include a **not medical advice** disclaimer.
- Pregnancy/nursing and thyroid/autoimmune answers route to **reconsider** guidance.

---

## Time spent & tradeoffs

**Estimated build time for this submission:** ~1 focused implementation pass (prototype + extension + docs/tests).

**Tradeoffs**

- Prioritized one complete journey (quiz + guidance API + merchant settings) over multiple PDP widgets.
- Next.js is the primary craft surface; Liquid/JS mirrors behavior for Shopify-native proof.
- AI polish is optional so the assignment never depends on a paid API key.
- Did not build a full embedded Shopify admin app — Theme Editor + metafields cover configurability requirements with less surface area.

**Would build next**

- Persist quiz preferences to customer metafields / shopper account
- A/B test pack recommendation copy
- Native Shopify Functions for bundle pricing
- Structured metaobjects for multi-product quiz matrices

---

## Testing instructions

```bash
cd apps/web && npm test
```

Manual API check:

```bash
curl -s http://localhost:3000/api/guidance \
  -H 'content-type: application/json' \
  -d '{"productHandle":"ashwagandha-60-capsules","answers":{"goal":"daily_resilience","experience":"consistent","routine":"both","constraint":"none"}}' | jq
```

Manual UX: run the quiz through strong / possible / reconsider paths; try unavailable variant; add to cart; resize to mobile.

---

## Loom walkthrough outline (2–4 min)

1. Customer: hero → variant → ATC feedback  
2. Quiz: questions → loading → personalized result + pack nudge  
3. Merchant: Theme Editor settings + product metafield benefits  
4. Engineering: API contract, tests, real vs mocked, AI note highlights  

---

## License / attribution

Assignment submission for Kerala Ayurveda hiring process. Brand names and public product descriptions remain the property of their owners; demo content is for evaluation only.
