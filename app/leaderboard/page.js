import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Trophy, Medal } from "lucide-react";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getWeekStartDate } from "@/lib/weekUtils";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  // Client "session" : sert uniquement à vérifier qui est connecté.
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Client "service role" : contourne la RLS pour pouvoir lire les
  // lignes de TOUS les utilisateurs — indispensable pour un classement.
  // Sans lui, la RLS de user_stats limite chacun à sa propre ligne, et
  // le classement n'affiche jamais que "1 participant : soi-même".
  const db = createServiceRoleClient();

  const weekStart = getWeekStartDate();

  const { data: rows } = await db
    .from("user_stats")
    .select("user_id, display_name, weekly_xp, week_start_date")
    .eq("week_start_date", weekStart)
    .order("weekly_xp", { ascending: false })
    .limit(50);

  const ranked = rows ?? [];
  const myRank = ranked.findIndex((r) => r.user_id === user.id);

  function medalColor(index) {
    if (index === 0) return "text-gold";
    if (index === 1) return "text-gray-400";
    if (index === 2) return "text-amber-700";
    return null;
  }

  return (
    <main className="min-h-screen bg-parchment pb-16">
      <div className="bg-gradient-to-br from-ink to-ink-2 text-white px-5 pt-6 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard" className="text-white/70">
            <ArrowLeft size={22} />
          </Link>
          <h1 className="text-xl font-extrabold flex items-center gap-2">
            <Trophy size={22} className="text-gold-light" />
            Classement de la semaine
          </h1>
        </div>
        <p className="text-sm text-white/60 font-semibold">
          Réinitialisé chaque lundi — {ranked.length} participant{ranked.length !== 1 ? "s" : ""} cette semaine
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-5 -mt-5 relative z-10">
        {myRank >= 0 && (
          <div className="bg-white border border-gold/30 rounded-2xl p-4 mb-4 shadow-md flex items-center justify-between">
            <p className="text-base font-semibold text-ink/70">Votre position</p>
            <p className="text-lg font-extrabold text-ink">
              #{myRank + 1} — {ranked[myRank].weekly_xp} XP
            </p>
          </div>
        )}

        {ranked.length === 0 ? (
          <p className="text-center text-ink/50 text-base py-20">
            Personne n'a encore gagné d'XP cette semaine. Soyez le premier !
          </p>
        ) : (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden divide-y divide-black/5">
            {ranked.map((row, index) => {
              const isMe = row.user_id === user.id;
              const color = medalColor(index);
              return (
                <div
                  key={row.user_id}
                  className={`flex items-center justify-between px-4 py-3.5 ${
                    isMe ? "bg-gold/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 text-center font-extrabold text-ink/60">
                      {color ? <Medal size={20} className={color} /> : index + 1}
                    </div>
                    <p className={`font-bold text-base ${isMe ? "text-ink" : "text-ink/80"}`}>
                      {row.display_name || "Utilisateur Arabiya+"}
                      {isMe && <span className="text-xs text-gold ml-2">(vous)</span>}
                    </p>
                  </div>
                  <p className="font-extrabold text-base text-ink">{row.weekly_xp} XP</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
