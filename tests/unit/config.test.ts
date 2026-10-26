import { afterEach, describe, expect, it } from "vitest";
import { supabaseConfigured } from "../../src/lib/supabase/config";

const env = process.env as Record<string, string | undefined>;
const saved = { url: env.NEXT_PUBLIC_SUPABASE_URL, key: env.NEXT_PUBLIC_SUPABASE_ANON_KEY };
afterEach(() => {
  env.NEXT_PUBLIC_SUPABASE_URL = saved.url;
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY = saved.key;
});

describe("supabaseConfigured", () => {
  it("accepte une adresse https et une clé", () => {
    env.NEXT_PUBLIC_SUPABASE_URL = "https://exemple.supabase.co";
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "cle";
    expect(supabaseConfigured()).toBe(true);
  });

  it("refuse une adresse invalide (par exemple une clé collée à la place) sans lever d'erreur", () => {
    env.NEXT_PUBLIC_SUPABASE_URL = "sb_publishable_abc123";
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "cle";
    expect(supabaseConfigured()).toBe(false);
  });

  it("refuse les variables absentes ou un autre protocole", () => {
    env.NEXT_PUBLIC_SUPABASE_URL = undefined;
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY = undefined;
    expect(supabaseConfigured()).toBe(false);
    env.NEXT_PUBLIC_SUPABASE_URL = "ftp://exemple.co";
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "cle";
    expect(supabaseConfigured()).toBe(false);
  });
});
