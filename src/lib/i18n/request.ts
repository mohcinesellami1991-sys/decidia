import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import fr from "../../messages/fr.json";

type Dict = { [key: string]: string | string[] | Dict };

// L'anglais complète le français : toute clé manquante retombe sur le FR.
function merge(base: Dict, over: Dict): Dict {
  const out: Dict = { ...base };
  for (const [k, v] of Object.entries(over)) {
    const b = out[k];
    out[k] =
      v && typeof v === "object" && !Array.isArray(v) && b && typeof b === "object" && !Array.isArray(b)
        ? merge(b as Dict, v as Dict)
        : v;
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = routing.locales.includes(requested as never) ? (requested as string) : routing.defaultLocale;
  if (locale === "fr") return { locale, messages: fr };
  const mod = (await import(`../../messages/${locale}.json`)).default as Dict;
  return { locale, messages: merge(fr as unknown as Dict, mod) };
});
