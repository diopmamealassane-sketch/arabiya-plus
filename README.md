# Arabiya+ — MVP

Application Next.js connectée à Supabase, implémentant le MVP défini dans les
documents de spécifications : parcours du Cycle 1 (A1), 5 types d'exercices,
audio natif, répétition espacée, gamification (XP/streak), et abonnement
Premium via Stripe.

Ce dépôt a été **construit et testé** (installation, build de production,
démarrage du serveur, migrations SQL exécutées sur un Postgres réel, RLS
vérifiée avec deux comptes utilisateurs distincts) avant d'être livré — voir
le détail de ces vérifications dans la conversation qui a produit ce projet.

## Stack

- **Frontend** : Next.js 14 (App Router), Tailwind CSS
- **Backend** : Supabase (Postgres, Auth, RLS)
- **Paiement** : Stripe Checkout + webhooks
- **Audio** : synthèse vocale du navigateur en développement (voir note
  ci-dessous) — à remplacer par des fichiers pré-enregistrés en production

## Structure

```
app/
  page.js                    — landing page
  login/, signup/            — authentification
  dashboard/                 — progression, liste des unités/leçons
  lesson/[lessonId]/         — moteur de leçon (server component qui
                                résout les mots, ne renvoie jamais la bonne
                                réponse au client avant validation)
  pricing/                   — page tarifs + déclenchement Stripe Checkout
  api/
    submit-answer/           — validation serveur de chaque réponse,
                                calcul XP, mise à jour de la file de
                                révision espacée (Leitner)
    create-checkout-session/ — crée la session Stripe
    stripe-webhook/          — seul point d'écriture du statut d'abonnement
components/
  LessonEngine.js             — logique d'interaction du prototype,
                                 connectée à /api/submit-answer
lib/
  supabase/client.js          — client navigateur (respecte la RLS)
  supabase/server.js          — client serveur session + client service-role
                                 (bypass RLS, réservé aux routes API)
  srs.js                       — algorithme de répétition espacée (Leitner)
middleware.js                  — rafraîchit la session Supabase
```

## Démarrage

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Appliquer le schéma : copier `supabase/migrations/` et `supabase/seed.sql`
   (livrés séparément) dans votre repo, puis :
   ```
   supabase link --project-ref VOTRE_PROJECT_REF
   supabase db push
   ```
3. Copier `.env.example` vers `.env.local` et renseigner les clés (Supabase
   Project Settings > API, Stripe Dashboard > Developers)
4. `npm install`
5. `npm run dev` → http://localhost:3000

## Point d'attention avant la mise en production

**L'audio utilise la synthèse vocale du navigateur** (`window.speechSynthesis`),
comme dans le prototype initial. C'est suffisant pour développer et démontrer,
mais conformément à la recommandation du document d'architecture (§6), il
faudra remplacer `word.audio_url` par de vrais enregistrements avant le
lancement public : la qualité et la disponibilité d'une voix arabe ne sont
pas garanties sur tous les appareils.

## Application mobile (PWA)

Le site est installable comme une application, sans passer par l'App Store
ou le Play Store :

- **Android (Chrome)** : bannière "Ajouter à l'écran d'accueil" automatique,
  ou menu ⋮ → "Installer l'application"
- **iOS (Safari)** : bouton Partager → "Sur l'écran d'accueil"

Une fois installée, l'app s'ouvre en plein écran (sans barre d'adresse),
avec sa propre icône, et reste utilisable brièvement hors connexion grâce
au service worker (`public/sw.js`).

C'est une PWA (Progressive Web App) : même code que le site, pas un second
projet à maintenir. La vraie application native (React Native, publiée sur
les stores) reste un projet séparé, prévu en V2 dans le plan de
développement.

## Ce qui n'est PAS encore fait

- Emails transactionnels (bienvenue, reçu, relance)
- Vue "révision quotidienne" dédiée (le back-end la supporte déjà via
  `user_word_review`, l'écran reste à construire)
- Badges par unité
- Pages marketing secondaires (à propos, etc.)
- Design responsive fin sur tous les écrans (testé aux tailles principales
  uniquement)

Ces éléments correspondent aux tâches P1/P2 du plan de développement — le
parcours P0 (inscription → leçon → progression → paiement) est fonctionnel
de bout en bout.
