import { createHmac, randomUUID, timingSafeEqual, createHash } from "node:crypto";
import { cookies, headers } from "next/headers";

const COOKIE = "decidia_anon";
const MAX_AGE = 60 * 60 * 24 * 90;

function secret() {
  const s = process.env.ANON_SECRET;
  if (s && s.length >= 32) return s;
  // On ne réutilise jamais la clé service_role pour signer un cookie : en production, ANON_SECRET est obligatoire.
  if (process.env.NODE_ENV !== "production") return "decidia-dev-only-secret-not-for-production";
  throw new Error("ANON_SECRET manquant ou trop court (32 caractères minimum)");
}

const sign = (id: string) => createHmac("sha256", secret()).update(id).digest("base64url");

function verify(value: string | undefined): string | null {
  if (!value) return null;
  const [id, sig] = value.split(".");
  if (!id || !sig) return null;
  const expected = sign(id);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b) ? id : null;
}

/** Lit l'identifiant anonyme signé, sans en créer. */
export async function readAnonId(): Promise<string | null> {
  return verify((await cookies()).get(COOKIE)?.value);
}

/** Lit ou crée l'identifiant anonyme (à appeler depuis une route API ou une action). */
export async function ensureAnonId(): Promise<string> {
  const store = await cookies();
  const existing = verify(store.get(COOKIE)?.value);
  if (existing) return existing;
  const id = randomUUID();
  store.set(COOKIE, `${id}.${sign(id)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return id;
}

export function clearAnonCookie(store: Awaited<ReturnType<typeof cookies>>) {
  store.delete(COOKIE);
}

/** Empreinte de l'IP (jamais stockée en clair). */
export async function ipHash(): Promise<string> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  return createHash("sha256").update(`${ip}:${secret()}`).digest("hex").slice(0, 32);
}
