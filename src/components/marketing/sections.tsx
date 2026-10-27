import { getTranslations } from "next-intl/server";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StaticGauge } from "@/components/report/static-gauge";
import { getSample } from "@/lib/sample-report";
import { getLocale } from "next-intl/server";
import { PLANS } from "@/lib/stripe/plans";

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-2">{children}</p>
);

const SectionTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={cn("mt-3 max-w-[18em] font-serif text-4xl leading-[1.05] text-balance sm:text-5xl lg:text-6xl", className)}>{children}</h2>
);

/* ---------- Hero ---------- */
const rise = (delay: number) => ({ animationDelay: `${delay}s` });
const RISE = "motion-safe:animate-[hero-rise_0.7s_cubic-bezier(0.22,1,0.36,1)_both]";

export async function Hero() {
  const t = await getTranslations("landing");
  return (
    <div className="relative isolate overflow-hidden">
      {/* Atmosphère : halo bleu en haut à droite et quadrillage fin qui s'estompe */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(55%_60%_at_72%_0%,var(--glow),transparent_72%)]" />
        <div className="absolute inset-x-0 top-0 h-[560px] bg-[linear-gradient(var(--hairline)_1px,transparent_1px),linear-gradient(90deg,var(--hairline)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(65%_75%_at_50%_0%,black,transparent)]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-14 pb-12 pt-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:pb-16 lg:pt-24">
          <div>
            <p className={cn("inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3.5 py-1.5 text-[12.5px] text-muted backdrop-blur", RISE)} style={rise(0)}>
              <span aria-hidden className="size-1.5 rounded-full bg-ocean" />
              {t("eyebrow")}
            </p>
            <h1 className="mt-6 font-serif text-[clamp(3rem,6.6vw,5.4rem)] leading-[0.98] tracking-tight">
              {t("h1a")} <span className="whitespace-nowrap text-ocean italic">{t("h1b")}</span>
            </h1>
            <p className="mt-6 max-w-[33em] text-lg leading-relaxed text-muted">{t("lead")}</p>
            <div className={cn("mt-9 flex flex-wrap items-center gap-x-6 gap-y-4", RISE)} style={rise(0.28)}>
              <Button asChild size="lg"><Link href="/new">{t("cta")} <ArrowRight /></Link></Button>
              <Link href="/exemple" className="group inline-flex items-center gap-1.5 text-[15px] font-medium text-foreground underline-offset-4 hover:underline">
                {t("ctaSecondary")}
                <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
            <ul className={cn("mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted-2", RISE)} style={rise(0.36)}>
              {(t.raw("points") as string[]).map((p) => (
                <li key={p} className="flex items-center gap-1.5"><Check className="size-3.5 text-accent-cyan" strokeWidth={3} aria-hidden />{p}</li>
              ))}
            </ul>
          </div>

          <div className="relative lg:pb-24 lg:pl-4">
            <div className={cn("relative rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-pop)] sm:p-6", RISE)} style={rise(0.2)} aria-label={t("demoLabel")}>
              <div className="flex items-center justify-between">
                <Eyebrow>{t("demoLabel")}</Eyebrow>
                <span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[11px] text-muted">{t("demoProfile")}</span>
              </div>
              <p className="mt-3 min-h-[4.6em] text-[15.5px] leading-relaxed">
                {t("demoText")}
                <span aria-hidden className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-[3px] bg-[var(--ocean-to)] motion-safe:animate-[blink_1.1s_steps(1)_infinite]" />
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {(t.raw("demoChips") as string[]).map((c, i) => (
                  <li key={c} className={cn("rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[12.5px] text-primary", RISE)} style={rise(0.7 + i * 0.12)}>{c}</li>
                ))}
              </ul>

              <div className="mt-5 grid gap-3 rounded-2xl border border-border bg-background p-4 text-sm">
                <p className={cn("flex gap-3 border-l-2 border-amber pl-3 text-muted", RISE)} style={rise(1.4)}>
                  <b className="shrink-0 pt-0.5 font-mono text-xs tracking-widest text-amber">{t("demoNo")}</b>
                  <span>{t("demoNoText")}</span>
                </p>
                <p className={cn("flex gap-3 border-l-2 border-primary pl-3 text-muted", RISE)} style={rise(1.9)}>
                  <b className="shrink-0 pt-0.5 font-mono text-xs tracking-widest text-primary">{t("demoInstead")}</b>
                  <span>{t("demoInsteadText")}</span>
                </p>
                <div className={cn("pt-1", RISE)} style={rise(2.4)}>
                  <div className="flex items-baseline justify-between text-xs text-muted-2">
                    <span className="font-mono uppercase tracking-widest">{t("demoMeta")}</span>
                    <span className="font-mono text-foreground tabular-nums">64 / 100</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden>
                    <div className="h-full w-[64%] rounded-full bg-ocean motion-safe:animate-[meter-fill_1.2s_cubic-bezier(0.22,1,0.36,1)_2.5s_both]" />
                  </div>
                </div>
              </div>
            </div>

            <div className={cn("mt-4 rounded-2xl border border-amber-line bg-amber-soft p-4 text-[13px] shadow-[var(--shadow-card)] lg:absolute lg:bottom-2 lg:left-0 lg:mt-0 lg:w-[280px]", RISE)} style={rise(2.9)} aria-hidden>
              <p className="font-mono text-[10.5px] uppercase tracking-widest text-amber">⚠ {t("demoDevil")}</p>
              <p className="mt-1.5 leading-snug text-muted">{t("demoDevilText")}</p>
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 border-t border-border py-2 sm:grid-cols-4">
          {(t.raw("proof") as { k: string; v: string }[]).map((p, i) => (
            <div key={p.k} className={cn("px-1 py-5 sm:px-6", i === 0 && "sm:pl-0", i > 0 && "sm:border-l sm:border-border", i % 2 === 1 && "border-l border-border sm:border-l")}>
              <dt className="font-mono text-xl font-medium tabular-nums text-foreground sm:text-2xl">{p.k}</dt>
              <dd className="mt-1 text-[13px] text-muted-2">{p.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/* ---------- Pourquoi pas ChatGPT ---------- */
export async function WhySection() {
  const t = await getTranslations("landing.why");
  const cards = t.raw("cards") as { t: string; x: string; ok: string }[];
  return (
    <section id="why" className="scroll-mt-20 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <SectionTitle>{t("title")}</SectionTitle>
        <p className="mt-4 max-w-[40em] text-muted">{t("sub")}</p>
        <div className="mt-10 grid gap-3.5 sm:grid-cols-2">
          {cards.map((c) => (
            <article key={c.t} className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="text-[17px] font-semibold">{c.t}</h3>
              <p className="mt-3 text-sm text-muted-2 line-through decoration-muted-2/60">{c.x}</p>
              <p className="mt-3 text-[14.5px] leading-relaxed">
                <span className="mr-1.5 bg-ocean bg-clip-text font-mono text-[11px] uppercase tracking-widest text-transparent">{t("label")} ·</span>
                {c.ok}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Démo de rapport ---------- */
export async function DemoSection() {
  const t = await getTranslations("landing.demo");
  const rt = await getTranslations("report");
  const r = getSample(await getLocale()).report;
  return (
    <section className="pb-20 lg:pb-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 rounded-3xl border border-border bg-surface p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <h2 className="mt-3 font-serif text-4xl leading-[1.05] text-balance sm:text-5xl">{t("title")}</h2>
            <p className="mt-4 max-w-[34em] text-muted">{t("sub")}</p>
            <Button asChild className="mt-7" variant="secondary" size="lg"><Link href="/exemple">{t("cta")} →</Link></Button>
          </div>
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4" aria-hidden>
            <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-border bg-background p-4 sm:gap-5 sm:p-5">
              <StaticGauge value={r.recommendation.confidence} size={96} label={rt("confidence")} />
              <p className="min-w-0 font-serif text-xl leading-tight sm:text-2xl">{r.summary}</p>
            </div>
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2.5 rounded-2xl border border-border bg-background p-4 sm:p-5">
              {r.options.slice(0, 3).map((o) => (
                <div key={o.title} className="grid min-w-0 gap-1.5">
                  <div className="flex justify-between gap-3 text-sm"><span className="min-w-0 truncate">{o.title}</span><span className="font-mono tabular-nums text-muted-2">{o.confidence}</span></div>
                  <div className="h-1.5 rounded-full bg-surface-2"><div className="h-full rounded-full bg-ocean" style={{ width: `${o.confidence}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-amber-line bg-amber-soft p-5 text-sm">
              <p className="font-mono text-[11px] uppercase tracking-widest text-amber">⚠ {rt("devil")}</p>
              <p className="mt-2 text-muted">{r.devils_advocate.strongest_objection}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Comment ça marche ---------- */
export async function HowSection() {
  const t = await getTranslations("landing.how");
  const steps = t.raw("steps") as { t: string; d: string; tags: string[] }[];
  return (
    <section id="how" className="scroll-mt-20 pb-20 lg:pb-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <SectionTitle>{t("title")}</SectionTitle>
        <ol className="mt-10 grid overflow-hidden rounded-2xl border border-border bg-surface md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.t} className="border-b border-border p-7 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-2">{t("step")} {i + 1}</span>
              <h3 className="mt-2 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{s.d}</p>
              {s.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {s.tags.map((g) => <span key={g} className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted">{g}</span>)}
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Différenciateurs ---------- */
export async function DiffSection() {
  const t = await getTranslations("landing.diff");
  const items = t.raw("items") as { t: string; d: string }[];
  return (
    <section className="pb-20 lg:pb-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <SectionTitle>{t("title")}</SectionTitle>
        <dl className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div key={it.t} className="border-t border-border pt-5">
              <dt className="font-serif text-2xl">{it.t}</dt>
              <dd className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{it.d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ---------- Les 13 modèles mentaux ---------- */
export async function ModelsSection() {
  const t = await getTranslations("landing.models");
  const items = t.raw("items") as { n: string; d: string }[];
  return (
    <section id="models" className="scroll-mt-20 pb-20 lg:pb-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <SectionTitle>{t("title")}</SectionTitle>
        <p className="mt-4 max-w-[42em] text-muted">{t("sub")}</p>
        <ul className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <li key={m.n} className="group bg-surface p-5 transition-colors duration-150 hover:bg-surface-2">
              <h3 className="font-serif text-2xl leading-tight">{m.n}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{m.d}</p>
            </li>
          ))}
          <li className="flex flex-col justify-between gap-4 bg-surface p-5 sm:col-span-1 lg:col-span-2">
            <h3 className="font-serif text-3xl leading-tight text-ocean">{t("tile.t")}</h3>
            <Link href="/exemple" className="group inline-flex w-fit items-center gap-1.5 text-[15px] font-medium hover:underline">
              {t("tile.cta")} <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}

/* ---------- Grille Océan Bleu ---------- */
export async function ErrcSection() {
  const t = await getTranslations("landing.errc");
  const cells = t.raw("cells") as { k: string; q: string }[];
  const tones = ["text-danger", "text-muted", "text-primary", "text-accent-cyan"];
  return (
    <section className="pb-20 lg:pb-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <div>
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <SectionTitle>{t("title")}</SectionTitle>
          <p className="mt-4 max-w-[34em] leading-relaxed text-muted">{t("sub")}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {cells.map((c, i) => (
            <div key={c.k} className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
              <p className={cn("font-mono text-xs font-medium uppercase tracking-widest", tones[i])}>{c.k}</p>
              <p className="mt-2 font-serif text-2xl leading-snug">{c.q}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Tarifs ---------- */
export async function PricingSection({ founderOpen = true }: { founderOpen?: boolean }) {
  const t = await getTranslations("pricing");
  const free = t.raw("free.features") as string[];
  const pro = t.raw("pro.features") as string[];
  return (
    <section id="pricing" className="scroll-mt-20 pb-20 lg:pb-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <SectionTitle>{t("title")}</SectionTitle>
        <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7">
            <h3 className="font-serif text-3xl">{t("free.name")}</h3>
            <p className="font-serif text-6xl leading-none">{t("free.price")}</p>
            <ul className="grid gap-2.5 text-[14.5px] text-muted">
              {free.map((f) => <li key={f} className="flex gap-2.5"><Check className="mt-0.5 size-4 shrink-0 text-accent-cyan" />{f}</li>)}
            </ul>
            <Button asChild variant="secondary" className="mt-auto"><Link href="/new">{t("free.cta")}</Link></Button>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-transparent p-7 [background:linear-gradient(var(--surface),var(--surface))_padding-box,linear-gradient(135deg,#2f6bff,#00c2ff)_border-box]">
            {founderOpen && <span className="w-fit rounded-full bg-ocean px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest text-white">{t("pro.tag")}</span>}
            <h3 className="font-serif text-3xl">{t("pro.name")}</h3>
            <p className="font-serif text-6xl leading-none">{PLANS.pro.price} <small className="font-sans text-sm text-muted-2">{t("pro.per")}</small></p>
            {founderOpen && <p className="text-sm text-primary">{t("pro.founder")}</p>}
            <ul className="grid gap-2.5 text-[14.5px] text-muted">
              {pro.map((f) => <li key={f} className="flex gap-2.5"><Check className="mt-0.5 size-4 shrink-0 text-accent-cyan" />{f}</li>)}
            </ul>
            <Button asChild className="mt-auto"><Link href="/login?next=/settings">{t("pro.cta")}</Link></Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
export async function FaqSection() {
  const t = await getTranslations("faq");
  const items = t.raw("items") as { q: string; a: string }[];
  return (
    <section id="faq" className="scroll-mt-20 pb-20 lg:pb-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <SectionTitle>{t("title")}</SectionTitle>
        <div className="mt-8">
          {items.map((it) => (
            <details key={it.q} className="group border-t border-border py-5 last:border-b">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {it.q}
                <span aria-hidden className="font-mono text-muted-2 group-open:hidden">+</span>
                <span aria-hidden className="hidden font-mono text-muted-2 group-open:inline">–</span>
              </summary>
              <p className="mt-3 max-w-[46em] text-[15px] leading-relaxed text-muted">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
