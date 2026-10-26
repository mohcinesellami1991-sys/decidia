import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("errors");
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-2">404</p>
        <h1 className="mt-3 font-serif text-6xl">{t("notFoundTitle")}</h1>
        <p className="mt-3 text-muted">{t("notFoundText")}</p>
        <Button asChild className="mt-7"><Link href="/">{t("home")}</Link></Button>
      </div>
    </main>
  );
}
