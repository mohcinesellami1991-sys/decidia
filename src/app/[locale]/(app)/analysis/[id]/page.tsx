import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { AnalysisFlow } from "@/components/app/analysis-flow";
import { getAnswers, getLatestReport, getOwnedDecision, getViewer, isPaid } from "@/lib/db";
import { hasSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Analyse", robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AnalysisPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  if (!hasSupabase() || !UUID.test(id)) notFound();

  const viewer = await getViewer();
  const decision = await getOwnedDecision(id, viewer);
  if (!decision) {
    const t = await getTranslations("analysis");
    return <p className="px-4 py-24 text-center text-muted">{t("notFound")}</p>;
  }

  const [answers, latest] = await Promise.all([getAnswers(id), getLatestReport(id)]);
  const lang = (await getLocale()) === "en" ? "en-GB" : "fr-FR";
  const date = new Date(latest?.createdAt ?? decision.created_at).toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric" });

  return (
    <AnalysisFlow
      decisionId={decision.id}
      title={decision.title}
      problem={decision.problem_text}
      persona={decision.persona}
      dateLabel={date}
      questions={answers.map((a) => ({ question: a.question, answer: a.answer, example: a.example }))}
      report={latest?.report ?? null}
      status={decision.status}
      viewer={{ signedIn: Boolean(viewer.userId), paid: isPaid(viewer) }}
    />
  );
}
