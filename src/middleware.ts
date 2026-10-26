import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/lib/i18n/routing";
import { supabaseConfigured } from "@/lib/supabase/config";

const intl = createIntlMiddleware(routing);

const PROTECTED = /^(?:\/en)?\/(journal|settings|decision)(\/|$)/;
// Seules ces pages ont besoin de la session : la landing et les pages publiques restent statiques et rapides.
const NEEDS_SESSION = /^(?:\/en)?\/(journal|settings|decision|analysis|new|login)(\/|$)/;

function loginRedirect(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = request.nextUrl.pathname.startsWith("/en") ? "/en/login" : "/login";
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export default async function middleware(request: NextRequest) {
  const response = intl(request);
  const path = request.nextUrl.pathname;

  if (!supabaseConfigured() || !NEEDS_SESSION.test(path)) return response;

  try {
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => list.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    });
    // Limite d'attente : un Supabase lent ne doit pas bloquer la navigation.
    const { data } = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("auth_timeout")), 4000)),
    ]);
    if (!data.user && PROTECTED.test(path)) return loginRedirect(request);
  } catch (e) {
    console.error("[middleware] session", e instanceof Error ? e.message : e);
    if (PROTECTED.test(path)) return loginRedirect(request);
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
