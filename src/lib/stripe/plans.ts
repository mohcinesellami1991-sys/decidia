/** Constantes d'offre partagées serveur / client (sans dépendance Stripe). */
export const PLANS = {
  pro: { price: "29 €", monthlyEur: 29 },
  founder: { price: "19 €", monthlyEur: 19, seats: 100 },
} as const;
