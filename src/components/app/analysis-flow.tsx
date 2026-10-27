"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CornerDownLeft, Download, Lightbulb, Loader2 } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState } from "@/components/shared/states";
import { ReportView } from "@/components/report/report-view";
import type { PartialReport } from "@/components/report/parts";
import type { Report } from "@/lib/ai/schemas";
import { PaywallCard, SignupWall } from "@/components/app/walls";
import { createClient } from "@/lib/supabase/browser";
import { track } from "@/components/shared/analytics";
import { cn } from "@/lib/utils";

export interface FlowProps {
  decisionId: string;
  title: string;
  problem: string;
  persona: string;
  dateLabel: string;
  questions: { question: string; answer: string; example?: string }[];
  report: Report | null;
  status: string;
  viewer: { signedIn: boolean; paid: boolean };
}

const KEY_STEP: [keyof Report, number][] = [
  ["recommendation", 4], ["devils_advocate", 3], ["errc", 2], ["options", 1], ["models_used", 0],
];
const stepFor = (p: PartialReport) => {
  for (const [k, i] of KEY_STEP) if (p[k as keyof PartialReport]) return i;
  return -1;
};

/* ---------- Une question à la fois ---------- */
export function QuestionStep({
  questions, answers, idx, onAnswer, onNext, onSkip, onBack,
}: {
  questions: { question: string; example?: string }[];
  answers: string[];
  idx: number;
  onAnswer: (value: string) => void;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const t = useTranslations("analysis");
  const c = useTranslations("common");
  const q = questions[idx];
  const last = idx === questions.length - 1;
  return (
    <div className="mx-auto grid max-w-2xl gap-9 px-4 py-14 sm:px-6 sm:py-20">
      <div>
        <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted-2">
          <span>{t("contextTitle")}</span>
          <span className="tabular-nums">{t("questionOf", { n: idx + 1, total: questions.length })}</span>
        </div>
        <div className="mt-3 flex gap-1.5" aria-hidden>
          {questions.map((_, i) => (
            <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-surface-2">
              <span className={cn("block h-full rounded-full bg-ocean transition-[width] duration-300", i <= idx ? "w-full" : "w-0")} />
            </span>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.form
          key={idx}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}
          onSubmit={(e) => { e.preventDefault(); onNext(); }}
          className="grid gap-6"
        >
          <label htmlFor="answer" className="font-serif text-4xl leading-[1.1] text-balance sm:text-5xl">{q.question}</label>
          <div className="grid gap-3">
            <Input
              id="answer" autoFocus value={answers[idx] ?? ""} maxLength={1000} autoComplete="off"
              onChange={(e) => onAnswer(e.target.value)}
              placeholder={t("answerPlaceholder")}
              className="h-14 rounded-2xl px-5 text-lg shadow-[var(--shadow-card)]"
            />
            {q.example && !answers[idx] && (
              <button
                type="button"
                onClick={() => onAnswer(q.example!.replace(/^(ex\.?|e\.g\.)\s*:?\s*/i, ""))}
                className="group flex w-fit max-w-full items-start gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-left text-[13.5px] text-muted transition-colors duration-150 hover:border-primary/40 hover:text-foreground"
              >
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden />
                <span><span className="font-medium text-foreground">{t("useExample")}</span> · {q.example}</span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" size="lg">{last ? t("start") : c("continue")} <ArrowRight /></Button>
            <Button type="button" variant="ghost" size="lg" onClick={onSkip}>{c("skip")}</Button>
            <span className="ml-auto hidden items-center gap-1.5 text-xs text-muted-2 sm:flex"><CornerDownLeft className="size-3.5" aria-hidden />{t("hint")}</span>
          </div>
        </motion.form>
      </AnimatePresence>

      {idx > 0 && (
        <button type="button" onClick={onBack} className="flex w-fit items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden />{t("back")}
        </button>
      )}
    </div>
  );
}

/* ---------- Écran de progression narratif ---------- */
function useElapsed(active: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setS((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function ProgressView({ partial }: { partial: PartialReport }) {
  const t = useTranslations("analysis");
  const elapsed = useElapsed(true);
  const cur = stepFor(partial);
  const lines = t.raw("progress") as string[];
  const models = (partial.models_used ?? []).map((m) => m?.name).filter(Boolean) as string[];
  const nOptions = (partial.options ?? []).filter((o) => o?.title).length;
  const nRisks = (partial.risks ?? []).filter((r) => r?.risk).length;
  const objection = Boolean(partial.devils_advocate?.strongest_objection);
  const hasLive = models.length > 0 || nOptions > 0 || objection || nRisks > 0;

  return (
    <div className="mx-auto grid max-w-xl gap-9 px-4 py-16 sm:py-24" role="status" aria-live="polite">
      <div className="flex items-center gap-5">
        <div className="relative grid size-16 shrink-0 place-items-center" aria-hidden>
          <span className="absolute inset-0 rounded-full bg-ocean opacity-20 motion-safe:animate-ping" />
          <span className="absolute inset-2 rounded-full bg-ocean opacity-30 motion-safe:animate-pulse" />
          <span className="relative size-7 rounded-full bg-ocean shadow-[0_0_30px_rgb(47_107_255/0.6)]" />
        </div>
        <div>
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{t("progressTitle")}</h1>
          <p className="mt-1 text-sm text-muted">{t("progressSub")}</p>
        </div>
      </div>

      <ol className="grid gap-1 rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-card)]">
        {lines.map((line, i) => {
          const state = i <= cur ? "done" : i === cur + 1 ? "active" : "todo";
          return (
            <li key={line} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-colors duration-300", state === "active" && "bg-surface-2", state === "todo" ? "text-muted-2" : "text-foreground")}>
              <span className={cn("grid size-6 shrink-0 place-items-center rounded-full border transition-colors duration-300", state === "done" ? "border-success/50 bg-success-soft" : "border-border bg-background")}>
                {state === "done" ? <Check className="size-3.5 text-success" aria-hidden /> : state === "active" ? <Loader2 className="size-3.5 animate-spin text-primary motion-reduce:animate-none" aria-hidden /> : null}
              </span>
              {line}
            </li>
          );
        })}
      </ol>

      <div className="flex items-end justify-between gap-4 text-xs text-muted-2">
        <span className="font-mono uppercase tracking-widest">{t("elapsed")}</span>
        <span className="font-mono text-base tabular-nums text-foreground">{elapsed}</span>
      </div>

      {hasLive && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="grid gap-3 rounded-2xl border border-dashed border-border p-4">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-2">{t("live")}</p>
          {models.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {models.map((m) => <li key={m} className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[13px] text-primary">{m}</li>)}
            </ul>
          )}
          <ul className="grid gap-1.5 text-sm text-muted">
            {nOptions > 0 && <li>{t("optionsFound", { n: nOptions })}</li>}
            {objection && <li className="text-amber">{t("objectionFound")}</li>}
            {nRisks > 0 && <li>{t("riskFound", { n: nRisks })}</li>}
          </ul>
        </motion.div>
      )}
    </div>
  );
}

/* ---------- Parcours complet ---------- */
export function AnalysisFlow(props: FlowProps) {
  const t = useTranslations("analysis");
  const [stage, setStage] = useState<"questions" | "running" | "report" | "error" | "signup" | "paywall">(props.report ? "report" : "questions");
  const [answers, setAnswers] = useState(props.questions.map((q) => q.answer));
  const [idx, setIdx] = useState(0);
  const [partial, setPartial] = useState<PartialReport>({});
  const [report, setReport] = useState<Report | null>(props.report);
  const started = useRef(false);

  const run = useCallback(async () => {
    setStage("running");
    setPartial({});
    track("questions_answered");
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          decisionId: props.decisionId,
          answers: props.questions.map((q, i) => ({ question: q.question, answer: answers[i] ?? "" })),
        }),
      });
      if (res.status === 402) {
        const d = await res.json().catch(() => ({}));
        return setStage(d.error === "paywall" ? "paywall" : "signup");
      }
      if (!res.ok || !res.body) return setStage("error");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const msg = JSON.parse(line);
          if (msg.type === "partial") setPartial(msg.data);
          else if (msg.type === "done") {
            setReport(msg.data);
            setStage("report");
            track("report_viewed");
            window.scrollTo({ top: 0 });
            return;
          } else if (msg.type === "error") return setStage("error");
        }
      }
      setStage((s) => (s === "running" ? "error" : s));
    } catch {
      setStage("error");
    }
  }, [answers, props.decisionId, props.questions]);

  // Aucune question (cas limite) : on lance directement l'analyse.
  useEffect(() => {
    if (!props.report && props.questions.length === 0 && !started.current) {
      started.current = true;
      void run();
    }
  }, [props.report, props.questions.length, run]);

  if (stage === "questions" && props.questions.length > 0) {
    const last = idx === props.questions.length - 1;
    const next = () => (last ? run() : setIdx(idx + 1));
    return (
      <QuestionStep
        questions={props.questions}
        answers={answers}
        idx={idx}
        onAnswer={(v) => setAnswers((a) => a.map((x, i) => (i === idx ? v : x)))}
        onNext={next}
        onSkip={() => { setAnswers((a) => a.map((x, i) => (i === idx ? "" : x))); next(); }}
        onBack={() => setIdx(Math.max(0, idx - 1))}
      />
    );
  }

  if (stage === "running") return <ProgressView partial={partial} />;
  if (stage === "error") {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <ErrorState description={t("failed")} onRetry={run} />
      </div>
    );
  }
  if (stage === "signup") return <div className="mx-auto max-w-2xl px-4 py-16"><SignupWall next={`/analysis/${props.decisionId}`} /></div>;
  if (stage === "paywall") return <div className="mx-auto max-w-2xl px-4 py-16"><PaywallCard /></div>;

  if (!report) return null;
  return (
    <ReportView
      title={props.title}
      problem={props.problem}
      dateLabel={props.dateLabel}
      persona={props.persona}
      report={report}
      decisionId={props.decisionId}
      actions={<ReportActions {...props} />}
    />
  );
}

export function ReportActions({ decisionId, viewer, status }: Pick<FlowProps, "decisionId" | "viewer" | "status">) {
  const r = useTranslations("report");
  const [marked, setMarked] = useState(status !== "analyzed" && status !== "draft");

  async function markDecided() {
    const supabase = createClient();
    const { error } = await supabase.from("decisions").update({ status: "decided", decided_at: new Date().toISOString() }).eq("id", decisionId);
    if (!error) setMarked(true);
  }

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap gap-3">
        {viewer.paid ? (
          <Button asChild><a href={`/api/pdf/${decisionId}`}><Download />{r("exportPdf")}</a></Button>
        ) : (
          <Button variant="secondary" onClick={() => track("pdf_locked_click")} asChild>
            <Link href={viewer.signedIn ? "/settings" : `/login?next=/analysis/${decisionId}`}><Download />{r("exportPdf")} · Pro</Link>
          </Button>
        )}
        {viewer.signedIn ? (
          <>
            <Button asChild variant="secondary"><Link href="/journal">{r("saveJournal")}</Link></Button>
            {!marked && <Button variant="ghost" onClick={markDecided}>{r("markDecided")}</Button>}
          </>
        ) : null}
      </div>
      {!viewer.signedIn && <SignupWall next={`/analysis/${decisionId}`} />}
      {viewer.signedIn && !viewer.paid && <PaywallCard />}
    </div>
  );
}
