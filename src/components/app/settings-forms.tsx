"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

export function ProfileForm({ userId, fullName, persona }: { userId: string; fullName: string; persona: string }) {
  const t = useTranslations("settings");
  const p = useTranslations("new.personas");
  const c = useTranslations("common");
  const [name, setName] = useState(fullName);
  const [per, setPer] = useState(persona);
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await createClient().from("profiles").update({ full_name: name, persona: per }).eq("id", userId);
    setSaved(!error);
  }

  return (
    <form onSubmit={save} className="grid gap-5">
      <div className="grid gap-2">
        <label htmlFor="name" className="font-mono text-xs uppercase tracking-widest text-muted-2">{t("name")}</label>
        <Input id="name" value={name} onChange={(e) => { setName(e.target.value); setSaved(false); }} maxLength={80} autoComplete="name" />
      </div>
      <fieldset className="grid gap-2">
        <legend className="mb-1 font-mono text-xs uppercase tracking-widest text-muted-2">{t("persona")}</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup">
          {(["entrepreneur", "individual", "manager"] as const).map((k) => (
            <label key={k} className={cn("cursor-pointer rounded-full border px-4 py-2 text-sm has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring", per === k ? "border-primary/50 bg-primary/15" : "border-border bg-surface text-muted")}>
              <input type="radio" name="persona" className="sr-only" checked={per === k} onChange={() => { setPer(k); setSaved(false); }} />
              {p(k)}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="secondary">{c("save")}</Button>
        {saved && <span role="status" className="text-sm text-success">{t("saved")}</span>}
      </div>
    </form>
  );
}

export function BillingActions({ plan }: { plan: "free" | "pro" | "team" }) {
  const t = useTranslations("settings");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function go(url: string) {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error();
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div>
        {plan === "free" ? (
          <Button onClick={() => go("/api/stripe/checkout")} disabled={loading}>{t("upgrade")}</Button>
        ) : (
          <Button variant="secondary" onClick={() => go("/api/stripe/portal")} disabled={loading}>{t("manage")}</Button>
        )}
      </div>
      {error && <p role="alert" className="text-sm text-danger">Action indisponible pour le moment. Réessaie dans un instant.</p>}
    </div>
  );
}

export function DataActions() {
  const t = useTranslations("settings");
  const c = useTranslations("common");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function remove() {
    setBusy(true);
    setError(false);
    const res = await fetch("/api/account/delete", { method: "POST" });
    if (res.ok) window.location.href = "/";
    else {
      setError(true);
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8">
      <div>
        <Button asChild variant="secondary"><a href="/api/account/export" download><Download />{t("export")}</a></Button>
        <p className="mt-2 text-sm text-muted-2">{t("exportSub")}</p>
      </div>
      <div className="rounded-2xl border border-danger/40 p-5">
        <h3 className="font-medium">{t("delete")}</h3>
        <p className="mt-1 text-sm text-muted">{t("deleteSub")}</p>
        {!confirming ? (
          <Button className="mt-4" variant="secondary" onClick={() => setConfirming(true)}>{t("delete")}</Button>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="danger" onClick={remove} disabled={busy}>{t("deleteConfirm")}</Button>
            <Button variant="ghost" onClick={() => setConfirming(false)} disabled={busy}>{c("cancel")}</Button>
          </div>
        )}
        {error && <p role="alert" className="mt-3 text-sm text-danger">La suppression a échoué. Réessaie ou contacte le support.</p>}
      </div>
    </div>
  );
}
