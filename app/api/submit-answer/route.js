import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { nextBoxLevel, nextReviewDate } from "@/lib/srs";
import { arabicAnswersMatch } from "@/lib/arabicNormalize";
import { getWeekStartDate } from "@/lib/weekUtils";

const XP_BY_KIND = {
  intro: 5,
  mcq_ar_to_fr: 10,
  mcq_fr_to_ar: 10,
  listen: 10,
  order: 15,
  dictee: 15,
  repeat_aloud: 8,
  dialogue: 20, // exercice plus long (lecture + compréhension) — XP en conséquence
};

export async function POST(request) {
  // 1. Identify the caller from their session cookie — never trust a
  //    user_id sent in the request body.
  const sessionClient = createServerSupabaseClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { step_id, user_answer } = await request.json();
  if (!step_id) {
    return NextResponse.json({ error: "step_id manquant" }, { status: 400 });
  }

  // 2. From here on, use the service-role client — it bypasses RLS, which
  //    is exactly what a trusted server process is allowed to do. The
  //    correct answer lives in `steps.payload` and is never sent to the
  //    client ahead of time, so it can't be read from devtools.
  const db = createServiceRoleClient();

  const { data: step, error: stepError } = await db
    .from("steps")
    .select("id, lesson_id, kind, payload, lessons(unit_id)")
    .eq("id", step_id)
    .single();

  if (stepError || !step) {
    return NextResponse.json({ error: "Étape introuvable" }, { status: 404 });
  }

  const isCorrect = evaluateAnswer(step, user_answer);
  const xpAwarded = isCorrect ? XP_BY_KIND[step.kind] ?? 10 : 0;

  // 3. Update XP + streak + XP hebdomadaire (pour le leaderboard).
  if (xpAwarded > 0) {
    const today = new Date().toISOString().slice(0, 10);
    const { data: stats } = await db
      .from("user_stats")
      .select("xp_total, streak_count, last_active_date, weekly_xp, week_start_date")
      .eq("user_id", user.id)
      .single();

    const wasActiveYesterday =
      stats?.last_active_date &&
      new Date(today) - new Date(stats.last_active_date) === 86400000;
    const wasActiveToday = stats?.last_active_date === today;

    const newStreak = wasActiveToday
      ? stats.streak_count
      : wasActiveYesterday
      ? (stats?.streak_count ?? 0) + 1
      : 1;

    // L'XP hebdomadaire se remet à zéro dès qu'on détecte qu'on est
    // entré dans une nouvelle semaine (comparaison du lundi courant à
    // celui enregistré) — pas besoin de tâche planifiée (cron), la
    // remise à zéro se fait "paresseusement" à la prochaine action.
    const currentWeekStart = getWeekStartDate();
    const isSameWeek = stats?.week_start_date === currentWeekStart;
    const newWeeklyXp = isSameWeek ? (stats?.weekly_xp ?? 0) + xpAwarded : xpAwarded;

    await db
      .from("user_stats")
      .update({
        xp_total: (stats?.xp_total ?? 0) + xpAwarded,
        streak_count: newStreak,
        last_active_date: today,
        weekly_xp: newWeeklyXp,
        week_start_date: currentWeekStart,
      })
      .eq("user_id", user.id);
  }

  // 4. Update the spaced-repetition queue for any word this step touches.
  const { data: linkedWords } = await db
    .from("step_words")
    .select("word_id")
    .eq("step_id", step_id);

  for (const { word_id } of linkedWords ?? []) {
    const { data: existing } = await db
      .from("user_word_review")
      .select("box_level")
      .eq("user_id", user.id)
      .eq("word_id", word_id)
      .maybeSingle();

    const currentLevel = existing?.box_level ?? 1;
    const newLevel = nextBoxLevel(currentLevel, isCorrect);

    await db.from("user_word_review").upsert({
      user_id: user.id,
      word_id,
      box_level: newLevel,
      next_review_at: nextReviewDate(newLevel).toISOString(),
      last_result: isCorrect ? "correct" : "incorrect",
      updated_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    correct: isCorrect,
    xp_awarded: xpAwarded,
    reveal: revealCorrectAnswer(step),
  });
}

// Once the user has already submitted an answer, it's safe to tell them
// what the correct one was — this is only ever computed after grading,
// never sent to the client ahead of time.
function revealCorrectAnswer(step) {
  switch (step.kind) {
    case "mcq_ar_to_fr":
    case "listen":
    case "dialogue":
      return { value: step.payload.answer };
    case "mcq_fr_to_ar":
      return { wordId: step.payload.answer_word_id };
    case "order":
      return { orderWordIds: step.payload.answer_word_ids };
    case "dictee":
      return { value: step.payload.answer }; // le mot arabe correct, à afficher après coup
    default:
      return null;
  }
}

// Evaluates the submitted answer against the step's stored payload.
// Kept in one place so the "what counts as correct" logic never has to be
// duplicated (or trusted) on the client.
function evaluateAnswer(step, userAnswer) {
  switch (step.kind) {
    case "intro":
      return true; // no wrong answer — acknowledging the flashcard is enough
    case "mcq_ar_to_fr":
    case "listen":
    case "dialogue":
      return userAnswer === step.payload.answer;
    case "mcq_fr_to_ar":
      return userAnswer === step.payload.answer_word_id;
    case "order":
      return (
        JSON.stringify(userAnswer) ===
        JSON.stringify(step.payload.answer_word_ids)
      );
    case "dictee":
      // Écoute + écriture : compare le mot tapé au mot arabe attendu, en
      // tolérant les harakat non saisies (peu de claviers les permettent).
      return arabicAnswersMatch(userAnswer, step.payload.answer);
    case "repeat_aloud":
      // Pas de reconnaissance vocale (hors scope du MVP) : l'utilisateur
      // s'auto-évalue. On fait confiance à sa réponse — le but est la
      // pratique répétée, pas une note infaillible.
      return userAnswer === true;
    default:
      return false;
  }
}
