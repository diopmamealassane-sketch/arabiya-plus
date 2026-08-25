"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Volume2, X, Check, ArrowRight, ArrowLeft, RotateCcw, CheckCircle2, Mic, PenLine, Sparkles, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { scorePronunciation } from "@/lib/pronunciationScore";

export default function LessonEngine({
  lessonTitle,
  lessonId,
  steps,
  prevLessonId,
  nextLessonId,
  alreadyCompleted,
}) {
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
  const [typedAnswer, setTypedAnswer] = useState("");
  const [recognitionState, setRecognitionState] = useState("idle"); // idle | listening | unsupported
  const [pronunciationScore, setPronunciationScore] = useState(null);
  const [cultureBite, setCultureBite] = useState(null);
  const [monthlyNotice, setMonthlyNotice] = useState(null); // { type: "warning" | "blocked", message: string }
  const voicesRef = useRef([]);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const continueBtnRef = useRef(null);

  const doneReportedRef = useRef(false);

  const done = stepIndex >= steps.length;
  const step = !done ? steps[stepIndex] : null;

  const shuffledOptions = useMemo(() => {
    if (!step?.options) return [];
    const arr = [...step.options];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [step?.id]);

  useEffect(() => {
    setSelected(null);
    setAnswered(false);
    setIsCorrect(false);
    setReveal(null);
    setOrderChosen([]);
    setTypedAnswer("");
    setPronunciationScore(null);
    setRecognitionState((s) => (s === "unsupported" ? s : "idle"));
    recognitionRef.current?.abort?.();
  }, [stepIndex]);

  useEffect(() => {
    if (!answered) return;
    const t = setTimeout(() => {
      continueBtnRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    return () => clearTimeout(t);
  }, [answered]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    function loadVoices() {
      voicesRef.current = window.speechSynthesis.getVoices();
    }
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  useEffect(() => {
    return () => {
      audioRef.current?.pause?.();
    };
  }, []);

  function playWord(word) {
    if (!word) {
      setLastSpokenOk(false);
      return;
    }

    if (word.audio_url) {
      try {
        audioRef.current?.pause?.();
        const audio = new Audio(word.audio_url);
        audioRef.current = audio;
        audio.onplay = () => setLastSpokenOk(true);
        audio.onerror = () => {
          speakFallback(word.arabic_vocalized);
        };
        audio.play().catch(() => {
          speakFallback(word.arabic_vocalized);
        });
        return;
      } catch {
        speakFallback(word.arabic_vocalized);
        return;
      }
    }

    speakFallback(word.arabic_vocalized);
  }

  function speakFallback(text) {
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

  function startPronunciationCheck(targetWord) {
    const SpeechRecognitionCtor =
      typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognitionCtor) {
      setRecognitionState("unsupported");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "ar-SA";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setRecognitionState("listening");
    recognition.onerror = (event) => {
      // Diagnostic temporaire : affiche l'erreur réelle au lieu de la
      // masquer silencieusement, pour identifier la vraie cause.
      alert("Erreur reconnaissance vocale : " + event.error);
      setRecognitionState("idle");
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const score = scorePronunciation(transcript, targetWord);
      setPronunciationScore(score);
      setRecognitionState("idle");
      handleMcqSelect(score >= 60, score >= 60);
    };
    recognition.onend = () => {
      setRecognitionState((s) => (s === "listening" ? "idle" : s));
    };

    try {
      recognition.start();
      setTimeout(() => {
        try {
          recognition.stop();
        } catch {}
      }, 5000);
    } catch {
      setRecognitionState("idle");
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

  const note = gradedCount > 0 ? Math.round((correctCount / gradedCount) * 20) : 20;
  const appreciation =
    note >= 18 ? "Excellent !" :
    note >= 16 ? "Très bien !" :
    note >= 14 ? "Bien." :
    note >= 12 ? "Assez bien." :
    note >= 10 ? "Passable." :
    "Peut mieux faire.";

  useEffect(() => {
    if (!done || doneReportedRef.current) return;
    doneReportedRef.current = true;
    fetch("/api/complete-lesson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lesson_id: lessonId, accuracy: note * 5 }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!data) return;
        if (res.status === 403 && data.error === "monthly_limit_reached") {
          setMonthlyNotice({ type: "blocked", message: data.message });
        } else if (data.warning) {
          setMonthlyNotice({ type: "warning", message: data.warning });
        }
      })
      .catch(() => {});
  }, [done]);

  useEffect(() => {
    if (!done) return;
    fetch("/api/culture-bite/random", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && !data.error) setCultureBite(data);
      })
      .catch(() => {});
  }, [done]);

  if (done) {
    return (
      <main className="geo-bg min-h-screen flex items-center justify-center px-4">
        <div className="bg-parchment text-ink rounded-2xl p-8 max-w-sm w-full text-center float-in">
          <p className="uppercase tracking-widest text-sm text-[#8a8264] font-semibold mb-2">
            Leçon terminée
          </p>
          <h2 className="arabic text-3xl mb-4">أَحْسَنْتَ!</h2>

          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="text-4xl font-black text-ink">{note}</span>
            <span className="text-lg text-[#8a8264] font-semibold">/ 20</span>
          </div>
          <p className="text-base font-semibold text-[#7a5c14] mb-1">{appreciation}</p>
          <p className="text-sm text-[#8a8264] mb-6">
            {correctCount} / {gradedCount} bonnes réponses · +{xpEarned} XP
          </p>

          {monthlyNotice && (
            <div
              className={`rounded-xl p-4 mb-6 text-left border-2 flex gap-2.5 items-start ${
                monthlyNotice.type === "blocked"
                  ? "bg-rust/10 border-rust/40"
                  : "bg-gold/10 border-gold/40"
              }`}
            >
              <AlertTriangle
                size={18}
                className={`shrink-0 mt-0.5 ${monthlyNotice.type === "blocked" ? "text-[#8C3327]" : "text-[#7a5c14]"}`}
              />
              <p
                className={`text-sm font-semibold ${
                  monthlyNotice.type === "blocked" ? "text-[#8C3327]" : "text-[#7a5c14]"
                }`}
              >
                {monthlyNotice.message}
              </p>
            </div>
          )}

          {cultureBite && (
            <div className="bg-white border-2 border-gold/30 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs uppercase tracking-wide text-[#8a8264] font-bold mb-1.5 flex items-center gap-1.5">
                <Sparkles size={13} className="text-gold" /> Le saviez-vous ?
              </p>
              <p className="font-bold text-ink mb-1">
                {cultureBite.emoji} {cultureBite.title_fr}
              </p>
              <p className="text-sm text-[#6b6350]">{cultureBite.body_fr}</p>
            </div>
          )}

          <button
            onClick={() => (nextLessonId ? router.push(`/lesson/${nextLessonId}`) : router.push("/dashboard"))}
            className="w-full bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold py-3 rounded-xl flex items-center justify-center gap-2"
          >
            {nextLessonId ? "Leçon suivante" : "Retour au tableau de bord"}
            <ArrowRight size={20} />
          </button>
          {nextLessonId && (
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full mt-3 py-2 text-sm text-[#8a8264]"
            >
              Retour au tableau de bord
            </button>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="geo-bg min-h-screen px-4 py-8">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.push("/dashboard")} className="opacity-70">
            <X size={24} />
          </button>
          <div className="flex items-center gap-3">
            {prevLessonId && (
              <button
                onClick={() => router.push(`/lesson/${prevLessonId}`)}
                className="opacity-70 flex items-center gap-1 text-sm font-semibold"
                title="Leçon précédente"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <span className="text-sm opacity-60">{stepIndex + 1} / {steps.length}</span>
            {nextLessonId && (
              <button
                onClick={() => router.push(`/lesson/${nextLessonId}`)}
                className="opacity-70 flex items-center gap-1 text-sm font-semibold"
                title="Passer à la leçon suivante"
              >
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {alreadyCompleted && (
          <div className="bg-teal/15 border border-teal/40 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2 text-teal text-sm font-semibold">
            <CheckCircle2 size={16} /> Leçon déjà validée — vous pouvez la refaire ou passer à la suivante.
          </div>
        )}

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
          <p className="text-sm uppercase tracking-wide text-[#8a8264] font-semibold mb-3">
            {lessonTitle}
          </p>

          {step.kind === "intro" && (
            <>
              <div className="text-center py-3">
                {step.word?.image_url && (
                  <img
                    src={step.word.image_url}
                    alt={step.word?.french ?? ""}
                    className="w-32 h-32 object-cover rounded-2xl mx-auto mb-4 border-2 border-black/10"
                  />
                )}
                <div className="arabic text-5xl" dir="rtl">{step.word?.arabic_vocalized}</div>
                <div className="italic text-[#6b6350] mt-2 text-base">{step.word?.transliteration}</div>
                <div className="font-semibold mt-1">{step.word?.french}</div>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => playWord(step.word)}
                  className="w-12 h-12 rounded-full bg-ink text-gold-light flex items-center justify-center speak-pulse"
                >
                  <Volume2 size={22} />
                </button>
              </div>
              {lastSpokenOk === false && (
                <p className="text-sm text-center text-[#8a8264] mt-3">
                  🔇 Audio indisponible pour ce mot — appuyez-vous sur la transcription phonétique.
                </p>
              )}
              <button
                onClick={handleIntroContinue}
                disabled={submitting}
                className="w-full mt-6 bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                J'ai compris <ArrowRight size={20} />
              </button>
            </>
          )}

          {step.kind === "mcq_ar_to_fr" && (
            <>
              <p className="font-semibold mb-4">Que signifie ce mot ?</p>
              <div className="text-center mb-4">
                <div className="arabic text-4xl" dir="rtl">{step.promptWord?.arabic_vocalized}</div>
                <button
                  onClick={() => playWord(step.promptWord)}
                  className="w-10 h-10 mx-auto mt-2 rounded-full bg-ink text-gold-light flex items-center justify-center"
                >
                  <Volume2 size={18} />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {(shuffledOptions).map((opt) => (
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

          {step.kind === "dialogue" && (
            <>
              <p className="font-semibold mb-4 flex items-center gap-2">
                <PenLine size={18} /> Lisez le dialogue
              </p>
              <div className="space-y-2.5 mb-6">
                {(step.lines ?? []).map((line, idx) => {
                  const isLeft = idx % 2 === 0;
                  return (
                    <div key={idx} className={`flex ${isLeft ? "justify-start" : "justify-end"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                          isLeft
                            ? "bg-white border border-black/10 rounded-bl-sm"
                            : "bg-ink text-white rounded-br-sm"
                        }`}
                      >
                        {line.speaker && (
                          <p className={`text-xs font-bold mb-1 ${isLeft ? "text-[#8a8264]" : "text-gold-light"}`}>
                            {line.speaker}
                          </p>
                        )}
                        <p className="arabic text-xl leading-relaxed" dir="rtl">{line.arabic}</p>
                        <p className={`text-sm mt-1 ${isLeft ? "opacity-70" : "opacity-80"}`}>{line.french}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-black/10 pt-4 mb-3">
                <p className="text-xs uppercase tracking-wide text-[#8a8264] font-bold mb-2">
                  Question de compréhension
                </p>
                <p className="font-semibold">{step.questionFr}</p>
              </div>
              <div className="flex flex-col gap-2">
                {(shuffledOptions).map((opt) => (
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
                {(shuffledOptions).map((opt) => (
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
              {step.note && <p className="text-sm italic text-[#8a8264] mt-3">{step.note}</p>}
            </>
          )}

          {step.kind === "order" && (
            <>
              <p className="font-semibold mb-4">{step.instruction}</p>
              <div className="min-h-[58px] border-2 border-dashed border-black/15 rounded-xl flex items-center gap-2 px-3 py-2 flex-wrap justify-end" dir="rtl">
                {orderChosen.length === 0 && (
                  <span className="text-sm text-[#a89f83]" dir="ltr">
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
                <button onClick={resetOrder} className="mt-4 text-sm flex items-center gap-1 opacity-60">
                  <RotateCcw size={15} /> Recommencer
                </button>
              )}
            </>
          )}

          {step.kind === "listen" && (
            <>
              <p className="font-semibold mb-4">Écoutez, puis choisissez la bonne traduction</p>
              <div className="flex flex-col items-center mb-5">
                <button
                  onClick={() => playWord(step.word)}
                  className="w-16 h-16 rounded-full bg-ink text-gold-light flex items-center justify-center speak-pulse"
                >
                  <Volume2 size={28} />
                </button>
                {lastSpokenOk === false && (
                  <p className="text-sm text-center text-[#8a8264] mt-3">
                    🔇 Audio indisponible.
                    <br />
                    Prononciation phonétique : <em>{step.word?.transliteration}</em>
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {(shuffledOptions).map((opt) => (
                  <OptionButton
                    key={opt}
                    arabicLabel={opt}
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

          {step.kind === "dictee" && (
            <>
              <p className="font-semibold mb-1 flex items-center gap-2">
                <PenLine size={18} /> Dictée — écoutez et écrivez le mot en arabe
              </p>
              <p className="text-sm text-[#8a8264] mb-4">Compréhension orale + production écrite</p>
              <div className="flex justify-center mb-5">
                <button
                  onClick={() => playWord(step.word)}
                  className="w-16 h-16 rounded-full bg-ink text-gold-light flex items-center justify-center speak-pulse"
                >
                  <Volume2 size={28} />
                </button>
              </div>
              {lastSpokenOk === false && (
                <p className="text-sm text-center text-[#8a8264] mb-4">
                  🔇 Audio indisponible.
                  <br />
                  Prononciation phonétique : <em>{step.word?.transliteration}</em>
                </p>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!answered && !submitting) handleMcqSelect(typedAnswer, typedAnswer);
                }}
              >
                <input
                  type="text"
                  dir="rtl"
                  lang="ar"
                  disabled={answered || submitting}
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  placeholder="اكتب هنا"
                  className={`arabic text-2xl w-full border-2 rounded-xl px-4 py-3 mb-3 text-center ${
                    answered && isCorrect ? "border-teal bg-teal/10" : answered ? "border-rust bg-rust/10" : "border-black/15"
                  }`}
                />
                {answered && !isCorrect && (
                  <p className="text-sm text-center text-[#8C3327] mb-2">
                    Réponse attendue : <span className="arabic text-lg">{reveal?.value}</span>
                  </p>
                )}
                {!answered && (
                  <button
                    type="submit"
                    disabled={!typedAnswer.trim() || submitting}
                    className="w-full bg-ink text-white font-bold py-3 rounded-xl disabled:opacity-40"
                  >
                    Vérifier
                  </button>
                )}
              </form>
            </>
          )}

          {step.kind === "repeat_aloud" && (
            <>
              <p className="font-semibold mb-1 flex items-center gap-2">
                <Mic size={18} /> Production orale — lisez et répétez à voix haute
              </p>
              <p className="text-sm text-[#8a8264] mb-4">
                {recognitionState === "unsupported"
                  ? "Reconnaissance vocale non disponible sur ce navigateur — évaluez-vous vous-même ci-dessous."
                  : "Enregistrez-vous, ou évaluez-vous vous-même."}
              </p>
              <div className="text-center py-3">
                <div className="arabic text-5xl" dir="rtl">{step.word?.arabic_vocalized}</div>
                <div className="italic text-[#6b6350] mt-2 text-base">{step.word?.transliteration}</div>
                <div className="font-semibold mt-1">{step.word?.french}</div>
              </div>
              <div className="flex justify-center gap-4 mb-5">
                <button
                  onClick={() => playWord(step.word)}
                  className="w-14 h-14 rounded-full bg-ink text-gold-light flex items-center justify-center speak-pulse"
                  title="Écouter la prononciation"
                >
                  <Volume2 size={24} />
                </button>
                {recognitionState !== "unsupported" && !answered && (
                  <button
                    onClick={() => startPronunciationCheck(step.word?.audio_text || step.word?.arabic_vocalized)}
                    disabled={recognitionState === "listening" || submitting}
                    className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      recognitionState === "listening"
                        ? "bg-rust text-white speak-pulse"
                        : "bg-teal text-white"
                    }`}
                    title="Enregistrer ma prononciation"
                  >
                    <Mic size={24} />
                  </button>
                )}
              </div>

              {recognitionState === "listening" && (
                <p className="text-sm text-center text-[#7a5c14] font-semibold mb-4">
                  🎙️ Je vous écoute — parlez maintenant…
                </p>
              )}

              {pronunciationScore !== null && (
                <div
                  className={`rounded-xl px-4 py-3 mb-4 text-center font-bold ${
                    pronunciationScore >= 80
                      ? "bg-teal/10 text-[#1E5E56]"
                      : pronunciationScore >= 60
                      ? "bg-gold/15 text-[#7a5c14]"
                      : "bg-rust/10 text-[#8C3327]"
                  }`}
                >
                  Score de prononciation : {pronunciationScore}%
                </div>
              )}

              {!answered && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMcqSelect(false, false)}
                    className="flex-1 py-3 rounded-xl border-2 border-black/15 font-semibold text-sm"
                  >
                    À retravailler
                  </button>
                  <button
                    onClick={() => handleMcqSelect(true, true)}
                    className="flex-1 py-3 rounded-xl bg-teal text-white font-semibold text-sm"
                  >
                    J'ai réussi
                  </button>
                </div>
              )}
            </>
          )}

          {answered && step.kind !== "intro" && (
            <>
              <p className={`text-base font-semibold text-center mt-4 ${isCorrect ? "text-teal" : "text-rust"}`}>
                {isCorrect ? "Parfait !" : "Pas tout à fait — la bonne réponse est en surbrillance."}
              </p>
              <button
                ref={continueBtnRef}
                onClick={nextStep}
                className={`w-full mt-4 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 ${
                  isCorrect ? "bg-teal" : "bg-rust"
                }`}
              >
                Continuer <ArrowRight size={20} />
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
      {isCorrectAnswer && <Check size={20} className="text-teal" />}
    </button>
  );
}
