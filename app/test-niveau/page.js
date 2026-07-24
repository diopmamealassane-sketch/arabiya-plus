"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";

// Mix d'items objectifs (vrai/faux sur du vocabulaire et de la grammaire déjà
// enseignés dans le cours) et d'auto-évaluation — un vrai test adaptatif
// demanderait un moteur de scoring plus riche, mais ce mélange suffit à
// distinguer un vrai débutant d'quelqu'un qui a déjà des bases.
const QUESTIONS = [
  {
    id: 1,
    kind: "objective",
    prompt: "Que signifie مَرْحَبًا ؟",
    options: ["Bonjour", "Merci", "Au revoir", "Oui"],
    answer: "Bonjour",
  },
  {
    id: 2,
    kind: "objective",
    prompt: "Comment dit-on « merci » en arabe ?",
    options: ["شُكْرًا", "مَرْحَبًا", "نَعَمْ", "لَا"],
    answer: "شُكْرًا",
  },
  {
    id: 3,
    kind: "objective",
    prompt: "أُم signifie :",
    options: ["Mère", "Père", "Frère", "Sœur"],
    answer: "Mère",
  },
  {
    id: 4,
    kind: "objective",
    prompt: "خَمْسة correspond au chiffre :",
    options: ["5", "4", "6", "3"],
    answer: "5",
  },
  {
    id: 5,
    kind: "objective",
    prompt: "أَخْضَر signifie :",
    options: ["Vert", "Rouge", "Bleu", "Jaune"],
    answer: "Vert",
  },
  {
    id: 6,
    kind: "objective",
    prompt: "مَا اسْمُكَ؟ signifie :",
    options: ["Comment tu t'appelles ?", "Comment vas-tu ?", "D'où viens-tu ?", "Merci"],
    answer: "Comment tu t'appelles ?",
  },
  {
    id: 7,
    kind: "objective",
    prompt: "أَنْتِ correspond à :",
    options: ["Tu (féminin)", "Tu (masculin)", "Il", "Elle"],
    answer: "Tu (féminin)",
  },
  {
    id: 8,
    kind: "objective",
    prompt: "آكُل signifie :",
    options: ["Je mange", "Tu manges", "Il mange", "Nous mangeons"],
    answer: "Je mange",
  },
  {
    id: 9,
    kind: "self",
    prompt: "Savez-vous lire les lettres de l'alphabet arabe ?",
    options: [
      { label: "Pas du tout", points: 0 },
      { label: "Un peu", points: 1 },
      { label: "Oui, couramment", points: 2 },
    ],
  },
  {
    id: 10,
    kind: "self",
    prompt: "Pouvez-vous tenir une conversation simple en arabe ?",
    options: [
      { label: "Non, jamais", points: 0 },
      { label: "Quelques mots", points: 1 },
      { label: "Oui, un peu", points: 2 },
    ],
  },
];

const MAX_SCORE = 8 * 2 + 2 + 2; // 8 objective questions (2 pts) + 2 self questions (max 2 pts)

function getRecommendation(score) {
  if (score <= 6) {
    return {
      level: "Débutant complet",
      unit: "Unité 1 — Se saluer",
      description:
        "Parfait pour démarrer depuis le tout début : l'alphabet, la prononciation, et vos premiers mots.",
    };
  }
  if (score <= 13) {
    return {
      level: "Débutant confirmé",
      unit: "Unité 4 — Les couleurs",
      description:
        "Vous connaissez déjà les bases (salutations, famille, chiffres). On vous propose de reprendre à partir des couleurs pour ne rien rater d'utile.",
    };
  }
  return {
    level: "Niveau élémentaire (A2)",
    unit: "Cycle 2, Unité 1 — Le présent",
    description:
      "Le vocabulaire de base semble déjà acquis. Vous pouvez directement attaquer la grammaire : les pronoms et la conjugaison au présent.",
  };
}

export default function PlacementTestPage() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);

  const done = index >= QUESTIONS.length;
  const question = !done ? QUESTIONS[index] : null;

  function handleObjective(opt) {
    if (selected !== null) return;
    setSelected(opt);
    if (opt === question.answer) setScore((s) => s + 2);
    setTimeout(() => {
      setSelected(null);
      setIndex((i) => i + 1);
    }, 500);
  }

  function handleSelf(opt) {
    if (selected !== null) return;
    setSelected(opt.label);
    setScore((s) => s + opt.points);
    setTimeout(() => {
      setSelected(null);
      setIndex((i) => i + 1);
    }, 350);
  }

  function restart() {
    setIndex(0);
    setScore(0);
    setSelected(null);
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
              Point de départ recommandé
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
            <img src="/logo-mark.png" alt="Arabiya+" className="h-12 w-auto" />
            <span className="kufi text-base text-gold-light">Test de niveau</span>
          </div>
          <span className="text-sm opacity-60">{index + 1} / {QUESTIONS.length}</span>
        </div>

        <div className="flex gap-1.5 mb-6">
          {QUESTIONS.map((_, i) => (
            <div key={i} className="flex-1 h-2 rounded bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold to-gold-light transition-transform duration-300"
                style={{
                  transform: `scaleX(${i <= index ? 1 : 0})`,
                  transformOrigin: "left",
                }}
              />
            </div>
          ))}
        </div>

        <div className="bg-parchment text-ink rounded-2xl p-6 float-in">
          <p
            className={question.kind === "objective" ? "arabic text-3xl text-center mb-5" : "font-semibold mb-5"}
            dir={question.kind === "objective" && /[\u0600-\u06FF]/.test(question.prompt) ? "rtl" : undefined}
          >
            {question.prompt}
          </p>

          <div className="flex flex-col gap-2">
            {question.kind === "objective"
              ? question.options.map((opt) => {
                  const isArabic = /[\u0600-\u06FF]/.test(opt);
                  const isSel = selected === opt;
                  const isRight = selected !== null && opt === question.answer;
                  const isWrong = isSel && opt !== question.answer;
                  let cls = "border-black/10 bg-white";
                  if (isRight) cls = "border-teal bg-teal/10 text-[#1E5E56]";
                  else if (isWrong) cls = "border-rust bg-rust/10 text-[#8C3327]";
                  return (
                    <button
                      key={opt}
                      onClick={() => handleObjective(opt)}
                      disabled={selected !== null}
                      className={`text-left px-4 py-3 rounded-xl border-2 font-semibold ${cls}`}
                    >
                      {isArabic ? <span className="arabic text-xl" dir="rtl">{opt}</span> : opt}
                    </button>
                  );
                })
              : question.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleSelf(opt)}
                    disabled={selected !== null}
                    className={`text-left px-4 py-3 rounded-xl border-2 font-semibold ${
                      selected === opt.label ? "border-ink-3 bg-black/5" : "border-black/10 bg-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
          </div>
        </div>

        <p className="text-center text-sm text-parchment-dim opacity-60 mt-6">
          Gratuit, sans inscription — 10 questions, 2 minutes.
        </p>
      </div>
    </main>
  );
}
