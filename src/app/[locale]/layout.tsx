import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { routing } from "@/lib/i18n/routing";
import { AnalyticsProvider } from "@/components/shared/analytics";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], preload: false });
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://getdecidia.com";
  return {
    metadataBase: new URL(base),
    title: { default: t("title"), template: "%s · Decidia" },
    description: t("description"),
    alternates: { languages: { fr: "/", en: "/en" } },
    openGraph: { title: t("title"), description: t("description"), type: "website", locale: locale === "en" ? "en_GB" : "fr_FR" },
    twitter: { card: "summary_large_image", title: t("title"), description: t("description") },
  };
}

export const viewport: Viewport = {
  themeColor: [{ color: "#0b0d12" }],
  colorScheme: "dark light",
};

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const all = (await getMessages()) as Record<string, unknown>;
  // Les textes de la landing, des tarifs, de la FAQ et des pages légales ne servent qu'au serveur :
  // on n'envoie au navigateur que ce que les composants clients lisent.
  const { meta: _m, pricing: _p, faq: _f, footer: _ft, legal: _l, email: _e, landing, ...clientMessages } = all as Record<string, never>;
  void _m; void _p; void _f; void _ft; void _l; void _e;
  const messages = { ...clientMessages, landing: { waitlist: (landing as { waitlist: unknown }).waitlist } };

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <NextIntlClientProvider messages={messages}>
            <AnalyticsProvider>{children}</AnalyticsProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
