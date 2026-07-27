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
  ],
  A2: [
    { ar: "أَنَا", fr: "je / moi", typeable: true },
    { ar: "لِمَاذَا", fr: "pourquoi", typeable: true },
    { ar: "مَطَار", fr: "aéroport", typeable: true },
    { ar: "مَرِيض", fr: "malade", typeable: true },
    { ar: "طَوِيل", fr: "grand (une personne)", typeable: true },
    { ar: "إِنْتِرْنِت", fr: "internet", typeable: true },
  ],
  B1: [
    { ar: "سَأَذْهَب غَدًا", fr: "j'irai demain", typeable: false },
    { ar: "فِي رَأْيِي", fr: "à mon avis", typeable: false },
    { ar: "لَوْ كُنْتُ غَنِيًّا", fr: "si j'étais riche", typeable: false },
    { ar: "صَحَفِيّ", fr: "journaliste", typeable: true },
    { ar: "مُقَابَلَة عَمَل", fr: "entretien d'embauche", typeable: false },
    { ar: "وَاجِب مَنْزِلِيّ", fr: "devoir (à la maison)", typeable: false },
  ],
  B2: [
    { ar: "كُتِبَ", fr: "a été écrit", typeable: true },
    { ar: "قَالَ إِنَّهُ سَيَأْتِي", fr: "il a dit qu'il viendrait", typeable: false },
    { ar: "الرَّجُل الَّذِي يَعْمَل هُنَا", fr: "l'homme qui travaille ici", typeable: false },
    { ar: "بِالرَّغْم مِنْ ذَلِك", fr: "malgré cela", typeable: false },
    { ar: "تَغَيُّر المُنَاخ", fr: "le changement climatique", typeable: false },
    { ar: "الذَّكَاء الاِصْطِنَاعِيّ", fr: "l'intelligence artificielle", typeable: false },
  ],
  C1: [
    { ar: "تَشَرَّفْنَا", fr: "enchanté (formel)", typeable: true },
    { ar: "سُخْرِيَة", fr: "ironie", typeable: true },
    { ar: "بِلَا أَدْنَى شَكّ", fr: "sans aucun doute", typeable: false },
    { ar: "مُفَاوَضَات ثُنَائِيَّة", fr: "négociations bilatérales", typeable: false },
    { ar: "اِسْتِعَارَة", fr: "métaphore", typeable: true },
    { ar: "فَلْسَفَة", fr: "philosophie", typeable: true },
  ],
  C2: [
    { ar: "لَهْجَة", fr: "dialecte", typeable: true },
    { ar: "تَرْجَمَة فَوْرِيَّة", fr: "interprétation simultanée", typeable: false },
    { ar: "حَكَوَاتِي", fr: "conteur traditionnel", typeable: true },
    { ar: "جَذْر ثُلَاثِيّ", fr: "racine trilitère", typeable: false },
    { ar: "صَحَافَة اِسْتِقْصَائِيَّة", fr: "journalisme d'investigation", typeable: false },
    { ar: "البَلَاغَة", fr: "l'éloquence", typeable: true },
  ],
};

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

const MASTERY_THRESHOLD = 0.65;

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

// Construit le test : pour chaque cycle (A1 → C2, du plus facile au
// plus dur), 6 questions objectives tirées du vrai vocabulaire du
// cycle, puis les 6 questions d'auto-évaluation à la fin.
function buildTest() {
  const objective = [];
  CYCLES.forEach((cycle) => {
    const words = shuffle(WORD_BANK[cycle]);
    words.forEach((w, i) => {
      const kindPool = w.typeable
        ? ["type_ar", "mcq_ar_to_fr", "mcq_fr_to_ar"]
        : ["mcq_ar_to_fr", "mcq_fr_to_ar"];
      const kind = kindPool[i % kindPool.length];
      const distractorPool = words.filter((x) => x.ar !== w.ar);

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

  if (!questions) {
    return (
      <main className="geo-bg min-h-screen flex items-center justify-center px-4">
        <p className="text-parchment-dim text-sm">Préparation de votre test…</p>
      </main>
    );
  }

  const done = index >= questions.length;
  const current = !done ? questions[index] : null;
  const objectiveCount = CYCLES.length * 6;

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
    if (typedResult !== null) return;
    const correct = arabicAnswersMatch(typedAnswer, current.answer);
    setTypedResult(correct);
    recordObjective(current.cycle, correct);
    setTimeout(advance, 1100);
  }

  function restart() {
    window.location.reload(); // régénère un nouveau tirage aléatoire
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
