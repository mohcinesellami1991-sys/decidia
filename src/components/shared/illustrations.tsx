import { useId } from "react";

/** Illustrations d'états vides : boussole posée sur des vagues, dans le dégradé Océan Bleu. */
function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#2f6bff" />
        <stop offset="1" stopColor="#00c2ff" />
      </linearGradient>
    </defs>
  );
}

export function IllustrationJournal({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 200 140" fill="none" className={className} aria-hidden>
      <Defs id={id} />
      <circle cx="100" cy="64" r="46" fill={`url(#${id})`} opacity="0.08" />
      <circle cx="100" cy="64" r="32" stroke={`url(#${id})`} strokeWidth="2" />
      <circle cx="100" cy="64" r="26" stroke="var(--border)" strokeWidth="1" strokeDasharray="2 5" />
      <path d="M100 40 L108 64 L100 88 L92 64 Z" fill={`url(#${id})`} />
      <path d="M100 40 L108 64 L100 64 Z" fill="var(--surface)" opacity="0.45" />
      <circle cx="100" cy="64" r="3" fill="var(--surface)" stroke={`url(#${id})`} strokeWidth="1.5" />
      <path d="M20 108 C 44 98, 62 118, 86 108 S 130 98, 154 108 S 184 116, 190 108" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      <path d="M10 122 C 36 112, 56 132, 82 122 S 128 112, 152 122 S 182 130, 196 122" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" opacity="0.45" />
      <path d="M26 134 C 48 126, 66 142, 88 134 S 130 126, 150 134" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" opacity="0.2" />
    </svg>
  );
}

export function IllustrationError({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 140" fill="none" className={className} aria-hidden>
      <circle cx="100" cy="64" r="44" fill="var(--amber)" opacity="0.1" />
      <circle cx="100" cy="64" r="30" stroke="var(--amber)" strokeWidth="2" />
      <path d="M100 48 V68" stroke="var(--amber)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="79" r="2.6" fill="var(--amber)" />
      <path d="M24 112 C 48 102, 66 122, 90 112 S 134 102, 158 112 S 186 120, 192 112" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M12 126 C 38 116, 58 136, 84 126 S 130 116, 154 126" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" opacity="0.22" />
    </svg>
  );
}

export function IllustrationFollowup({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 200 140" fill="none" className={className} aria-hidden>
      <Defs id={id} />
      <rect x="40" y="22" width="120" height="86" rx="14" fill="var(--surface)" stroke="var(--border)" />
      <path d="M58 82 L78 62 L94 74 L124 44 L142 58" stroke={`url(#${id})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="142" cy="58" r="5" fill={`url(#${id})`} />
      <path d="M58 96 H110" stroke="var(--border)" strokeWidth="3" strokeLinecap="round" />
      <path d="M26 124 C 52 114, 70 134, 96 124 S 142 114, 168 124" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}
