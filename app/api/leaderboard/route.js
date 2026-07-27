import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getWeekStartDate } from "@/lib/weekUtils";

export async function GET() {
  const sessionClient = createServerSupabaseClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Le classement lit weekly_xp d'autres utilisateurs — RLS empêcherait
  // normalement cette lecture inter-comptes, donc on passe par le
  // client service-role (lecture seule ici, et on ne renvoie que les
  // colonnes nécessaires à un classement : ni email, ni autre donnée).
  const db = createServiceRoleClient();
  const currentWeekStart = getWeekStartDate();

  const { data: top, error } = await db
    .from("user_stats")
    .select("user_id, display_name, weekly_xp")
    .eq("week_start_date", currentWeekStart)
    .gt("weekly_xp", 0)
    .order("weekly_xp", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (top ?? []).map((row, i) => ({
    rank: i + 1,
    userId: row.user_id,
    displayName: row.display_name ?? "Apprenant",
    weeklyXp: row.weekly_xp,
    isMe: row.user_id === user.id,
  }));

  // Si l'utilisateur courant n'est pas dans le top 20, on calcule quand
  // même son rang réel pour l'afficher séparément ("Vous êtes 47e").
  let me = rows.find((r) => r.isMe) ?? null;
  if (!me) {
    const { data: myStats } = await db
      .from("user_stats")
      .select("user_id, display_name, weekly_xp, week_start_date")
      .eq("user_id", user.id)
      .maybeSingle();

    const myWeeklyXp = myStats?.week_start_date === currentWeekStart ? myStats.weekly_xp ?? 0 : 0;

    if (myWeeklyXp > 0) {
      const { count } = await db
        .from("user_stats")
        .select("user_id", { count: "exact", head: true })
        .eq("week_start_date", currentWeekStart)
        .gt("weekly_xp", myWeeklyXp);

      me = {
        rank: (count ?? 0) + 1,
        userId: user.id,
        displayName: myStats?.display_name ?? "Vous",
        weeklyXp: myWeeklyXp,
        isMe: true,
      };
    } else {
      me = { rank: null, userId: user.id, displayName: "Vous", weeklyXp: 0, isMe: true };
    }
  }

  return NextResponse.json({ top: rows, me, weekStart: currentWeekStart });
}
