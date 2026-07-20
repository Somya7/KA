import { NextRequest, NextResponse } from "next/server";
import { polishGuidanceWithAi } from "@/lib/guidance/ai";
import { buildGuidance } from "@/lib/guidance/engine";
import { guidanceRequestSchema } from "@/lib/guidance/schema";
import type { GuidanceResponse } from "@/lib/guidance/types";

export const runtime = "nodejs";

/**
 * Shopify storefronts call this API cross-origin.
 * Allow browser POSTs from any storefront origin (public guidance endpoint).
 */
function corsHeaders(request?: NextRequest): HeadersInit {
  const origin = request?.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin === "null" ? "*" : origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function jsonWithCors(
  body: unknown,
  init: { status?: number; headers?: HeadersInit },
  request?: NextRequest
) {
  return NextResponse.json(body, {
    status: init.status ?? 200,
    headers: {
      "Cache-Control": "no-store",
      ...corsHeaders(request),
      ...init.headers,
    },
  });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return jsonWithCors(
      { error: "Invalid JSON body", code: "INVALID_JSON" },
      { status: 400 },
      request
    );
  }

  const parsed = guidanceRequestSchema.safeParse(json);
  if (!parsed.success) {
    return jsonWithCors(
      {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      },
      { status: 400 },
      request
    );
  }

  const { productHandle, answers } = parsed.data;

  try {
    const base = buildGuidance(productHandle, answers);
    const { guidance, usedAi } = await polishGuidanceWithAi(base);

    const response: GuidanceResponse = {
      ...guidance,
      source: usedAi ? "rules+ai" : "rules",
    };

    return jsonWithCors(response, { status: 200 }, request);
  } catch {
    return jsonWithCors(
      {
        error: "Unable to generate guidance right now",
        code: "GUIDANCE_FAILED",
      },
      { status: 500 },
      request
    );
  }
}
