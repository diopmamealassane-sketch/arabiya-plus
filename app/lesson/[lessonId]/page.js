import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import LessonEngine from "@/components/LessonEngine";

export const dynamic = "force-dynamic";

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

  // Leçons voisines (même unité) pour la navigation précédente/suivante,
  // et le statut de progression pour reconnaître une leçon déjà validée.
  const [{ data: siblingLessons }, { data: progressRow }, { data: unit }] = await Promise.all([
    supabase
      .from("lessons")
      .select("id, order_index")
      .eq("unit_id", lesson.unit_id)
      .order("order_index"),
    supabase
      .from("user_progress")
      .select("status")
      .eq("user_id", user.id)
      .eq("lesson_id", lesson.id)
      .maybeSingle(),
    supabase.from("units").select("cycle, order_index").eq("id", lesson.unit_id).single(),
  ]);

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

  const alreadyCompleted = progressRow?.status === "completed";

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

  const { data: words } = await supabase
    .from("words")
    .select("id, arabic_vocalized, transliteration, french")
    .in("id", Array.from(wordIds));

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
