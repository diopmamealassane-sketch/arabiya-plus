import Link from "next/link";
import { redirect } from "next/navigation";
import { Flame, Star, ArrowRight } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import LearningPath from "@/components/LearningPath";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: stats }, { data: units }, { data: progress }, { data: subscription }] =
    await Promise.all([
      supabase.from("user_stats").select("*").eq("user_id", user.id).single(),
      supabase
        .from("units")
        .select("id, cycle, title_fr, order_index, is_free, lessons(id, title_fr, order_index)")
        .order("cycle")
        .order("order_index"),
      supabase.from("user_progress").select("lesson_id, status").eq("user_id", user.id),
      supabase.from("subscriptions").select("status").eq("user_id", user.id).single(),
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

  return (
    <main className="min-h-screen bg-parchment">
      {/* Bannière */}
      <div className="bg-gradient-to-br from-ink to-ink-2 text-white px-5 pt-6 pb-11 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <img src="/logo-mark.png" alt="Arabiya+" className="h-14 w-auto" />
          <div className="flex gap-2.5">
            <span className="bg-white/15 backdrop-blur rounded-full px-3.5 py-1.5 text-xs font-extrabold flex items-center gap-1.5">
              <Flame size={14} /> {stats?.streak_count ?? 0} jours
            </span>
            <span className="bg-white/15 backdrop-blur rounded-full px-3.5 py-1.5 text-xs font-extrabold flex items-center gap-1.5">
              <Star size={14} /> {stats?.xp_total ?? 0} XP
            </span>
          </div>
        </div>

        <div className="relative z-10 mt-5">
          <h1 className="arabic text-3xl" dir="rtl">مَرْحَبًا!</h1>
          <p className="text-sm text-white/70 font-semibold mt-1">
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
            <p className="text-sm text-ink/70 font-semibold">
              2 unités gratuites débloquées. Passez Premium pour le reste du parcours.
            </p>
            <Link
              href="/pricing"
              className="bg-gradient-to-b from-gold-light to-gold text-[#241A02] text-sm font-extrabold px-4 py-2.5 rounded-xl whitespace-nowrap flex items-center gap-1.5"
            >
              Tarifs <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {unitsByCycle.length > 0 ? (
          <LearningPath
            unitsByCycle={unitsByCycle}
            progressByLesson={progressByLesson}
            isPremium={isPremium}
          />
        ) : (
          <p className="text-center text-ink/50 text-sm py-20">
            Aucun contenu pour le moment — exécutez le seed Supabase pour voir la leçon de démonstration.
          </p>
        )}
      </div>
    </main>
  );
}
