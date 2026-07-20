import type {
  Constraint,
  FitBand,
  Goal,
  GuidanceAnswers,
  GuidanceResponse,
  PackSize,
  Routine,
  SuggestedPack,
} from "./types";

const DISCLAIMER =
  "This guidance is for general wellness education only. It is not medical advice, diagnosis, or treatment. Consult a qualified healthcare professional before starting any supplement, especially if you are pregnant, nursing, taking medication, or have a health condition.";

const GOAL_COPY: Record<
  Goal,
  { strongHeadline: string; strongBody: string; possibleBody: string }
> = {
  calm_focus: {
    strongHeadline: "A steady companion for everyday calm and focus",
    strongBody:
      "Ashwagandha is often chosen as an adaptogen to support a calmer mind and more grounded daily focus. Your answers suggest this product aligns well with that intention when used consistently.",
    possibleBody:
      "Your goal of calm focus can pair with Ashwagandha as part of a broader wellness routine. Start gently, notice how you feel over a few weeks, and adjust with professional guidance if needed.",
  },
  steady_energy: {
    strongHeadline: "Support for natural energy without a stimulant spike",
    strongBody:
      "Many people look to Ashwagandha to support natural energy and resilience through daily demands. Your preferences suggest a good fit for a steady, non-stimulant approach.",
    possibleBody:
      "Ashwagandha may support balanced energy as part of sleep, nutrition, and movement habits. Treat this as supportive wellness care—not a quick fix.",
  },
  daily_resilience: {
    strongHeadline: "Built for everyday stress-response support",
    strongBody:
      "Ashwagandha is traditionally valued as an adaptogen that supports the body’s response to everyday stress. Your answers point to a strong lifestyle match for consistent use.",
    possibleBody:
      "For daily resilience, consistency matters more than intensity. Ashwagandha can be one supportive piece alongside rest and routine.",
  },
  sleep_wind_down: {
    strongHeadline: "A wind-down ally for evening calm",
    strongBody:
      "If winding down is your priority, Ashwagandha may support a calmer evening rhythm for some people. Pair it with a simple wind-down ritual for best habit fit.",
    possibleBody:
      "Evening calm is personal. Ashwagandha may complement a wind-down routine; keep expectations gentle and avoid treating it as a sleep medicine.",
  },
};

function scoreFit(answers: GuidanceAnswers): { band: FitBand; score: number } {
  if (
    answers.constraint === "pregnancy_nursing" ||
    answers.constraint === "thyroid_autoimmune"
  ) {
    return { band: "reconsider", score: 0 };
  }

  let score = 55;

  const goalBoost: Record<Goal, number> = {
    calm_focus: 18,
    steady_energy: 16,
    daily_resilience: 20,
    sleep_wind_down: 14,
  };
  score += goalBoost[answers.goal];

  if (answers.experience === "new") score += 4;
  if (answers.experience === "occasional") score += 8;
  if (answers.experience === "consistent") score += 10;

  if (answers.constraint === "medication") score -= 12;

  if (answers.routine === "both") score += 6;
  if (answers.routine === "evening" && answers.goal === "sleep_wind_down") score += 8;
  if (answers.routine === "morning" && answers.goal === "steady_energy") score += 6;

  if (score >= 78) return { band: "strong", score };
  if (score >= 55) return { band: "possible", score };
  return { band: "reconsider", score };
}

function buildRoutine(answers: GuidanceAnswers): GuidanceResponse["routineSteps"] {
  const when =
    answers.routine === "morning"
      ? "morning"
      : answers.routine === "evening"
        ? "evening"
        : "morning and evening";

  const doseDetail =
    answers.experience === "new"
      ? "Begin with the labeled serving (typically one capsule AM and one PM, or as directed on the product). Stay consistent for 2–3 weeks before judging fit."
      : "Follow the product label: commonly one capsule in the morning and one in the evening, or as recommended by your healthcare professional.";

  const steps: GuidanceResponse["routineSteps"] = [
    {
      title: `Anchor it to your ${when}`,
      detail:
        answers.routine === "both"
          ? "Take with water at consistent times each day so the habit sticks."
          : `Take with water during your preferred ${when} window.`,
    },
    {
      title: "Follow the labeled serving",
      detail: doseDetail,
    },
    {
      title: "Pair with a simple cue",
      detail:
        answers.goal === "sleep_wind_down"
          ? "Link your capsule to an evening wind-down cue—dim lights, stretch, or a short quiet moment."
          : "Link your capsule to an existing habit like breakfast, brushing teeth, or starting work.",
    },
  ];

  if (answers.constraint === "medication") {
    steps.unshift({
      title: "Check with your clinician first",
      detail:
        "Because you take medication, confirm timing and suitability with a healthcare professional before starting.",
    });
  }

  return steps;
}

function suggestPack(answers: GuidanceAnswers, band: FitBand): SuggestedPack {
  let size: PackSize = "60";

  if (band === "strong" && (answers.experience === "consistent" || answers.routine === "both")) {
    size = "120";
  } else if (band === "strong" && answers.experience !== "new") {
    size = "120";
  } else if (band === "possible" && answers.experience === "consistent") {
    size = "120";
  }

  if (band === "reconsider") {
    size = "60";
  }

  return {
    size,
    label: size === "60" ? "60 capsules (starter pack)" : "120 capsules (value pack)",
    rationale:
      size === "60"
        ? "A smaller pack lets you evaluate personal fit with lower commitment."
        : "A larger pack supports the consistent daily rhythm your answers point toward.",
  };
}

function reconsiderCopy(constraint: Constraint): Pick<GuidanceResponse, "headline" | "body"> {
  if (constraint === "pregnancy_nursing") {
    return {
      headline: "Pause and speak with a professional first",
      body: "During pregnancy or nursing, supplement choices should be guided by a qualified clinician. We recommend consulting your healthcare provider before considering Ashwagandha.",
    };
  }
  if (constraint === "thyroid_autoimmune") {
    return {
      headline: "Personal medical context comes first",
      body: "Thyroid or autoimmune conditions can change how supplements fit your routine. Please consult your healthcare professional before using Ashwagandha.",
    };
  }
  return {
    headline: "A thoughtful pause is the right next step",
    body: "Based on your answers, Ashwagandha may not be the clearest first step without personalized advice. Consider speaking with a practitioner who knows your full health picture.",
  };
}

/**
 * Pure rule-based guidance engine. Deterministic and unit-testable.
 * Optional AI polish is applied outside this function.
 */
export function buildGuidance(
  productHandle: string,
  answers: GuidanceAnswers
): Omit<GuidanceResponse, "source"> {
  if (productHandle !== "ashwagandha-60-capsules" && productHandle !== "ashwagandha") {
    // Still return guidance for demo product handles; unknown products get softer framing
  }

  const { band } = scoreFit(answers);

  if (band === "reconsider") {
    const copy = reconsiderCopy(answers.constraint);
    return {
      fitBand: band,
      headline: copy.headline,
      body: copy.body,
      routineSteps: [
        {
          title: "Seek personalized advice",
          detail: "Share your goals and health context with a qualified professional before purchasing.",
        },
        {
          title: "Explore gentler first steps",
          detail: "Sleep, hydration, and daily movement often form a safer baseline while you get advice.",
        },
      ],
      suggestedPack: suggestPack(answers, band),
      disclaimer: DISCLAIMER,
    };
  }

  const goal = GOAL_COPY[answers.goal];
  const isStrong = band === "strong";

  return {
    fitBand: band,
    headline: isStrong ? goal.strongHeadline : "A possible fit—start gently and observe",
    body: isStrong ? goal.strongBody : goal.possibleBody,
    routineSteps: buildRoutine(answers),
    suggestedPack: suggestPack(answers, band),
    disclaimer: DISCLAIMER,
  };
}

/** Exported for tests — scoring surface without full response assembly. */
export function evaluateFitBand(answers: GuidanceAnswers): FitBand {
  return scoreFit(answers).band;
}

export function evaluateSuggestedPackSize(
  answers: GuidanceAnswers,
  band: FitBand
): PackSize {
  return suggestPack(answers, band).size;
}

export function routinePreferenceLabel(routine: Routine): string {
  if (routine === "both") return "morning and evening";
  return routine;
}
