import Link from "next/link";
import { redirect } from "next/navigation";
import { Flame, Star, ArrowRight, Brain, Trophy } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import LearningPath from "@/components/LearningPath";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const nowIso = new Date().toISOString();

  const [
    { data: stats },
    { data: units },
    { data: progress },
    { data: subscription },
    { count: dueReviewCount },
  ] = await Promise.all([
    supabase.from("user_stats").select("*").eq("user_id", user.id).single(),
    supabase
      .from("units")
      .select("id, cycle, title_fr, order_index, is_free, lessons(id, title_fr, order_index)")
      .order("cycle")
      .order("order_index"),
    supabase.from("user_progress").select("lesson_id, status").eq("user_id", user.id),
    supabase.from("subscriptions").select("status").eq("user_id", user.id).single(),
    supabase
      .from("user_word_review")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .lte("next_review_at", nowIso),
  ]);

  const progressByLesson = Object.fromEntries(
    (progress ?? []).map((p) => [p.lesson_id, p.status])
  );
  const isPremium = subscription?.status === "active";

  // Group units by cycle, preserving the cycle order already applied by the query
  const unitsByCycle = [];
  for (const unit of units ?? []) {
    let group = unitsByCycle.find((g) => g.cycle === unit.cycle);
    if (!group) {
      group = { cycle: unit.cycle, units: [] };
      unitsByCycle.push(group);
    }
    group.units.push(unit);
  }

  const totalLessons = (units ?? []).reduce((sum, u) => sum + (u.lessons?.length ?? 0), 0);
  const completedLessons = (progress ?? []).filter((p) => p.status === "completed").length;
  const overallPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Calcule la prochaine leçon précise (pas juste l'unité) à proposer en
  // priorité — c'est ce qui permet de "reprendre là où on s'était arrêté"
  // dès la reconnexion, plutôt que de laisser l'utilisateur chercher.
  let resumeLesson = null;
  outer: for (const group of unitsByCycle) {
    for (const unit of group.units) {
      const locked = !unit.is_free && !isPremium;
      if (locked) continue;
      const sortedLessons = [...(unit.lessons ?? [])].sort((a, b) => a.order_index - b.order_index);
      for (const lesson of sortedLessons) {
        if (progressByLesson[lesson.id] !== "completed") {
          resumeLesson = { ...lesson, unitTitle: unit.title_fr };
          break outer;
        }
      }
    }
  }

  const dueCount = dueReviewCount ?? 0;

  return (
    <main className="min-h-screen bg-parchment">
      {/* Bannière */}
      <div className="bg-gradient-to-br from-ink to-ink-2 text-white px-5 pt-6 pb-11 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <Link href="/" className="shrink-0 max-w-[45%]">
            <img
              src="/logo-mark.png"
              alt="Arabiya+"
              className="h-32 w-auto max-w-full object-contain"
            />
          </Link>
          <div className="flex gap-2.5">
            <span className="bg-white/15 backdrop-blur rounded-full px-3.5 py-1.5 text-sm font-extrabold flex items-center gap-1.5">
              <Flame size={16} /> {stats?.streak_count ?? 0} jours
            </span>
            <span className="bg-white/15 backdrop-blur rounded-full px-3.5 py-1.5 text-sm font-extrabold flex items-center gap-1.5">
              <Star size={16} /> {stats?.xp_total ?? 0} XP
            </span>
            <Link
              href="/leaderboard"
              className="bg-white/15 backdrop-blur rounded-full px-3.5 py-1.5 text-sm font-extrabold flex items-center gap-1.5"
            >
              <Trophy size={16} />
            </Link>
          </div>
        </div>

        <div className="relative z-10 mt-5">
          <h1 className="arabic text-3xl" dir="rtl">مَرْحَبًا!</h1>
          <p className="text-base text-white/70 font-semibold mt-1">
            {completedLessons} leçon{completedLessons !== 1 ? "s" : ""} terminée{completedLessons !== 1 ? "s" : ""} sur {totalLessons}
          </p>
        </div>

        <div className="relative z-10 mt-4 bg-white/20 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 -mt-5 relative z-10 pb-16">
        {!isPremium && (
          <div className="bg-white border border-gold/30 rounded-2xl p-4 mb-10 shadow-md flex items-center justify-between gap-3">
            <p className="text-base text-ink/70 font-semibold">
              5 unités gratuites débloquées. Passez Premium pour le reste du parcours.
            </p>
            <Link
              href="/pricing"
              className="bg-gradient-to-b from-gold-light to-gold text-[#241A02] text-base font-extrabold px-4 py-2.5 rounded-xl whitespace-nowrap flex items-center gap-1.5"
            >
              Abonnement <ArrowRight size={16} />
            </Link>
          </div>
        )}

        <div className="grid gap-4 mb-6">
          {resumeLesson && completedLessons > 0 && (
            <Link
              href={`/lesson/${resumeLesson.id}`}
              className="block bg-gradient-to-br from-ink to-ink-2 text-white rounded-2xl p-5 shadow-md"
            >
              <p className="text-sm text-white/60 font-semibold mb-1">Reprendre où vous en étiez</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gold-light font-bold uppercase tracking-wide">{resumeLesson.unitTitle}</p>
                  <p className="font-extrabold text-lg">{resumeLesson.title_fr}</p>
                </div>
                <ArrowRight size={22} className="text-gold-light shrink-0" />
              </div>
            </Link>
          )}

          {dueCount > 0 && (
            <Link
              href="/review"
              className="block bg-gradient-to-br from-gold-light to-gold text-[#241A02] rounded-2xl p-5 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-black/10 flex items-center justify-center shrink-0">
                    <Brain size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold opacity-70">Révision du jour</p>
                    <p className="font-extrabold text-lg">
                      {dueCount} mot{dueCount !== 1 ? "s" : ""} à réviser
                    </p>
                  </div>
                </div>
                <ArrowRight size={22} className="shrink-0" />
              </div>
            </Link>
          )}
        </div>

        {unitsByCycle.length > 0 ? (
          <LearningPath
            unitsByCycle={unitsByCycle}
            progressByLesson={progressByLesson}
            isPremium={isPremium}
          />
        ) : (
          <p className="text-center text-ink/50 text-base py-20">
            Aucun contenu pour le moment — exécutez le seed Supabase pour voir la leçon de démonstration.
          </p>
        )}
      </div>
    </main>
  );
}
