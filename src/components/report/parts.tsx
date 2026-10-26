"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Report } from "@/lib/ai/schemas";

export type Partial2<T> = { [K in keyof T]?: T[K] extends (infer U)[] ? Partial2<U>[] : T[K] extends object ? Partial2<T[K]> : T[K] };
export type PartialReport = Partial2<Report>;

export const strs = (a?: (string | undefined)[]) => (a ?? []).filter((x): x is string => Boolean(x));

/* ---------- Jauge de confiance ---------- */
export function ConfidenceGauge({ value, size = 148 }: { value: number; size?: number }) {
  const t = useTranslations("report");
  const reduce = useReducedMotion();
  const R = 64;
  const len = 2 * Math.PI * R;
  const v = Math.max(0, Math.min(100, value));
  const id = useId();
  const tone = v >= 75 ? "var(--success)" : null;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${t("confidence")} ${v} ${t("ofMax")}`}>
      <svg viewBox="0 0 148 148" className="size-full -rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2f6bff" />
            <stop offset="1" stopColor="#00c2ff" />
          </linearGradient>
        </defs>
        <circle cx="74" cy="74" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="10" />
        <motion.circle
          cx="74" cy="74" r={R} fill="none" strokeWidth="10" strokeLinecap="round"
          stroke={tone ?? `url(#${id})`}
          strokeDasharray={len}
          initial={{ strokeDashoffset: reduce ? len * (1 - v / 100) : len }}
          animate={{ strokeDashoffset: len * (1 - v / 100) }}
          transition={{ duration: reduce ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <b className="font-serif text-5xl font-normal leading-none tabular-nums">{v}</b>
        <span className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-2">{t("confidence")}</span>
      </div>
    </div>
  );
}

/** Jauge sans JavaScript ni animation, pour les pages statiques (landing). */
export function StaticGauge({ value, size = 96, label }: { value: number; size?: number; label: string }) {
  const R = 64;
  const len = 2 * Math.PI * R;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${label} ${v}/100`}>
      <svg viewBox="0 0 148 148" className="size-full -rotate-90" aria-hidden>
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2f6bff" />
            <stop offset="1" stopColor="#00c2ff" />
          </linearGradient>
        </defs>
        <circle cx="74" cy="74" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="10" />
        <circle cx="74" cy="74" r={R} fill="none" stroke="url(#sg)" strokeWidth="10" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - v / 100)} />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <b className="font-serif text-3xl font-normal leading-none tabular-nums">{v}</b>
      </div>
    </div>
  );
}

/* ---------- Modèles mentaux ---------- */
export function MentalModels({ models }: { models: { name?: string; insight?: string }[] }) {
  const t = useTranslations("report");
  const [open, setOpen] = useState(0);
  const items = models.filter((m) => m.name);
  const current = items[Math.min(open, Math.max(items.length - 1, 0))];
  if (!items.length) return null;
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("models")}>
        {items.map((m, i) => (
          <MentalModelChip key={m.name} name={m.name!} active={i === open} onClick={() => setOpen(i)} />
        ))}
      </div>
      {current?.insight && (
        <p role="tabpanel" className="mt-3 rounded-xl border border-border bg-surface px-4 py-3.5 text-[15px] leading-relaxed text-muted">
          <b className="font-medium text-foreground">{current.name}.</b> {current.insight}
        </p>
      )}
    </div>
  );
}

export function MentalModelChip({ name, active, onClick }: { name: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-[13px] transition-colors duration-150",
        active ? "border-primary/50 bg-primary/20 text-primary" : "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20",
      )}
    >
      {name}
    </button>
  );
}

/* ---------- Option ---------- */
export function OptionCard({ option, best }: { option: Partial2<Report["options"][number]>; best?: boolean }) {
  const t = useTranslations("report");
  const score = option.confidence ?? 0;
  return (
    <article className={cn("grid gap-2 rounded-2xl border bg-surface p-5", best ? "border-ring/60" : "border-border")}>
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-[17px] font-semibold leading-snug">{option.title}</h3>
        <span className="shrink-0 font-mono text-sm tabular-nums">{Math.round(score)} / 100</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2" role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label={t("confidence")}>
        <div className="h-full rounded-full bg-ocean transition-[width] duration-700" style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
      </div>
      <div className="mt-2 grid gap-4 text-sm text-muted sm:grid-cols-2">
        <BulletBlock title={t("pros")} items={strs(option.pros)} />
        <BulletBlock title={t("cons")} items={strs(option.cons)} />
      </div>
      {strs(option.risks).length > 0 && (
        <p className="mt-1 text-xs text-muted-2"><span className="font-mono uppercase tracking-widest">{t("risks")} · </span>{strs(option.risks).join(" · ")}</p>
      )}
    </article>
  );
}

function BulletBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h4 className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-2">{title}</h4>
      <ul className="mt-1.5 list-disc space-y-1 pl-5">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </div>
  );
}

/* ---------- Grille Océan Bleu ---------- */
export function ERRCGrid({ errc }: { errc: Partial2<Report["errc"]> }) {
  const t = useTranslations("report");
  const cells = [
    { key: "eliminate", label: t("eliminate"), tone: "text-danger" },
    { key: "reduce", label: t("reduce"), tone: "text-muted" },
    { key: "raise", label: t("raise"), tone: "text-primary" },
    { key: "create", label: t("create"), tone: "text-[var(--ocean-to)]" },
  ] as const;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {cells.map((c) => (
        <div key={c.key} className="rounded-2xl border border-border bg-surface p-5">
          <h4 className={cn("font-mono text-xs font-medium uppercase tracking-widest", c.tone)}>{c.label}</h4>
          <ul className="mt-2 space-y-1.5 text-[15px] text-muted">
            {strs(errc[c.key]).map((x, i) => <li key={i}>{x}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ---------- Avocat du diable ---------- */
export function DevilsAdvocate({ data }: { data: Partial2<Report["devils_advocate"]> }) {
  const t = useTranslations("report");
  return (
    <section aria-label={t("devil")} className="rounded-2xl border border-amber-line bg-amber-soft p-6">
      <p className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-widest text-amber">
        <AlertTriangle className="size-4" /> {t("devil")}
      </p>
      {data.strongest_objection && (
        <>
          <h2 className="mt-3 font-serif text-3xl leading-tight">{t("strongest")}</h2>
          <p className="mt-2 text-[15.5px] leading-relaxed text-muted">{data.strongest_objection}</p>
        </>
      )}
      {strs(data.blind_spots).length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium">{t("blind")}</h3>
          <ul className="mt-1.5 list-disc space-y-1.5 pl-5 text-[15px] text-muted">{strs(data.blind_spots).map((x, i) => <li key={i}>{x}</li>)}</ul>
        </div>
      )}
      {data.verdict_change && (
        <p className="mt-4 border-t border-dashed border-amber-line pt-4 text-[15px]">
          <b className="font-medium text-amber">{t("verdictChange")}. </b>
          {data.verdict_change}
        </p>
      )}
    </section>
  );
}

/* ---------- Plan d'action ---------- */
export function ActionPlan({ steps, storageKey }: { steps: Partial2<Report["action_plan"][number]>[]; storageKey?: string }) {
  const t = useTranslations("report");
  const [done, setDone] = useState<Record<number, boolean>>({});
  const key = storageKey ? `decidia:plan:${storageKey}` : null;

  useEffect(() => {
    if (!key) return;
    try {
      const raw = localStorage.getItem(key);
      if (raw) setDone(JSON.parse(raw));
    } catch {
      /* stockage indisponible */
    }
  }, [key]);

  const toggle = (i: number) =>
    setDone((prev) => {
      const next = { ...prev, [i]: !prev[i] };
      if (key) {
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* ignoré */
        }
      }
      return next;
    });

  return (
    <ul className="grid gap-2.5">
      {steps.filter((s) => s.step).map((s, i) => (
        <li key={i} className="rounded-xl border border-border bg-surface">
          <label className="grid cursor-pointer grid-cols-[auto_1fr_auto] items-start gap-3.5 p-4">
            <input type="checkbox" checked={Boolean(done[i])} onChange={() => toggle(i)} className="mt-0.5 size-5 accent-[#2f6bff]" />
            <span>
              <span className={cn("text-[15px]", done[i] && "text-muted-2 line-through")}>{s.step}</span>
              {s.success_metric && <span className="mt-0.5 block text-[13px] text-muted-2">{t("metric")} : {s.success_metric}</span>}
            </span>
            <span className="whitespace-nowrap font-mono text-xs text-muted-2">{s.deadline}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Risques ---------- */
const LEVEL_TONE = { low: "text-muted-2", medium: "text-muted", high: "text-amber" } as const;

export function RiskTable({ risks }: { risks: Partial2<Report["risks"][number]>[] }) {
  const t = useTranslations("report");
  const rows = risks.filter((r) => r.risk);
  if (!rows.length) return null;
  const Lvl = ({ v, kind }: { v?: "low" | "medium" | "high"; kind: "levels" | "impacts" }) =>
    v ? (
      <span className={cn("inline-flex items-center gap-1.5 font-mono text-xs font-medium", LEVEL_TONE[v])}>
        <span aria-hidden className="size-2 rounded-full bg-current" />
        {t(`${kind}.${v}`)}
      </span>
    ) : null;
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface" tabIndex={0} role="region" aria-label={t("riskTable")}>
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr>
            {[t("risk"), t("probability"), t("impact"), t("mitigation")].map((h) => (
              <th key={h} scope="col" className="border-b border-border px-4 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-widest text-muted-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="align-top [&:not(:last-child)>td]:border-b [&>td]:border-border">
              <td className="px-4 py-3.5 text-foreground">{r.risk}</td>
              <td className="px-4 py-3.5"><Lvl v={r.probability} kind="levels" /></td>
              <td className="px-4 py-3.5"><Lvl v={r.impact} kind="impacts" /></td>
              <td className="px-4 py-3.5 text-muted">{r.mitigation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
