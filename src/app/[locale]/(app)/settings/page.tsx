import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { SettingsView } from "@/components/app/settings-view";
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
  const { data: profile } = await createAdmin().from("profiles").select("full_name, persona").eq("id", viewer.userId).single();

  return (
    <SettingsView
      userId={viewer.userId}
      email={viewer.email}
      fullName={profile?.full_name ?? ""}
      persona={profile?.persona ?? "entrepreneur"}
      plan={viewer.plan}
      isFounder={viewer.isFounder}
      checkout={checkout}
    />
  );
}
