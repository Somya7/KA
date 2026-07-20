"use client";

import { useCallback, useMemo, useState } from "react";
import type { GuidanceAnswers, GuidanceResponse } from "@/lib/guidance/types";

interface MerchantQuizCopy {
  headline: string;
  ctaLabel: string;
  disclaimerCopy: string;
}

interface IsThisRightForMeProps {
  productHandle: string;
  merchant: MerchantQuizCopy;
  onPackSuggestion?: (packSize: "60" | "120") => void;
}

type StepId = keyof GuidanceAnswers;

const STEPS: {
  id: StepId;
  prompt: string;
  options: { value: string; label: string; hint?: string }[];
}[] = [
  {
    id: "goal",
    prompt: "What are you hoping to support?",
    options: [
      { value: "calm_focus", label: "Calm focus", hint: "Steady mind through the day" },
      { value: "steady_energy", label: "Steady energy", hint: "Without a stimulant edge" },
      { value: "daily_resilience", label: "Daily resilience", hint: "Everyday stress response" },
      { value: "sleep_wind_down", label: "Evening wind-down", hint: "A gentler close to the day" },
    ],
  },
  {
    id: "experience",
    prompt: "How familiar are you with Ashwagandha?",
    options: [
      { value: "new", label: "New to it" },
      { value: "occasional", label: "Tried it before" },
      { value: "consistent", label: "Use it regularly" },
    ],
  },
  {
    id: "routine",
    prompt: "When would this fit your day?",
    options: [
      { value: "morning", label: "Morning" },
      { value: "evening", label: "Evening" },
      { value: "both", label: "Morning & evening" },
    ],
  },
  {
    id: "constraint",
    prompt: "Anything we should factor in?",
    options: [
      { value: "none", label: "Nothing specific" },
      { value: "medication", label: "I take medication" },
      { value: "pregnancy_nursing", label: "Pregnant or nursing" },
      { value: "thyroid_autoimmune", label: "Thyroid / autoimmune context" },
    ],
  },
];

type Status = "idle" | "answering" | "loading" | "ready" | "empty" | "error";

export function IsThisRightForMe({
  productHandle,
  merchant,
  onPackSuggestion,
}: IsThisRightForMeProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<GuidanceAnswers>>({});
  const [result, setResult] = useState<GuidanceResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const progress = useMemo(() => {
    if (status === "ready" || status === "loading") return 100;
    if (status === "idle") return 0;
    return Math.round((stepIndex / STEPS.length) * 100);
  }, [status, stepIndex]);

  const start = () => {
    setStatus("answering");
    setStepIndex(0);
    setAnswers({});
    setResult(null);
    setErrorMessage(null);
  };

  const fetchGuidance = useCallback(
    async (finalAnswers: GuidanceAnswers) => {
      setStatus("loading");
      setErrorMessage(null);
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 10000);

      try {
        const res = await fetch("/api/guidance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productHandle, answers: finalAnswers }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!res.ok) {
          const payload = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error || "Request failed");
        }

        const data = (await res.json()) as GuidanceResponse;
        if (!data?.headline) {
          setStatus("empty");
          return;
        }

        setResult(data);
        setStatus("ready");
        onPackSuggestion?.(data.suggestedPack.size);
      } catch (err) {
        clearTimeout(timeout);
        setErrorMessage(
          err instanceof Error && err.name === "AbortError"
            ? "That took too long. Please try again."
            : "We couldn’t personalize right now. Try again in a moment."
        );
        setStatus("error");
      }
    },
    [productHandle, onPackSuggestion]
  );

  const choose = (value: string) => {
    const step = STEPS[stepIndex];
    const nextAnswers = { ...answers, [step.id]: value } as Partial<GuidanceAnswers>;
    setAnswers(nextAnswers);

    if (stepIndex < STEPS.length - 1) {
      window.setTimeout(() => setStepIndex((i) => i + 1), 180);
      return;
    }

    void fetchGuidance(nextAnswers as GuidanceAnswers);
  };

  const bandLabel =
    result?.fitBand === "strong"
      ? "Strong fit"
      : result?.fitBand === "possible"
        ? "Possible fit"
        : "Consider with care";

  return (
    <section className="quiz" aria-labelledby="quiz-heading">
      <div className="quiz__header">
        <p className="quiz__eyebrow">Decision support</p>
        <h2 id="quiz-heading" className="quiz__title">
          {merchant.headline}
        </h2>
        <p className="quiz__lede">
          Four short questions. We’ll suggest a fit, a simple routine, and a pack size—without medical claims.
        </p>
        <div className="quiz__progress" aria-hidden>
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>

      {status === "idle" ? (
        <div className="quiz__idle">
          <button type="button" className="quiz__start" onClick={start}>
            {merchant.ctaLabel}
          </button>
          <p className="quiz__disclaimer">{merchant.disclaimerCopy}</p>
        </div>
      ) : null}

      {status === "answering" ? (
        <div className="quiz__step" key={STEPS[stepIndex].id}>
          <p className="quiz__step-count">
            Question {stepIndex + 1} of {STEPS.length}
          </p>
          <h3 className="quiz__prompt">{STEPS[stepIndex].prompt}</h3>
          <div className="quiz__options">
            {STEPS[stepIndex].options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className="quiz__option"
                onClick={() => choose(opt.value)}
              >
                <span className="quiz__option-label">{opt.label}</span>
                {opt.hint ? <span className="quiz__option-hint">{opt.hint}</span> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {status === "loading" ? (
        <div className="quiz__loading" aria-busy="true" aria-live="polite">
          <div className="shimmer" />
          <div className="shimmer shimmer--short" />
          <div className="shimmer" />
          <p className="quiz__loading-text">Personalizing your guidance…</p>
        </div>
      ) : null}

      {status === "ready" && result ? (
        <div className={`quiz__result quiz__result--${result.fitBand}`} key={result.headline}>
          <div className="quiz__band">{bandLabel}</div>
          <h3 className="quiz__result-title">{result.headline}</h3>
          <p className="quiz__result-body">{result.body}</p>

          <ol className="quiz__routine">
            {result.routineSteps.map((step) => (
              <li key={step.title}>
                <strong>{step.title}</strong>
                <span>{step.detail}</span>
              </li>
            ))}
          </ol>

          <div className="quiz__pack">
            <p className="quiz__pack-label">Suggested pack</p>
            <p className="quiz__pack-value">{result.suggestedPack.label}</p>
            <p className="quiz__pack-why">{result.suggestedPack.rationale}</p>
          </div>

          <p className="quiz__disclaimer">{result.disclaimer}</p>
          <p className="quiz__source">Source: {result.source === "rules+ai" ? "rules + AI polish" : "deterministic rules"}</p>

          <button type="button" className="quiz__restart" onClick={start}>
            Retake quiz
          </button>
        </div>
      ) : null}

      {status === "empty" ? (
        <div className="quiz__error" role="status">
          <p>No guidance returned. Please try again.</p>
          <button type="button" className="quiz__restart" onClick={start}>
            Start over
          </button>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="quiz__error" role="alert">
          <p>{errorMessage}</p>
          <button
            type="button"
            className="quiz__restart"
            onClick={() => {
              if (
                answers.goal &&
                answers.experience &&
                answers.routine &&
                answers.constraint
              ) {
                void fetchGuidance(answers as GuidanceAnswers);
              } else {
                start();
              }
            }}
          >
            Retry
          </button>
        </div>
      ) : null}
    </section>
  );
}
