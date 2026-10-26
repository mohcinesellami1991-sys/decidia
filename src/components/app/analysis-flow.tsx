"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Download, Loader2 } from "lucide-react";
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

export interface FlowProps {
  decisionId: string;
  title: string;
  problem: string;
  persona: string;
  dateLabel: string;
  questions: { question: string; answer: string }[];
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

export function AnalysisFlow(props: FlowProps) {
  const t = useTranslations("analysis");
  const c = useTranslations("common");
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
    const q = props.questions[idx];
    const last = idx === props.questions.length - 1;
    const next = () => (last ? run() : setIdx(idx + 1));
    return (
      <div className="mx-auto grid max-w-2xl gap-8 px-4 py-14 sm:px-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-2">
            {t("questionOf", { n: idx + 1, total: props.questions.length })}
          </p>
          <div className="mt-3 flex gap-1.5" aria-hidden>
            {props.questions.map((_, i) => <span key={i} className={`h-1 flex-1 rounded-full ${i <= idx ? "bg-ocean" : "bg-surface-2"}`} />)}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.form
            key={idx}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            onSubmit={(e) => { e.preventDefault(); next(); }}
            className="grid gap-5"
          >
            <label htmlFor="answer" className="font-serif text-4xl leading-tight text-balance">{q.question}</label>
            <Input
              id="answer" autoFocus value={answers[idx] ?? ""} maxLength={1000}
              onChange={(e) => setAnswers((a) => a.map((v, i) => (i === idx ? e.target.value : v)))}
              placeholder={t("answerPlaceholder")} className="h-14 rounded-xl text-lg"
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" size="lg">{last ? t("start") : c("continue")} →</Button>
              <Button type="button" variant="ghost" onClick={() => { setAnswers((a) => a.map((v, i) => (i === idx ? "" : v))); next(); }}>{c("skip")}</Button>
              {idx > 0 && <Button type="button" variant="ghost" onClick={() => setIdx(idx - 1)}><ArrowLeft />{c("back")}</Button>}
            </div>
          </motion.form>
        </AnimatePresence>
      </div>
    );
  }

  if (stage === "running") {
    const cur = stepFor(partial);
    const lines = t.raw("progress") as string[];
    return (
      <div className="mx-auto grid max-w-xl gap-8 px-4 py-20 sm:px-6" role="status" aria-live="polite">
        <div>
          <h1 className="font-serif text-5xl leading-tight">{t("progressTitle")}</h1>
          <p className="mt-2 text-muted">{t("progressSub")}</p>
        </div>
        <ol className="grid gap-3">
          {lines.map((line, i) => {
            const state = i <= cur ? "done" : i === cur + 1 ? "active" : "todo";
            return (
              <li key={line} className={`flex items-center gap-3 text-[15px] transition-colors duration-200 ${state === "todo" ? "text-muted-2" : "text-foreground"}`}>
                <span className="grid size-6 place-items-center rounded-full border border-border bg-surface">
                  {state === "done" ? <Check className="size-3.5 text-success" /> : state === "active" ? <Loader2 className="size-3.5 animate-spin text-primary" /> : null}
                </span>
                {line}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

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

function ReportActions({ decisionId, viewer, status }: FlowProps) {
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
