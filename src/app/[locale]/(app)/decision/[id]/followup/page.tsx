import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FollowupForm } from "@/components/app/followup-form";
import { createAdmin, hasSupabase } from "@/lib/supabase/server";
import { getOwnedDecision, getViewer } from "@/lib/db";
import type { FollowupAdjustment } from "@/lib/ai/schemas";

export const metadata: Metadata = { title: "Suivi", robots: { index: false } };

export default async function FollowupPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  if (!hasSupabase()) notFound();
  const viewer = await getViewer();
  const decision = await getOwnedDecision(id, viewer);
  if (!decision || !viewer.userId) notFound();
  const t = await getTranslations("followup");

  const { data } = await createAdmin()
    .from("followups")
    .select("outcome, ai_adjustment_json")
    .eq("decision_id", id)
    .not("answered_at", "is", null)
    .order("answered_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-2">{decision.title}</p>
      <h1 className="mt-3 font-serif text-5xl leading-tight text-balance">{t("title")}</h1>
      <p className="mb-9 mt-3 text-muted">{t("sub")}</p>
      <FollowupForm decisionId={id} initial={data?.ai_adjustment_json ? (data.ai_adjustment_json as FollowupAdjustment) : null} />
    </div>
  );
}
