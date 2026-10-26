"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const STORE = "decidia:consent";
type Consent = "unknown" | "granted" | "denied";
type PostHog = typeof import("posthog-js").default;
let client: PostHog | null = null;

function readConsent(): Consent {
  try {
    const v = localStorage.getItem(STORE);
    return v === "granted" || v === "denied" ? v : "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Mesure d'audience soumise au consentement (RGPD). PostHog n'est téléchargé qu'après acceptation,
 * si la clé est définie et si le navigateur n'envoie pas Do Not Track.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("consent");
  // null tant que le navigateur n'a pas lu le choix : aucune bannière au rendu serveur.
  const [consent, setConsent] = useState<Consent | null>(null);

  useEffect(() => {
    setConsent(navigator.doNotTrack === "1" ? "denied" : readConsent());
  }, []);

  useEffect(() => {
    if (!KEY || consent !== "granted" || client) return;
    const start = () =>
      import("posthog-js").then(({ default: posthog }) => {
        posthog.init(KEY, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
          capture_pageview: true,
          person_profiles: "identified_only",
        });
        client = posthog;
      });
    if ("requestIdleCallback" in window) window.requestIdleCallback(start, { timeout: 3000 });
    else setTimeout(start, 1500);
  }, [consent]);

  function choose(value: "granted" | "denied") {
    try {
      localStorage.setItem(STORE, value);
    } catch {
      /* stockage indisponible : le choix vaut pour cette page */
    }
    if (value === "denied") client?.opt_out_capturing();
    setConsent(value);
  }

  const showBanner = Boolean(KEY) && consent === "unknown";

  return (
    <>
      {children}
      {showBanner && (
        <div role="region" aria-label={t("label")} className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-4">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-2xl sm:flex-row sm:items-center">
            <p className="text-[13.5px] leading-relaxed text-muted">{t("text")}</p>
            <div className="flex shrink-0 gap-2">
              <Button variant="secondary" size="sm" onClick={() => choose("denied")}>{t("refuse")}</Button>
              <Button size="sm" onClick={() => choose("granted")}>{t("accept")}</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Évènements du funnel : analysis_started, questions_answered, report_viewed, signup_wall_shown, paywall_shown, checkout_started… */
export function track(event: string, props?: Record<string, unknown>) {
  client?.capture(event, props);
}
