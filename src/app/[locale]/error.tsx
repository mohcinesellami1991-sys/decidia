"use client";

import { ErrorState } from "@/components/shared/states";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto grid min-h-[60dvh] max-w-xl place-items-center px-4">
      <ErrorState description="Une erreur inattendue s'est produite. Ton travail n'est pas perdu." onRetry={reset} />
    </main>
  );
}
