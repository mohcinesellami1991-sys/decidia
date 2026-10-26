import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdmin, hasSupabase } from "@/lib/supabase/server";
import { ipHash } from "@/lib/anon";

const Input = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  consent: z.literal(true),
  locale: z.enum(["fr", "en"]).default("fr"),
  website: z.string().max(0).optional(), // champ piège anti-robots
});

export async function POST(req: Request) {
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (!hasSupabase()) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const admin = createAdmin();
  const ip = await ipHash();
  const since = new Date(Date.now() - 3_600_000).toISOString();
  const { count } = await admin
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("type", "waitlist")
    .eq("ip_hash", ip)
    .gte("created_at", since);
  if ((count ?? 0) >= 5) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  await admin.from("usage_events").insert({ type: "waitlist", ip_hash: ip });

  const { error } = await admin
    .from("waitlist")
    .insert({ email: parsed.data.email, locale: parsed.data.locale, consent: true });
  if (error?.code === "23505") return NextResponse.json({ status: "already" });
  if (error) return NextResponse.json({ error: "db_failed" }, { status: 500 });
  return NextResponse.json({ status: "ok" });
}
