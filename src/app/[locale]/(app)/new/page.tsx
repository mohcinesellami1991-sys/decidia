import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NewForm } from "@/components/app/new-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("new") };
}

export default async function NewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("new");
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-serif text-5xl leading-[1.05] text-balance sm:text-6xl">{t("title")}</h1>
      <p className="mb-10 mt-4 max-w-[38em] text-lg text-muted">{t("sub")}</p>
      <NewForm />
    </div>
  );
}
