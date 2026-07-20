import { describe, expect, it } from "vitest";
import {
  buildGuidance,
  evaluateFitBand,
  evaluateSuggestedPackSize,
} from "@/lib/guidance/engine";
import type { GuidanceAnswers } from "@/lib/guidance/types";

const base: GuidanceAnswers = {
  goal: "daily_resilience",
  experience: "occasional",
  routine: "both",
  constraint: "none",
};

describe("GuidanceEngine fit bands", () => {
  it("returns strong for aligned wellness goals without constraints", () => {
    const band = evaluateFitBand({
      ...base,
      goal: "daily_resilience",
      experience: "consistent",
      routine: "both",
      constraint: "none",
    });
    expect(band).toBe("strong");
  });

  it("returns reconsider for pregnancy or nursing", () => {
    expect(
      evaluateFitBand({ ...base, constraint: "pregnancy_nursing" })
    ).toBe("reconsider");
  });

  it("returns reconsider for thyroid or autoimmune context", () => {
    expect(
      evaluateFitBand({ ...base, constraint: "thyroid_autoimmune" })
    ).toBe("reconsider");
  });

  it("softens fit when medication constraint is present", () => {
    const withMeds = evaluateFitBand({
      ...base,
      goal: "sleep_wind_down",
      experience: "new",
      routine: "morning",
      constraint: "medication",
    });
    expect(["possible", "reconsider"]).toContain(withMeds);
    expect(withMeds).not.toBe("strong");
  });
});

describe("GuidanceEngine pack suggestion", () => {
  it("suggests 120 for strong consistent users", () => {
    const answers: GuidanceAnswers = {
      goal: "calm_focus",
      experience: "consistent",
      routine: "both",
      constraint: "none",
    };
    const band = evaluateFitBand(answers);
    expect(band).toBe("strong");
    expect(evaluateSuggestedPackSize(answers, band)).toBe("120");
  });

  it("suggests 60 starter pack when reconsidering", () => {
    const answers: GuidanceAnswers = {
      ...base,
      constraint: "pregnancy_nursing",
    };
    const band = evaluateFitBand(answers);
    expect(evaluateSuggestedPackSize(answers, band)).toBe("60");
  });
});

describe("buildGuidance response shape", () => {
  it("includes disclaimer and routine steps", () => {
    const result = buildGuidance("ashwagandha-60-capsules", base);
    expect(result.disclaimer.toLowerCase()).toContain("not medical advice");
    expect(result.routineSteps.length).toBeGreaterThanOrEqual(2);
    expect(result.suggestedPack.label).toBeTruthy();
    expect(["strong", "possible", "reconsider"]).toContain(result.fitBand);
  });

  it("prioritizes clinician check when medication is selected", () => {
    const result = buildGuidance("ashwagandha", {
      ...base,
      constraint: "medication",
      goal: "steady_energy",
      experience: "occasional",
    });
    if (result.fitBand !== "reconsider") {
      expect(result.routineSteps[0].title.toLowerCase()).toContain("clinician");
    }
  });
});
