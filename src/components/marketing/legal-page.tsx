import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";

export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: { h: string; p: string[] }[] }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <h1 className="font-serif text-5xl leading-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-2">{updated}</p>
        <div className="mt-10 grid gap-9">
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="font-serif text-2xl">{s.h}</h2>
              {s.p.map((x, i) => <p key={i} className="mt-2 leading-relaxed text-muted">{x}</p>)}
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
