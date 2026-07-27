import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Intervalles en jours par niveau de boîte (méthode Leitner) — une bonne
// réponse fait monter d'une boîte, une mauvaise réponse renvoie à la
// boîte 1 (révision dès le lendemain).
const INTERVALS_DAYS = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30, 6: 90 };
const MAX_BOX = 6;

export async function POST(request) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const wordId = body?.wordId;
  const correct = body?.correct;

  if (!wordId || typeof correct !== "boolean") {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("user_word_review")
    .select("box_level")
    .eq("user_id", user.id)
    .eq("word_id", wordId)
    .maybeSingle();

  const currentBox = existing?.box_level ?? 0;
  const newBox = correct ? Math.min(currentBox + 1, MAX_BOX) : 1;
  const intervalDays = INTERVALS_DAYS[newBox] ?? 1;
  const nextReviewAt = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("user_word_review").upsert(
    {
      user_id: user.id,
      word_id: wordId,
      box_level: newBox,
      next_review_at: nextReviewAt,
      last_result: correct ? "correct" : "incorrect",
    },
    { onConflict: "user_id,word_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, box_level: newBox, next_review_at: nextReviewAt });
}
