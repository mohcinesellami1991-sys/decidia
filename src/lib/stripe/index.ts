import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY manquant");
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

export const stripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_PRO);

/** Offres. Essentiel et Équipe sont prévues dans le code mais désactivées pour le MVP. */
export const PLANS = {
  pro: { enabled: true, priceEnv: "STRIPE_PRICE_PRO", label: "Pro", monthlyEur: 29 },
  founder: { enabled: true, priceEnv: "STRIPE_PRICE_FOUNDER", label: "Pro · fondateur", monthlyEur: 19, seats: 100 },
  essential: { enabled: false, priceEnv: "STRIPE_PRICE_ESSENTIAL", label: "Essentiel", monthlyEur: 9 },
  team: { enabled: false, priceEnv: "STRIPE_PRICE_TEAM", label: "Équipe", monthlyEur: 79 },
} as const;

export type PlanKey = keyof typeof PLANS;

export function priceFor(key: PlanKey): string | null {
  const p = PLANS[key];
  return p.enabled ? (process.env[p.priceEnv] ?? null) : null;
}

export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
