"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { ErrorState } from "@/components/shared/states";
import { ActionPlan } from "@/components/report/parts";
import { cn } from "@/lib/utils";
import type { FollowupAdjustment } from "@/lib/ai/schemas";

const OUTCOMES = ["success", "partial", "failed"] as const;

export function FollowupForm({ decisionId, initial }: { decisionId: string; initial: FollowupAdjustment | null }) {
  const t = useTranslations("followup");
  const [outcome, setOutcome] = useState<(typeof OUTCOMES)[number] | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [result, setResult] = useState<FollowupAdjustment | null>(initial);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!outcome) return;
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch("/api/ai/followup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ decisionId, outcome, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.adjustment);
    } catch {
      setFailed(true);
    }
    setLoading(false);
  }

  if (result) {
    return (
      <div className="grid gap-8" aria-live="polite">
        <p className="text-sm text-muted-2">{initial ? t("alreadyDone") : t("thanks")}</p>
        <section><h2 className="font-serif text-3xl">{t("gap")}</h2><p className="mt-2 leading-relaxed text-muted">{result.gap_analysis}</p></section>
        <section className="rounded-2xl border border-border bg-surface p-6"><h2 className="font-serif text-3xl">{t("lesson")}</h2><p className="mt-2 leading-relaxed text-muted">{result.lesson}</p></section>
        <section><h2 className="mb-4 font-serif text-3xl">{t("adjusted")}</h2><ActionPlan steps={result.adjusted_plan} storageKey={`${decisionId}:adjusted`} /></section>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-7">
      <div role="radiogroup" aria-label={t("title")} className="grid gap-3 sm:grid-cols-3">
        {OUTCOMES.map((o) => (
          <label key={o} className={cn("cursor-pointer rounded-2xl border p-4 text-center text-[15px] transition-colors duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
            outcome === o ? "border-primary/60 bg-primary/15" : "border-border bg-surface hover:border-primary/30")}>
            <input type="radio" name="outcome" value={o} checked={outcome === o} onChange={() => setOutcome(o)} className="sr-only" />
            {t(`outcomes.${o}`)}
          </label>
        ))}
      </div>
      <div className="grid gap-2">
        <label htmlFor="notes" className="font-mono text-xs uppercase tracking-widest text-muted-2">{t("notes")}</label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} placeholder={t("notesPlaceholder")} />
      </div>
      {failed && <ErrorState description="L'ajustement a échoué. Tes réponses sont conservées." onRetry={() => setFailed(false)} />}
      <div><Button type="submit" size="lg" disabled={!outcome || loading}>{loading && <Loader2 className="animate-spin" />} {t("send")}</Button></div>
    </form>
  );
}
