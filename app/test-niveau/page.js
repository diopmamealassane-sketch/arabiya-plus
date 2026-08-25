"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, Sparkles, Check, Lock, CheckCircle2, Target } from "lucide-react";
import { arabicAnswersMatch } from "@/lib/arabicNormalize";

// ------------------------------------------------------------------
// Banque de vocabulaire — 6 mots/expressions représentatifs par cycle,
// tirés du contenu réel des 6 cycles du cours (A1 à C2). Chaque cycle
// est maintenant réellement disponible, donc chaque niveau peut être
// objectivement testé (plus d'estimation approximative au-delà de A2).
// "typeable" = true pour les mots courts qu'on peut raisonnablement
// demander de taper en arabe ; false pour les expressions plus longues,
// testées uniquement en QCM.
// ------------------------------------------------------------------
const WORD_BANK = {
  A1: [
    { ar: "مَرْحَبًا", fr: "bonjour", typeable: true },
    { ar: "أَب", fr: "père", typeable: true },
    { ar: "وَاحِد", fr: "un", typeable: true },
    { ar: "أَحْمَر", fr: "rouge", typeable: true },
    { ar: "خُبْز", fr: "pain", typeable: true },
    { ar: "بَيْت", fr: "maison", typeable: true },
    { ar: "أُمّ", fr: "mère", typeable: true },
    { ar: "أَخ", fr: "frère", typeable: true },
    { ar: "أُخْت", fr: "sœur", typeable: true },
    { ar: "اِثْنَان", fr: "deux", typeable: true },
    { ar: "ثَلَاثَة", fr: "trois", typeable: true },
    { ar: "أَرْبَعَة", fr: "quatre", typeable: true },
    { ar: "خَمْسَة", fr: "cinq", typeable: true },
    { ar: "أَزْرَق", fr: "bleu", typeable: true },
    { ar: "أَخْضَر", fr: "vert", typeable: true },
    { ar: "أَصْفَر", fr: "jaune", typeable: true },
    { ar: "مَاء", fr: "eau", typeable: true },
    { ar: "حَلِيب", fr: "lait", typeable: true },
    { ar: "تُفَّاح", fr: "pomme", typeable: true },
    { ar: "مَدْرَسَة", fr: "école", typeable: true },
    { ar: "كِتَاب", fr: "livre", typeable: true },
    { ar: "قَلَم", fr: "stylo", typeable: true },
    { ar: "بَاب", fr: "porte", typeable: true },
    { ar: "شَمْس", fr: "soleil", typeable: true },
    { ar: "قَمَر", fr: "lune", typeable: true },
    { ar: "يَوْم", fr: "jour", typeable: true },
    { ar: "لَيْلَة", fr: "nuit", typeable: true },
    { ar: "صَبَاح الخَيْر", fr: "bonjour (le matin)", typeable: true },
    { ar: "مَسَاء الخَيْر", fr: "bonsoir", typeable: true },
    { ar: "شُكْرًا", fr: "merci", typeable: true },
    { ar: "مِن فَضْلِك", fr: "s'il te plaît", typeable: true },
    { ar: "نَعَم", fr: "oui", typeable: true },
    { ar: "لَا", fr: "non", typeable: true },
    { ar: "اِسْم", fr: "nom", typeable: true },
  ],
  A2: [
    { ar: "أَنَا", fr: "je / moi", typeable: true },
    { ar: "لِمَاذَا", fr: "pourquoi", typeable: true },
    { ar: "مَطَار", fr: "aéroport", typeable: true },
    { ar: "مَرِيض", fr: "malade", typeable: true },
    { ar: "طَوِيل", fr: "grand (une personne)", typeable: true },
    { ar: "إِنْتِرْنِت", fr: "internet", typeable: true },
    { ar: "أَمْس", fr: "hier", typeable: true },
    { ar: "اليَوْم", fr: "aujourd'hui", typeable: true },
    { ar: "غَدًا", fr: "demain", typeable: true },
    { ar: "مَتَى", fr: "quand", typeable: true },
    { ar: "أَيْنَ", fr: "où", typeable: true },
    { ar: "كَيْف", fr: "comment", typeable: true },
    { ar: "كَم", fr: "combien", typeable: true },
    { ar: "مَحَطَّة القِطَار", fr: "gare", typeable: true },
    { ar: "فُنْدُق", fr: "hôtel", typeable: true },
    { ar: "مُسْتَشْفَى", fr: "hôpital", typeable: true },
    { ar: "صَيْدَلِيَّة", fr: "pharmacie", typeable: true },
    { ar: "مَطْعَم", fr: "restaurant", typeable: true },
    { ar: "سُوق", fr: "marché", typeable: true },
    { ar: "نُقُود", fr: "argent", typeable: true },
    { ar: "بِطَاقَة", fr: "carte", typeable: true },
    { ar: "تَذْكِرَة", fr: "billet", typeable: true },
    { ar: "رِحْلَة", fr: "voyage", typeable: true },
    { ar: "عَائِلَة", fr: "famille", typeable: true },
    { ar: "صَدِيق", fr: "ami", typeable: true },
    { ar: "عَمَل", fr: "travail", typeable: true },
    { ar: "مُدِير", fr: "directeur", typeable: true },
    { ar: "مُوَظَّف", fr: "employé", typeable: true },
    { ar: "اِجْتِمَاع", fr: "réunion", typeable: true },
    { ar: "طَقْس", fr: "météo", typeable: true },
    { ar: "مُمْطِر", fr: "pluvieux", typeable: true },
    { ar: "مُشْمِس", fr: "ensoleillé", typeable: true },
    { ar: "بَارِد", fr: "froid", typeable: true },
  ],
  B1: [
    { ar: "سَأَذْهَب غَدًا", fr: "j'irai demain", typeable: true },
    { ar: "فِي رَأْيِي", fr: "à mon avis", typeable: true },
    { ar: "لَوْ كُنْتُ غَنِيًّا", fr: "si j'étais riche", typeable: false },
    { ar: "صَحَفِيّ", fr: "journaliste", typeable: true },
    { ar: "مُقَابَلَة عَمَل", fr: "entretien d'embauche", typeable: true },
    { ar: "وَاجِب مَنْزِلِيّ", fr: "devoir (à la maison)", typeable: true },
    { ar: "لَقَدْ ذَهَبْتُ", fr: "je suis allé", typeable: true },
    { ar: "كُنْتُ أَعْمَل", fr: "je travaillais", typeable: true },
    { ar: "سَوْفَ أُسَافِر", fr: "je voyagerai", typeable: true },
    { ar: "يَجِب أَن", fr: "il faut que", typeable: true },
    { ar: "مِن المُمْكِن أَن", fr: "il est possible que", typeable: false },
    { ar: "أَعْتَقِد أَنَّ", fr: "je pense que", typeable: true },
    { ar: "بِالنِّسْبَة لِي", fr: "en ce qui me concerne", typeable: false },
    { ar: "عَلَى الرَّغْم مِن", fr: "bien que / malgré", typeable: false },
    { ar: "مُنْذُ سَنَتَيْن", fr: "il y a deux ans", typeable: false },
    { ar: "تَخَرَّجْتُ", fr: "j'ai obtenu mon diplôme", typeable: true },
    { ar: "اِسْتَقَلْتُ", fr: "j'ai démissionné", typeable: true },
    { ar: "تَرْقِيَة", fr: "promotion", typeable: true },
    { ar: "رَاتِب", fr: "salaire", typeable: true },
    { ar: "عَقْد عَمَل", fr: "contrat de travail", typeable: true },
    { ar: "إِجَازَة", fr: "congé", typeable: true },
    { ar: "مَوْعِد طِبِّيّ", fr: "rendez-vous médical", typeable: true },
    { ar: "أَعْرَاض", fr: "symptômes", typeable: true },
    { ar: "وَصْفَة طِبِّيَّة", fr: "ordonnance", typeable: true },
    { ar: "تَأْمِين صِحِّيّ", fr: "assurance maladie", typeable: false },
    { ar: "خِبْرَة", fr: "expérience", typeable: true },
    { ar: "مَهَارَة", fr: "compétence", typeable: true },
    { ar: "هَدَف", fr: "objectif", typeable: true },
    { ar: "تَحَدٍّ", fr: "défi", typeable: true },
    { ar: "حَلّ", fr: "solution", typeable: true },
    { ar: "مُشْكِلَة", fr: "problème", typeable: true },
    { ar: "قَرَار", fr: "décision", typeable: true },
    { ar: "فُرْصَة", fr: "opportunité", typeable: true },
  ],
  B2: [
    { ar: "كُتِبَ", fr: "a été écrit", typeable: true },
    { ar: "قَالَ إِنَّهُ سَيَأْتِي", fr: "il a dit qu'il viendrait", typeable: false },
    { ar: "الرَّجُل الَّذِي يَعْمَل هُنَا", fr: "l'homme qui travaille ici", typeable: false },
    { ar: "بِالرَّغْم مِنْ ذَلِك", fr: "malgré cela", typeable: false },
    { ar: "تَغَيُّر المُنَاخ", fr: "le changement climatique", typeable: true },
    { ar: "الذَّكَاء الاِصْطِنَاعِيّ", fr: "l'intelligence artificielle", typeable: true },
    { ar: "اِقْتِصَاد", fr: "économie", typeable: true },
    { ar: "سِيَاسَة", fr: "politique", typeable: true },
    { ar: "دِيمُقْرَاطِيَّة", fr: "démocratie", typeable: true },
    { ar: "اِنْتِخَابَات", fr: "élections", typeable: true },
    { ar: "حُكُومَة", fr: "gouvernement", typeable: true },
    { ar: "بَرْلَمَان", fr: "parlement", typeable: true },
    { ar: "قَانُون", fr: "loi", typeable: true },
    { ar: "عَدَالَة", fr: "justice", typeable: true },
    { ar: "حَقّ الإِنْسَان", fr: "droit de l'homme", typeable: false },
    { ar: "مُجْتَمَع", fr: "société", typeable: true },
    { ar: "ثَقَافَة", fr: "culture", typeable: true },
    { ar: "تَقَالِيد", fr: "traditions", typeable: true },
    { ar: "هُوِيَّة", fr: "identité", typeable: true },
    { ar: "تَنَوُّع", fr: "diversité", typeable: true },
    { ar: "عَوْلَمَة", fr: "mondialisation", typeable: true },
    { ar: "تَنْمِيَة مُسْتَدَامَة", fr: "développement durable", typeable: false },
    { ar: "طَاقَة مُتَجَدِّدَة", fr: "énergie renouvelable", typeable: false },
    { ar: "تَلَوُّث", fr: "pollution", typeable: true },
    { ar: "اِنْبِعَاثَات", fr: "émissions", typeable: true },
    { ar: "أَزْمَة", fr: "crise", typeable: true },
    { ar: "تَضَخُّم", fr: "inflation", typeable: true },
    { ar: "بَطَالَة", fr: "chômage", typeable: true },
    { ar: "اِسْتِثْمَار", fr: "investissement", typeable: true },
    { ar: "مُنَافَسَة", fr: "concurrence", typeable: true },
    { ar: "اِبْتِكَار", fr: "innovation", typeable: true },
    { ar: "رِيَادَة الأَعْمَال", fr: "entrepreneuriat", typeable: false },
    { ar: "اِسْتِدَامَة", fr: "durabilité", typeable: true },
  ],
  C1: [
    { ar: "تَشَرَّفْنَا", fr: "enchanté (formel)", typeable: true },
    { ar: "سُخْرِيَة", fr: "ironie", typeable: true },
    { ar: "بِلَا أَدْنَى شَكّ", fr: "sans aucun doute", typeable: false },
    { ar: "مُفَاوَضَات ثُنَائِيَّة", fr: "négociations bilatérales", typeable: false },
    { ar: "اِسْتِعَارَة", fr: "métaphore", typeable: true },
    { ar: "فَلْسَفَة", fr: "philosophie", typeable: true },
    { ar: "مُفَارَقَة", fr: "paradoxe", typeable: true },
    { ar: "تَنَاقُض", fr: "contradiction", typeable: true },
    { ar: "جَدَل", fr: "controverse", typeable: true },
    { ar: "إِقْنَاع", fr: "persuasion", typeable: true },
    { ar: "حُجَّة", fr: "argument", typeable: true },
    { ar: "اِسْتِنْتَاج", fr: "déduction", typeable: true },
    { ar: "اِفْتِرَاض", fr: "hypothèse", typeable: true },
    { ar: "مَنْطِق", fr: "logique", typeable: true },
    { ar: "تَحْلِيل نَقْدِيّ", fr: "analyse critique", typeable: false },
    { ar: "مَنْهَجِيَّة", fr: "méthodologie", typeable: true },
    { ar: "اِسْتِقْرَاء", fr: "induction", typeable: true },
    { ar: "تَجْرِيد", fr: "abstraction", typeable: true },
    { ar: "تَأْوِيل", fr: "interprétation", typeable: true },
    { ar: "سِيَاق", fr: "contexte", typeable: true },
    { ar: "دَلَالَة", fr: "signification / sémantique", typeable: true },
    { ar: "بَلَاغِيّ", fr: "rhétorique (adj.)", typeable: true },
    { ar: "أُسْلُوب", fr: "style", typeable: true },
    { ar: "نَبْرَة", fr: "ton", typeable: true },
    { ar: "إِيقَاع", fr: "rythme", typeable: true },
    { ar: "رَمْزِيَّة", fr: "symbolisme", typeable: true },
    { ar: "تَنَاصّ", fr: "intertextualité", typeable: true },
    { ar: "نَقْد أَدَبِيّ", fr: "critique littéraire", typeable: false },
    { ar: "مُصْطَلَح", fr: "terme / concept", typeable: true },
    { ar: "إِشْكَالِيَّة", fr: "problématique", typeable: true },
    { ar: "تَصَوُّر", fr: "conception / représentation", typeable: true },
    { ar: "تَفْكِيك", fr: "déconstruction", typeable: true },
    { ar: "تَرَابُط", fr: "cohérence", typeable: true },
  ],
  C2: [
    { ar: "لَهْجَة", fr: "dialecte", typeable: true },
    { ar: "تَرْجَمَة فَوْرِيَّة", fr: "interprétation simultanée", typeable: false },
    { ar: "حَكَوَاتِي", fr: "conteur traditionnel", typeable: true },
    { ar: "جَذْر ثُلَاثِيّ", fr: "racine trilitère", typeable: false },
    { ar: "صَحَافَة اِسْتِقْصَائِيَّة", fr: "journalisme d'investigation", typeable: false },
    { ar: "البَلَاغَة", fr: "l'éloquence", typeable: true },
    { ar: "فُصْحَى", fr: "arabe littéraire", typeable: true },
    { ar: "عَامِّيَّة", fr: "dialecte familier", typeable: true },
    { ar: "اِزْدِوَاجِيَّة لُغَوِيَّة", fr: "diglossie", typeable: false },
    { ar: "صَرْف", fr: "morphologie", typeable: true },
    { ar: "نَحْو", fr: "syntaxe / grammaire", typeable: true },
    { ar: "عَرُوض", fr: "métrique / prosodie", typeable: true },
    { ar: "قَافِيَة", fr: "rime", typeable: true },
    { ar: "بَحْر شِعْرِيّ", fr: "mètre poétique", typeable: false },
    { ar: "مَقَامَة", fr: "maqama (genre littéraire)", typeable: true },
    { ar: "أَدَب جَاهِلِيّ", fr: "littérature préislamique", typeable: false },
    { ar: "تُرَاث", fr: "patrimoine", typeable: true },
    { ar: "مَخْطُوطَة", fr: "manuscrit", typeable: true },
    { ar: "تَحْقِيق نَصِّيّ", fr: "édition critique de texte", typeable: false },
    { ar: "اِسْتِشْرَاق", fr: "orientalisme", typeable: true },
    { ar: "مُسْتَعْرِب", fr: "arabisant", typeable: true },
    { ar: "اِزْدِهَار حَضَارِيّ", fr: "épanouissement civilisationnel", typeable: false },
    { ar: "فِقْه اللُّغَة", fr: "philologie", typeable: false },
    { ar: "سِيَاسَة لُغَوِيَّة", fr: "politique linguistique", typeable: false },
    { ar: "تَعْرِيب", fr: "arabisation", typeable: true },
    { ar: "تَقْعِيد", fr: "normalisation / codification", typeable: true },
    { ar: "مُوَلَّد", fr: "néologisme", typeable: true },
    { ar: "مُعَرَّب", fr: "mot arabisé (emprunt)", typeable: true },
    { ar: "اِشْتِقَاق", fr: "dérivation", typeable: true },
    { ar: "جِنَاس", fr: "jeu de mots (paronomase)", typeable: true },
    { ar: "طِبَاق", fr: "antithèse", typeable: true },
    { ar: "اِسْتِطْرَاد", fr: "digression", typeable: true },
    { ar: "حِجَاج", fr: "argumentation rhétorique", typeable: true },
    { ar: "بَيَان", fr: "clarté d'expression / rhétorique", typeable: true },
  ],
};

// Nombre de questions objectives tirées au sort par cycle à chaque
// passage du test (le test garde 42 questions au total : 6 cycles ×
// 6 questions + 6 questions d'auto-évaluation). La banque ci-dessus
// est bien plus grande (200 mots/expressions) pour que chaque passage
// tire un échantillon différent et ne puisse pas être mémorisé.
const QUESTIONS_PER_CYCLE = 6;

const CYCLES = ["A1", "A2", "B1", "B2", "C1", "C2"];

const CYCLE_LABELS = {
  A1: "Cycle 1 — Débutant (A1)",
  A2: "Cycle 2 — Élémentaire (A2)",
  B1: "Cycle 3 — Intermédiaire (B1)",
  B2: "Cycle 4 — Intermédiaire supérieur (B2)",
  C1: "Cycle 5 — Avancé (C1)",
  C2: "Cycle 6 — Expert (C2)",
};

const CYCLE_DESCRIPTIONS = {
  A1: "Vous partez de zéro — parfait pour construire des bases solides.",
  A2: "Les fondations sont là. Direction la grammaire et le quotidien.",
  B1: "Vous savez déjà beaucoup de choses. Passons au passé, au futur et à l'opinion.",
  B2: "Bon niveau intermédiaire. Il est temps d'attaquer les nuances et l'argumentation.",
  C1: "Très bon niveau ! Direction les registres de langue et les sujets abstraits.",
  C2: "Niveau avancé confirmé. Cap sur la maîtrise quasi native de l'arabe.",
};

// ------------------------------------------------------------------
// Auto-évaluation — une question par cycle, pour recueillir le
// ressenti personnel de l'utilisateur en complément du test objectif.
// N'influence pas le calcul du niveau, affichée à titre indicatif.
// ------------------------------------------------------------------
const SELF_ASSESSMENT = [
  { cycle: "A1", prompt: "Je peux me présenter et saluer quelqu'un en arabe." },
  { cycle: "A2", prompt: "Je peux parler de ma vie quotidienne et poser des questions simples." },
  { cycle: "B1", prompt: "Je peux raconter un événement passé et donner mon avis." },
  { cycle: "B2", prompt: "Je peux débattre d'un sujet d'actualité et nuancer mes propos." },
  { cycle: "C1", prompt: "Je peux comprendre l'humour, l'ironie et un discours académique." },
  { cycle: "C2", prompt: "Je me sens à l'aise à l'oral et à l'écrit, à un niveau proche d'un natif." },
];
const SELF_OPTIONS = [
  { label: "Pas du tout", points: 0 },
  { label: "Un peu", points: 1 },
  { label: "Assez bien", points: 2 },
  { label: "Tout à fait", points: 3 },
];

const MASTERY_THRESHOLD = 0.8;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sample(arr, n) {
  return shuffle(arr).slice(0, n);
}

// Répartition cible des 6 questions objectives tirées par cycle :
// 4 questions de production (dictée en arabe / "comment dit-on en
// arabe") pour 2 questions à choix multiples (QCM), au lieu du 2/2/2
// précédent. La production ne peut pas se deviner au hasard — c'est
// ce qui empêche un niveau B1 de se retrouver classé C1/C2 par chance.
const KIND_PLAN = ["type_ar", "type_ar", "mcq_fr_to_ar", "type_ar", "type_ar", "mcq_ar_to_fr"];

// Construit le test : pour chaque cycle (A1 → C2, du plus facile au
// plus dur), on tire au hasard QUESTIONS_PER_CYCLE mots dans la banque
// (200 au total) puis on leur applique le plan de répartition
// ci-dessus, avant les 6 questions d'auto-évaluation à la fin. Comme
// l'échantillon change à chaque passage, le test ne peut pas être
// mémorisé ni deviné d'une tentative à l'autre.
function buildTest() {
  const objective = [];
  CYCLES.forEach((cycle) => {
    const pool = WORD_BANK[cycle];
    const words = sample(pool, Math.min(QUESTIONS_PER_CYCLE, pool.length));

    words.forEach((w, i) => {
      let kind = KIND_PLAN[i % KIND_PLAN.length];
      // Un mot/expression non "typeable" (trop long à saisir) retombe
      // sur la version QCM de la même direction de production.
      if (kind === "type_ar" && !w.typeable) kind = "mcq_fr_to_ar";

      const distractorPool = pool.filter((x) => x.ar !== w.ar);

      if (kind === "type_ar") {
        objective.push({ kind, cycle, prompt: w.fr, answer: w.ar });
      } else if (kind === "mcq_ar_to_fr") {
        const distractors = sample(distractorPool, Math.min(3, distractorPool.length)).map((d) => d.fr);
        objective.push({ kind, cycle, prompt: w.ar, answer: w.fr, options: shuffle([w.fr, ...distractors]) });
      } else {
        const distractors = sample(distractorPool, Math.min(3, distractorPool.length)).map((d) => d.ar);
        objective.push({ kind, cycle, prompt: w.fr, answer: w.ar, options: shuffle([w.ar, ...distractors]) });
      }
    });
  });

  const self = SELF_ASSESSMENT.map((item) => ({ kind: "self", cycle: item.cycle, prompt: item.prompt }));

  return [...objective, ...self];
}

// Détermine, à partir de la précision par cycle, le dernier cycle
// réellement maîtrisé (≥ 65 % de bonnes réponses) en parcourant du
// plus facile au plus dur. Le point de départ recommandé est le
// cycle suivant — c'est la logique classique d'un test de placement :
// trouver la limite exacte des connaissances acquises.
function computeRecommendation(cycleStats) {
  let confirmedIndex = -1;
  for (let i = 0; i < CYCLES.length; i++) {
    const stat = cycleStats[CYCLES[i]];
    const pct = stat.total > 0 ? stat.correct / stat.total : 0;
    if (pct >= MASTERY_THRESHOLD) confirmedIndex = i;
    else break;
  }

  if (confirmedIndex === CYCLES.length - 1) {
    return {
      confirmedIndex,
      startIndex: confirmedIndex,
      level: "Expert (C2) — et au-delà !",
      cycleLabel: CYCLE_LABELS.C2,
      unit: "Unité 10 — L'éloquence et l'art du discours",
      description:
        "Vous maîtrisez l'ensemble du contenu testé, jusqu'au niveau C2. Votre niveau est proche d'une maîtrise quasi native — bravo !",
      mastered: true,
    };
  }

  const startIndex = confirmedIndex + 1;
  const startCycle = CYCLES[startIndex];
  return {
    confirmedIndex,
    startIndex,
    level:
      startIndex === 0
        ? "Débutant complet (A1)"
        : `${CYCLE_LABELS[startCycle].split("—")[1].trim()}`,
    cycleLabel: CYCLE_LABELS[startCycle],
    unit: "Unité 1",
    description: CYCLE_DESCRIPTIONS[startCycle],
    mastered: false,
  };
}

export default function PlacementTestPage() {
  // Important : le tirage aléatoire ne doit JAMAIS se produire pendant le
  // rendu initial (serveur ou hydratation), sinon React détecte un
  // décalage entre ce que le serveur a généré et ce que le client
  // recalcule. On calcule donc les questions uniquement après le
  // montage, côté navigateur.
  const [questions, setQuestions] = useState(null);
  useEffect(() => {
    setQuestions(buildTest());
  }, []);

  const [index, setIndex] = useState(0);
  const [cycleStats, setCycleStats] = useState(() =>
    Object.fromEntries(CYCLES.map((c) => [c, { correct: 0, total: 0 }]))
  );
  const [selfStats, setSelfStats] = useState(() => Object.fromEntries(CYCLES.map((c) => [c, null])));
  const [selected, setSelected] = useState(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [typedResult, setTypedResult] = useState(null); // null | true | false
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState("idle"); // idle | sending | sent | error
  const [emailError, setEmailError] = useState("");

  if (!questions) {
    return (
      <main className="geo-bg min-h-screen flex items-center justify-center px-4">
        <p className="text-parchment-dim text-sm">Préparation de votre test…</p>
      </main>
    );
  }

  const done = index >= questions.length;
  const current = !done ? questions[index] : null;
  const objectiveCount = CYCLES.length * QUESTIONS_PER_CYCLE;

  function advance() {
    setSelected(null);
    setTypedAnswer("");
    setTypedResult(null);
    setIndex((i) => i + 1);
  }

  function recordObjective(cycle, correct) {
    setCycleStats((prev) => ({
      ...prev,
      [cycle]: { correct: prev[cycle].correct + (correct ? 1 : 0), total: prev[cycle].total + 1 },
    }));
  }

  function handleMcq(opt) {
    if (selected !== null) return;
    setSelected(opt);
    const correct = opt === current.answer;
    recordObjective(current.cycle, correct);
    setTimeout(advance, 450);
  }

  function handleSelf(opt) {
    if (selected !== null) return;
    setSelected(opt.label);
    setSelfStats((prev) => ({ ...prev, [current.cycle]: opt.points }));
    setTimeout(advance, 300);
  }

  function handleTypeSubmit(e) {
    e.preventDefault();
    alert("handleTypeSubmit appelé ! typedAnswer=" + typedAnswer + " answer=" + current.answer);
    if (typedResult !== null) return;
    try {
      const correct = arabicAnswersMatch(typedAnswer, current.answer);
      alert("Résultat comparaison : " + correct);
      setTypedResult(correct);
      recordObjective(current.cycle, correct);
      setTimeout(advance, 1100);
    } catch (err) {
      alert("ERREUR : " + err.message);
    }
  

  function restart() {
    window.location.reload(); // régénère un nouveau tirage aléatoire
  }

  async function handleSendEmail(e, reco) {
    e.preventDefault();
    if (!email || emailStatus === "sending" || emailStatus === "sent") return;
    setEmailStatus("sending");
    setEmailError("");
    try {
      const roadmap = CYCLES.map((cycle, i) => ({
        label: CYCLE_LABELS[cycle],
        mastered: i <= reco.confirmedIndex,
        isStart: i === reco.startIndex,
      }));
      const res = await fetch("/api/send-placement-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          level: reco.level,
          cycleLabel: reco.cycleLabel,
          unit: reco.unit,
          description: reco.description,
          roadmap,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Échec de l'envoi. Réessayez.");
      setEmailStatus("sent");
    } catch (err) {
      setEmailStatus("error");
      setEmailError(err.message || "Échec de l'envoi. Réessayez.");
    }
  }

  if (done) {
    const reco = computeRecommendation(cycleStats);
    return (
      <main className="geo-bg min-h-screen flex items-center justify-center px-4 py-12">
        <div className="bg-parchment text-ink rounded-2xl p-8 max-w-md w-full text-center float-in">
          <Sparkles className="mx-auto mb-3 text-gold" size={30} />
          <p className="uppercase tracking-widest text-sm text-[#8a8264] font-semibold mb-2">Résultat de votre test</p>
          <h2 className="text-2xl font-bold mb-1">{reco.level}</h2>
          <p className="text-base text-[#6b6350] mb-5">{reco.description}</p>

          <div className="bg-white border-2 border-gold/40 rounded-xl p-4 mb-6">
            <p className="text-sm uppercase tracking-wide text-[#8a8264] font-semibold mb-1">
              {reco.mastered ? "Pour continuer à progresser" : "Point de départ recommandé"}
            </p>
            <p className="font-bold">{reco.cycleLabel}</p>
            <p className="text-sm text-[#6b6350]">{reco.unit}</p>
          </div>

          <div className="text-left mb-6">
            <p className="text-sm uppercase tracking-wide text-[#8a8264] font-semibold mb-3">Votre parcours d'apprentissage</p>
            <div className="space-y-2">
              {CYCLES.map((cycle, i) => {
                const isMastered = i <= reco.confirmedIndex;
                const isStart = i === reco.startIndex && !reco.mastered;
                const isStartMastered = reco.mastered && i === reco.startIndex;
                let icon = <Lock size={16} className="text-black/25 shrink-0" />;
                let cls = "text-black/35";
                if (isMastered) {
                  icon = <CheckCircle2 size={16} className="text-teal shrink-0" />;
                  cls = "text-ink font-semibold";
                }
                if (isStart || isStartMastered) {
                  icon = <Target size={16} className="text-gold shrink-0" />;
                  cls = "text-ink font-bold";
                }
                return (
                  <div key={cycle} className={`flex items-center gap-2.5 text-sm ${cls}`}>
                    {icon}
                    <span>{CYCLE_LABELS[cycle]}</span>
                    {isMastered && !isStart && <span className="text-teal text-xs ml-auto">Maîtrisé</span>}
                    {(isStart || isStartMastered) && <span className="text-[#8a8264] text-xs ml-auto">Point de départ</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={(e) => handleSendEmail(e, reco)} className="text-left mb-6">
            <label className="text-sm uppercase tracking-wide text-[#8a8264] font-semibold mb-2 block">
              Recevoir ce résultat par email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={emailStatus === "sending" || emailStatus === "sent"}
                placeholder="vous@exemple.com"
                className="flex-1 min-w-0 border-2 border-black/15 rounded-xl px-3 py-2 text-sm disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={emailStatus === "sending" || emailStatus === "sent"}
                className="bg-ink text-white font-bold px-4 rounded-xl text-sm whitespace-nowrap disabled:opacity-50"
              >
                {emailStatus === "sending" ? "Envoi…" : emailStatus === "sent" ? "Envoyé ✓" : "Envoyer"}
              </button>
            </div>
            {emailStatus === "sent" && (
              <p className="text-sm text-teal mt-2 flex items-center gap-1">
                <Check size={14} /> Résultat envoyé à {email}
              </p>
            )}
            {emailStatus === "error" && <p className="text-sm text-[#8C3327] mt-2">{emailError}</p>}
          </form>

          <Link
            href="/signup"
            className="w-full bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold py-3 rounded-xl flex items-center justify-center gap-2"
          >
            Commencer gratuitement <ArrowRight size={20} />
          </Link>
          <button onClick={restart} className="w-full mt-3 py-2 text-sm text-[#8a8264] flex items-center justify-center gap-1">
            <RotateCcw size={14} /> Refaire le test (nouveau tirage aléatoire)
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="geo-bg min-h-screen px-4 py-10">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link href="/">
              <img src="/logo-mark.png" alt="Arabiya+" className="h-12 w-auto" />
            </Link>
            <span className="kufi text-base text-gold-light">Test de niveau</span>
          </div>
          <span className="text-sm opacity-60">
            {index + 1} / {questions.length}
          </span>
        </div>

        <div className="flex gap-1.5 mb-6">
          {questions.map((_, i) => (
            <div key={i} className="flex-1 h-2 rounded bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold to-gold-light transition-transform duration-300"
                style={{ transform: `scaleX(${i <= index ? 1 : 0})`, transformOrigin: "left" }}
              />
            </div>
          ))}
        </div>

        <div className="bg-parchment text-ink rounded-2xl p-6 float-in">
          {index === 0 && (
            <p className="text-sm text-[#8a8264] italic mb-4">
              Le test commence par les bases (A1) et devient progressivement plus difficile, jusqu'au niveau C2.
            </p>
          )}
          {index === objectiveCount && (
            <p className="text-sm text-[#8a8264] italic mb-4">
              Dernière partie — votre ressenti personnel, à titre indicatif.
            </p>
          )}

          <p
            className={
              current.kind !== "self" && /[\u0600-\u06FF]/.test(current.prompt)
                ? "arabic text-3xl text-center mb-5"
                : "font-semibold mb-5 text-base"
            }
            dir={current.kind !== "self" && /[\u0600-\u06FF]/.test(current.prompt) ? "rtl" : undefined}
          >
            {current.prompt}
          </p>

          {current.kind === "type_ar" && (
            <form onSubmit={handleTypeSubmit}>
              <p className="text-sm text-[#8a8264] mb-2">Tapez le mot en arabe :</p>
              <input
                type="text"
                dir="rtl"
                lang="ar"
                autoFocus
                disabled={typedResult !== null}
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                className={`arabic text-2xl w-full border-2 rounded-xl px-4 py-3 mb-3 text-center ${
                  typedResult === true ? "border-teal bg-teal/10" : typedResult === false ? "border-rust bg-rust/10" : "border-black/15"
                }`}
                placeholder="اكتب هنا"
              />
              {typedResult === false && (
                <p className="text-sm text-center text-[#8C3327] mb-3">
                  Réponse attendue : <span className="arabic text-lg">{current.answer}</span>
                </p>
              )}
              {typedResult === true && (
                <p className="text-sm text-center text-teal mb-3 flex items-center justify-center gap-1">
                  <Check size={16} /> Correct !
                </p>
              )}
              {typedResult === null && (
                <button type="submit" className="w-full bg-ink text-white font-bold py-3 rounded-xl">
                  Vérifier
                </button>
              )}
            </form>
          )}

          {(current.kind === "mcq_ar_to_fr" || current.kind === "mcq_fr_to_ar") && (
            <div className="flex flex-col gap-2">
              {current.options.map((opt) => {
                const isArabic = /[\u0600-\u06FF]/.test(opt);
                const isSel = selected === opt;
                const isRight = selected !== null && opt === current.answer;
                const isWrong = isSel && opt !== current.answer;
                let cls = "border-black/10 bg-white";
                if (isRight) cls = "border-teal bg-teal/10 text-[#1E5E56]";
                else if (isWrong) cls = "border-rust bg-rust/10 text-[#8C3327]";
                return (
                  <button
                    key={opt}
                    onClick={() => handleMcq(opt)}
                    disabled={selected !== null}
                    className={`text-left px-4 py-3 rounded-xl border-2 font-semibold text-base ${cls}`}
                  >
                    {isArabic ? (
                      <span className="arabic text-xl" dir="rtl">
                        {opt}
                      </span>
                    ) : (
                      opt
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {current.kind === "self" && (
            <div className="flex flex-col gap-2">
              {SELF_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleSelf(opt)}
                  disabled={selected !== null}
                  className={`text-left px-4 py-3 rounded-xl border-2 font-semibold text-base ${
                    selected === opt.label ? "border-ink-3 bg-black/5" : "border-black/10 bg-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-sm text-parchment-dim opacity-60 mt-6">
          Gratuit, sans inscription — {objectiveCount} questions couvrant les 6 niveaux du CECRL, du A1 au C2.
        </p>
      </div>
    </main>
  );
}
