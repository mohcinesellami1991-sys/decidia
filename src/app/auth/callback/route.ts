import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { clearAnonCookie, readAnonId } from "@/lib/anon";
import { claimAnonDecisions } from "@/lib/db";

/** Retour du lien magique ou de Google : crée la session, rattache l'analyse anonyme, redirige. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/journal";
  // Redirection limitée aux chemins internes.
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/journal";

  if (!code) return NextResponse.redirect(`${origin}/login?error=1`);

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/login?error=1`);

  const { data } = await supabase.auth.getUser();
  const anonId = await readAnonId().catch(() => null);
  if (data.user && anonId) {
    await claimAnonDecisions(data.user.id, anonId);
    clearAnonCookie(await cookies());
  }
  return NextResponse.redirect(`${origin}${next}`);
}
