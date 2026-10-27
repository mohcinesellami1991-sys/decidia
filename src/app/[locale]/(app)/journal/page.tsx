import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { JournalView, JOURNAL_FILTERS, type JournalFilter, type JournalRow } from "@/components/app/journal-view";
import { createAdmin, hasSupabase } from "@/lib/supabase/server";
import { getViewer } from "@/lib/db";

export const metadata: Metadata = { title: "Journal", robots: { index: false } };

const OPEN = ["analyzed", "decided"];

export default async function JournalPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ f?: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!hasSupabase()) notFound();
  const { f } = await searchParams;
  const filter: JournalFilter = JOURNAL_FILTERS.includes(f as JournalFilter) ? (f as JournalFilter) : "all";
  const viewer = await getViewer();
  if (!viewer.userId) notFound();

  const { data } = await createAdmin()
    .from("decisions")
    .select("id, title, status, confidence_score, created_at")
    .eq("user_id", viewer.userId)
    .neq("status", "draft")
    .order("created_at", { ascending: false });
  const all = (data ?? []) as JournalRow[];
  const rows =
    filter === "open" ? all.filter((d) => OPEN.includes(d.status))
    : filter === "success" ? all.filter((d) => d.status === "success" || d.status === "partial")
    : filter === "failed" ? all.filter((d) => d.status === "failed")
    : all;

  return <JournalView rows={rows} all={all} filter={filter} />;
}
