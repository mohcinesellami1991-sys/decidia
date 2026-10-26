import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { hasSupabase } from "@/lib/supabase/server";
import { getLatestReport, getOwnedDecision, getViewer, isPaid } from "@/lib/db";
import { ReportPdf } from "@/lib/pdf/report-pdf";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!hasSupabase()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const { id } = await ctx.params;
  const viewer = await getViewer();
  if (!viewer.userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isPaid(viewer)) return NextResponse.json({ error: "paywall" }, { status: 402 });

  const decision = await getOwnedDecision(id, viewer);
  if (!decision) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const latest = await getLatestReport(decision.id);
  if (!latest) return NextResponse.json({ error: "no_report" }, { status: 404 });

  const locale = decision.locale === "en" ? "en" : "fr";
  const date = new Date(latest.createdAt).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const buffer = await renderToBuffer(createElement(ReportPdf, { title: decision.title, date, report: latest.report, locale }));
  const filename = `decidia-${decision.id.slice(0, 8)}.pdf`;
  return new NextResponse(new Uint8Array(buffer), {
    headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="${filename}"`, "cache-control": "private, no-store" },
  });
}
