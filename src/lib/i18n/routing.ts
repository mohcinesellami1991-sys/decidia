import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
  localeDetection: false, // français d'abord : l'anglais se choisit avec le sélecteur de langue
});

export type Locale = (typeof routing.locales)[number];
