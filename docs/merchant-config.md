# Merchant configuration guide

This feature is designed so a store owner, ecommerce manager, or content marketer can update key PDP experience content without developer changes.

## Theme Editor settings (app block: KA PDP Enhance)

1. Open **Online Store → Themes → Customize**.
2. Navigate to a **product** template.
3. Add **KA PDP Enhance** (app block / section from the theme app extension).
4. Edit:

| Setting | Purpose | Example |
|---|---|---|
| Quiz headline | Decision-support title | `Is this right for me?` |
| Quiz CTA label | Start button | `Find my fit` |
| Disclaimer copy | Non-medical framing under the CTA | `Wellness guidance only—not medical advice…` |
| Guidance API URL | Backend endpoint for personalized results | `https://your-app.vercel.app/api/guidance` |
| Product | Optional product picker when not on a product template | Ashwagandha product |

Changes preview live in the Theme Editor and publish with the theme.

## Product-specific benefits metafield

**Definition (Shopify Admin → Settings → Custom data → Products):**

- Name: PDP Benefits
- Namespace and key: `custom.pdp_benefits`
- Type: List of single-line text (recommended) or JSON

**Usage:**

1. Open the product in Admin.
2. Edit the **PDP Benefits** metafield.
3. Add 3–5 short benefit lines (general wellness language only).
4. Save. The storefront block reads this metafield and falls back to defaults if empty.

This satisfies the requirement that **at least one editable property is product-specific**.

## Content guidelines for merchants

- Prefer supportive wellness language (“supports”, “helps maintain”) over medical claims.
- Do not promise disease treatment, guaranteed results, or invent certifications/testimonials.
- Keep the disclaimer visible; do not delete the non-medical framing.
