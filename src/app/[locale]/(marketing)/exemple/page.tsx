import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { ReportView } from "@/components/report/report-view";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { getSample } from "@/lib/sample-report";

export const metadata: Metadata = { title: "Exemple de rapport" };

export default async function ExamplePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");
  const sample = getSample(locale);
  return (
    <>
      <SiteHeader />
      <main id="main">
        <ReportView
          title={sample.title}
          problem={sample.problem}
          dateLabel={sample.date}
          persona="entrepreneur"
          report={sample.report}
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
