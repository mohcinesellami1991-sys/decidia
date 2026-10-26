"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/browser";
import { track } from "@/components/shared/analytics";

export function LoginForm({ next, configured, hadError }: { next: string; configured: boolean; hadError: boolean }) {
  const t = useTranslations("auth");
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">(hadError ? "error" : "idle");

  const redirectTo = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function magic(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    setState("loading");
    const { error } = await createClient().auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } });
    setState(error ? "error" : "sent");
    if (!error) track("login_link_sent");
  }

  async function google() {
    setState("loading");
    const { error } = await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } });
    if (error) setState("error");
  }

  if (!configured) return <p role="alert" className="rounded-xl border border-amber-line bg-amber-soft p-4 text-sm">{t("notConfigured")}</p>;
  if (state === "sent") return <p role="status" className="rounded-xl border border-success/40 bg-success-soft p-4 text-sm text-success">{t("sent")}</p>;

  return (
    <div className="grid gap-5">
      <Button type="button" variant="secondary" size="lg" onClick={google} disabled={state === "loading"}>
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden><path fill="#4285F4" d="M23 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-4.9 3.4-8.4z"/><path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0 0 12 23.5z"/><path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4l3.8-3z"/><path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 0 0 1.8 6.8l3.8 3C6.5 7.4 9 5.4 12 5.4z"/></svg>
        {t("google")}
      </Button>
      <div className="flex items-center gap-3 text-xs text-muted-2" aria-hidden><span className="h-px flex-1 bg-border" />{t("or")}<span className="h-px flex-1 bg-border" /></div>
      <form onSubmit={magic} className="grid gap-3">
        <label htmlFor="email" className="font-mono text-xs uppercase tracking-widest text-muted-2">{t("email")}</label>
        <Input id="email" name="email" type="email" required autoComplete="email" placeholder="toi@entreprise.fr" className="h-12 text-base" />
        <Button type="submit" size="lg" disabled={state === "loading"}>{state === "loading" && <Loader2 className="animate-spin" />}{t("send")}</Button>
      </form>
      {state === "error" && <p role="alert" className="text-sm text-danger">{t("error")}</p>}
      <p className="text-xs text-muted-2">{t("consent")}</p>
    </div>
  );
}
