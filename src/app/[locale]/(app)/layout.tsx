import { setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/shared/site-header";
import { getViewer } from "@/lib/db";
import { hasSupabase } from "@/lib/supabase/server";

export default async function AppLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const viewer = hasSupabase() ? await getViewer().catch(() => null) : null;
  return (
    <>
      <SiteHeader variant="app" signedIn={Boolean(viewer?.userId)} />
      <main id="main" className="min-h-[70dvh]">{children}</main>
    </>
  );
}
