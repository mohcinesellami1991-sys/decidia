"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
let ready = false;

/** PostHog n'est chargé que si la clé est définie et si le navigateur n'envoie pas Do Not Track. */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!KEY || ready || navigator.doNotTrack === "1") return;
    posthog.init(KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
      capture_pageview: true,
      person_profiles: "identified_only",
    });
    ready = true;
  }, []);
  return children;
}

/** Évènements du funnel : landing_cta, analysis_started, questions_answered, report_viewed, signup_wall, paywall, checkout_started… */
export function track(event: string, props?: Record<string, unknown>) {
  if (ready) posthog.capture(event, props);
}
