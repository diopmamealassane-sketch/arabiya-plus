import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { generateCertificatePdf } from "@/lib/certificate";

const CYCLE_LABELS = {
  A1: "Cycle 1 — Débutant (A1)",
  A2: "Cycle 2 — Élémentaire (A2)",
  B1: "Cycle 3 — Intermédiaire (B1)",
  B2: "Cycle 4 — Intermédiaire supérieur (B2)",
  C1: "Cycle 5 — Avancé (C1)",
  C2: "Cycle 6 — Expert (C2)",
};

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cycle = searchParams.get("cycle");

  if (!cycle || !CYCLE_LABELS[cycle]) {
    return NextResponse.json({ error: "Paramètre 'cycle' invalide." }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  // Unités "core" (order_index <= 10) du cycle demandé, avec leurs leçons —
  // même filtre que côté client dans LearningPath.js.
  const { data: units, error: unitsError } = await supabase
    .from("units")
    .select("id, order_index, lessons(id)")
    .eq("cycle", cycle)
    .lte("order_index", 10);

  if (unitsError || !units || units.length === 0) {
    return NextResponse.json({ error: "Cycle introuvable." }, { status: 404 });
  }

  const lessonIds = units.flatMap((u) => (u.lessons ?? []).map((l) => l.id));
  const totalLessons = lessonIds.length;

  if (totalLessons === 0) {
    return NextResponse.json({ error: "Cycle vide." }, { status: 404 });
  }

  // Revérification côté serveur : impossible d'obtenir le certificat en
  // trafiquant l'URL, on recompte la progression réelle en base.
  const { data: progress, error: progressError } = await supabase
    .from("user_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .in("lesson_id", lessonIds)
    .eq("status", "completed");

  if (progressError) {
    return NextResponse.json({ error: "Erreur de vérification de la progression." }, { status: 500 });
  }

  const doneCount = progress?.length ?? 0;

  if (doneCount < totalLessons) {
    return NextResponse.json({ error: "Ce cycle n'est pas encore terminé." }, { status: 403 });
  }

  // Nom affiché : profil Supabase, repli sur la partie avant le @ de l'email.
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, name")
    .eq("id", user.id)
    .single();

  const userName =
    profile?.full_name || profile?.name || user.email?.split("@")[0] || "Étudiant Arabiya+";

  const dateStr = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const pdfBytes = await generateCertificatePdf({
    userName,
    cycleLabel: CYCLE_LABELS[cycle],
    unitsCount: units.length,
    lessonsCount: totalLessons,
    dateStr,
  });

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Certificat-Arabiya-Plus-${cycle}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
