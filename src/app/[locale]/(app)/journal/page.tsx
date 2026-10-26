import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/states";
import { createAdmin } from "@/lib/supabase/server";
import { getViewer, type DecisionRow } from "@/lib/db";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Journal", robots: { index: false } };

type Filter = "all" | "open" | "success" | "failed";
const FILTERS: Filter[] = ["all", "open", "success", "failed"];
const OPEN = ["analyzed", "decided"];
const TONE = { draft: "neutral", analyzed: "ocean", decided: "ocean", success: "success", partial: "amber", failed: "amber" } as const;

export default async function JournalPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ f?: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { f } = await searchParams;
  const filter: Filter = FILTERS.includes(f as Filter) ? (f as Filter) : "all";
  const t = await getTranslations("journal");
  const viewer = await getViewer();
  const lang = (await getLocale()) === "en" ? "en-GB" : "fr-FR";

  const admin = createAdmin();
  let q = admin.from("decisions").select("*").eq("user_id", viewer.userId!).neq("status", "draft").order("created_at", { ascending: false });
  if (filter === "open") q = q.in("status", OPEN);
  if (filter === "success") q = q.in("status", ["success", "partial"]);
  if (filter === "failed") q = q.eq("status", "failed");
  const { data } = await q;
  const rows = (data ?? []) as DecisionRow[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-5xl leading-tight">{t("title")}</h1>
          <p className="mt-2 text-muted">{t("sub")}</p>
        </div>
        <Button asChild><Link href="/new"><Plus />{t("emptyCta")}</Link></Button>
      </div>

      <nav aria-label="Filtres" className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((k) => (
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
          <EmptyState title={t("emptyTitle")} description={t("emptyText")} action={<Button asChild size="sm"><Link href="/new">{t("emptyCta")}</Link></Button>} />
        ) : (
          <ul className="grid gap-3">
            {rows.map((d) => (
              <li key={d.id} className="grid gap-3 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <Link href={`/analysis/${d.id}`} className="block truncate text-[17px] font-semibold hover:text-primary">{d.title}</Link>
                  <p className="mt-1 text-[13px] text-muted-2">
                    {t("created")} {new Date(d.created_at).toLocaleDateString(lang, { day: "numeric", month: "short", year: "numeric" })}
                    {d.confidence_score !== null && <> · {t("confidence")} <span className="font-mono tabular-nums">{d.confidence_score}</span>/100</>}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
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
