import { NextRequest, NextResponse } from "next/server";
import { polishGuidanceWithAi } from "@/lib/guidance/ai";
import { buildGuidance } from "@/lib/guidance/engine";
import { guidanceRequestSchema } from "@/lib/guidance/schema";
import type { GuidanceResponse } from "@/lib/guidance/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body", code: "INVALID_JSON" },
      { status: 400 }
    );
  }

  const parsed = guidanceRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      },
      { status: 400 }
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

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to generate guidance right now",
        code: "GUIDANCE_FAILED",
      },
      { status: 500 }
    );
  }
}
