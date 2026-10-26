import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default async function Privacy({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  return (
    <LegalPage
      title={t("privacyTitle")}
      updated={t("updated")}
      sections={[
        { h: "Données collectées", p: ["Ton e-mail et ton nom (compte), les décisions que tu décris, tes réponses de contexte, les rapports générés et tes suivis. Pour l'analyse anonyme, un identifiant technique signé est stocké dans un cookie."] },
        { h: "Pourquoi nous les utilisons", p: ["Pour produire tes analyses, conserver ton journal de décisions, t'envoyer les relances J+14 et J+30, gérer ton abonnement et mesurer le coût du service. Nous ne vendons aucune donnée."] },
        { h: "Sous-traitants", p: ["Hébergement et base de données (Supabase, Vercel), modèle d'IA (Anthropic), paiement (Stripe), e-mails (Resend) et mesure d'audience (PostHog, activée uniquement si tu l'acceptes dans la bannière, jamais si ton navigateur envoie Do Not Track). Le texte de ta décision est transmis au fournisseur d'IA pour produire le rapport."] },
        { h: "Tes droits (RGPD)", p: ["Tu peux exporter toutes tes données et supprimer ton compte à tout moment depuis Réglages. La suppression efface définitivement tes décisions, rapports et suivis. Pour toute demande, écris-nous à l'adresse indiquée dans les mentions légales."] },
        { h: "Conservation", p: ["Tes données sont conservées tant que ton compte existe. Les analyses anonymes non rattachées à un compte sont supprimées après 90 jours."] },
        { h: "Avertissement", p: ["Decidia est une aide à la décision, pas un conseil juridique, financier ou médical."] },
      ]}
    />
  );
}
