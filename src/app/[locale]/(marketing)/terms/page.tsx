import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Conditions d'utilisation" };

export default async function Terms({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  return (
    <LegalPage
      title={t("termsTitle")}
      updated={t("updated")}
      sections={[
        { h: "Service", p: ["Decidia fournit des analyses de décision générées par IA. Les résultats sont des aides à la réflexion et ne garantissent aucun résultat."] },
        { h: "Aucun conseil réglementé", p: ["Decidia ne fournit pas de conseil juridique, financier, fiscal ou médical. Pour ces sujets, consulte un professionnel qualifié. Tu restes seul responsable de tes décisions."] },
        { h: "Abonnement", p: ["L'offre Pro est facturée mensuellement via Stripe, sans engagement. Tu peux résilier à tout moment depuis le portail d'abonnement. L'usage est illimité dans une limite raisonnable."] },
        { h: "Usage acceptable", p: ["Il est interdit de contourner les limites du service, de l'utiliser pour des contenus illicites ou d'extraire les modèles."] },
        { h: "Modification", p: ["Ces conditions peuvent évoluer. Les changements importants te seront notifiés par e-mail."] },
      ]}
    />
  );
}
