export type Goal = "calm_focus" | "steady_energy" | "daily_resilience" | "sleep_wind_down";
export type Experience = "new" | "occasional" | "consistent";
export type Routine = "morning" | "evening" | "both";
export type Constraint = "none" | "pregnancy_nursing" | "medication" | "thyroid_autoimmune";

export type FitBand = "strong" | "possible" | "reconsider";

export type PackSize = "60" | "120";

export interface GuidanceAnswers {
  goal: Goal;
  experience: Experience;
  routine: Routine;
  constraint: Constraint;
}

export interface GuidanceRequest {
  productHandle: string;
  answers: GuidanceAnswers;
}

export interface RoutineStep {
  title: string;
  detail: string;
}

export interface SuggestedPack {
  size: PackSize;
  label: string;
  rationale: string;
}

export interface GuidanceResponse {
  fitBand: FitBand;
  headline: string;
  body: string;
  routineSteps: RoutineStep[];
  suggestedPack: SuggestedPack;
  disclaimer: string;
  source: "rules" | "rules+ai";
}
