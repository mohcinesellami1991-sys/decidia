"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ActionPlan, ConfidenceGauge, DevilsAdvocate, ERRCGrid, MentalModels, OptionCard, RiskTable, strs,
  type PartialReport,
} from "./parts";

function Section({ id, title, sub, children, className }: { id: string; title: string; sub?: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn("scroll-mt-32", className)}
    >
      <h2 className="font-serif text-4xl leading-tight">{title}</h2>
      {sub ? <p className="mb-4 mt-1 text-sm text-muted-2">{sub}</p> : <div className="h-4" />}
      {children}
    </motion.section>
  );
}

/** Section visible à l'écran : sert à surligner l'entrée du sommaire. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  const key = ids.join("|");
  useEffect(() => {
    const els = key.split("|").map((id) => document.getElementById(id)).filter((e): e is HTMLElement => Boolean(e));
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);
  return active;
}

export function ReportView({
  title, problem, dateLabel, persona, report, decisionId, actions, toc = true,
}: {
  title: string;
  problem?: string;
  dateLabel?: string;
  persona?: string;
  report: PartialReport;
  decisionId?: string;
  actions?: React.ReactNode;
  toc?: boolean;
}) {
  const t = useTranslations("report");
  const p = useTranslations("new.personas");
  const options = (report.options ?? []).filter((o) => o?.title);
  const bestIdx = options.reduce((b, o, i, a) => ((o.confidence ?? 0) > (a[b]?.confidence ?? 0) ? i : b), 0);
  const hasErrc = Boolean(report.errc && (["eliminate", "reduce", "raise", "create"] as const).some((k) => strs(report.errc?.[k]).length));
  const conf = report.recommendation?.confidence;
  const level = conf === undefined ? null : conf >= 70 ? "high" : conf >= 45 ? "mid" : "low";

  const sections = [
    { id: "verdict", label: t("toc.verdict"), show: Boolean(report.summary || conf !== undefined) },
    { id: "models", label: t("toc.models"), show: (report.models_used ?? []).some((m) => m?.name) },
    { id: "options", label: t("toc.options"), show: options.length > 0 },
    { id: "errc", label: t("toc.errc"), show: hasErrc },
    { id: "devil", label: t("toc.devil"), show: Boolean(report.devils_advocate?.strongest_objection) },
    { id: "reco", label: t("toc.reco"), show: Boolean(report.recommendation?.choice) },
    { id: "plan", label: t("toc.plan"), show: (report.action_plan ?? []).some((s) => s?.step) },
    { id: "risks", label: t("toc.risks"), show: (report.risks ?? []).some((r) => r?.risk) },
  ].filter((s) => s.show);
  const active = useActiveSection(sections.map((s) => s.id));

  return (
    <>
      {toc && sections.length > 3 && (
        <nav aria-label={t("toc.label")} className="sticky top-[57px] z-10 border-b border-border bg-background/85 backdrop-blur">
          <ul className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 [scrollbar-width:none]">
            {sections.map((s) => (
              <li key={s.id} className="shrink-0">
                <a
                  href={`#${s.id}`}
                  aria-current={active === s.id ? "true" : undefined}
                  className={cn("block rounded-full px-3 py-1.5 text-[13px] transition-colors duration-150", active === s.id ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground")}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <article className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)] gap-14 px-4 py-10 sm:px-6">
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
            id="verdict"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
            aria-label={t("verdict")}
            className="relative isolate grid scroll-mt-32 grid-cols-[minmax(0,1fr)] items-center gap-7 overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:grid-cols-[auto_minmax(0,1fr)] sm:p-8"
          >
            <div aria-hidden className="pointer-events-none absolute -left-16 -top-16 -z-10 size-72 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]" />
            {conf !== undefined && <ConfidenceGauge value={conf} />}
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2.5 font-mono text-xs uppercase tracking-widest text-muted-2">
                {t("verdict")}
                {level && (
                  <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] normal-case tracking-normal", level === "high" ? "border-success/40 bg-success-soft text-success" : level === "mid" ? "border-primary/30 bg-primary/10 text-primary" : "border-amber-line bg-amber-soft text-amber")}>
                    {t(`level.${level}`)}
                  </span>
                )}
              </p>
              <h2 className="mt-2 font-serif text-3xl leading-tight text-balance sm:text-4xl">{report.summary}</h2>
              {report.diagnosis && <p className="mt-3 text-[15.5px] leading-relaxed text-muted">{report.diagnosis}</p>}
            </div>
          </motion.section>
        )}

        {sections.some((s) => s.id === "models") && (
          <Section id="models" title={t("models")} sub={t("modelsSub")}>
            <MentalModels models={report.models_used ?? []} />
          </Section>
        )}

        {options.length > 0 && (
          <Section id="options" title={t("options")} sub={t("optionsSub")}>
            <div className="grid gap-3">
              {options.map((o, i) => <OptionCard key={i} option={o} best={i === bestIdx && options.length > 1} />)}
            </div>
          </Section>
        )}

        {hasErrc && report.errc && (
          <Section id="errc" title={t("errc")} sub={t("errcSub")}>
            <ERRCGrid errc={report.errc} />
          </Section>
        )}

        {report.devils_advocate?.strongest_objection && (
          <div id="devil" className="scroll-mt-32"><DevilsAdvocate data={report.devils_advocate} /></div>
        )}

        {report.recommendation?.choice && (
          <motion.section
            id="reco"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
            className="scroll-mt-32 rounded-3xl border border-transparent p-6 shadow-[var(--shadow-pop)] [background:linear-gradient(var(--surface),var(--surface))_padding-box,linear-gradient(135deg,#2f6bff,#00c2ff)_border-box] sm:p-8"
          >
            <p className="font-mono text-xs uppercase tracking-widest text-muted-2">{t("reco")}</p>
            <h2 className="mt-2 font-serif text-4xl leading-tight">{report.recommendation.choice}</h2>
            {report.recommendation.why && <p className="mt-3 text-[15.5px] leading-relaxed text-muted">{report.recommendation.why}</p>}
          </motion.section>
        )}

        {(report.action_plan ?? []).some((s) => s?.step) && (
          <Section id="plan" title={t("plan")} sub={t("planSub")}>
            <ActionPlan steps={report.action_plan ?? []} storageKey={decisionId} />
          </Section>
        )}

        {(report.risks ?? []).some((r) => r?.risk) && (
          <Section id="risks" title={t("risks")} sub={t("riskSub")}>
            <RiskTable risks={report.risks ?? []} />
          </Section>
        )}

        {strs(report.followup_questions).length > 0 && (
          <Section id="check" title={t("followupQuestions")}>
            <ul className="list-disc space-y-1.5 pl-5 text-[15px] text-muted">{strs(report.followup_questions).map((q, i) => <li key={i}>{q}</li>)}</ul>
          </Section>
        )}

        {actions}
      </article>
    </>
  );
}
