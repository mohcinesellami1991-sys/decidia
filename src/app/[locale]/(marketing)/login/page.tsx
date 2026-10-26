import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/shared/site-header";
import { LoginForm } from "@/components/app/login-form";
import { supabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

export default async function LoginPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ next?: string; error?: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { next, error } = await searchParams;
  const t = await getTranslations("auth");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/journal";
  const configured = supabaseConfigured();
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-md px-4 py-16 sm:py-24">
        <h1 className="font-serif text-5xl leading-tight">{t("title")}</h1>
        <p className="mb-8 mt-3 text-muted">{t("sub")}</p>
        <LoginForm next={safeNext} configured={configured} hadError={Boolean(error)} />
      </main>
    </>
  );
}
