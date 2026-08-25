import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import LessonEngine from "@/components/LessonEngine";
import { getMonthStartDate, getNextMonthStartDate, formatDateFr } from "@/lib/monthUtils";
import { Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const MONTHLY_LESSON_LIMIT = 200;

export default async function LessonPage({ params }) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title_fr, order_index, unit_id, steps(id, order_index, kind, payload)")
    .eq("id", params.lessonId)
    .single();

  if (!lesson) redirect("/dashboard");

  const monthStart = getMonthStartDate();
  const monthStartDate = new Date(`${monthStart}T00:00:00.000Z`);

  // Leçons voisines (même unité) pour la navigation précédente/suivante,
  // le statut de progression (pour reconnaître une leçon déjà validée),
  // et le nombre de NOUVELLES leçons déjà validées ce mois-ci — utilisé
  // pour appliquer le quota mensuel de 200 avant même d'afficher la leçon.
  const [{ data: siblingLessons }, { data: progressRow }, { data: unit }, { count: monthlyCount }] =
    await Promise.all([
      supabase
        .from("lessons")
        .select("id, order_index")
        .eq("unit_id", lesson.unit_id)
        .order("order_index"),
      supabase
        .from("user_progress")
        .select("status, completed_at")
        .eq("user_id", user.id)
        .eq("lesson_id", lesson.id)
        .maybeSingle(),
      supabase.from("units").select("cycle, order_index").eq("id", lesson.unit_id).single(),
      supabase
        .from("user_progress")
        .select("lesson_id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "completed")
        .gte("completed_at", monthStartDate.toISOString()),
    ]);

  const alreadyCompleted = progressRow?.status === "completed";

  // Une leçon déjà validée CE MOIS-CI reste toujours accessible (c'est de
  // la révision, jamais comptée dans le quota). Une leçon jamais faite, ou
  // faite un mois précédent, est en revanche soumise à la limite : si le
  // quota des 200 nouvelles leçons du mois est déjà atteint, on bloque
  // l'accès à la page elle-même plutôt que de laisser l'utilisateur
  // commencer une leçon qui ne pourra de toute façon pas être enregistrée.
  const completedThisMonth =
    alreadyCompleted && progressRow?.completed_at && new Date(progressRow.completed_at) >= monthStartDate;

  const isBlocked = !completedThisMonth && (monthlyCount ?? 0) >= MONTHLY_LESSON_LIMIT;

  if (isBlocked) {
    const resetDate = formatDateFr(getNextMonthStartDate());
    return (
      <main className="geo-bg min-h-screen flex items-center justify-center px-4">
        <div className="bg-parchment text-ink rounded-2xl p-8 max-w-sm w-full text-center float-in">
          <div className="w-14 h-14 rounded-full bg-rust/10 border-2 border-rust/40 flex items-center justify-center mx-auto mb-5">
            <Lock size={24} className="text-[#8C3327]" />
          </div>
          <h2 className="text-xl font-bold text-ink mb-3">Limite mensuelle atteinte</h2>
          <p className="text-sm text-[#6b6350] mb-6 leading-relaxed">
            🔒 Vous avez atteint la limite de {MONTHLY_LESSON_LIMIT} nouvelles leçons pour ce mois-ci. C'est une
            pause volontaire pour vous aider à mieux mémoriser ce que vous avez déjà appris. Vous pouvez continuer à
            réviser librement toutes vos leçons déjà validées. De nouvelles leçons seront à nouveau disponibles le{" "}
            {resetDate}.
          </p>
          <Link
            href="/dashboard"
            className="w-full bg-gradient-to-b from-gold-light to-gold text-[#241A02] font-bold py-3 rounded-xl flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} /> Retour au tableau de bord
          </Link>
        </div>
      </main>
    );
  }

  const siblingIndex = (siblingLessons ?? []).findIndex((l) => l.id === lesson.id);
  let prevLessonId = siblingIndex > 0 ? siblingLessons[siblingIndex - 1].id : null;
  let nextLessonId =
    siblingIndex >= 0 && siblingIndex < (siblingLessons?.length ?? 0) - 1
      ? siblingLessons[siblingIndex + 1].id
      : null;

  // Dernière leçon de l'unité : on tente de prolonger vers la première
  // leçon de l'unité suivante (même cycle), pour ne pas laisser
  // l'apprenant dans une impasse en fin d'unité.
  if (!nextLessonId && unit) {
    const { data: nextUnit } = await supabase
      .from("units")
      .select("id")
      .eq("cycle", unit.cycle)
      .eq("order_index", unit.order_index + 1)
      .maybeSingle();
    if (nextUnit) {
      const { data: firstLessonNextUnit } = await supabase
        .from("lessons")
        .select("id")
        .eq("unit_id", nextUnit.id)
        .order("order_index")
        .limit(1)
        .maybeSingle();
      nextLessonId = firstLessonNextUnit?.id ?? null;
    }
  }

  const steps = (lesson.steps ?? []).sort((a, b) => a.order_index - b.order_index);

  // Collect every word id referenced anywhere in the steps' payloads so we
  // can resolve them in a single query.
  const wordIds = new Set();
  for (const s of steps) {
    const p = s.payload || {};
    if (p.word_id) wordIds.add(p.word_id);
    if (p.prompt_word_id) wordIds.add(p.prompt_word_id);
    (p.option_word_ids ?? []).forEach((id) => wordIds.add(id));
    (p.chip_word_ids ?? []).forEach((id) => wordIds.add(id));
  }

const { data: words, error: wordsError } = await supabase
  .from("words")
  .select("id, arabic_vocalized, transliteration, french, audio_url, image_url")
  .in("id", Array.from(wordIds));

  if (wordsError) {
    console.error("Erreur fetch words pour la leçon", lesson.id, ":", wordsError.message, wordsError);
  }

  const wordById = Object.fromEntries((words ?? []).map((w) => [w.id, w]));

  // IMPORTANT: build props for the client without ever including
  // `answer` / `answer_word_id` / `answer_word_ids`. The client only gets
  // enough to render the question; grading happens exclusively in
  // /api/submit-answer against the payload still sitting server-side.
  const enrichedSteps = steps.map((s) => {
    const p = s.payload || {};
    switch (s.kind) {
      case "intro":
        return { id: s.id, kind: s.kind, word: wordById[p.word_id] };
      case "mcq_ar_to_fr":
        return {
          id: s.id,
          kind: s.kind,
          promptWord: wordById[p.prompt_word_id],
          options: p.options,
        };
      case "mcq_fr_to_ar":
        return {
          id: s.id,
          kind: s.kind,
          promptFr: p.prompt_fr,
          note: p.note,
          options: (p.option_word_ids ?? []).map((id) => wordById[id]),
        };
      case "order":
        return {
          id: s.id,
          kind: s.kind,
          instruction: p.instruction,
          chips: (p.chip_word_ids ?? []).map((id) => wordById[id]),
          answerLength: (p.answer_word_ids ?? []).length,
        };
      case "listen":
        return {
          id: s.id,
          kind: s.kind,
          word: wordById[p.word_id],
          options: p.options,
        };
      case "dictee":
        // Écoute + écriture : le mot arabe (word.arabic_vocalized) ne doit
        // JAMAIS s'afficher en texte côté client avant la réponse — il ne
        // sert qu'à la synthèse vocale, exactement comme pour "listen".
        return { id: s.id, kind: s.kind, word: wordById[p.word_id] };
      case "repeat_aloud":
        // Production orale : ici, au contraire, le mot s'affiche à l'écran
        // (il faut le lire pour le répéter) — pas de triche possible
        // puisqu'il n'y a pas de correction automatique, juste une
        // auto-évaluation après avoir répété à voix haute.
        return { id: s.id, kind: s.kind, word: wordById[p.word_id] };
      case "dialogue":
        // Texte/dialogue long avec question de compréhension (C1/C2).
        // Contrairement aux autres types, le contenu n'est pas construit
        // à partir de mots isolés en base : les répliques et la question
        // vivent directement dans le payload. L'option correcte (p.answer)
        // n'est jamais envoyée au client, comme pour les autres types.
        return {
          id: s.id,
          kind: s.kind,
          lines: p.lines,
          questionFr: p.question_fr,
          options: p.options,
        };
      default:
        return { id: s.id, kind: s.kind };
    }
  });

  return (
    <LessonEngine
      lessonTitle={lesson.title_fr}
      lessonId={lesson.id}
      steps={enrichedSteps}
      prevLessonId={prevLessonId}
      nextLessonId={nextLessonId}
      alreadyCompleted={alreadyCompleted}
    />
  );
}
