"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Lock } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { track } from "@/components/shared/analytics";

export function SignupWall({ next }: { next: string }) {
  const t = useTranslations("wall");
  return (
    <aside role="complementary" className="rounded-3xl border border-transparent p-7 sm:p-9 [background:linear-gradient(var(--surface),var(--surface))_padding-box,linear-gradient(135deg,#2f6bff,#00c2ff)_border-box]">
      <Lock className="size-5 text-primary" aria-hidden />
      <h2 className="mt-3 font-serif text-4xl leading-tight">{t("signupTitle")}</h2>
      <p className="mt-2 max-w-[34em] text-muted">{t("signupSub")}</p>
      <Button asChild size="lg" className="mt-6" onClick={() => track("signup_wall_click")}>
        <Link href={`/login?next=${encodeURIComponent(next)}`}>{t("signupCta")} →</Link>
      </Button>
    </aside>
  );
}

export function PaywallCard() {
  const t = useTranslations("wall");
  const e = useTranslations("errors");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  async function checkout() {
    setLoading(true);
    setFailed(false);
    track("checkout_started");
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error("no_url");
    } catch {
      setFailed(true);
      setLoading(false);
    }
  }

  return (
    <aside className="rounded-3xl border border-transparent p-7 sm:p-9 [background:linear-gradient(var(--surface),var(--surface))_padding-box,linear-gradient(135deg,#2f6bff,#00c2ff)_border-box]">
      <h2 className="font-serif text-4xl leading-tight text-balance">{t("paywallTitle")}</h2>
      <p className="mt-2 max-w-[36em] text-muted">{t("paywallSub")}</p>
      <ul className="mt-5 grid gap-2 text-[15px] text-muted">
        {(t.raw("paywallPoints") as string[]).map((p) => (
          <li key={p} className="flex gap-2.5"><Check className="mt-0.5 size-4 shrink-0 text-[var(--ocean-to)]" />{p}</li>
        ))}
      </ul>
      <Button size="lg" className="mt-6" onClick={checkout} disabled={loading}>{t("paywallCta")}</Button>
      {failed && <p role="alert" className="mt-3 text-sm text-danger">{e("checkoutFailed")}</p>}
    </aside>
  );
}
