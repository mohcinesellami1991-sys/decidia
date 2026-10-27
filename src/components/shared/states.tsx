import * as React from "react";
import { Button } from "@/components/ui/button";
import { IllustrationError, IllustrationJournal } from "@/components/shared/illustrations";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-md bg-[linear-gradient(90deg,var(--surface-2),var(--border),var(--surface-2))] bg-[length:200%_100%] motion-safe:animate-[shimmer_1.6s_linear_infinite]",
        className,
      )}
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
  illustration,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  illustration?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-surface/40 px-6 py-14 text-center">
      {illustration ?? <IllustrationJournal className="h-32 w-auto" />}
      <h3 className="mt-2 font-serif text-3xl leading-tight">{title}</h3>
      <p className="max-w-sm text-[15px] leading-relaxed text-muted">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Quelque chose a coincé.",
  description,
  onRetry,
  retryLabel = "Réessayer",
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-3xl border border-amber-line bg-amber-soft px-6 py-12 text-center"
    >
      <IllustrationError className="h-28 w-auto" />
      <h3 className="font-serif text-3xl leading-tight">{title}</h3>
      <p className="max-w-sm text-[15px] leading-relaxed text-muted">{description}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-1">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
