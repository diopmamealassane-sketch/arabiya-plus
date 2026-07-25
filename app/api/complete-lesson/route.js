import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

// Appelée une seule fois, côté client, quand l'utilisateur atteint l'écran
// de fin de leçon. C'est ce qui manquait : submit-answer suit chaque
// réponse individuellement (XP, répétition espacée), mais rien ne
// marquait jamais la LEÇON elle-même comme terminée dans user_progress —
// d'où une progression toujours affichée à 0, quel que soit l'avancement
// réel de l'utilisateur.
export async function POST(request) {
  const sessionClient = createServerSupabaseClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { lesson_id, accuracy } = await request.json();
  if (!lesson_id) {
    return NextResponse.json({ error: "lesson_id manquant" }, { status: 400 });
  }

  const db = createServiceRoleClient();

  // Vérifie que la leçon existe réellement avant d'écrire quoi que ce
  // soit — évite qu'un id arbitraire pollue la table de progression.
  const { data: lesson } = await db.from("lessons").select("id").eq("id", lesson_id).single();
  if (!lesson) {
    return NextResponse.json({ error: "Leçon introuvable" }, { status: 404 });
  }

  const { error } = await db.from("user_progress").upsert(
    {
      user_id: user.id,
      lesson_id,
      status: "completed",
      accuracy: typeof accuracy === "number" ? accuracy : null,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
