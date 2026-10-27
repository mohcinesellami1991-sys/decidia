import { getTranslations } from "next-intl/server";
import { BillingActions, DataActions, ProfileForm } from "@/components/app/settings-forms";
import { Badge } from "@/components/ui/badge";

function Panel({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-5 rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
      <h2 id={id} className="font-serif text-3xl leading-tight">{title}</h2>
      {children}
    </section>
  );
}

export async function SettingsView({
  userId, email, fullName, persona, plan, isFounder, checkout,
}: {
  userId: string; email: string | null; fullName: string; persona: string;
  plan: "free" | "pro" | "team"; isFounder: boolean; checkout?: string;
}) {
  const t = await getTranslations("settings");
  const paid = plan !== "free";
  return (
    <div className="mx-auto grid max-w-2xl gap-6 px-4 py-12 sm:px-6">
      <h1 className="font-serif text-5xl leading-tight sm:text-6xl">{t("title")}</h1>

      {checkout === "success" && <p role="status" className="rounded-xl border border-success/40 bg-success-soft p-4 text-sm text-success">{t("checkoutSuccess")}</p>}

      <Panel id="s-plan" title={t("plan")}>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-2xl border border-border bg-background p-5">
          <div>
            <p className="flex items-center gap-2.5">
              <Badge tone={paid ? "ocean" : "neutral"}>{paid ? t("planPro") : t("planFree")}</Badge>
              {isFounder && <Badge tone="amber">{t("founder")}</Badge>}
            </p>
            <p className="mt-2 font-serif text-2xl leading-tight">{paid ? t("proTitle") : t("freeTitle")}</p>
            <p className="mt-1 max-w-sm text-sm text-muted">{paid ? t("proText") : t("freeText")}</p>
          </div>
          <BillingActions plan={plan} />
        </div>
      </Panel>

      <Panel id="s-profile" title={t("profile")}>
        <p className="text-sm text-muted-2">{t("email")} : <span className="text-foreground">{email}</span></p>
        <ProfileForm userId={userId} fullName={fullName} persona={persona} />
      </Panel>

      <Panel id="s-data" title={t("data")}>
        <DataActions />
      </Panel>
    </div>
  );
}
