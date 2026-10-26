"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { track } from "@/components/shared/analytics";

export function WaitlistForm() {
  const t = useTranslations("landing.waitlist");
  const locale = useLocale();
  const [state, setState] = useState<"idle" | "loading" | "ok" | "already" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), consent: form.get("consent") === "on", locale, website: form.get("website") ?? "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setState(data.status === "already" ? "already" : "ok");
        track("waitlist_joined");
      } else setState("error");
    } catch {
      setState("error");
    }
  }

  if (state === "ok" || state === "already") {
    return <p role="status" className="rounded-xl border border-success/40 bg-success-soft p-4 text-sm text-success">{state === "ok" ? t("done") : t("already")}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3" noValidate={false}>
      <label htmlFor="wl-email" className="font-mono text-xs uppercase tracking-widest text-muted-2">{t("label")}</label>
      <Input id="wl-email" name="email" type="email" required autoComplete="email" placeholder={t("placeholder")} className="h-12 text-base" />
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <label className="flex items-start gap-2.5 text-[13px] text-muted">
        <input name="consent" type="checkbox" required className="mt-0.5 size-4 accent-[#2f6bff]" />
        {t("consent")}
      </label>
      <Button type="submit" size="lg" disabled={state === "loading"}>{t("cta")}</Button>
      {state === "error" ? <p role="alert" className="text-sm text-danger">{t("error")}</p> : <p className="text-xs text-muted-2">{t("note")}</p>}
    </form>
  );
}
