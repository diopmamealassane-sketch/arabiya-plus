"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, Sparkles, Check } from "lucide-react";
import { arabicAnswersMatch } from "@/lib/arabicNormalize";

// ------------------------------------------------------------------
// Banque de vocabulaire — reprise mot pour mot du contenu réel des 40
// leçons du cours (rien n'est inventé). ~110 entrées, réparties sur
// toutes les unités du Cycle 1 et l'Unité 1 du Cycle 2, du plus simple
// au plus avancé.
// ------------------------------------------------------------------
const WORD_BANK = [
  // Se saluer
  { ar: "مَرْحَبًا", fr: "bonjour" }, { ar: "شُكْرًا", fr: "merci" },
  { ar: "مَعَ السَّلَامَة", fr: "au revoir" }, { ar: "نَعَمْ", fr: "oui" }, { ar: "لَا", fr: "non" },
  { ar: "مِنْ فَضْلِك", fr: "s'il te plaît" }, { ar: "عَفْوًا", fr: "de rien" },
  { ar: "آسِف", fr: "désolé" }, { ar: "أَهْلًا وَسَهْلًا", fr: "bienvenue" },
  { ar: "صَبَاحُ الخَيْر", fr: "bonjour (le matin)" }, { ar: "مَسَاءُ الخَيْر", fr: "bonsoir" },
  { ar: "تُصْبِح عَلَى خَيْر", fr: "bonne nuit" }, { ar: "إِلَى اللِّقَاء", fr: "à bientôt" },
  { ar: "مَبْرُوك", fr: "félicitations" }, { ar: "بِالتَّوْفِيق", fr: "bonne chance" },
  { ar: "سَيِّد", fr: "monsieur" }, { ar: "سَيِّدَة", fr: "madame" }, { ar: "آنِسَة", fr: "mademoiselle" },
  // La famille
  { ar: "أَب", fr: "père" }, { ar: "أُم", fr: "mère" }, { ar: "اِبْن", fr: "fils" }, { ar: "اِبْنَة", fr: "fille" },
  { ar: "أَخ", fr: "frère" }, { ar: "أُخْت", fr: "sœur" }, { ar: "جَدّ", fr: "grand-père" }, { ar: "جَدَّة", fr: "grand-mère" },
  { ar: "عَمّ", fr: "oncle (paternel)" }, { ar: "عَمَّة", fr: "tante (paternelle)" },
  { ar: "خَال", fr: "oncle (maternel)" }, { ar: "خَالَة", fr: "tante (maternelle)" },
  { ar: "زَوْج", fr: "mari" }, { ar: "زَوْجَة", fr: "épouse" }, { ar: "طِفْل", fr: "enfant" }, { ar: "عَائِلَة", fr: "famille" },
  { ar: "صَدِيق", fr: "ami" }, { ar: "صَدِيقَة", fr: "amie" }, { ar: "جَار", fr: "voisin" }, { ar: "جَارَة", fr: "voisine" },
  // Les chiffres
  { ar: "صِفْر", fr: "zéro" }, { ar: "وَاحِد", fr: "un" }, { ar: "اِثْنان", fr: "deux" }, { ar: "ثَلاثة", fr: "trois" },
  { ar: "أَرْبَعة", fr: "quatre" }, { ar: "خَمْسة", fr: "cinq" }, { ar: "سِتَّة", fr: "six" }, { ar: "سَبْعَة", fr: "sept" },
  { ar: "ثَمَانِيَة", fr: "huit" }, { ar: "تِسْعَة", fr: "neuf" }, { ar: "عَشَرَة", fr: "dix" },
  { ar: "عِشْرُون", fr: "vingt" }, { ar: "ثَلاثُون", fr: "trente" }, { ar: "أَرْبَعُون", fr: "quarante" },
  { ar: "خَمْسُون", fr: "cinquante" }, { ar: "سِتُّون", fr: "soixante" }, { ar: "مِئَة", fr: "cent" },
  { ar: "أَوَّل", fr: "premier" }, { ar: "ثَانِي", fr: "deuxième" }, { ar: "ثَالِث", fr: "troisième" },
  // Les couleurs
  { ar: "أَحْمَر", fr: "rouge" }, { ar: "أَزْرَق", fr: "bleu" }, { ar: "أَخْضَر", fr: "vert" },
  { ar: "أَصْفَر", fr: "jaune" }, { ar: "أَسْوَد", fr: "noir" }, { ar: "أَبْيَض", fr: "blanc" },
  { ar: "بُنِّي", fr: "marron" }, { ar: "وَرْدِي", fr: "rose" }, { ar: "رَمَادِي", fr: "gris" },
  { ar: "بُرْتُقَالِي", fr: "orange (couleur)" }, { ar: "بَنَفْسَجِي", fr: "violet" },
  { ar: "فَاتِح", fr: "clair" }, { ar: "غَامِق", fr: "foncé" }, { ar: "ذَهَبِي", fr: "doré" },
  // La nourriture
  { ar: "خُبْز", fr: "pain" }, { ar: "مَاء", fr: "eau" }, { ar: "لَحْم", fr: "viande" },
  { ar: "سَمَك", fr: "poisson" }, { ar: "فَاكِهَة", fr: "fruit" }, { ar: "خُضَار", fr: "légumes" },
  { ar: "قَهْوَة", fr: "café" }, { ar: "شَاي", fr: "thé" }, { ar: "حَلِيب", fr: "lait" }, { ar: "عَصِير", fr: "jus" },
  { ar: "فَطُور", fr: "petit-déjeuner" }, { ar: "غَدَاء", fr: "déjeuner" }, { ar: "عَشَاء", fr: "dîner" },
  { ar: "تُفَّاح", fr: "pomme" }, { ar: "مَوْز", fr: "banane" }, { ar: "جَزَر", fr: "carotte" }, { ar: "بَصَل", fr: "oignon" },
  // Le temps
  { ar: "يَوْم", fr: "jour" }, { ar: "أُسْبُوع", fr: "semaine" }, { ar: "شَهْر", fr: "mois" }, { ar: "سَنَة", fr: "année" },
  { ar: "صَبَاح", fr: "matin" }, { ar: "مَسَاء", fr: "soir" },
  { ar: "الأَحَد", fr: "dimanche" }, { ar: "الإثْنَيْن", fr: "lundi" }, { ar: "الجُمُعَة", fr: "vendredi" }, { ar: "السَّبْت", fr: "samedi" },
  { ar: "اليَوْم", fr: "aujourd'hui" }, { ar: "غَدًا", fr: "demain" }, { ar: "أَمْس", fr: "hier" },
  { ar: "رَبِيع", fr: "printemps" }, { ar: "صَيْف", fr: "été" }, { ar: "خَرِيف", fr: "automne" }, { ar: "شِتَاء", fr: "hiver" },
  // Les objets du quotidien
  { ar: "كِتَاب", fr: "livre" }, { ar: "قَلَم", fr: "stylo" }, { ar: "بَاب", fr: "porte" },
  { ar: "بَيْت", fr: "maison" }, { ar: "سَيَّارَة", fr: "voiture" }, { ar: "هَاتِف", fr: "téléphone" },
  { ar: "قَمِيص", fr: "chemise" }, { ar: "حِذَاء", fr: "chaussure" }, { ar: "قُبَّعَة", fr: "chapeau" },
  { ar: "طَاوِلَة", fr: "table" }, { ar: "مِفْتَاح", fr: "clé" }, { ar: "حَاسُوب", fr: "ordinateur" },
  // Premières conversations
  { ar: "مَا اسْمُكَ؟", fr: "comment tu t'appelles ?" }, { ar: "كَيْفَ حَالُكَ؟", fr: "comment vas-tu ?" },
  { ar: "بِخَيْر", fr: "bien" }, { ar: "تَشَرَّفْنَا", fr: "enchanté(e)" }, { ar: "مِنْ أَيْنَ أَنْتَ؟", fr: "d'où viens-tu ?" },
  { ar: "لا أَفْهَم", fr: "je ne comprends pas" }, { ar: "سَعِيد", fr: "content / heureux" },
  { ar: "حَزِين", fr: "triste" }, { ar: "جَائِع", fr: "affamé" },
  // Cycle 2 — Le présent
  { ar: "أَنَا", fr: "je / moi" }, { ar: "أَنْتَ", fr: "tu (masculin)" }, { ar: "أَنْتِ", fr: "tu (féminin)" },
  { ar: "هُوَ", fr: "il" }, { ar: "هِيَ", fr: "elle" }, { ar: "نَحْنُ", fr: "nous" },
  { ar: "آكُل", fr: "je mange" }, { ar: "يَأْكُل", fr: "il mange" }, { ar: "نَأْكُل", fr: "nous mangeons" },
];

// ------------------------------------------------------------------
// Auto-évaluation (descripteurs CECRL) — nécessaire pour estimer B1 à
// C2, contenu que le cours ne couvre pas encore objectivement.
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

// Construit dynamiquement 20 questions objectives (piochées au hasard
// dans les ~110 mots, avec 3 types possibles dont la saisie tapée en
// arabe) + les 10 questions d'auto-évaluation = 30 au total.
function buildTest() {
  const chosenWords = sample(WORD_BANK, 20);
  const objective = chosenWords.map((w, i) => {
    const kind = i % 3 === 0 ? "type_ar" : i % 3 === 1 ? "mcq_ar_to_fr" : "mcq_fr_to_ar";
    const distractorPool = WORD_BANK.filter((x) => x.ar !== w.ar);

    if (kind === "type_ar") {
      return { kind, prompt: w.fr, answer: w.ar };
    }
    if (kind === "mcq_ar_to_fr") {
      const distractors = sample(distractorPool, 3).map((d) => d.fr);
      return { kind, prompt: w.ar, answer: w.fr, options: shuffle([w.fr, ...distractors]) };
    }
    // mcq_fr_to_ar
    const distractors = sample(distractorPool, 3).map((d) => d.ar);
    return { kind, prompt: w.fr, answer: w.ar, options: shuffle([w.ar, ...distractors]) };
  });

  const self = shuffle(SELF_ASSESSMENT).map((prompt) => ({ kind: "self", prompt }));

  return [...objective, ...self];
}

function getRecommendation(score, maxScore) {
  const pct = score / maxScore;
  if (pct <= 0.18) {
    return { level: "A1 — Débutant complet", unit: "Unité 1 — Se saluer",
      description: "Parfait pour démarrer depuis le tout début.", available: true };
  }
  if (pct <= 0.4) {
    return { level: "A1 — Débutant confirmé", unit: "Unité 4 — Les couleurs",
      description: "Les bases semblent déjà acquises. Reprenez à partir des couleurs.", available: true };
  }
  if (pct <= 0.62) {
    return { level: "A2 — Élémentaire", unit: "Cycle 2, Unité 1 — Le présent",
      description: "Le vocabulaire de base est acquis. Direction la grammaire.", available: true };
  }
  if (pct <= 0.8) {
    return { level: "B1 — Intermédiaire (estimé)", unit: "Cycle 2, Unité 1 — Le présent",
      description: "Votre niveau dépasse probablement le contenu actuel. Le Cycle 3 (B1) est en préparation.", available: false };
  }
  return { level: "B2 et au-delà (estimé)", unit: "Cycle 2, Unité 1 — Le présent",
    description: "Niveau avancé estimé. Ce contenu n'est pas encore disponible — en attendant, vérifiez vos fondations sur le Cycle 2.", available: false };
}

export default function PlacementTestPage() {
  // Important : le tirage aléatoire ne doit JAMAIS se produire pendant le
  // rendu initial (serveur ou hydratation), sinon React détecte un
  // décalage entre ce que le serveur a généré et ce que le client
  // recalcule — et le tirage ne serait alors fait qu'une fois, au moment
  // de la construction du site, au lieu d'à chaque visite. On calcule
  // donc les questions uniquement après le montage, côté navigateur.
  const [questions, setQuestions] = useState(null);
  useEffect(() => {
    setQuestions(buildTest());
  }, []);

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [typedResult, setTypedResult] = useState(null); // null | true | false

  const MAX_SCORE = 20 * 2 + 10 * 3; // 70

  if (!questions) {
    return (
      <main className="geo-bg min-h-screen flex items-center justify-center px-4">
        <p className="text-parchment-dim text-sm">Préparation de votre test…</p>
      </main>
    );
  }

  const done = index >= questions.length;
  const current = !done ? questions[index] : null;

  function nextQuestion(gained) {
    setScore((s) => s + gained);
    setSelected(null);
    setTypedAnswer("");
    setTypedResult(null);
    setIndex((i) => i + 1);
  }

  function handleMcq(opt) {
    if (selected !== null) return;
    setSelected(opt);
    const correct = opt === current.answer;
    setTimeout(() => nextQuestion(correct ? 2 : 0), 450);
  }

  function handleSelf(opt) {
    if (selected !== null) return;
    setSelected(opt.label);
    setTimeout(() => nextQuestion(opt.points), 300);
  }

  function handleTypeSubmit(e) {
    e.preventDefault();
    if (typedResult !== null) return;
    const correct = arabicAnswersMatch(typedAnswer, current.answer);
    setTypedResult(correct);
    setTimeout(() => nextQuestion(correct ? 2 : 0), 1100);
  }

  function restart() {
    window.location.reload(); // régénère un nouveau tirage aléatoire de 30 questions
  }

  if (done) {
    const reco = getRecommendation(score, MAX_SCORE);
    return (
      <main className="geo-bg min-h-screen flex items-center justify-center px-4 py-12">
        <div className="bg-parchment text-ink rounded-2xl p-8 max-w-sm w-full text-center float-in">
          <Sparkles className="mx-auto mb-3 text-gold" size={30} />
          <p className="uppercase tracking-widest text-sm text-[#8a8264] font-semibold mb-2">Résultat de votre test</p>
          <h2 className="text-2xl font-bold mb-1">{reco.level}</h2>
          <p className="text-base text-[#6b6350] mb-5">{reco.description}</p>
          <div className="bg-white border-2 border-gold/40 rounded-xl p-4 mb-6">
            <p className="text-sm uppercase tracking-wide text-[#8a8264] font-semibold mb-1">
              {reco.available ? "Point de départ recommandé" : "En attendant le contenu de votre niveau"}
            </p>
            <p className="font-bold">{reco.unit}</p>
          </div>
          <Link href="/signup" className="w-full bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold py-3 rounded-xl flex items-center justify-center gap-2">
            Commencer gratuitement <ArrowRight size={20} />
          </Link>
          <button onClick={restart} className="w-full mt-3 py-2 text-sm text-[#8a8264] flex items-center justify-center gap-1">
            <RotateCcw size={14} /> Refaire le test (30 nouvelles questions)
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
            <Link href="/"><img src="/logo-mark.png" alt="Arabiya+" className="h-12 w-auto" /></Link>
            <span className="kufi text-base text-gold-light">Test de niveau</span>
          </div>
          <span className="text-sm opacity-60">{index + 1} / {questions.length}</span>
        </div>

        <div className="flex gap-1.5 mb-6">
          {questions.map((_, i) => (
            <div key={i} className="flex-1 h-2 rounded bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-gold to-gold-light transition-transform duration-300"
                style={{ transform: `scaleX(${i <= index ? 1 : 0})`, transformOrigin: "left" }} />
            </div>
          ))}
        </div>

        <div className="bg-parchment text-ink rounded-2xl p-6 float-in">
          {index === 20 && (
            <p className="text-sm text-[#8a8264] italic mb-4">
              Dernière partie — votre aisance générale, pour affiner l'estimation au-delà du contenu testable.
            </p>
          )}

          <p
            className={current.kind !== "self" && /[\u0600-\u06FF]/.test(current.prompt) ? "arabic text-3xl text-center mb-5" : "font-semibold mb-5 text-base"}
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
                  <button key={opt} onClick={() => handleMcq(opt)} disabled={selected !== null}
                    className={`text-left px-4 py-3 rounded-xl border-2 font-semibold text-base ${cls}`}>
                    {isArabic ? <span className="arabic text-xl" dir="rtl">{opt}</span> : opt}
                  </button>
                );
              })}
            </div>
          )}

          {current.kind === "self" && (
            <div className="flex flex-col gap-2">
              {SELF_OPTIONS.map((opt) => (
                <button key={opt.label} onClick={() => handleSelf(opt)} disabled={selected !== null}
                  className={`text-left px-4 py-3 rounded-xl border-2 font-semibold text-base ${
                    selected === opt.label ? "border-ink-3 bg-black/5" : "border-black/10 bg-white"
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-sm text-parchment-dim opacity-60 mt-6">
          Gratuit, sans inscription — 30 questions tirées au hasard parmi plus de 100, à chaque tentative.
        </p>
      </div>
    </main>
  );
}
