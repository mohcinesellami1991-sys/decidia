import { getLocale, getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/states";
import { StaticGauge } from "@/components/report/parts";
import { cn } from "@/lib/utils";

export type JournalRow = {
  id: string;
  title: string;
  status: "draft" | "analyzed" | "decided" | "success" | "partial" | "failed";
  confidence_score: number | null;
  created_at: string;
};

export type JournalFilter = "all" | "open" | "success" | "failed";
export const JOURNAL_FILTERS: JournalFilter[] = ["all", "open", "success", "failed"];
const OPEN = ["analyzed", "decided"];
const TONE = { draft: "neutral", analyzed: "ocean", decided: "ocean", success: "success", partial: "amber", failed: "amber" } as const;

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-3 py-3 shadow-[var(--shadow-card)] sm:px-5 sm:py-4">
      <p className="font-mono text-[10px] uppercase leading-snug tracking-wider text-muted-2 sm:text-[11px] sm:tracking-widest">{label}</p>
      <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 font-serif text-3xl leading-none tabular-nums sm:text-4xl">{value}{hint && <span className="font-sans text-xs text-muted-2 sm:text-sm">{hint}</span>}</p>
    </div>
  );
}

/** Vue du journal : statistiques, filtres et cartes de décisions. `all` sert aux statistiques, `rows` à la liste filtrée. */
export async function JournalView({ rows, all, filter }: { rows: JournalRow[]; all: JournalRow[]; filter: JournalFilter }) {
  const t = await getTranslations("journal");
  const lang = (await getLocale()) === "en" ? "en-GB" : "fr-FR";

  const analysed = all.filter((d) => d.status !== "draft");
  const done = analysed.filter((d) => ["success", "partial", "failed"].includes(d.status));
  const wins = analysed.filter((d) => d.status === "success").length;
  const scores = analysed.map((d) => d.confidence_score).filter((n): n is number => n !== null);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-5xl leading-tight sm:text-6xl">{t("title")}</h1>
          <p className="mt-2 text-muted">{t("sub")}</p>
        </div>
        <Button asChild size="lg"><Link href="/new"><Plus />{t("emptyCta")}</Link></Button>
      </div>

      {analysed.length > 0 && (
        <div className="mt-9 grid grid-cols-3 gap-2 sm:gap-3">
          <Stat label={t("stats.total")} value={String(analysed.length)} />
          <Stat label={t("stats.success")} value={done.length ? `${wins}` : t("stats.none")} hint={done.length ? `/ ${done.length}` : undefined} />
          <Stat label={t("stats.avg")} value={avg === null ? t("stats.none") : String(avg)} hint={avg === null ? undefined : "/ 100"} />
        </div>
      )}

      <nav aria-label="Filtres" className="mt-8 flex flex-wrap gap-2">
        {JOURNAL_FILTERS.map((k) => (
          <Link
            key={k} href={k === "all" ? "/journal" : `/journal?f=${k}`} aria-current={filter === k ? "page" : undefined}
            className={cn("rounded-full border px-4 py-1.5 text-sm transition-colors duration-150", filter === k ? "border-primary/50 bg-primary/15 text-foreground" : "border-border bg-surface text-muted hover:text-foreground")}
          >
            {t(`filters.${k}`)}
          </Link>
        ))}
      </nav>

      <div className="mt-6">
        {rows.length === 0 ? (
          <EmptyState title={t("emptyTitle")} description={t("emptyText")} action={<Button asChild size="lg"><Link href="/new">{t("emptyCta")}</Link></Button>} />
        ) : (
          <ul className="grid gap-3">
            {rows.map((d) => (
              <li key={d.id} className="group grid items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)] transition-colors duration-150 hover:border-primary/40 grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto] sm:p-5">
                {d.confidence_score !== null ? (
                  <StaticGauge value={d.confidence_score} size={64} label={t("confidence")} />
                ) : (
                  <div className="size-16 rounded-full border border-dashed border-border" aria-hidden />
                )}
                <div className="min-w-0">
                  <Link href={`/analysis/${d.id}`} className="line-clamp-2 text-[17px] font-semibold leading-snug hover:text-primary">{d.title}</Link>
                  <p className="mt-1 text-[13px] text-muted-2">
                    {t("created")} {new Date(d.created_at).toLocaleDateString(lang, { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  {OPEN.includes(d.status) && <p className="mt-1.5 text-[13px] text-primary">{t("nextStep")}</p>}
                </div>
                <div className="col-span-2 flex flex-wrap items-center gap-2.5 sm:col-span-1 sm:justify-end">
                  <Badge tone={TONE[d.status]}>{t(`status.${d.status}`)}</Badge>
                  {OPEN.includes(d.status) && <Button asChild size="sm" variant="secondary"><Link href={`/decision/${d.id}/followup`}>{t("followup")}</Link></Button>}
                  <Button asChild size="sm" variant="ghost"><Link href={`/analysis/${d.id}`}>{t("open")}</Link></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
