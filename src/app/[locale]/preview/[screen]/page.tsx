import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/shared/site-header";
import { JournalView } from "@/components/app/journal-view";
import { SettingsView } from "@/components/app/settings-view";
import { FollowupForm } from "@/components/app/followup-form";
import { LoginForm } from "@/components/app/login-form";
import { PaywallCard, SignupWall } from "@/components/app/walls";
import { ReportActions } from "@/components/app/analysis-flow";
import { PreviewError, PreviewProgress, PreviewQuestions } from "@/components/app/preview-client";
import { ReportView } from "@/components/report/report-view";
import { NewForm } from "@/components/app/new-form";
import { EmptyState, Skeleton } from "@/components/shared/states";
import { PREVIEW_JOURNAL } from "@/lib/preview-fixtures";
import { getSample } from "@/lib/sample-report";

// Banc d'essai visuel : désactivé en production sauf si ENABLE_PREVIEW=1.
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

const ID = "00000000-0000-4000-8000-000000000001";

const FOLLOWUP_RESULT = {
  gap_analysis:
    "Ma prévision supposait des précommandes hors de ton cercle proche. Le résultat montre que cette hypothèse était trop optimiste : 12 précommandes en 5 semaines, presque toutes venant de ton entourage.",
  lesson: "Une demande validée par des inconnus vaut dix fois une demande validée par des proches.",
  adjusted_plan: [
    { step: "Refaire le test auprès de 100 inconnus ciblés", deadline: "J+14", success_metric: "10 précommandes hors cercle proche" },
    { step: "Tester un second canal d'acquisition", deadline: "J+28", success_metric: "Coût d'acquisition sous 12 €" },
  ],
};

function FollowupBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-2">Quitter mon CDI pour lancer une box de café en ligne</p>
      <h1 className="mt-3 font-serif text-5xl leading-tight text-balance">Ta décision a-t-elle marché ?</h1>
      <p className="mb-9 mt-3 text-muted">Dis-moi ce qui s&apos;est réellement passé. Je compare avec mon analyse et j&apos;ajuste le plan.</p>
      {children}
    </div>
  );
}

export default async function PreviewPage({ params }: { params: Promise<{ locale: string; screen: string }> }) {
  if (process.env.ENABLE_PREVIEW !== "1" && process.env.NODE_ENV === "production") notFound();
  const { locale, screen } = await params;
  setRequestLocale(locale);
  const sample = getSample(locale);
  const e = await getTranslations("errors");
  const c = await getTranslations("common");
  const signedIn = !["report-anon", "login", "new-anon"].includes(screen);

  const report = (viewer: { signedIn: boolean; paid: boolean }) => (
    <ReportView
      title={sample.title}
      problem={sample.problem}
      dateLabel={sample.date}
      persona="entrepreneur"
      report={sample.report}
      decisionId={ID}
      actions={<ReportActions decisionId={ID} viewer={viewer} status="analyzed" />}
    />
  );

  let body: React.ReactNode;
  switch (screen) {
    case "journal":
      body = <JournalView rows={PREVIEW_JOURNAL} all={PREVIEW_JOURNAL} filter="all" />;
      break;
    case "journal-empty":
      body = <JournalView rows={[]} all={[]} filter="all" />;
      break;
    case "settings-free":
      body = <SettingsView userId={ID} email="toi@entreprise.fr" fullName="Camille Martin" persona="entrepreneur" plan="free" isFounder={false} />;
      break;
    case "settings-pro":
      body = <SettingsView userId={ID} email="toi@entreprise.fr" fullName="Camille Martin" persona="entrepreneur" plan="pro" isFounder checkout="success" />;
      break;
    case "followup":
      body = <FollowupBlock><FollowupForm decisionId={ID} initial={null} /></FollowupBlock>;
      break;
    case "followup-done":
      body = <FollowupBlock><FollowupForm decisionId={ID} initial={FOLLOWUP_RESULT} /></FollowupBlock>;
      break;
    case "questions":
      body = <PreviewQuestions />;
      break;
    case "questions-2":
      body = <PreviewQuestions start={1} filled />;
      break;
    case "progress-early":
      body = <PreviewProgress stage="early" />;
      break;
    case "progress-mid":
      body = <PreviewProgress stage="mid" />;
      break;
    case "progress-late":
      body = <PreviewProgress stage="late" />;
      break;
    case "report-anon":
      body = report({ signedIn: false, paid: false });
      break;
    case "report-free":
      body = report({ signedIn: true, paid: false });
      break;
    case "report-pro":
      body = report({ signedIn: true, paid: true });
      break;
    case "walls":
      body = <div className="mx-auto grid max-w-2xl gap-6 px-4 py-14"><SignupWall next="/new" /><PaywallCard /></div>;
      break;
    case "login":
      body = (
        <div className="mx-auto max-w-md px-4 py-16">
          <h1 className="font-serif text-5xl">Connexion</h1>
          <div className="mt-8"><LoginForm next="/journal" configured hadError={false} /></div>
        </div>
      );
      break;
    case "new":
    case "new-anon":
      body = <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16"><NewForm /></div>;
      break;
    case "states":
      body = (
        <div className="mx-auto grid max-w-3xl gap-8 px-4 py-12">
          <EmptyState title="Aucune décision pour l'instant" description="Ta première analyse apparaîtra ici, avec son suivi." />
          <PreviewError title={c("error")} description={e("unexpected")} />
          <div className="grid gap-4" aria-busy>
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        </div>
      );
      break;
    default:
      notFound();
  }

  return (
    <>
      <SiteHeader variant="app" signedIn={signedIn} />
      <main id="main">{body}</main>
    </>
  );
}
