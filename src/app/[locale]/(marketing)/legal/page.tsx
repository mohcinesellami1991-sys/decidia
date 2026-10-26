import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Mentions légales" };

export default async function Legal({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  return (
    <LegalPage
      title={t("legalTitle")}
      updated={t("updated")}
      sections={[
        { h: "Éditeur", p: ["À compléter avant la mise en production : raison sociale, forme juridique, adresse, numéro d'immatriculation, directeur de la publication et e-mail de contact."] },
        { h: "Hébergement", p: ["Vercel Inc. (application) et Supabase (base de données). Coordonnées complètes à ajouter."] },
      ]}
    />
  );
}
