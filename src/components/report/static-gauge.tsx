import { useId } from "react";

/** Jauge sans JavaScript ni animation, pour les pages statiques (landing, journal). Fichier serveur : n'embarque pas framer-motion. */
export function StaticGauge({ value, size = 96, label }: { value: number; size?: number; label: string }) {
  const R = 64;
  const len = 2 * Math.PI * R;
  const v = Math.max(0, Math.min(100, value));
  const id = useId();
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${label} ${v}/100`}>
      <svg viewBox="0 0 148 148" className="size-full -rotate-90" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2f6bff" />
            <stop offset="1" stopColor="#00c2ff" />
          </linearGradient>
        </defs>
        <circle cx="74" cy="74" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="10" />
        <circle cx="74" cy="74" r={R} fill="none" stroke={`url(#${id})`} strokeWidth="10" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - v / 100)} />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <b className="font-serif text-3xl font-normal leading-none tabular-nums">{v}</b>
      </div>
    </div>
  );
}
