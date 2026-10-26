"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { useRouter } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { track } from "@/components/shared/analytics";
import { PaywallCard, SignupWall } from "@/components/app/walls";

type Err = null | { kind: "invalid" | "rate" | "failed" | "scope" | "signup" | "paywall"; message?: string };

export function NewForm({ defaultPersona = "entrepreneur" }: { defaultPersona?: "entrepreneur" | "individual" | "manager" }) {
  const t = useTranslations("new");
  const c = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [problem, setProblem] = useState("");
  const [persona, setPersona] = useState(defaultPersona);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<Err>(null);
  const examples = t.raw("examples") as string[];
  const tooShort = problem.trim().length < 20;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (tooShort) return setErr({ kind: "invalid" });
    setLoading(true);
    setErr(null);
    track("analysis_started", { persona });
    try {
      const res = await fetch("/api/ai/questions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ problem, persona, locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 402) {
        track(data.error === "paywall" ? "paywall_shown" : "signup_wall_shown");
        setErr({ kind: data.error === "paywall" ? "paywall" : "signup" });
      } else if (res.status === 429) setErr({ kind: "rate" });
      else if (!res.ok) setErr({ kind: "failed" });
      else if (data.inScope === false) setErr({ kind: "scope", message: data.message });
      else {
        router.push(`/analysis/${data.decisionId}`);
        return;
      }
    } catch {
      setErr({ kind: "failed" });
    }
    setLoading(false);
  }

  if (err?.kind === "signup") return <SignupWall next="/new" />;
  if (err?.kind === "paywall") return <PaywallCard />;

  return (
    <form onSubmit={submit} className="grid gap-8" aria-busy={loading}>
      <div className="grid gap-2">
        <label htmlFor="problem" className="sr-only">{t("title")}</label>
        <Textarea
          id="problem" name="problem" value={problem} onChange={(e) => setProblem(e.target.value)}
          placeholder={t("placeholder")} maxLength={4000} rows={7} required disabled={loading}
          className="min-h-48 rounded-2xl p-5 text-lg leading-relaxed"
        />
        <div className="flex justify-between text-xs text-muted-2">
          <span role={err?.kind === "invalid" ? "alert" : undefined} className={cn(err?.kind === "invalid" && "text-amber")}>{tooShort && problem.length > 0 ? t("minChars") : " "}</span>
          <span className="tabular-nums">{problem.length} / 4000</span>
        </div>
      </div>

      <fieldset className="grid gap-3">
        <legend className="mb-1 font-mono text-xs uppercase tracking-widest text-muted-2">{t("examplesLabel")}</legend>
        <div className="flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button key={ex} type="button" onClick={() => setProblem(ex)} disabled={loading}
              className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-left text-[13px] text-muted transition-colors duration-150 hover:border-primary/40 hover:text-foreground">
              {ex}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-1 font-mono text-xs uppercase tracking-widest text-muted-2">{t("persona")}</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("persona")}>
          {(["entrepreneur", "individual", "manager"] as const).map((p) => (
            <label key={p} className={cn("cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
              persona === p ? "border-primary/50 bg-primary/15 text-foreground" : "border-border bg-surface text-muted hover:text-foreground")}>
              <input type="radio" name="persona" value={p} checked={persona === p} onChange={() => setPersona(p)} className="sr-only" />
              {t(`personas.${p}`)}
            </label>
          ))}
        </div>
      </fieldset>

      {err && err.kind !== "invalid" && (
        <p role="alert" className="rounded-xl border border-amber-line bg-amber-soft p-4 text-sm">
          {err.kind === "scope" ? (err.message || t("outOfScope")) : err.kind === "rate" ? t("limit") : `${c("error")} ${c("retry")}.`}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={loading || tooShort}>
          {loading && <Loader2 className="animate-spin" aria-hidden />} {t("cta")}
        </Button>
        <span className="text-[13px] text-muted-2">{t("freeLeft")}</span>
      </div>
    </form>
  );
}
