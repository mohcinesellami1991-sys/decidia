import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { DemoSection, DiffSection, FaqSection, Hero, HowSection, PricingSection, WhySection } from "@/components/marketing/sections";
import { WaitlistForm } from "@/components/marketing/waitlist-form";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing.waitlist");

  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <WhySection />
        <DemoSection />
        <HowSection />
        <DiffSection />
        <PricingSection />
        <FaqSection />
        <section id="waitlist" className="scroll-mt-20 pb-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid items-center gap-10 rounded-3xl border border-border bg-surface p-6 sm:p-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-2">{t("eyebrow")}</p>
                <h2 className="mt-3 font-serif text-4xl leading-[1.05] text-balance sm:text-5xl">{t("title")}</h2>
                <p className="mt-4 max-w-[34em] text-muted">{t("sub")}</p>
              </div>
              <WaitlistForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
