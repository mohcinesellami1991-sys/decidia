import type { Report } from "@/lib/ai/schemas";

export const SAMPLE_TITLE = "Quitter mon CDI pour lancer une box de café en ligne";
export const SAMPLE_PROBLEM = "Je veux quitter mon CDI en janvier pour lancer une box de café de spécialité en ligne. J'ai 12 000 € d'économies.";

export const SAMPLE_REPORT: Report = {
  summary: "Pas en janvier. Teste d'abord, quitte ensuite.",
  diagnosis:
    "Le marché du café de spécialité existe, mais tu financerais une hypothèse non vérifiée avec 100 % de tes économies. Valide la demande auprès d'inconnus pendant que ton salaire tombe encore.",
  models_used: [
    { name: "Inversion", insight: "Si tu voulais que cette box échoue, il suffirait de quitter ton emploi avant de savoir si des inconnus achètent." },
    { name: "Coût d'opportunité", insight: "Quitter ton CDI coûte ton salaire de 6 à 12 mois, pas seulement tes 12 000 € d'économies." },
    { name: "Pensée de second ordre", insight: "Sans revenu, tu accepteras des clients et des prix qui abîment la marque dès le départ." },
    { name: "Biais du survivant", insight: "Les fondateurs de box qui ont réussi racontent leur saut. Les nombreux qui ont échoué se taisent." },
    { name: "Paris asymétriques", insight: "Tester coûte peu et peut rapporter beaucoup. Tout miser coûte tout pour un gain comparable." },
  ],
  options: [
    {
      title: "A · Précommander 30 box en gardant ton CDI",
      pros: ["Risque financier quasi nul", "Tu mesures la vraie demande avant de t'engager"],
      cons: ["Lancement plus lent de 2 mois", "Charge de travail le soir et le week-end"],
      confidence: 74,
      risks: ["Fatigue", "Précommandes uniquement issues de ton entourage"],
    },
    {
      title: "B · Quitter en janvier et tout miser",
      pros: ["Temps plein dès le départ"],
      cons: ["Environ 6 mois de trésorerie (hypothèse : 2 000 € de dépenses par mois)", "Aucune vente test", "Pression sur chaque décision"],
      confidence: 38,
      risks: ["Épuisement de la trésorerie avant la première vague de clients"],
    },
    {
      title: "C · Passer à 4 jours et lancer en parallèle",
      pros: ["Un jour entier par semaine dédié au projet", "Salaire conservé à 80 %"],
      cons: ["Dépend de l'accord de ton employeur"],
      confidence: 61,
      risks: ["Refus de l'employeur", "Dispersion entre les deux activités"],
    },
  ],
  errc: {
    eliminate: ["Les box « surprise » à 30 € que personne ne finit"],
    reduce: ["Le nombre de références : 2 cafés par mois, pas 6"],
    raise: ["La traçabilité : torréfacteur, altitude, date de torréfaction"],
    create: ["Une fiche de dégustation guidée pour apprendre à goûter"],
  },
  devils_advocate: {
    strongest_objection:
      "Des précommandes auprès de ton entourage ne prouvent rien. Tes amis achètent par gentillesse, pas parce que le produit répond à un besoin.",
    blind_spots: [
      "Tu n'as pas dit d'où viendront les 30 premiers clients.",
      "Le coût d'acquisition en ligne n'est pas estimé dans tes chiffres.",
      "La logistique d'expédition (emballage, casse, retours) est peut-être sous-estimée.",
    ],
    verdict_change:
      "Si tu as déjà une audience qualifiée (par exemple 100 abonnés à une newsletter café), passe à l'option C et accélère.",
  },
  recommendation: {
    choice: "Option A, avec un seuil de décision chiffré",
    confidence: 64,
    why: "Quitte ton CDI seulement si tu atteins 30 précommandes payées par des inconnus, avec un coût d'acquisition sous 12 € par client (hypothèse à vérifier). Hypothèses à confirmer : marge brute de 45 %, panier moyen de 24 €.",
  },
  action_plan: [
    { step: "Créer une page de précommande simple avec paiement", deadline: "J+7", success_metric: "Page en ligne, paiement testé" },
    { step: "Contacter 200 clients potentiels qui ne te connaissent pas", deadline: "J+21", success_metric: "Au moins 5 % de réponses" },
    { step: "Atteindre 30 précommandes payées", deadline: "J+42", success_metric: "30 clients hors de ton cercle proche" },
  ],
  risks: [
    { risk: "Aucune demande hors de ton entourage", probability: "high", impact: "high", mitigation: "Test payant avant toute démission" },
    { risk: "Coût d'acquisition trop élevé", probability: "medium", impact: "high", mitigation: "Seuil maximal de 12 € par client" },
    { risk: "Rupture d'approvisionnement", probability: "low", impact: "medium", mitigation: "Deux torréfacteurs partenaires" },
  ],
  followup_questions: [
    "Combien de personnes qualifiées peux-tu toucher sans publicité ?",
    "Quel est ton coût réel de livraison par colis ?",
  ],
};
