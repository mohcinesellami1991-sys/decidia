"use client";

import { useEffect } from "react";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
type PostHog = typeof import("posthog-js").default;
let client: PostHog | null = null;

/** PostHog n'est téléchargé que si la clé est définie et si le navigateur n'envoie pas Do Not Track. */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!KEY || client || navigator.doNotTrack === "1") return;
    const start = () =>
      import("posthog-js").then(({ default: posthog }) => {
        posthog.init(KEY, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
          capture_pageview: true,
          person_profiles: "identified_only",
        });
        client = posthog;
      });
    // On laisse la page devenir interactive avant de charger la mesure d'audience.
    if ("requestIdleCallback" in window) window.requestIdleCallback(start, { timeout: 3000 });
    else setTimeout(start, 1500);
  }, []);
  return children;
}

/** Évènements du funnel : analysis_started, questions_answered, report_viewed, signup_wall_shown, paywall_shown, checkout_started… */
export function track(event: string, props?: Record<string, unknown>) {
  client?.capture(event, props);
}
