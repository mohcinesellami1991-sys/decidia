import "server-only";
import { createAdmin } from "@/lib/supabase/server";
import type { Viewer } from "@/lib/db";
import { isPaid } from "@/lib/db";

export type Gate = { ok: true } | { ok: false; reason: "signup" | "paywall" | "rate" | "fair_use" };

const WINDOW_MIN = 10;
const PER_IP = 20;
const PER_USER = 30;
const FAIR_USE_PER_MONTH = 200;

async function countSince(filter: Record<string, string>, type: string | null, since: Date) {
  const admin = createAdmin();
  let q = admin.from("usage_events").select("id", { count: "exact", head: true }).gte("created_at", since.toISOString());
  for (const [k, v] of Object.entries(filter)) q = q.eq(k, v);
  if (type) q = q.eq("type", type);
  const { count } = await q;
  return count ?? 0;
}

/** Limitation de débit des routes IA : par IP et par utilisateur. */
export async function rateLimit(viewer: Viewer, ipHash: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MIN * 60_000);
  const [byIp, byUser] = await Promise.all([
    countSince({ ip_hash: ipHash }, null, since),
    viewer.userId ? countSince({ user_id: viewer.userId }, null, since) : Promise.resolve(0),
  ]);
  return byIp < PER_IP && byUser < PER_USER;
}

/**
 * Quota : 1 analyse gratuite (anonyme puis compte), ensuite Pro.
 * Les analyses anonymes sont aussi plafonnées par IP sur 24 h pour résister au vidage de cookies.
 */
export async function canStartAnalysis(viewer: Viewer, ipHash: string): Promise<Gate> {
  const admin = createAdmin();

  if (viewer.userId && isPaid(viewer)) {
    const since = new Date(Date.now() - 30 * 86_400_000);
    const used = await countSince({ user_id: viewer.userId }, "analysis", since);
    return used < FAIR_USE_PER_MONTH ? { ok: true } : { ok: false, reason: "fair_use" };
  }

  if (viewer.userId) {
    const { count } = await admin
      .from("decisions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", viewer.userId)
      .neq("status", "draft");
    return (count ?? 0) < 1 ? { ok: true } : { ok: false, reason: "paywall" };
  }

  if (viewer.anonId) {
    const { count } = await admin
      .from("decisions")
      .select("id", { count: "exact", head: true })
      .eq("anon_id", viewer.anonId)
      .neq("status", "draft");
    if ((count ?? 0) >= 1) return { ok: false, reason: "signup" };
  }
  const ipDay = await countSince({ ip_hash: ipHash }, "analysis", new Date(Date.now() - 86_400_000));
  return ipDay < 3 ? { ok: true } : { ok: false, reason: "signup" };
}
