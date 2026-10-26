"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";

export function LangSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");
  const next = locale === "fr" ? "en" : "fr";
  return (
    <Button variant="ghost" size="sm" lang={next} onClick={() => router.replace(pathname, { locale: next })}>
      {t("lang")}
    </Button>
  );
}
