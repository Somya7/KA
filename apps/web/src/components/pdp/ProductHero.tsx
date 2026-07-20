"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProductVariant } from "@/lib/product";
import { formatPrice } from "@/lib/product";

interface ProductHeroProps {
  title: string;
  subtitle: string;
  description: string;
  vendor: string;
  images: { src: string; alt: string }[];
  variants: ProductVariant[];
  recommendedVariantId?: string;
  onAddToCart?: (variant: ProductVariant) => Promise<void> | void;
}

export function ProductHero({
  title,
  subtitle,
  description,
  vendor,
  images,
  variants,
  recommendedVariantId,
  onAddToCart,
}: ProductHeroProps) {
  const resolveVariant = useCallback(
    (id?: string) =>
      variants.find((v) => v.id === id && v.available) ??
      variants.find((v) => v.available) ??
      variants[0],
    [variants]
  );

  const [activeImage, setActiveImage] = useState(0);
  const [selected, setSelected] = useState(() => resolveVariant(recommendedVariantId));
  const [qty, setQty] = useState(1);
  const [cartState, setCartState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [selectFlash, setSelectFlash] = useState(false);

  useEffect(() => {
    const next = resolveVariant(recommendedVariantId);
    setSelected(next);
    setCartState("idle");
    setSelectFlash(true);
    const id = window.setTimeout(() => setSelectFlash(false), 500);
    return () => window.clearTimeout(id);
  }, [recommendedVariantId, resolveVariant]);

  const selectVariant = useCallback((variant: ProductVariant) => {
    if (!variant.available) return;
    setSelected(variant);
    setCartState("idle");
  }, []);

  const handleAdd = async () => {
    if (!selected?.available || cartState === "loading") return;
    setCartState("loading");
    try {
      await onAddToCart?.(selected);
      await new Promise((r) => setTimeout(r, 650));
      setCartState("success");
    } catch {
      setCartState("error");
    }
  };

  return (
    <section className="hero" aria-labelledby="product-title">
      <div className="hero__media">
        <div
          className={`hero__frame ${cartState === "success" ? "hero__frame--pulse" : ""}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={images[activeImage]?.src}
            src={images[activeImage]?.src}
            alt={images[activeImage]?.alt}
            className="hero__image"
          />
        </div>
        <div className="hero__thumbs" role="tablist" aria-label="Product images">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              role="tab"
              aria-selected={i === activeImage}
              className={`hero__thumb ${i === activeImage ? "is-active" : ""}`}
              onClick={() => setActiveImage(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt="" />
            </button>
          ))}
        </div>
      </div>

      <div className="hero__copy">
        <p className="hero__vendor">{vendor}</p>
        <h1 id="product-title" className="hero__title">
          {title}
        </h1>
        <p className="hero__subtitle">{subtitle}</p>
        <p className="hero__price">
          {formatPrice(selected.priceCents)}
          {selected.compareAtCents ? (
            <span className="hero__compare">{formatPrice(selected.compareAtCents)}</span>
          ) : null}
        </p>
        <p className="hero__desc">{description}</p>

        <fieldset className="variant-field">
          <legend className="variant-field__legend">Pack size</legend>
          <div className="variant-row">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={!v.available}
                aria-pressed={selected.id === v.id}
                className={`variant-chip ${selected.id === v.id ? "is-selected" : ""} ${
                  !v.available ? "is-unavailable" : ""
                } ${selected.id === v.id && selectFlash ? "is-flash" : ""}`}
                onClick={() => selectVariant(v)}
              >
                <span>{v.title}</span>
                <span className="variant-chip__price">{formatPrice(v.priceCents)}</span>
                {!v.available ? <span className="variant-chip__badge">Unavailable</span> : null}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="hero__actions">
          <label className="qty">
            <span className="sr-only">Quantity</span>
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              aria-label="Quantity"
            />
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQty((q) => q + 1)}
            >
              +
            </button>
          </label>

          <button
            type="button"
            className={`atc ${cartState === "loading" ? "is-loading" : ""} ${
              cartState === "success" ? "is-success" : ""
            }`}
            disabled={!selected.available || cartState === "loading"}
            onClick={handleAdd}
          >
            <span className="atc__label">
              {cartState === "loading"
                ? "Adding…"
                : cartState === "success"
                  ? "Added to cart"
                  : cartState === "error"
                    ? "Try again"
                    : "Add to cart"}
            </span>
            {cartState === "loading" ? <span className="atc__spinner" aria-hidden /> : null}
          </button>
        </div>

        {cartState === "error" ? (
          <p className="hero__error" role="alert">
            Something went wrong adding to cart. Please try again.
          </p>
        ) : null}
      </div>
    </section>
  );
}
