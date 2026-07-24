"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Volume2, X, Check, ArrowRight, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LessonEngine({ lessonTitle, lessonId, steps }) {
  const router = useRouter();
  const supabase = createClient();

  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [reveal, setReveal] = useState(null);
  const [orderChosen, setOrderChosen] = useState([]);
  const [xpEarned, setXpEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gradedCount, setGradedCount] = useState(0);
  const [shake, setShake] = useState(false);
  const [lastSpokenOk, setLastSpokenOk] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const voicesRef = useRef([]);

  const done = stepIndex >= steps.length;
  const step = !done ? steps[stepIndex] : null;

  useEffect(() => {
    setSelected(null);
    setAnswered(false);
    setIsCorrect(false);
    setReveal(null);
    setOrderChosen([]);
  }, [stepIndex]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    function loadVoices() {
      voicesRef.current = window.speechSynthesis.getVoices();
    }
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  function speak(text) {
    if (!text || !("speechSynthesis" in window)) {
      setLastSpokenOk(false);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      const arabicVoice = voicesRef.current.find((v) => v.lang?.toLowerCase().startsWith("ar"));
      if (arabicVoice) {
        utter.voice = arabicVoice;
        utter.lang = arabicVoice.lang;
      } else {
        utter.lang = "ar-SA";
      }
      utter.rate = 0.82;
      utter.onstart = () => setLastSpokenOk(true);
      utter.onerror = () => setLastSpokenOk(false);
      if (!arabicVoice) {
        setTimeout(() => {
          if (!window.speechSynthesis.speaking) setLastSpokenOk(false);
        }, 350);
      }
      window.speechSynthesis.speak(utter);
    } catch {
      setLastSpokenOk(false);
    }
  }

  async function submitAnswer(userAnswer) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step_id: step.id, user_answer: userAnswer }),
      });
      if (!res.ok) throw new Error("submit-answer failed");
      const data = await res.json();
      setIsCorrect(data.correct);
      setReveal(data.reveal);
      setXpEarned((x) => x + (data.xp_awarded ?? 0));
      if (step.kind !== "intro") {
        setGradedCount((c) => c + 1);
        if (data.correct) setCorrectCount((c) => c + 1);
      }
      setAnswered(true);
      if (!data.correct) {
        setShake(true);
        setTimeout(() => setShake(false), 420);
      }
    } catch {
      // If grading fails (e.g. offline), don't strand the user — let them
      // continue without XP rather than block the lesson.
      setIsCorrect(false);
      if (step.kind !== "intro") setGradedCount((c) => c + 1);
      setAnswered(true);
    } finally {
      setSubmitting(false);
    }
  }

  function handleIntroContinue() {
    submitAnswer(null).then(nextStep);
  }

  function handleMcqSelect(opt, valueForApi) {
    if (answered || submitting) return;
    setSelected(opt);
    submitAnswer(valueForApi);
  }

  function handleChipTap(chip, idx) {
    if (answered || submitting) return;
    const next = [...orderChosen, { ...chip, _key: idx }];
    setOrderChosen(next);
    if (next.length === step.answerLength) {
      submitAnswer(next.map((c) => c.id));
    }
  }

  function resetOrder() {
    if (answered) return;
    setOrderChosen([]);
  }

  function nextStep() {
    setStepIndex((i) => i + 1);
  }

  // Note sur 20, calculée sur les exercices notables uniquement (les écrans
  // "intro" ne comptent pas — ce ne sont pas des questions, juste des
  // flashcards de découverte).
  const note = gradedCount > 0 ? Math.round((correctCount / gradedCount) * 20) : 20;
  const appreciation =
    note >= 18 ? "Excellent !" :
    note >= 16 ? "Très bien !" :
    note >= 14 ? "Bien." :
    note >= 12 ? "Assez bien." :
    note >= 10 ? "Passable." :
    "Peut mieux faire.";

  if (done) {
    return (
      <main className="geo-bg min-h-screen flex items-center justify-center px-4">
        <div className="bg-parchment text-ink rounded-2xl p-8 max-w-sm w-full text-center float-in">
          <p className="uppercase tracking-widest text-xs text-[#8a8264] font-semibold mb-2">
            Leçon terminée
          </p>
          <h2 className="arabic text-3xl mb-4">أَحْسَنْتَ!</h2>

          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="text-4xl font-black text-ink">{note}</span>
            <span className="text-lg text-[#8a8264] font-semibold">/ 20</span>
          </div>
          <p className="text-sm font-semibold text-[#7a5c14] mb-1">{appreciation}</p>
          <p className="text-xs text-[#8a8264] mb-6">
            {correctCount} / {gradedCount} bonnes réponses · +{xpEarned} XP
          </p>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold py-3 rounded-xl"
          >
            Retour au tableau de bord
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="geo-bg min-h-screen px-4 py-8">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.push("/dashboard")} className="opacity-70">
            <X size={22} />
          </button>
          <span className="text-xs opacity-60">{stepIndex + 1} / {steps.length}</span>
        </div>

        <div className="flex gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div key={i} className="flex-1 h-2 rounded bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold to-gold-light transition-transform duration-500"
                style={{
                  transform: `scaleX(${i < stepIndex ? 1 : i === stepIndex ? (answered ? 1 : 0.35) : 0})`,
                  transformOrigin: "left",
                }}
              />
            </div>
          ))}
        </div>

        <div className={`bg-parchment text-ink rounded-2xl p-6 float-in ${shake ? "shake" : ""}`}>
          <p className="text-xs uppercase tracking-wide text-[#8a8264] font-semibold mb-3">
            {lessonTitle}
          </p>

          {step.kind === "intro" && (
            <>
              <div className="text-center py-3">
                <div className="arabic text-5xl" dir="rtl">{step.word?.arabic_vocalized}</div>
                <div className="italic text-[#6b6350] mt-2 text-sm">{step.word?.transliteration}</div>
                <div className="font-semibold mt-1">{step.word?.french}</div>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => speak(step.word?.arabic_vocalized)}
                  className="w-12 h-12 rounded-full bg-ink text-gold-light flex items-center justify-center speak-pulse"
                >
                  <Volume2 size={20} />
                </button>
              </div>
              {lastSpokenOk === false && (
                <p className="text-xs text-center text-[#8a8264] mt-3">
                  🔇 Pas de voix arabe sur cet appareil — appuyez-vous sur la transcription phonétique.
                </p>
              )}
              <button
                onClick={handleIntroContinue}
                disabled={submitting}
                className="w-full mt-6 bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                J'ai compris <ArrowRight size={18} />
              </button>
            </>
          )}

          {step.kind === "mcq_ar_to_fr" && (
            <>
              <p className="font-semibold mb-4">Que signifie ce mot ?</p>
              <div className="text-center mb-4">
                <div className="arabic text-4xl" dir="rtl">{step.promptWord?.arabic_vocalized}</div>
                <button
                  onClick={() => speak(step.promptWord?.arabic_vocalized)}
                  className="w-10 h-10 mx-auto mt-2 rounded-full bg-ink text-gold-light flex items-center justify-center"
                >
                  <Volume2 size={16} />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {(step.options ?? []).map((opt) => (
                  <OptionButton
                    key={opt}
                    label={opt}
                    isSelected={selected === opt}
                    isCorrectAnswer={answered && reveal?.value === opt}
                    isWrongSelected={answered && selected === opt && reveal?.value !== opt}
                    disabled={answered || submitting}
                    onClick={() => handleMcqSelect(opt, opt)}
                  />
                ))}
              </div>
            </>
          )}

          {step.kind === "mcq_fr_to_ar" && (
            <>
              <p className="font-semibold mb-4">Comment dit-on « {step.promptFr} » ?</p>
              <div className="flex flex-col gap-2">
                {(step.options ?? []).map((opt) => (
                  <OptionButton
                    key={opt.id}
                    arabicLabel={opt.arabic_vocalized}
                    isSelected={selected === opt.id}
                    isCorrectAnswer={answered && reveal?.wordId === opt.id}
                    isWrongSelected={answered && selected === opt.id && reveal?.wordId !== opt.id}
                    disabled={answered || submitting}
                    onClick={() => handleMcqSelect(opt.id, opt.id)}
                  />
                ))}
              </div>
              {step.note && <p className="text-xs italic text-[#8a8264] mt-3">{step.note}</p>}
            </>
          )}

          {step.kind === "order" && (
            <>
              <p className="font-semibold mb-4">{step.instruction}</p>
              <div className="min-h-[58px] border-2 border-dashed border-black/15 rounded-xl flex items-center gap-2 px-3 py-2 flex-wrap justify-end" dir="rtl">
                {orderChosen.length === 0 && (
                  <span className="text-xs text-[#a89f83]" dir="ltr">
                    Touchez les mots ci-dessous dans l'ordre
                  </span>
                )}
                {orderChosen.map((c, i) => (
                  <span key={i} className="arabic text-2xl px-4 py-2 rounded-xl bg-white border-2 border-black/15">
                    {c.arabic_vocalized}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap mt-4" dir="rtl">
                {(step.chips ?? []).map((c, i) => (
                  <button
                    key={i}
                    disabled={orderChosen.some((o) => o._key === i)}
                    onClick={() => handleChipTap(c, i)}
                    className="arabic text-2xl px-4 py-2 rounded-xl bg-white border-2 border-black/15 disabled:opacity-20"
                  >
                    {c.arabic_vocalized}
                  </button>
                ))}
              </div>
              {orderChosen.length > 0 && !answered && (
                <button onClick={resetOrder} className="mt-4 text-xs flex items-center gap-1 opacity-60">
                  <RotateCcw size={13} /> Recommencer
                </button>
              )}
            </>
          )}

          {step.kind === "listen" && (
            <>
              <p className="font-semibold mb-4">Écoutez, puis choisissez la bonne traduction</p>
              <div className="flex flex-col items-center mb-5">
                <button
                  onClick={() => speak(step.word?.arabic_vocalized)}
                  className="w-16 h-16 rounded-full bg-ink text-gold-light flex items-center justify-center speak-pulse"
                >
                  <Volume2 size={26} />
                </button>
                {lastSpokenOk === false && (
                  <p className="text-xs text-center text-[#8a8264] mt-3">
                    🔇 Pas de voix arabe disponible.
                    <br />
                    Prononciation phonétique : <em>{step.word?.transliteration}</em>
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {(step.options ?? []).map((opt) => (
                  <OptionButton
                    key={opt}
                    label={opt}
                    isSelected={selected === opt}
                    isCorrectAnswer={answered && reveal?.value === opt}
                    isWrongSelected={answered && selected === opt && reveal?.value !== opt}
                    disabled={answered || submitting}
                    onClick={() => handleMcqSelect(opt, opt)}
                  />
                ))}
              </div>
            </>
          )}

          {answered && step.kind !== "intro" && (
            <>
              <p className={`text-sm font-semibold text-center mt-4 ${isCorrect ? "text-teal" : "text-rust"}`}>
                {isCorrect ? "Parfait !" : "Pas tout à fait — la bonne réponse est en surbrillance."}
              </p>
              <button
                onClick={nextStep}
                className={`w-full mt-4 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 ${
                  isCorrect ? "bg-teal" : "bg-rust"
                }`}
              >
                Continuer <ArrowRight size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function OptionButton({ label, arabicLabel, isSelected, isCorrectAnswer, isWrongSelected, disabled, onClick }) {
  let cls = "border-black/10 bg-white";
  if (isCorrectAnswer) cls = "border-teal bg-teal/10 text-[#1E5E56]";
  else if (isWrongSelected) cls = "border-rust bg-rust/10 text-[#8C3327]";
  else if (isSelected) cls = "border-ink-3 bg-black/5";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-4 py-3 rounded-xl border-2 font-semibold flex items-center justify-between ${cls}`}
    >
      {arabicLabel ? <span className="arabic text-xl" dir="rtl">{arabicLabel}</span> : <span>{label}</span>}
      {isCorrectAnswer && <Check size={18} className="text-teal" />}
    </button>
  );
}
