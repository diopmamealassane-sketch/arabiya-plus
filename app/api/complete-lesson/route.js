import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getMonthStartDate, getNextMonthStartDate, formatDateFr } from "@/lib/monthUtils";

// Appelée une seule fois, côté client, quand l'utilisateur atteint l'écran
// de fin de leçon. C'est ce qui manquait : submit-answer suit chaque
// réponse individuellement (XP, répétition espacée), mais rien ne
// marquait jamais la LEÇON elle-même comme terminée dans user_progress —
// d'où une progression toujours affichée à 0, quel que soit l'avancement
// réel de l'utilisateur.
//
// Limite mensuelle : pour éviter qu'un utilisateur (notamment en période
// d'essai) enchaîne les 600 leçons de la plateforme en quelques semaines
// au lieu de les assimiler, on plafonne à 200 NOUVELLES leçons validées
// par mois calendaire — pour tout le monde, essai ou abonné.
//
// Réviser une leçon déjà validée CE MOIS-CI ne compte jamais dans le
// quota : grâce à l'upsert sur (user_id, lesson_id), seule une leçon pas
// encore complétée depuis le 1er du mois fait progresser le compteur.
// Des messages encourageant la révision sont renvoyés une seule fois
// chacun, au moment précis où le compteur atteint 100, 130, 160, 190
// puis 195.
const MONTHLY_LESSON_LIMIT = 200;
const WARNING_THRESHOLDS = [100, 130, 160, 190, 195];

const WARNING_MESSAGES = {
  100: "🎉 100 leçons validées ce mois-ci ! Une petite révision des unités précédentes pourrait bien renforcer tout ce que vous avez appris.",
  130: "💪 130 leçons ce mois-ci — un rythme impressionnant ! Pensez à alterner avec des révisions pour mieux ancrer vos acquis.",
  160: "⏸️ 160 leçons ce mois-ci : vous approchez de la limite mensuelle de 200. On vous conseille de ralentir et de revoir les leçons déjà terminées.",
  190: "⚠️ Attention : 190 leçons ce mois-ci, il ne vous en reste que 10 avant la limite mensuelle. Profitez-en pour réviser plutôt qu'enchaîner.",
  195: "🚨 Dernière ligne droite : 195 leçons sur 200 ce mois-ci. Plus que 5 nouvelles leçons possibles — passez en mode révision dès maintenant.",
};

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

  const monthStart = getMonthStartDate();
  const monthStartIso = `${monthStart}T00:00:00.000Z`;

  // Une leçon déjà validée CE MOIS-CI qu'on refait est une révision : elle
  // ne doit jamais être bloquée ni compter dans le quota mensuel.
  const { data: existingThisMonth } = await db
    .from("user_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("lesson_id", lesson_id)
    .eq("status", "completed")
    .gte("completed_at", monthStartIso)
    .maybeSingle();

  const isReview = !!existingThisMonth;
  let newMonthlyCount = null;

  if (!isReview) {
    const { count: currentMonthlyCount } = await db
      .from("user_progress")
      .select("lesson_id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "completed")
      .gte("completed_at", monthStartIso);

    newMonthlyCount = (currentMonthlyCount ?? 0) + 1;

    if (newMonthlyCount > MONTHLY_LESSON_LIMIT) {
      const resetDate = formatDateFr(getNextMonthStartDate());
      return NextResponse.json(
        {
          error: "monthly_limit_reached",
          message: `🔒 Vous avez atteint la limite de ${MONTHLY_LESSON_LIMIT} nouvelles leçons pour ce mois-ci. C'est une pause volontaire pour vous aider à mieux mémoriser ce que vous avez déjà appris. Vous pouvez continuer à réviser librement toutes vos leçons déjà validées. De nouvelles leçons seront à nouveau disponibles le ${resetDate}.`,
          lessonsThisMonth: newMonthlyCount - 1,
          monthlyLimit: MONTHLY_LESSON_LIMIT,
          resetDate,
        },
        { status: 403 }
      );
    }
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

  const warning =
    !isReview && WARNING_THRESHOLDS.includes(newMonthlyCount)
      ? WARNING_MESSAGES[newMonthlyCount]
      : null;

  return NextResponse.json({
    ok: true,
    lessonsThisMonth: isReview ? null : newMonthlyCount,
    monthlyLimit: MONTHLY_LESSON_LIMIT,
    warning,
  });
}
