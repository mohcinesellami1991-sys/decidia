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

export const SAMPLE_TITLE_EN = "Quit my job to launch an online coffee box";
export const SAMPLE_PROBLEM_EN = "I want to quit my job in January to launch an online specialty coffee box. I have €12,000 in savings.";

export const SAMPLE_REPORT_EN: Report = {
  summary: "Not in January. Test first, quit later.",
  diagnosis:
    "The specialty coffee market exists, but you would be funding an unverified hypothesis with 100% of your savings. Validate demand with strangers while your salary still lands.",
  models_used: [
    { name: "Inversion", insight: "If you wanted this box to fail, quitting your job before knowing whether strangers will buy would do it." },
    { name: "Opportunity cost", insight: "Quitting costs you 6 to 12 months of salary, not just your €12,000 in savings." },
    { name: "Second-order thinking", insight: "With no income, you will accept customers and prices that damage the brand from day one." },
    { name: "Survivorship bias", insight: "Founders who succeeded tell the story of their leap. The many who failed stay silent." },
    { name: "Asymmetric bets", insight: "Testing costs little and can pay a lot. Betting everything costs everything for a comparable gain." },
  ],
  options: [
    {
      title: "A · Pre-sell 30 boxes while keeping your job",
      pros: ["Almost no financial risk", "You measure real demand before committing"],
      cons: ["Launch is 2 months slower", "Evening and weekend workload"],
      confidence: 74,
      risks: ["Fatigue", "Pre-orders coming only from people you know"],
    },
    {
      title: "B · Quit in January and bet everything",
      pros: ["Full-time from day one"],
      cons: ["About 6 months of runway (assumption: €2,000 monthly spend)", "No test sales", "Pressure on every decision"],
      confidence: 38,
      risks: ["Cash runs out before the first wave of customers"],
    },
    {
      title: "C · Go to 4 days a week and launch in parallel",
      pros: ["One full day a week for the project", "80% of salary kept"],
      cons: ["Depends on your employer agreeing"],
      confidence: 61,
      risks: ["Employer refuses", "Split focus between both jobs"],
    },
  ],
  errc: {
    eliminate: ["“Surprise” boxes at €30 that nobody finishes"],
    reduce: ["Number of references: 2 coffees a month, not 6"],
    raise: ["Traceability: roaster, altitude, roast date"],
    create: ["A guided tasting sheet that teaches people how to taste"],
  },
  devils_advocate: {
    strongest_objection:
      "Pre-orders from people you know prove nothing. Friends buy out of kindness, not because the product meets a need.",
    blind_spots: [
      "You have not said where the first 30 customers will come from.",
      "Online customer acquisition cost is not estimated in your numbers.",
      "Shipping logistics (packaging, breakage, returns) may be underestimated.",
    ],
    verdict_change:
      "If you already have a qualified audience (say 100 coffee newsletter subscribers), go for option C and move faster.",
  },
  recommendation: {
    choice: "Option A, with a quantified decision threshold",
    confidence: 64,
    why: "Quit your job only if you reach 30 paid pre-orders from strangers at an acquisition cost under €12 per customer (assumption to verify). Assumptions to confirm: 45% gross margin, €24 average basket.",
  },
  action_plan: [
    { step: "Build a simple pre-order page with payment", deadline: "D+7", success_metric: "Page live, payment tested" },
    { step: "Contact 200 potential customers who don't know you", deadline: "D+21", success_metric: "At least 5% reply" },
    { step: "Reach 30 paid pre-orders", deadline: "D+42", success_metric: "30 customers outside your close circle" },
  ],
  risks: [
    { risk: "No demand beyond your circle", probability: "high", impact: "high", mitigation: "Paid test before any resignation" },
    { risk: "Acquisition cost too high", probability: "medium", impact: "high", mitigation: "Hard ceiling of €12 per customer" },
    { risk: "Supply disruption", probability: "low", impact: "medium", mitigation: "Two partner roasters" },
  ],
  followup_questions: [
    "How many qualified people can you reach without ads?",
    "What is your real shipping cost per parcel?",
  ],
};

export function getSample(locale: string) {
  return locale === "en"
    ? { title: SAMPLE_TITLE_EN, problem: SAMPLE_PROBLEM_EN, report: SAMPLE_REPORT_EN, date: "26 Oct 2026" }
    : { title: SAMPLE_TITLE, problem: SAMPLE_PROBLEM, report: SAMPLE_REPORT, date: "26 oct. 2026" };
}
