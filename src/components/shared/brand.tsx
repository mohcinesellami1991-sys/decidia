import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 font-serif text-[26px] leading-none", className)} aria-label="Decidia">
      <span aria-hidden className="relative inline-block size-[22px] rounded-full bg-ocean">
        <span className="absolute inset-[6px_0_0_6px] rounded-full bg-background" />
      </span>
      Decidia
    </Link>
  );
}
