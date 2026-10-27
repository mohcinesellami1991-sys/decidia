import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Case à cocher personnalisée, accessible : l'entrée native reste cliquable et focusable. */
export function Checkbox({ className, ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  return (
    <span className={cn("relative inline-grid size-5 shrink-0 place-items-center", className)}>
      <input type="checkbox" className="peer absolute inset-0 size-full cursor-pointer opacity-0" {...props} />
      <span
        aria-hidden
        className="pointer-events-none size-5 rounded-md border border-border bg-background transition-colors duration-150 peer-hover:border-primary/50 peer-checked:border-transparent peer-checked:bg-ocean peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring"
      />
      <Check
        aria-hidden
        strokeWidth={3}
        className="pointer-events-none absolute inset-0 m-auto size-3.5 scale-75 text-white opacity-0 transition-[opacity,transform] duration-150 peer-checked:scale-100 peer-checked:opacity-100"
      />
    </span>
  );
}
