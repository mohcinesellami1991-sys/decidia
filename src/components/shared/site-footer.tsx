import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const c = await getTranslations("common");
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-xs text-muted-2 sm:px-6">
        <p className="max-w-xl">{t("rights")} · {c("disclaimer")}</p>
        <nav aria-label="Légal" className="flex gap-5">
          <Link className="hover:text-foreground" href="/privacy">{t("privacy")}</Link>
          <Link className="hover:text-foreground" href="/terms">{t("terms")}</Link>
          <Link className="hover:text-foreground" href="/legal">{t("legal")}</Link>
        </nav>
      </div>
    </footer>
  );
}
