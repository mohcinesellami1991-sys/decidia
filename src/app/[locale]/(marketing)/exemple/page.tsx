import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { ReportView } from "@/components/report/report-view";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { SAMPLE_PROBLEM, SAMPLE_REPORT, SAMPLE_TITLE } from "@/lib/sample-report";

export const metadata: Metadata = { title: "Exemple de rapport" };

export default async function ExamplePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");
  return (
    <>
      <SiteHeader />
      <main id="main">
        <ReportView
          title={SAMPLE_TITLE}
          problem={SAMPLE_PROBLEM}
          dateLabel="26 oct. 2026"
          persona="entrepreneur"
          report={SAMPLE_REPORT}
          actions={
            <div className="rounded-3xl border border-border bg-surface p-7 text-center">
              <p className="font-serif text-3xl">{t("cta")}</p>
              <Button asChild size="lg" className="mt-5"><Link href="/new">{t("cta")} →</Link></Button>
            </div>
          }
        />
      </main>
      <SiteFooter />
    </>
  );
}
