import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BillingActions, DataActions, ProfileForm } from "@/components/app/settings-forms";
import { Badge } from "@/components/ui/badge";
import { createAdmin, hasSupabase } from "@/lib/supabase/server";
import { getViewer } from "@/lib/db";

export const metadata: Metadata = { title: "Réglages", robots: { index: false } };

export default async function SettingsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ checkout?: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!hasSupabase()) notFound();
  const viewer = await getViewer();
  if (!viewer.userId) notFound();
  const { checkout } = await searchParams;
  const t = await getTranslations("settings");

  const { data: profile } = await createAdmin().from("profiles").select("full_name, persona").eq("id", viewer.userId).single();

  return (
    <div className="mx-auto grid max-w-2xl gap-12 px-4 py-12 sm:px-6">
      <h1 className="font-serif text-5xl leading-tight">{t("title")}</h1>

      {checkout === "success" && <p role="status" className="rounded-xl border border-success/40 bg-success-soft p-4 text-sm text-success">Merci. Ton abonnement Pro est en cours d&apos;activation.</p>}

      <section aria-labelledby="s-profile" className="grid gap-5">
        <h2 id="s-profile" className="font-serif text-3xl">{t("profile")}</h2>
        <p className="text-sm text-muted-2">{viewer.email}</p>
        <ProfileForm userId={viewer.userId} fullName={profile?.full_name ?? ""} persona={profile?.persona ?? "entrepreneur"} />
      </section>

      <section aria-labelledby="s-plan" className="grid gap-4">
        <h2 id="s-plan" className="font-serif text-3xl">{t("plan")}</h2>
        <p className="flex items-center gap-2.5">
          <Badge tone={viewer.plan === "free" ? "neutral" : "ocean"}>{viewer.plan === "free" ? t("planFree") : t("planPro")}</Badge>
          {viewer.isFounder && <Badge tone="amber">Fondateur</Badge>}
        </p>
        <BillingActions plan={viewer.plan} />
      </section>

      <section aria-labelledby="s-data" className="grid gap-5">
        <h2 id="s-data" className="font-serif text-3xl">{t("data")}</h2>
        <DataActions />
      </section>
    </div>
  );
}
