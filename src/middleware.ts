import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/lib/i18n/routing";

const intl = createIntlMiddleware(routing);

const PROTECTED = /^(?:\/en)?\/(journal|settings|decision)(\/|$)/;

export default async function middleware(request: NextRequest) {
  const response = intl(request);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) =>
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    },
  );
  const { data } = await supabase.auth.getUser();

  if (!data.user && PROTECTED.test(request.nextUrl.pathname)) {
    const isEn = request.nextUrl.pathname.startsWith("/en");
    const url = request.nextUrl.clone();
    url.pathname = isEn ? "/en/login" : "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
