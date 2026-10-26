import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/brand";
import { LangSwitch } from "@/components/shared/lang-switch";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export async function SiteHeader({ signedIn = false, variant = "marketing" }: { signedIn?: boolean; variant?: "marketing" | "app" }) {
  const t = await getTranslations("nav");
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Logo href={variant === "app" && signedIn ? "/journal" : "/"} />
        <nav aria-label="Principal" className="ml-6 hidden items-center gap-1 text-sm text-muted md:flex">
          {variant === "marketing" || !signedIn ? (
            <>
              <Link className="rounded-md px-3 py-1.5 hover:text-foreground" href="/#why">{t("why")}</Link>
              <Link className="rounded-md px-3 py-1.5 hover:text-foreground" href="/#how">{t("how")}</Link>
              <Link className="rounded-md px-3 py-1.5 hover:text-foreground" href="/#pricing">{t("pricing")}</Link>
              <Link className="rounded-md px-3 py-1.5 hover:text-foreground" href="/#faq">{t("faq")}</Link>
            </>
          ) : (
            <>
              <Link className="rounded-md px-3 py-1.5 hover:text-foreground" href="/journal">{t("journal")}</Link>
              <Link className="rounded-md px-3 py-1.5 hover:text-foreground" href="/settings">{t("settings")}</Link>
            </>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <LangSwitch />
          <ThemeToggle />
          {signedIn ? (
            <Button asChild size="sm"><Link href="/new">{t("new")}</Link></Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link href="/login">{t("login")}</Link></Button>
              <Button asChild size="sm"><Link href="/new"><span className="hidden sm:inline">{t("cta")}</span><span className="sm:hidden">{t("ctaShort")}</span></Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
