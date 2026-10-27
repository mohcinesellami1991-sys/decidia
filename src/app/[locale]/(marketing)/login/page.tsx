import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check } from "lucide-react";
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
  const benefits = t.raw("benefits") as { t: string; d: string }[];
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto grid max-w-5xl gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
        <div className="mx-auto w-full max-w-md lg:mx-0">
          <h1 className="font-serif text-5xl leading-tight sm:text-6xl">{t("title")}</h1>
          <p className="mb-8 mt-3 text-muted">{t("sub")}</p>
          <LoginForm next={safeNext} configured={configured} hadError={Boolean(error)} />
        </div>
        <aside className="hidden self-center rounded-3xl border border-border bg-surface p-8 shadow-[var(--shadow-card)] lg:block" aria-label={t("benefitsTitle")}>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-2">{t("benefitsTitle")}</p>
          <ul className="mt-6 grid gap-6">
            {benefits.map((b) => (
              <li key={b.t} className="flex gap-4">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-ocean text-white"><Check className="size-3.5" strokeWidth={3} aria-hidden /></span>
                <div>
                  <p className="font-medium">{b.t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{b.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </main>
    </>
  );
}
