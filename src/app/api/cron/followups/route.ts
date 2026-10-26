import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdmin } from "@/lib/supabase/server";
import { appUrl } from "@/lib/stripe";
import FollowupEmail, { followupSubject } from "@/emails/followup";

export const maxDuration = 60;

/** Cron Vercel (quotidien) : envoie les relances J+14 / J+30 arrivées à échéance. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: "resend_not_configured" }, { status: 503 });

  const admin = createAdmin();
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM ?? "Decidia <hello@getdecidia.com>";

  const { data: due } = await admin
    .from("followups")
    .select("id, kind, decision_id, decisions!inner(id, title, locale, user_id)")
    .is("sent_at", null)
    .is("answered_at", null)
    .lte("due_at", new Date().toISOString())
    .limit(100);

  let sent = 0;
  let skipped = 0;
  for (const f of due ?? []) {
    const d = (Array.isArray(f.decisions) ? f.decisions[0] : f.decisions) as
      | { id: string; title: string; locale: string; user_id: string | null }
      | undefined;
    if (!d?.user_id) continue;

    // Si le point J+14 a déjà été fait, on n'envoie pas le J+30.
    const { count } = await admin
      .from("followups")
      .select("id", { count: "exact", head: true })
      .eq("decision_id", d.id)
      .not("answered_at", "is", null);
    if ((count ?? 0) > 0) {
      await admin.from("followups").update({ sent_at: new Date().toISOString() }).eq("id", f.id);
      skipped++;
      continue;
    }

    const { data: profile } = await admin.from("profiles").select("email").eq("id", d.user_id).single();
    if (!profile?.email) continue;
    const locale = d.locale === "en" ? "en" : "fr";
    const kind = f.kind as "d14" | "d30";
    const prefix = locale === "en" ? "/en" : "";
    const { error } = await resend.emails.send({
      from,
      to: profile.email,
      subject: followupSubject(locale, kind),
      react: FollowupEmail({ title: d.title, url: `${appUrl()}${prefix}/decision/${d.id}/followup`, locale, kind }),
    });
    if (error) {
      console.error("[cron] resend", error);
      continue;
    }
    await admin.from("followups").update({ sent_at: new Date().toISOString() }).eq("id", f.id);
    sent++;
  }
  return NextResponse.json({ sent, skipped });
}
