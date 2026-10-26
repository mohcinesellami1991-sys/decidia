"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("common");
  return (
    <Button variant="ghost" size="sm" aria-label={t("theme")} onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </Button>
  );
}
