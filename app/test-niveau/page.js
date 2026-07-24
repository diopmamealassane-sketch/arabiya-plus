"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";

// ------------------------------------------------------------------
// Partie 1 — 20 questions objectives, vocabulaire et grammaire réels
// du cours, classées en 3 paliers de difficulté croissante :
//   Palier 1 (index 0-7)   : A1 débutant (salutations, famille, couleurs, nombre)
//   Palier 2 (index 8-13)  : A1 confirmé (nombres avancés, temps, conversations, famille élargie)
//   Palier 3 (index 14-19) : A2 (pronoms, conjugaison du présent)
// ------------------------------------------------------------------
const OBJECTIVE = [
  { tier: 1, prompt: "مَرْحَبًا signifie :", options: ["Bonjour", "Merci", "Au revoir", "Oui"], answer: "Bonjour" },
  { tier: 1, prompt: "Comment dit-on « merci » ?", options: ["شُكْرًا", "مَرْحَبًا", "نَعَمْ", "لَا"], answer: "شُكْرًا" },
  { tier: 1, prompt: "أُم signifie :", options: ["Mère", "Père", "Frère", "Sœur"], answer: "Mère" },
  { tier: 1, prompt: "أَحْمَر signifie :", options: ["Rouge", "Vert", "Bleu", "Jaune"], answer: "Rouge" },
  { tier: 1, prompt: "أَخْضَر signifie :", options: ["Vert", "Rouge", "Bleu", "Jaune"], answer: "Vert" },
  { tier: 1, prompt: "خَمْسة correspond au chiffre :", options: ["5", "4", "6", "3"], answer: "5" },
  { tier: 1, prompt: "بَيْت signifie :", options: ["Maison", "Voiture", "Porte", "Livre"], answer: "Maison" },
  { tier: 1, prompt: "مَاء signifie :", options: ["Eau", "Pain", "Lait", "Thé"], answer: "Eau" },

  { tier: 2, prompt: "عَشَرَة correspond au chiffre :", options: ["10", "9", "8", "100"], answer: "10" },
  { tier: 2, prompt: "سِتُّون correspond au nombre :", options: ["Soixante", "Cinquante", "Soixante-dix", "Seize"], answer: "Soixante" },
  { tier: 2, prompt: "يَوْم signifie :", options: ["Jour", "Semaine", "Mois", "Année"], answer: "Jour" },
  { tier: 2, prompt: "مَا اسْمُكَ؟ signifie :", options: ["Comment tu t'appelles ?", "Comment vas-tu ?", "D'où viens-tu ?", "Merci"], answer: "Comment tu t'appelles ?" },
  { tier: 2, prompt: "عَمّ signifie :", options: ["Oncle (paternel)", "Oncle (maternel)", "Tante (paternelle)", "Cousin"], answer: "Oncle (paternel)" },
  { tier: 2, prompt: "صَبَاحُ الخَيْر signifie :", options: ["Bonjour (le matin)", "Bonsoir", "Bonne nuit", "À bientôt"], answer: "Bonjour (le matin)" },

  { tier: 3, prompt: "أَنْتِ correspond à :", options: ["Tu (féminin)", "Tu (masculin)", "Il", "Elle"], answer: "Tu (féminin)" },
  { tier: 3, prompt: "هُوَ correspond à :", options: ["Il", "Elle", "Tu (masculin)", "Nous"], answer: "Il" },
  { tier: 3, prompt: "آكُل signifie :", options: ["Je mange", "Tu manges", "Il mange", "Nous mangeons"], answer: "Je mange" },
  { tier: 3, prompt: "نَحْنُ correspond à :", options: ["Nous", "Je / moi", "Il", "Elle"], answer: "Nous" },
  { tier: 3, prompt: "تَأْكُلِين signifie :", options: ["Tu manges (féminin)", "Tu manges (masculin)", "Il mange", "Nous mangeons"], answer: "Tu manges (féminin)" },
  { tier: 3, prompt: "نَأْكُل signifie :", options: ["Nous mangeons", "Je mange", "Tu manges", "Elle mange"], answer: "Nous mangeons" },
];

// ------------------------------------------------------------------
// Partie 2 — 10 questions d'auto-évaluation (descripteurs façon CECRL),
// nécessaires pour estimer les niveaux B1 à C2 : le cours ne couvre pas
// encore ce contenu, donc impossible de le tester objectivement — ce
// sont vos propres mots qui permettent l'estimation ici.
// ------------------------------------------------------------------
const SELF_ASSESSMENT = [
  "Je peux me présenter et saluer quelqu'un en arabe.",
  "Je peux compter et donner des informations simples (âge, famille).",
  "Je peux comprendre des phrases simples sur des sujets familiers (achats, travail).",
  "Je peux raconter un événement passé ou décrire un projet simple.",
  "Je peux tenir une conversation spontanée avec un locuteur natif sans trop d'effort.",
  "Je peux comprendre un article de presse ou un bulletin d'actualités en arabe.",
  "Je peux exprimer une opinion nuancée sur un sujet complexe.",
  "Je peux comprendre un texte littéraire ou un discours formel sans difficulté.",
  "Je peux m'exprimer spontanément et avec précision sur des sujets complexes.",
  "Je me sens à l'aise à l'écrit comme à l'oral, à un niveau proche d'un natif.",
];
const SELF_OPTIONS = [
  { label: "Pas du tout", points: 0 },
  { label: "Un peu", points: 1 },
  { label: "Assez bien", points: 2 },
  { label: "Tout à fait", points: 3 },
];

// Score max : 20 questions objectives × 2 pts = 40, + 10 auto-éval × 3 pts = 30 → 70
function getRecommendation(score) {
  if (score <= 8) {
    return {
      level: "A1 — Débutant complet",
      unit: "Unité 1 — Se saluer",
      description: "Parfait pour démarrer depuis le tout début : l'alphabet, la prononciation, et vos premiers mots.",
      available: true,
    };
  }
  if (score <= 24) {
    return {
      level: "A1 — Débutant confirmé",
      unit: "Unité 4 — Les couleurs",
      description: "Les bases (salutations, famille, chiffres) semblent déjà acquises. Reprenez à partir des couleurs.",
      available: true,
    };
  }
  if (score <= 38) {
    return {
      level: "A2 — Élémentaire",
      unit: "Cycle 2, Unité 1 — Le présent",
      description: "Le vocabulaire de base est acquis. Direction la grammaire : pronoms et conjugaison au présent.",
      available: true,
    };
  }
  if (score <= 52) {
    return {
      level: "B1 — Intermédiaire (estimé)",
      unit: "Cycle 2, Unité 1 — Le présent",
      description: "Votre niveau dépasse probablement ce que le cours couvre pour l'instant. Le Cycle 3 (B1) est en préparation — en attendant, le Cycle 2 consolidera vos fondations grammaticales.",
      available: false,
    };
  }
  return {
    level: "B2 et au-delà (estimé)",
    unit: "Cycle 2, Unité 1 — Le présent",
    description: "Votre niveau semble avancé. Le contenu correspondant (B2 à C2) n'est pas encore disponible — le Cycle 2 vous permettra au moins de vérifier vos fondations pendant qu'on prépare la suite.",
    available: false,
  };
}

export default function PlacementTestPage() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [tier1Correct, setTier1Correct] = useState(0);
  const [skippedAdvanced, setSkippedAdvanced] = useState(false);

  const fullList = useMemo(
    () => [...OBJECTIVE, ...SELF_ASSESSMENT.map((prompt) => ({ kind: "self", prompt }))],
    []
  );

  const done = index >= fullList.length || (skippedAdvanced && index >= 8 && index < 20);
  const current = !done ? fullList[index] : null;
  const isObjective = current && current.answer !== undefined;

  // Total de questions affiché — plus court pour un débutant complet
  // détecté après le premier palier (adaptation réelle, pas juste un chiffre).
  const estimatedTotal = skippedAdvanced ? 8 + SELF_ASSESSMENT.length : fullList.length;
  const displayIndex = skippedAdvanced && index >= 20 ? index - 12 : index;

  function advance(nextScore, wasCorrectTier1) {
    let nextIndex = index + 1;

    // Fin du palier 1 (8 questions) : si le score y est très faible,
    // on considère un débutant complet et on saute directement à
    // l'auto-évaluation — inutile de l'ennuyer avec 12 questions de plus.
    if (index === 7) {
      const t1 = tier1Correct + (wasCorrectTier1 ? 1 : 0);
      if (t1 <= 2) {
        setSkippedAdvanced(true);
        nextIndex = 20; // début de l'auto-évaluation
      }
    }

    setScore(nextScore);
    setSelected(null);
    setIndex(nextIndex);
  }

  function handleObjective(opt) {
    if (selected !== null) return;
    setSelected(opt);
    const correct = opt === current.answer;
    if (index < 8) setTier1Correct((c) => c + (correct ? 1 : 0));
    setTimeout(() => advance(score + (correct ? 2 : 0), correct), 450);
  }

  function handleSelf(opt) {
    if (selected !== null) return;
    setSelected(opt.label);
    setTimeout(() => advance(score + opt.points, false), 300);
  }

  function restart() {
    setIndex(0);
    setScore(0);
    setSelected(null);
    setTier1Correct(0);
    setSkippedAdvanced(false);
  }

  if (done) {
    const reco = getRecommendation(score);
    return (
      <main className="geo-bg min-h-screen flex items-center justify-center px-4 py-12">
        <div className="bg-parchment text-ink rounded-2xl p-8 max-w-sm w-full text-center float-in">
          <Sparkles className="mx-auto mb-3 text-gold" size={30} />
          <p className="uppercase tracking-widest text-sm text-[#8a8264] font-semibold mb-2">
            Résultat de votre test
          </p>
          <h2 className="text-2xl font-bold mb-1">{reco.level}</h2>
          <p className="text-base text-[#6b6350] mb-5">{reco.description}</p>

          <div className="bg-white border-2 border-gold/40 rounded-xl p-4 mb-6">
            <p className="text-sm uppercase tracking-wide text-[#8a8264] font-semibold mb-1">
              {reco.available ? "Point de départ recommandé" : "En attendant le contenu de votre niveau"}
            </p>
            <p className="font-bold">{reco.unit}</p>
          </div>

          <Link
            href="/signup"
            className="w-full bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold py-3 rounded-xl flex items-center justify-center gap-2"
          >
            Commencer gratuitement <ArrowRight size={20} />
          </Link>
          <button
            onClick={restart}
            className="w-full mt-3 py-2 text-sm text-[#8a8264] flex items-center justify-center gap-1"
          >
            <RotateCcw size={14} /> Refaire le test
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
          <span className="text-sm opacity-60">{displayIndex + 1} / {estimatedTotal}</span>
        </div>

        <div className="flex gap-1.5 mb-6">
          {Array.from({ length: estimatedTotal }).map((_, i) => (
            <div key={i} className="flex-1 h-2 rounded bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold to-gold-light transition-transform duration-300"
                style={{ transform: `scaleX(${i <= displayIndex ? 1 : 0})`, transformOrigin: "left" }}
              />
            </div>
          ))}
        </div>

        <div className="bg-parchment text-ink rounded-2xl p-6 float-in">
          {index === 20 && (
            <p className="text-sm text-[#8a8264] italic mb-4">
              Dernière partie — quelques questions sur votre aisance générale, pour affiner l'estimation.
            </p>
          )}

          <p
            className={isObjective ? "arabic text-3xl text-center mb-5" : "font-semibold mb-5 text-base"}
            dir={isObjective && /[\u0600-\u06FF]/.test(current.prompt) ? "rtl" : undefined}
          >
            {current.prompt}
          </p>

          <div className="flex flex-col gap-2">
            {isObjective
              ? current.options.map((opt) => {
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
                      onClick={() => handleObjective(opt)}
                      disabled={selected !== null}
                      className={`text-left px-4 py-3 rounded-xl border-2 font-semibold text-base ${cls}`}
                    >
                      {isArabic ? <span className="arabic text-xl" dir="rtl">{opt}</span> : opt}
                    </button>
                  );
                })
              : SELF_OPTIONS.map((opt) => (
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
        </div>

        <p className="text-center text-sm text-parchment-dim opacity-60 mt-6">
          Gratuit, sans inscription — le test s'adapte : un vrai débutant n'a pas besoin de répondre à 30 questions.
        </p>
      </div>
    </main>
  );
}
