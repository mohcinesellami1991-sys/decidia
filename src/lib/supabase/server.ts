import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminJs } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabaseConfigured } from "./config";

export function hasSupabase() {
  return supabaseConfigured();
}

/** Client lié à la session de l'utilisateur (RLS appliquée). */
export async function createClient() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            /* appelé depuis un Server Component : la session est rafraîchie par le middleware */
          }
        },
      },
    },
  );
}

/** Client service (contourne la RLS). Serveur uniquement : webhooks, cron, analyses anonymes. */
export function createAdmin() {
  return createAdminJs(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
