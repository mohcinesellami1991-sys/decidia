"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ActionPlan, ConfidenceGauge, DevilsAdvocate, ERRCGrid, MentalModels, OptionCard, RiskTable, strs,
  type PartialReport,
} from "./parts";

function Section({ title, sub, children, className }: { title: string; sub?: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <h2 className="font-serif text-4xl leading-tight">{title}</h2>
      {sub && <p className="mb-4 mt-1 text-sm text-muted-2">{sub}</p>}
      {!sub && <div className="h-4" />}
      {children}
    </motion.section>
  );
}

export function ReportView({
  title, problem, dateLabel, persona, report, decisionId, actions,
}: {
  title: string;
  problem?: string;
  dateLabel?: string;
  persona?: string;
  report: PartialReport;
  decisionId?: string;
  actions?: React.ReactNode;
}) {
  const t = useTranslations("report");
  const p = useTranslations("new.personas");
  const options = (report.options ?? []).filter((o) => o?.title);
  const bestIdx = options.reduce((b, o, i, a) => ((o.confidence ?? 0) > (a[b]?.confidence ?? 0) ? i : b), 0);
  const hasErrc = report.errc && (["eliminate", "reduce", "raise", "create"] as const).some((k) => strs(report.errc?.[k]).length);
  const conf = report.recommendation?.confidence;

  return (
    <article className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)] gap-12 px-4 py-10 sm:px-6">
      <header>
        <p className="flex flex-wrap items-center gap-2.5 font-mono text-xs uppercase tracking-widest text-muted-2">
          <span>{t("report")}{dateLabel ? ` · ${dateLabel}` : ""}</span>
          {persona && <><span aria-hidden>·</span><span>{t("profile")} {p(persona as "entrepreneur")}</span></>}
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.08] text-balance sm:text-6xl">{title}</h1>
        {problem && <blockquote className="mt-5 border-l-2 border-border pl-4 font-serif text-lg italic text-muted">« {problem} »</blockquote>}
      </header>

      {(report.summary || conf !== undefined) && (
        <motion.section
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
          aria-label={t("verdict")}
          className="grid grid-cols-[minmax(0,1fr)] items-center gap-7 rounded-3xl border border-border bg-surface p-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:p-7"
        >
          {conf !== undefined && <ConfidenceGauge value={conf} />}
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-2">{t("verdict")}</p>
            <h2 className="mt-1.5 font-serif text-3xl leading-tight text-balance">{report.summary}</h2>
            {report.diagnosis && <p className="mt-3 text-[15.5px] leading-relaxed text-muted">{report.diagnosis}</p>}
          </div>
        </motion.section>
      )}

      {(report.models_used ?? []).some((m) => m?.name) && (
        <Section title={t("models")} sub={t("modelsSub")}>
          <MentalModels models={report.models_used ?? []} />
        </Section>
      )}

      {options.length > 0 && (
        <Section title={t("options")} sub={t("optionsSub")}>
          <div className="grid gap-3">
            {options.map((o, i) => <OptionCard key={i} option={o} best={i === bestIdx && options.length > 1} />)}
          </div>
        </Section>
      )}

      {hasErrc && report.errc && (
        <Section title={t("errc")} sub={t("errcSub")}>
          <ERRCGrid errc={report.errc} />
        </Section>
      )}

      {report.devils_advocate?.strongest_objection && <DevilsAdvocate data={report.devils_advocate} />}

      {report.recommendation?.choice && (
        <motion.section
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
          className={cn("rounded-3xl border border-transparent p-6 sm:p-7", "[background:linear-gradient(var(--surface),var(--surface))_padding-box,linear-gradient(135deg,#2f6bff,#00c2ff)_border-box]")}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-muted-2">{t("reco")}</p>
          <h2 className="mt-2 font-serif text-4xl leading-tight">{report.recommendation.choice}</h2>
          {report.recommendation.why && <p className="mt-3 text-[15.5px] leading-relaxed text-muted">{report.recommendation.why}</p>}
        </motion.section>
      )}

      {(report.action_plan ?? []).some((s) => s?.step) && (
        <Section title={t("plan")} sub={t("planSub")}>
          <ActionPlan steps={report.action_plan ?? []} storageKey={decisionId} />
        </Section>
      )}

      {(report.risks ?? []).some((r) => r?.risk) && (
        <Section title={t("risks")} sub={t("riskSub")}>
          <RiskTable risks={report.risks ?? []} />
        </Section>
      )}

      {strs(report.followup_questions).length > 0 && (
        <Section title={t("followupQuestions")}>
          <ul className="list-disc space-y-1.5 pl-5 text-[15px] text-muted">{strs(report.followup_questions).map((q, i) => <li key={i}>{q}</li>)}</ul>
        </Section>
      )}

      {actions}
    </article>
  );
}
