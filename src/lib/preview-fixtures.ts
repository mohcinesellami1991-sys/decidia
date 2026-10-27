import type { JournalRow } from "@/components/app/journal-view";

/** Données fictives pour le banc d'essai visuel (/preview/*), jamais affichées en production. */
export const PREVIEW_JOURNAL: JournalRow[] = [
  { id: "00000000-0000-4000-8000-000000000001", title: "Quitter mon CDI pour lancer une box de café en ligne", status: "decided", confidence_score: 64, created_at: "2026-10-26T09:12:00Z" },
  { id: "00000000-0000-4000-8000-000000000002", title: "Dois-je recruter mon premier salarié ou continuer seul ?", status: "analyzed", confidence_score: 71, created_at: "2026-10-12T14:30:00Z" },
  { id: "00000000-0000-4000-8000-000000000003", title: "Baisser mes prix de 20 % pour battre un concurrent moins cher", status: "success", confidence_score: 58, created_at: "2026-09-18T08:05:00Z" },
  { id: "00000000-0000-4000-8000-000000000004", title: "Pivoter vers le B2B après 6 mois de stagnation", status: "partial", confidence_score: 49, created_at: "2026-08-29T16:45:00Z" },
  { id: "00000000-0000-4000-8000-000000000005", title: "Ouvrir une boutique physique à Lyon", status: "failed", confidence_score: 33, created_at: "2026-07-03T10:00:00Z" },
];

export const PREVIEW_QUESTIONS = [
  { question: "Quel est ton objectif chiffré à 6 mois ?", example: "Ex. : 30 clients payants" },
  { question: "Quelles sont tes contraintes principales, en argent et en temps ?", example: "Ex. : 12 000 € d'économies, 10 h par semaine" },
  { question: "Qu'as-tu déjà testé auprès de vrais clients ?", example: "Ex. : rien encore, ou 3 entretiens" },
];
