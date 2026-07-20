"use client";

import { useCallback, useState } from "react";
import { ASHWAGANDHA_PRODUCT } from "@/lib/product";
import type { ProductVariant } from "@/lib/product";
import { ProductHero } from "@/components/pdp/ProductHero";
import { TrustBenefits } from "@/components/pdp/TrustBenefits";
import { IsThisRightForMe } from "@/components/pdp/IsThisRightForMe";
import { Toast } from "@/components/pdp/Toast";

export function PdpExperience() {
  const product = ASHWAGANDHA_PRODUCT;
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [recommendedId, setRecommendedId] = useState(
    product.merchantDefaults.recommendedVariantId
  );

  const onAddToCart = useCallback(async (variant: ProductVariant) => {
    // Demo cart: real Shopify Ajax Cart is wired in the theme extension.
    setToastMsg(`${variant.title} added (demo cart)`);
    setToastOpen(true);
  }, []);

  const onPackSuggestion = useCallback((packSize: "60" | "120") => {
    const match = product.variants.find((v) => v.packSize === packSize && v.available);
    if (match) {
      setRecommendedId(match.id);
      setToastMsg(`Pack suggestion updated: ${match.title}`);
      setToastOpen(true);
    }
  }, [product.variants]);

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <p className="brand">Kerala Ayurveda</p>
          <p className="site-header__note">PDP enhancement demo</p>
        </div>
      </header>

      <main className="page">
        <ProductHero
          title={product.title}
          subtitle={product.subtitle}
          description={product.description}
          vendor={product.vendor}
          images={product.images}
          variants={product.variants}
          recommendedVariantId={recommendedId}
          onAddToCart={onAddToCart}
        />

        <TrustBenefits
          benefits={product.merchantDefaults.benefitBullets}
          trustSignals={product.trustSignals}
          howToUse={product.howToUse}
        />

        <IsThisRightForMe
          productHandle={product.handle}
          merchant={{
            headline: product.merchantDefaults.quizHeadline,
            ctaLabel: product.merchantDefaults.quizCtaLabel,
            disclaimerCopy: product.merchantDefaults.disclaimerCopy,
          }}
          onPackSuggestion={onPackSuggestion}
        />

        <footer className="page-footer">
          <p>
            Content notes: {product.contentNotes.join(" ")}
          </p>
        </footer>
      </main>

      <Toast
        open={toastOpen}
        message={toastMsg}
        onClose={() => setToastOpen(false)}
        variant="success"
      />
    </>
  );
}
