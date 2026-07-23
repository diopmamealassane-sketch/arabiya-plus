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
    .select("id, title_fr, steps(id, order_index, kind, payload)")
    .eq("id", params.lessonId)
    .single();

  if (!lesson) redirect("/dashboard");

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

  return <LessonEngine lessonTitle={lesson.title_fr} lessonId={lesson.id} steps={enrichedSteps} />;
}
