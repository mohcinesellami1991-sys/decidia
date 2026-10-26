# Decidia

L'IA qui ose te dire non. SaaS d'aide à la décision : questions de contexte, modèles mentaux, grille Océan Bleu (ERRC), avocat du diable, rapport actionnable, puis suivi du résultat à J+14 et J+30.

Stack : Next.js 15 (App Router, RSC), TypeScript strict, Tailwind v4, Radix, Framer Motion, Supabase (Postgres, Auth, RLS), Vercel AI SDK + Anthropic Claude, Stripe, Resend + React Email, react-pdf, PostHog, next-intl (FR par défaut, EN prêt).

## Démarrer en local

```bash
npm install
cp .env.example .env.local      # puis renseigner les variables
npm run dev                      # http://localhost:3000
```

Sans variables, la landing, l'exemple de rapport (`/exemple`) et les pages légales fonctionnent. Le parcours d'analyse demande Supabase ; ajoute `DECIDIA_MOCK_AI=1` pour tester tout le parcours sans clé Anthropic.

Vérifications : `npm run check` (typecheck + lint + build) puis `npm run test:e2e` (Playwright, parcours publics + accessibilité axe WCAG AA, bureau et mobile).

## Déploiement

### 1. Supabase
1. Crée un projet **dédié à Decidia** (la migration ajoute un déclencheur sur `auth.users`, ne l'applique pas sur un projet utilisé par un autre site).
2. Applique `supabase/migrations/20261026000000_init.sql` (SQL Editor ou `supabase db push`).
3. Authentication → Providers : active **Email** (magic link) et **Google**. URL Configuration : Site URL = `https://getdecidia.com`, Redirect URLs = `https://getdecidia.com/auth/callback` (+ l'URL de preview Vercel).
4. Récupère l'URL, la clé `anon` et la clé `service_role`.

### 2. Vercel
1. Importe le dépôt, framework Next.js.
2. Renseigne toutes les variables de `.env.example` (Settings → Environment Variables). Les clés (`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `STRIPE_*`, `RESEND_API_KEY`, `ANON_SECRET`, `CRON_SECRET`) ne doivent jamais être préfixées `NEXT_PUBLIC_`.
3. Domaine : ajoute `getdecidia.com`.
4. Le cron `vercel.json` appelle `/api/cron/followups` chaque jour à 8 h UTC. Vercel envoie `Authorization: Bearer $CRON_SECRET`.

### 3. Stripe
1. Crée un produit **Pro** avec un prix récurrent 29 €/mois (`STRIPE_PRICE_PRO`) et un prix **fondateur** (`STRIPE_PRICE_FOUNDER`, valeur à décider, 19 €/mois dans les textes actuels). Les 100 premiers abonnés obtiennent le tarif fondateur (compteur `profiles.is_founder`).
2. Active le portail client (Billing → Customer portal).
3. Webhook : endpoint `https://getdecidia.com/api/stripe/webhook`, évènements `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Copie le secret dans `STRIPE_WEBHOOK_SECRET`.
4. Les offres Essentiel (9 €) et Équipe (79 €) sont prévues dans `src/lib/stripe/index.ts` avec `enabled: false`.

### 4. Resend
Vérifie le domaine d'envoi, crée la clé API, renseigne `EMAIL_FROM`.

### 5. PostHog
Renseigne `NEXT_PUBLIC_POSTHOG_KEY`. Évènements du funnel : `analysis_started`, `questions_answered`, `report_viewed`, `signup_wall_shown`, `paywall_shown`, `checkout_started`, `waitlist_joined`. Aucun évènement n'est envoyé si le navigateur envoie Do Not Track.

## Architecture

```
src/app/[locale]/(marketing)   landing, exemple, login, pages légales
src/app/[locale]/(app)         new, analysis/[id], journal, decision/[id]/followup, settings
src/app/api                    ai/{questions,analyze,followup}, stripe/*, cron/followups, pdf/[id], waitlist, account/*
src/lib/ai                     schémas Zod, prompts, moteur (streaming, nouvelle tentative, coût par appel)
src/lib/{db,limits,anon}.ts    accès données, quotas et limitation de débit, cookie anonyme signé
src/components/report          ConfidenceGauge, OptionCard, ERRCGrid, DevilsAdvocate, MentalModelChip, ActionPlan, RiskTable
supabase/migrations            schéma + RLS
```

### Moteur IA
- **Étape A** (questions) : modèle léger, 2 à 3 questions, filtre hors périmètre (médical, juridique grave).
- **Étape B** (analyse) : modèle d'analyse, sortie structurée validée par Zod (`finalizeReport` : bornes de scores, nombre d'options et de modèles), streaming NDJSON vers l'écran de progression, une nouvelle tentative automatique si la sortie est invalide, plafond de tokens.
- **Étape C** (suivi) : écart, leçon, plan ajusté.
- Chaque appel écrit une ligne dans `usage_events` (tokens, coût estimé). Requête utile : `select avg(cost_usd) from usage_events where type = 'analysis'`. Objectif : moins de 0,10 $ par analyse. Les tarifs se règlent par variables d'environnement.

### Quotas et sécurité
- 1 analyse gratuite (cookie anonyme signé HMAC, plafond par IP sur 24 h), rattachée au compte à l'inscription, puis Pro.
- Limitation de débit des routes IA par IP (hachée) et par utilisateur ; usage raisonnable Pro plafonné à 200 analyses / 30 jours.
- RLS sur toutes les tables ; plan, statut fondateur et identifiants Stripe ne sont modifiables que par le serveur.
- Clés API uniquement côté serveur ; en-têtes de sécurité dans `next.config.ts`.
- RGPD : export JSON et suppression de compte dans Réglages, consentement sur la liste d'attente.

Decidia est une aide à la décision, pas un conseil juridique, financier ou médical.
