"use client";

import { useState } from "react";
import { ProgressView, QuestionStep } from "@/components/app/analysis-flow";
import type { PartialReport } from "@/components/report/parts";
import { ErrorState } from "@/components/shared/states";
import { PREVIEW_QUESTIONS } from "@/lib/preview-fixtures";
import { SAMPLE_REPORT } from "@/lib/sample-report";

export function PreviewQuestions({ start = 0, filled = false }: { start?: number; filled?: boolean }) {
  const [idx, setIdx] = useState(start);
  const [answers, setAnswers] = useState(filled ? ["30 clients payants", "", ""] : ["", "", ""]);
  return (
    <QuestionStep
      questions={PREVIEW_QUESTIONS}
      answers={answers}
      idx={idx}
      onAnswer={(v) => setAnswers((a) => a.map((x, i) => (i === idx ? v : x)))}
      onNext={() => setIdx((i) => Math.min(i + 1, PREVIEW_QUESTIONS.length - 1))}
      onSkip={() => setIdx((i) => Math.min(i + 1, PREVIEW_QUESTIONS.length - 1))}
      onBack={() => setIdx((i) => Math.max(0, i - 1))}
    />
  );
}

export function PreviewProgress({ stage }: { stage: "early" | "mid" | "late" }) {
  const r = SAMPLE_REPORT;
  const partial: PartialReport =
    stage === "early"
      ? {}
      : stage === "mid"
        ? { summary: r.summary, models_used: r.models_used, options: r.options }
        : {
            summary: r.summary,
            models_used: r.models_used,
            options: r.options,
            errc: r.errc,
            devils_advocate: r.devils_advocate,
            recommendation: r.recommendation,
            action_plan: r.action_plan,
            risks: r.risks,
          };
  return <ProgressView partial={partial} />;
}

export function PreviewError({ title, description }: { title: string; description: string }) {
  return <ErrorState title={title} description={description} onRetry={() => {}} />;
}
