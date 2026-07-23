import Link from "next/link";
import { redirect } from "next/navigation";
import { Flame, Star, Lock } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
        .select("id, title_fr, order_index, is_free, lessons(id, title_fr, order_index)")
        .order("order_index"),
      supabase.from("user_progress").select("lesson_id, status").eq("user_id", user.id),
      supabase.from("subscriptions").select("status").eq("user_id", user.id).single(),
    ]);

  const progressByLesson = Object.fromEntries(
    (progress ?? []).map((p) => [p.lesson_id, p.status])
  );
  const isPremium = subscription?.status === "active";

  return (
    <main className="geo-bg min-h-screen px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <span className="kufi text-lg text-gold-light">Arabiya+</span>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 font-semibold text-gold-light">
              <Flame size={16} /> {stats?.streak_count ?? 0} jours
            </span>
            <span className="flex items-center gap-1 font-semibold text-gold-light">
              <Star size={16} /> {stats?.xp_total ?? 0} XP
            </span>
          </div>
        </div>

        {!isPremium && (
          <div className="bg-ink-2 border border-gold/30 rounded-2xl p-4 mb-8 flex items-center justify-between">
            <p className="text-sm opacity-80">
              Vous avez accès aux 2 premières unités. Passez Premium pour débloquer le Cycle 1 complet.
            </p>
            <Link href="/pricing" className="bg-gold text-[#241A02] text-sm font-bold px-4 py-2 rounded-xl whitespace-nowrap ml-4">
              Voir les tarifs
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {(units ?? []).map((unit) => {
            const locked = !unit.is_free && !isPremium;
            return (
              <div key={unit.id} className="bg-parchment text-ink rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold">{unit.title_fr}</h2>
                  {locked && <Lock size={16} className="opacity-50" />}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(unit.lessons ?? [])
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((lesson) => {
                      const status = progressByLesson[lesson.id] ?? "not_started";
                      return locked ? (
                        <span
                          key={lesson.id}
                          className="text-xs px-3 py-2 rounded-xl bg-black/5 opacity-40 cursor-not-allowed"
                        >
                          {lesson.title_fr}
                        </span>
                      ) : (
                        <Link
                          key={lesson.id}
                          href={`/lesson/${lesson.id}`}
                          className={`text-xs px-3 py-2 rounded-xl font-semibold ${
                            status === "completed"
                              ? "bg-teal/20 text-teal"
                              : "bg-gold/20 text-[#7a5c14]"
                          }`}
                        >
                          {lesson.title_fr}
                        </Link>
                      );
                    })}
                </div>
              </div>
            );
          })}
          {(units ?? []).length === 0 && (
            <p className="text-center opacity-60 text-sm">
              Aucun contenu pour le moment — exécutez le seed Supabase pour voir la leçon de démonstration.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
