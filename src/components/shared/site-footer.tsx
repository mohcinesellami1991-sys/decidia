import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Logo } from "@/components/shared/brand";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const n = await getTranslations("nav");
  const c = await getTranslations("common");
  const col = "grid content-start gap-2.5 text-sm text-muted";
  const link = "w-fit rounded-sm transition-colors duration-150 hover:text-foreground";
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 font-serif text-2xl leading-snug text-muted">{t("tagline")}</p>
          <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-muted-2">{c("disclaimer")}</p>
        </div>
        <nav aria-label={t("product")} className={col}>
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-muted-2">{t("product")}</p>
          <Link className={link} href="/#why">{n("why")}</Link>
          <Link className={link} href="/#how">{n("how")}</Link>
          <Link className={link} href="/exemple">{t("example")}</Link>
          <Link className={link} href="/#pricing">{n("pricing")}</Link>
          <Link className={link} href="/#faq">{n("faq")}</Link>
        </nav>
        <nav aria-label={t("legalTitle")} className={col}>
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-muted-2">{t("legalTitle")}</p>
          <Link className={link} href="/privacy">{t("privacy")}</Link>
          <Link className={link} href="/terms">{t("terms")}</Link>
          <Link className={link} href="/legal">{t("legal")}</Link>
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted-2 sm:px-6">{t("rights")}</p>
      </div>
    </footer>
  );
}
