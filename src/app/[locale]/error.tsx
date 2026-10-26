"use client";

import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/shared/states";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("errors");
  return (
    <main className="mx-auto grid min-h-[60dvh] max-w-xl place-items-center px-4">
      <ErrorState description={t("unexpected")} onRetry={reset} />
    </main>
  );
}
