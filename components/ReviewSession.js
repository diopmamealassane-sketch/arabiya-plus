"use client";

import { useState } from "react";
import Link from "next/link";
import { Volume2, X, Check } from "lucide-react";

export default function ReviewSession({ words }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const total = words.length;
  const done = index >= total;
  const word = !done ? words[index] : null;

  async function answer(correct) {
    if (submitting || !word) return;
    setSubmitting(true);
    if (correct) setCorrectCount((c) => c + 1);

    try {
      await fetch("/api/submit-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId: word.id, correct }),
      });
    } catch (err) {
      // On n'interrompt pas la session pour une erreur réseau ponctuelle —
      // le mot restera simplement dû à nouveau demain s'il n'a pas été
      // enregistré côté serveur.
      console.error("submit-review failed", err);
    }

    setSubmitting(false);
    setRevealed(false);
    setIndex((i) => i + 1);
  }

  function playAudio() {
    if (word?.audio_url) {
      new Audio(word.audio_url).play().catch(() => {});
    }
  }

  if (done) {
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    return (
      <div className="bg-white rounded-2xl p-8 shadow-md text-center mt-6">
        <p className="text-4xl mb-3">✅</p>
        <p className="text-ink font-extrabold text-xl mb-1">Révision terminée !</p>
        <p className="text-ink/60 text-base mb-6">
          {correctCount} / {total} mots connus ({pct}%)
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-extrabold px-5 py-3 rounded-xl"
        >
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="bg-white/40 rounded-full h-2 overflow-hidden mb-5">
        <div
          className="h-full bg-gold rounded-full transition-all duration-300"
          style={{ width: `${(index / total) * 100}%` }}
        />
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-md min-h-[280px] flex flex-col items-center justify-center text-center">
        <button
          onClick={playAudio}
          className="w-10 h-10 rounded-full bg-ink/5 flex items-center justify-center mb-4 text-ink/50"
          aria-label="Écouter"
        >
          <Volume2 size={20} />
        </button>

        <p className="arabic text-4xl text-ink mb-2" dir="rtl">
          {word.arabic_vocalized}
        </p>
        {word.transliteration && (
          <p className="text-ink/40 text-base font-semibold mb-4">{word.transliteration}</p>
        )}

        {revealed ? (
          <p className="text-ink font-extrabold text-xl mt-2">{word.french}</p>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="mt-2 bg-ink/5 text-ink font-bold px-5 py-2.5 rounded-xl"
          >
            Afficher la réponse
          </button>
        )}
      </div>

      {revealed && (
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={() => answer(false)}
            disabled={submitting}
            className="flex items-center justify-center gap-2 bg-white border-2 border-red-200 text-red-500 font-extrabold py-3.5 rounded-xl disabled:opacity-50"
          >
            <X size={20} /> Je ne savais pas
          </button>
          <button
            onClick={() => answer(true)}
            disabled={submitting}
            className="flex items-center justify-center gap-2 bg-ink text-white font-extrabold py-3.5 rounded-xl disabled:opacity-50"
          >
            <Check size={20} /> Je savais
          </button>
        </div>
      )}

      <p className="text-center text-ink/40 text-sm font-semibold mt-4">
        {index + 1} / {total}
      </p>
    </div>
  );
}
